-- Enrichment + Contacts header helpers
-- Date: 2026-06-26
--
-- get_contacts_needing_org_enrichment — the Apollo backfill queue: work-email
--   contacts with no company and a not-known-bad email. Idempotent (rows drop out
--   once a company is filled), so the backfill script can be re-run safely.
-- get_contact_segments — one-row counts powering the reworked Contacts header's
--   clickable working-filters (replaces the newsletter-flavoured KPI boxes).

-- Cursor-paginated (p_after_id) so no-match contacts aren't re-fetched in a loop.
CREATE OR REPLACE FUNCTION public.get_contacts_needing_org_enrichment(p_limit int DEFAULT 100, p_after_id bigint DEFAULT 0)
RETURNS TABLE (id bigint, signup_email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, signup_email
  FROM contacts
  WHERE (organisation_name IS NULL OR btrim(organisation_name) = '')
    AND signup_email LIKE '%@%'
    AND NOT public.is_free_email_domain(lower(split_part(signup_email, '@', 2)))
    AND coalesce(zb_status, '') NOT IN ('invalid', 'do_not_mail', 'abuse')
    AND id > coalesce(p_after_id, 0)
  ORDER BY id
  LIMIT greatest(1, least(coalesce(p_limit, 100), 500));
$$;
REVOKE EXECUTE ON FUNCTION public.get_contacts_needing_org_enrichment(int, bigint) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_contacts_needing_org_enrichment(int, bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.get_contact_segments()
RETURNS TABLE (
  total bigint,
  no_company bigint,
  needs_company_workmail bigint,
  decision_makers bigint,
  active_30d bigint,
  enriched bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE organisation_name IS NULL OR btrim(organisation_name) = ''),
    count(*) FILTER (
      WHERE (organisation_name IS NULL OR btrim(organisation_name) = '')
        AND signup_email LIKE '%@%'
        AND NOT public.is_free_email_domain(lower(split_part(signup_email, '@', 2)))
        AND coalesce(zb_status, '') NOT IN ('invalid', 'do_not_mail', 'abuse')),
    count(*) FILTER (WHERE public.is_decision_maker_seniority(seniority)),
    count(*) FILTER (WHERE last_download_date >= now() - interval '30 days'),
    count(*) FILTER (WHERE enriched IS TRUE)
  FROM contacts;
$$;
REVOKE EXECUTE ON FUNCTION public.get_contact_segments() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_contact_segments() TO service_role;

-- Rollback:
--   DROP FUNCTION public.get_contacts_needing_org_enrichment(int);
--   DROP FUNCTION public.get_contact_segments();
