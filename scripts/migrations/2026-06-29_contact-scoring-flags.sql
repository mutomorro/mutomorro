-- 2026-06-29_contact-scoring-flags.sql
-- CP-1 of the cohesive Contacts surface (docs/admin/admin-cohesive-surface-spec-2026-06-29.md).
--
-- Collapsing the surface to ONE composable query needs exactly one new materialised
-- value: the high-strength signal count per contact. The "engaged" facet is
-- clicks>0 OR downloaded-in-90d OR high-signals>0, and the signal count can't be
-- filtered in a single PostgREST query without a join — every other facet is already
-- a plain column filter. Also adds next_nudge_date (Phase 4 nurture; user-set, no
-- compute).

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS high_signals_count int;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS next_nudge_date date;

CREATE INDEX IF NOT EXISTS idx_contacts_high_signals_count
  ON public.contacts (high_signals_count);
CREATE INDEX IF NOT EXISTS idx_contacts_next_nudge_date
  ON public.contacts (next_nudge_date) WHERE next_nudge_date IS NOT NULL;

-- Extend the scoring refresh to also materialise high_signals_count (it already
-- computes high_signals for the score). Same name/signature, so the daily cron and
-- the on-enrich caller keep working unchanged. Score formula unchanged byte-for-byte.
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
      coalesce(s.high_signals, 0) AS high_signals_count,
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
  SET engagement_score = scored.score,
      high_signals_count = scored.high_signals_count
  FROM scored
  WHERE scored.id = c.id
    AND (c.engagement_score IS DISTINCT FROM scored.score
         OR c.high_signals_count IS DISTINCT FROM scored.high_signals_count);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- Re-assert the service-role lockdown (CREATE OR REPLACE preserves grants; belt-and-braces).
REVOKE EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_engagement_scores(bigint[]) TO service_role;

-- Backfill.
SELECT public.refresh_engagement_scores();
