-- 2026-06-29_hot-unworked-facets.sql
-- UC-1 step 2: a "Hot" lens (recent high-intent signal, regardless of subscription)
-- and an "Unworked" toggle (no interaction logged). Both become plain column filters
-- by materialising two recency facts:
--   last_high_signal_date  - recency of the strongest intent (set by the scoring refresh)
--   last_interaction_date  - when you last logged a touch (trigger-maintained, immediate)

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_high_signal_date timestamptz;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_interaction_date timestamptz;
CREATE INDEX IF NOT EXISTS idx_contacts_last_high_signal_date ON public.contacts (last_high_signal_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction_date ON public.contacts (last_interaction_date);

-- Extend the scoring refresh to also set last_high_signal_date. Score formula unchanged.
CREATE OR REPLACE FUNCTION public.refresh_engagement_scores(p_ids bigint[] DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE n integer;
BEGIN
  WITH sig AS (
    SELECT s.contact_id,
           count(*) FILTER (WHERE s.strength = 'high') AS high_signals,
           max(s.date) FILTER (WHERE s.strength = 'high') AS last_high
    FROM signals s
    WHERE p_ids IS NULL OR s.contact_id = ANY (p_ids)
    GROUP BY s.contact_id
  ),
  scored AS (
    SELECT c.id,
      coalesce(s.high_signals, 0) AS high_signals_count,
      s.last_high AS last_high_signal_date,
      ( least(coalesce(c.newsletter_clicks, 0), 5) * 8
      + least(coalesce(c.newsletter_opens, 0), 20) * 1
      + least(coalesce(c.download_count, 0), 10) * 1.5
      + (CASE WHEN c.last_download_date >= now() - interval '30 days' THEN 20
              WHEN c.last_download_date >= now() - interval '90 days' THEN 10 ELSE 0 END)
      + coalesce(s.high_signals, 0) * 15
      + (CASE WHEN public.is_decision_maker_seniority(c.seniority) THEN 12 ELSE 0 END)
      + (CASE WHEN NOT public.is_free_email_domain(lower(split_part(c.signup_email, '@', 2))) THEN 6 ELSE 0 END)
      + (CASE WHEN public.is_uk_contact(c.country, c.signup_email) THEN 18 ELSE 0 END)
      )::numeric AS score
    FROM contacts c LEFT JOIN sig s ON s.contact_id = c.id
    WHERE p_ids IS NULL OR c.id = ANY (p_ids)
  )
  UPDATE contacts c
  SET engagement_score = scored.score,
      high_signals_count = scored.high_signals_count,
      last_high_signal_date = scored.last_high_signal_date
  FROM scored
  WHERE scored.id = c.id
    AND (c.engagement_score IS DISTINCT FROM scored.score
         OR c.high_signals_count IS DISTINCT FROM scored.high_signals_count
         OR c.last_high_signal_date IS DISTINCT FROM scored.last_high_signal_date);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) TO service_role;

-- last_interaction_date: trigger-maintained so "Unworked" flips the instant you log a touch.
CREATE OR REPLACE FUNCTION public.interactions_touch_contact()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE contacts
    SET last_interaction_date = greatest(coalesce(last_interaction_date, NEW.created_at), NEW.created_at)
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interactions_touch_contact ON public.interactions;
CREATE TRIGGER trg_interactions_touch_contact
  AFTER INSERT ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.interactions_touch_contact();

-- Backfills.
UPDATE public.contacts c
SET last_interaction_date = i.max_at
FROM (SELECT contact_id, max(created_at) AS max_at FROM interactions WHERE contact_id IS NOT NULL GROUP BY contact_id) i
WHERE i.contact_id = c.id;

SELECT public.refresh_engagement_scores();
