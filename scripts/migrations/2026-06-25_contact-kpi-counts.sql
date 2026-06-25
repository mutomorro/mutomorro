-- Contact KPI counts — server-side GROUP BY for the /admin/contacts header strip
-- Date: 2026-06-25
--
-- The contacts list showed a single filtered total over a 7,583-row, ~38-column
-- table. This adds always-correct headline distributions (tier / newsletter funnel /
-- deliverability) computed server-side, per the CLAUDE.md 1,000-row rule (never
-- aggregate big tables in JS). Long-format (dim, val, count) so one call returns all
-- three breakdowns; the client groups by dim.
--
-- Normalises known vocab dirt: tier "Tier 2" (3 rows) folds into "2"; null/blank tier
-- becomes "(unset)"; null/blank newsletter_status folds into "never"; null/blank
-- zb_status becomes "unverified".

CREATE OR REPLACE FUNCTION public.get_contact_kpis()
RETURNS TABLE (dim text, val text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'tier' AS dim,
         CASE
           WHEN tier IS NULL OR btrim(tier) = '' THEN '(unset)'
           ELSE btrim(regexp_replace(lower(tier), '^tier\s*', ''))
         END AS val,
         count(*) AS count
  FROM contacts
  GROUP BY 2
  UNION ALL
  SELECT 'newsletter',
         coalesce(nullif(btrim(newsletter_status), ''), 'never'),
         count(*)
  FROM contacts
  GROUP BY 2
  UNION ALL
  SELECT 'deliverability',
         coalesce(nullif(btrim(zb_status), ''), 'unverified'),
         count(*)
  FROM contacts
  GROUP BY 2;
$$;
REVOKE EXECUTE ON FUNCTION public.get_contact_kpis() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_contact_kpis() TO service_role;
COMMENT ON FUNCTION public.get_contact_kpis() IS
  'Headline contact distributions (tier / newsletter / deliverability) for /admin/contacts, normalised for vocab dirt. Long-format dim/val/count. Service-role only.';

-- Rollback:
--   DROP FUNCTION public.get_contact_kpis();
