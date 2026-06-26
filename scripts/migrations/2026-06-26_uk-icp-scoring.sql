-- UK / ICP signal — UK is the biggest identifying factor for prospects.
-- Date: 2026-06-26
--
-- is_uk_contact = country looks UK OR the email domain ends in .uk. Combining both
-- catches 778 contacts (country alone 491, .uk domain alone 531) because country is
-- only enriched on ~32% of rows. Adds UK as a tunable weight in the engagement score,
-- a 'uk' filter and a 'golden' preset (UK + decision-maker, ~110 people), and a UK
-- marker/boost on the organisation ranking. Surfaces country + industry on people.

CREATE OR REPLACE FUNCTION public.is_uk_contact(p_country text, p_email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    (p_country IS NOT NULL AND (
       p_country ILIKE '%united kingdom%'
       OR p_country ILIKE '%northern ireland%'
       OR lower(btrim(p_country)) IN ('uk','gb','great britain','britain','england','scotland','wales')))
    OR lower(split_part(coalesce(p_email, ''), '@', 2)) ~ '\.uk$';
$$;

-- Per-contact engagement ranking, now UK-aware.
DROP FUNCTION IF EXISTS public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric);

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
  w_org numeric DEFAULT 6,
  w_uk numeric DEFAULT 18
)
RETURNS TABLE (
  id bigint, first_name text, last_name text, signup_email text, organisation_name text,
  role text, seniority text, tier text, domain text, is_org_email boolean,
  download_count int, newsletter_opens int, newsletter_clicks int, last_download_date timestamptz,
  high_signals bigint, is_decision_maker boolean, active_30d boolean, active_90d boolean,
  is_uk boolean, country text, industry text, score numeric
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
      (c.last_download_date >= now() - interval '90 days') AS active_90d,
      public.is_uk_contact(c.country, c.signup_email) AS is_uk,
      c.country, c.industry
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
      + (CASE WHEN is_org_email THEN w_org ELSE 0 END)
      + (CASE WHEN is_uk THEN w_uk ELSE 0 END) )::numeric AS score
    FROM base
  )
  SELECT id, first_name, last_name, signup_email, organisation_name, role, seniority, tier, domain, is_org_email,
    download_count, newsletter_opens, newsletter_clicks, last_download_date, high_signals,
    is_decision_maker, active_30d, active_90d, is_uk, country, industry, score
  FROM scored
  WHERE CASE coalesce(p_filter, 'all')
    WHEN 'recent' THEN active_90d
    WHEN 'decision_makers' THEN is_decision_maker
    WHEN 'repeat' THEN download_count >= 3
    WHEN 'clickers' THEN newsletter_clicks > 0
    WHEN 'enquirers' THEN high_signals > 0
    WHEN 'uk' THEN is_uk
    WHEN 'golden' THEN is_uk AND is_decision_maker
    ELSE true
  END
  ORDER BY score DESC, newsletter_clicks DESC, last_download_date DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(p_limit, 100), 500));
$$;
REVOKE EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) TO service_role;

-- Organisation ranking, with a UK marker (domain .uk) + small boost.
DROP FUNCTION IF EXISTS public.get_engaged_organisations(int);
CREATE OR REPLACE FUNCTION public.get_engaged_organisations(p_limit int DEFAULT 50)
RETURNS TABLE (
  domain text, org_name text, people bigint, downloaders bigint,
  opens bigint, clicks bigint, decision_makers bigint, active_90d bigint, is_uk boolean, score numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH c AS (
    SELECT
      lower(split_part(signup_email, '@', 2)) AS domain, organisation_name,
      coalesce(download_count, 0) AS dl, coalesce(newsletter_opens, 0) AS op, coalesce(newsletter_clicks, 0) AS cl,
      public.is_decision_maker_seniority(seniority) AS dm,
      (last_download_date >= now() - interval '90 days') AS active,
      public.is_uk_contact(country, signup_email) AS uk
    FROM contacts WHERE signup_email LIKE '%@%'
      AND coalesce(organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(signup_email, '@', 2)) <> 'mutomorro.com'
  )
  SELECT domain,
    mode() WITHIN GROUP (ORDER BY organisation_name) AS org_name,
    count(*) AS people, count(*) FILTER (WHERE dl > 0) AS downloaders,
    sum(op) AS opens, sum(cl) AS clicks,
    count(*) FILTER (WHERE dm) AS decision_makers, count(*) FILTER (WHERE active) AS active_90d,
    bool_or(uk OR domain ~ '\.uk$') AS is_uk,
    (sum(cl) * 3 + sum(op) + count(*) * 2 + count(*) FILTER (WHERE dm) * 4 + count(*) FILTER (WHERE active) * 5
      + (CASE WHEN bool_or(uk OR domain ~ '\.uk$') THEN 8 ELSE 0 END))::numeric AS score
  FROM c
  WHERE NOT public.is_free_email_domain(domain)
  GROUP BY domain HAVING count(*) >= 2
  ORDER BY score DESC
  LIMIT greatest(1, least(coalesce(p_limit, 50), 200));
$$;
REVOKE EXECUTE ON FUNCTION public.get_engaged_organisations(int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_organisations(int) TO service_role;

-- Add a UK count to the Contacts header segments.
DROP FUNCTION IF EXISTS public.get_contact_segments();
CREATE OR REPLACE FUNCTION public.get_contact_segments()
RETURNS TABLE (
  total bigint, no_company bigint, needs_company_workmail bigint,
  decision_makers bigint, active_30d bigint, enriched bigint, uk bigint
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
    count(*) FILTER (WHERE enriched IS TRUE),
    count(*) FILTER (WHERE public.is_uk_contact(country, signup_email))
  FROM contacts;
$$;
REVOKE EXECUTE ON FUNCTION public.get_contact_segments() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_contact_segments() TO service_role;

-- Rollback: restore prior get_engaged_contacts (10-arg), get_engaged_organisations,
--   get_contact_segments from the engagement-scoring / enrichment-helpers migrations;
--   DROP FUNCTION public.is_uk_contact(text, text);
