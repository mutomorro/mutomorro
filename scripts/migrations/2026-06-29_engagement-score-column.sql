-- 2026-06-29_engagement-score-column.sql
--
-- Materialise the engagement score as a first-class column on contacts so it is
-- filterable/sortable in the plain paginated Contacts query (browse mode) and so
-- the merged Contacts surface can rank off a stored value rather than recomputing.
--
-- The per-row formula MIRRORS public.get_engaged_contacts EXACTLY at its default
-- weights (wClick 8, wOpen 1, wDownload 1.5, wRecent30 20, wRecent90 10,
-- wSignal 15, wDm 12, wOrg 6, wUk 18; clicks/opens/downloads capped at 5/20/10).
-- Because the score is purely a per-row function of the contact's own columns, a
-- per-row UPDATE reproduces the RPC's score value identically.
--
-- The score is a SNAPSHOT at refresh time (the 30/90-day recency windows move), so
-- it is recomputed daily (Vercel cron /api/cron/refresh-engagement-scores) and
-- after each Apollo enrich. The adjustable-weights slider in /admin remains a
-- client-only exploration toy; this column is the canonical default-weighted score.

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS engagement_score numeric;

-- Sort/filter support for the browse query (ORDER BY engagement_score DESC).
CREATE INDEX IF NOT EXISTS idx_contacts_engagement_score
  ON public.contacts (engagement_score DESC NULLS LAST);

-- Recompute the score for all contacts, or just p_ids when given (the on-enrich
-- path). Returns the number of rows whose score actually changed.
CREATE OR REPLACE FUNCTION public.refresh_engagement_scores(p_ids bigint[] DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  n integer;
BEGIN
  WITH sig AS (
    SELECT s.contact_id, count(*) FILTER (WHERE s.strength = 'high') AS high_signals
    FROM signals s
    WHERE p_ids IS NULL OR s.contact_id = ANY (p_ids)
    GROUP BY s.contact_id
  ),
  scored AS (
    SELECT c.id,
      ( least(coalesce(c.newsletter_clicks, 0), 5) * 8
      + least(coalesce(c.newsletter_opens, 0), 20) * 1
      + least(coalesce(c.download_count, 0), 10) * 1.5
      + (CASE WHEN c.last_download_date >= now() - interval '30 days' THEN 20
              WHEN c.last_download_date >= now() - interval '90 days' THEN 10
              ELSE 0 END)
      + coalesce(s.high_signals, 0) * 15
      + (CASE WHEN public.is_decision_maker_seniority(c.seniority) THEN 12 ELSE 0 END)
      + (CASE WHEN NOT public.is_free_email_domain(lower(split_part(c.signup_email, '@', 2))) THEN 6 ELSE 0 END)
      + (CASE WHEN public.is_uk_contact(c.country, c.signup_email) THEN 18 ELSE 0 END)
      )::numeric AS score
    FROM contacts c
    LEFT JOIN sig s ON s.contact_id = c.id
    WHERE p_ids IS NULL OR c.id = ANY (p_ids)
  )
  UPDATE contacts c
  SET engagement_score = scored.score
  FROM scored
  WHERE scored.id = c.id
    AND c.engagement_score IS DISTINCT FROM scored.score;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- Mutating function: service-role only. (Closes the anon-executable mutating-RPC
-- class flagged in the 28 Jun stack review.)
REVOKE EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) TO service_role;

-- One-time backfill.
SELECT public.refresh_engagement_scores();
