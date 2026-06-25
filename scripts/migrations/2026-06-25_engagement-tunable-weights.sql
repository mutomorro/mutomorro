-- Engagement: tunable score weights + bulk-tag action
-- Date: 2026-06-25
--
-- Makes the engagement score weights parameters of get_engaged_contacts so the
-- admin can tune them live in the UI (defaults reproduce the original scoring).
-- Adds add_tag_to_contacts() so a ranked lead can be turned into a tagged segment
-- (tags are already a filter in /admin/contacts).

-- Drop the 2-arg version first: adding defaulted params would otherwise make the
-- old call signature ambiguous.
DROP FUNCTION IF EXISTS public.get_engaged_contacts(int, text);

CREATE OR REPLACE FUNCTION public.get_engaged_contacts(
  p_limit int DEFAULT 100,
  p_filter text DEFAULT 'all',
  w_click numeric DEFAULT 8,
  w_open numeric DEFAULT 1,
  w_download numeric DEFAULT 1.5,
  w_recent30 numeric DEFAULT 20,
  w_recent90 numeric DEFAULT 10,
  w_signal numeric DEFAULT 15,
  w_dm numeric DEFAULT 12,
  w_org numeric DEFAULT 6
)
RETURNS TABLE (
  id bigint, first_name text, last_name text, signup_email text, organisation_name text,
  role text, seniority text, tier text, domain text, is_org_email boolean,
  download_count int, newsletter_opens int, newsletter_clicks int, last_download_date timestamptz,
  high_signals bigint, is_decision_maker boolean, active_30d boolean, active_90d boolean, score numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH sig AS (
    SELECT contact_id, count(*) FILTER (WHERE strength = 'high') AS high_signals
    FROM signals GROUP BY contact_id
  ),
  base AS (
    SELECT
      c.id, c.first_name, c.last_name, c.signup_email, c.organisation_name, c.role, c.seniority, c.tier,
      lower(split_part(c.signup_email, '@', 2)) AS domain,
      coalesce(c.download_count, 0) AS download_count,
      coalesce(c.newsletter_opens, 0) AS newsletter_opens,
      coalesce(c.newsletter_clicks, 0) AS newsletter_clicks,
      c.last_download_date,
      coalesce(s.high_signals, 0) AS high_signals,
      public.is_decision_maker_seniority(c.seniority) AS is_decision_maker,
      (NOT public.is_free_email_domain(lower(split_part(c.signup_email, '@', 2)))) AS is_org_email,
      (c.last_download_date >= now() - interval '30 days') AS active_30d,
      (c.last_download_date >= now() - interval '90 days') AS active_90d
    FROM contacts c LEFT JOIN sig s ON s.contact_id = c.id
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
  ),
  scored AS (
    SELECT *,
      ( least(newsletter_clicks, 5) * w_click
      + least(newsletter_opens, 20) * w_open
      + least(download_count, 10) * w_download
      + (CASE WHEN active_30d THEN w_recent30 WHEN active_90d THEN w_recent90 ELSE 0 END)
      + high_signals * w_signal
      + (CASE WHEN is_decision_maker THEN w_dm ELSE 0 END)
      + (CASE WHEN is_org_email THEN w_org ELSE 0 END) )::numeric AS score
    FROM base
  )
  SELECT id, first_name, last_name, signup_email, organisation_name, role, seniority, tier, domain, is_org_email,
    download_count, newsletter_opens, newsletter_clicks, last_download_date, high_signals,
    is_decision_maker, active_30d, active_90d, score
  FROM scored
  WHERE CASE coalesce(p_filter, 'all')
    WHEN 'recent' THEN active_90d
    WHEN 'decision_makers' THEN is_decision_maker
    WHEN 'repeat' THEN download_count >= 3
    WHEN 'clickers' THEN newsletter_clicks > 0
    WHEN 'enquirers' THEN high_signals > 0
    ELSE true
  END
  ORDER BY score DESC, newsletter_clicks DESC, last_download_date DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(p_limit, 100), 500));
$$;
REVOKE EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) TO service_role;

-- Bulk-tag: append a tag to many contacts (idempotent — skips rows already tagged).
CREATE OR REPLACE FUNCTION public.add_tag_to_contacts(p_ids bigint[], p_tag text)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH upd AS (
    UPDATE contacts
    SET tags = array_append(coalesce(tags, '{}'), p_tag)
    WHERE id = ANY(p_ids)
      AND btrim(p_tag) <> ''
      AND NOT (p_tag = ANY(coalesce(tags, '{}')))
    RETURNING 1
  )
  SELECT count(*)::int FROM upd;
$$;
REVOKE EXECUTE ON FUNCTION public.add_tag_to_contacts(bigint[], text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.add_tag_to_contacts(bigint[], text) TO service_role;

-- Rollback:
--   (restore the 2-arg get_engaged_contacts from 2026-06-25_engagement-scoring.sql)
--   DROP FUNCTION public.add_tag_to_contacts(bigint[], text);
