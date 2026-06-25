-- Engagement scoring — surface the buried signals for /admin/engagement
-- Date: 2026-06-25
--
-- The site is download-gated, so download_count > 0 is nearly everyone (6,785 of
-- 7,583) — raw downloads barely discriminate. The signals that actually separate
-- interesting contacts from noise are: newsletter CLICKS (intent), recency,
-- high-strength signals (inbound enquiries), decision-maker seniority, and a work
-- email. These RPCs rank people and organisations by a transparent weighted score,
-- computed server-side (never iterate 7,583 contacts in JS — CLAUDE.md rule).

-- Shared free/personal email-domain test (mirrors lib/personal-email-domains.js,
-- extended with common international free providers seen in the data).
CREATE OR REPLACE FUNCTION public.is_free_email_domain(d text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(coalesce(d, '')) IN (
    'gmail.com','googlemail.com','hotmail.com','hotmail.co.uk','outlook.com','outlook.co.uk',
    'yahoo.com','yahoo.co.uk','yahoo.co.in','ymail.com','rocketmail.com','icloud.com','me.com',
    'mac.com','live.com','live.co.uk','aol.com','msn.com','protonmail.com','proton.me','hey.com',
    'btinternet.com','sky.com','virginmedia.com','ntlworld.com','blueyonder.co.uk','talktalk.net',
    'tiscali.co.uk','gmx.de','gmx.net','gmx.com','gmx.co.uk','web.de','t-online.de','mail.ru',
    'yandex.ru','yandex.com','qq.com','163.com','126.com','sina.com','free.fr','orange.fr',
    'comcast.net','verizon.net','zoho.com','fastmail.com','mail.com'
  );
$$;

-- Decision-maker seniority test (case-normalised — the column has 'Senior' vs
-- 'senior' etc.). Excludes manager/senior IC; these are buyers / budget-holders.
CREATE OR REPLACE FUNCTION public.is_decision_maker_seniority(s text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(coalesce(s, '')) IN ('director','c_suite','head','vp','founder','partner','owner');
$$;

-- Per-contact engagement ranking.
-- p_filter: 'all' | 'recent' | 'decision_makers' | 'repeat' | 'clickers' | 'enquirers'
CREATE OR REPLACE FUNCTION public.get_engaged_contacts(p_limit int DEFAULT 100, p_filter text DEFAULT 'all')
RETURNS TABLE (
  id bigint,
  first_name text,
  last_name text,
  signup_email text,
  organisation_name text,
  role text,
  seniority text,
  tier text,
  domain text,
  is_org_email boolean,
  download_count int,
  newsletter_opens int,
  newsletter_clicks int,
  last_download_date timestamptz,
  high_signals bigint,
  is_decision_maker boolean,
  active_30d boolean,
  active_90d boolean,
  score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH sig AS (
    SELECT contact_id, count(*) FILTER (WHERE strength = 'high') AS high_signals
    FROM signals
    GROUP BY contact_id
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
    FROM contacts c
    LEFT JOIN sig s ON s.contact_id = c.id
    -- Exclude the owner's own / internal records so they don't pollute the leads list.
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
  ),
  scored AS (
    SELECT *,
      ( least(newsletter_clicks, 5) * 8
      + least(newsletter_opens, 20) * 1
      + least(download_count, 10) * 1.5
      + (CASE WHEN active_30d THEN 20 WHEN active_90d THEN 10 ELSE 0 END)
      + high_signals * 15
      + (CASE WHEN is_decision_maker THEN 12 ELSE 0 END)
      + (CASE WHEN is_org_email THEN 6 ELSE 0 END) )::numeric AS score
    FROM base
  )
  SELECT
    id, first_name, last_name, signup_email, organisation_name, role, seniority, tier, domain, is_org_email,
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
REVOKE EXECUTE ON FUNCTION public.get_engaged_contacts(int, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_contacts(int, text) TO service_role;

-- Per-organisation (work-email domain) engagement aggregation.
CREATE OR REPLACE FUNCTION public.get_engaged_organisations(p_limit int DEFAULT 50)
RETURNS TABLE (
  domain text,
  org_name text,
  people bigint,
  downloaders bigint,
  opens bigint,
  clicks bigint,
  decision_makers bigint,
  active_90d bigint,
  score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH c AS (
    SELECT
      lower(split_part(signup_email, '@', 2)) AS domain,
      organisation_name,
      coalesce(download_count, 0) AS dl,
      coalesce(newsletter_opens, 0) AS op,
      coalesce(newsletter_clicks, 0) AS cl,
      public.is_decision_maker_seniority(seniority) AS dm,
      (last_download_date >= now() - interval '90 days') AS active
    FROM contacts
    WHERE signup_email LIKE '%@%'
      AND coalesce(organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(signup_email, '@', 2)) <> 'mutomorro.com'
  )
  SELECT
    domain,
    mode() WITHIN GROUP (ORDER BY organisation_name) AS org_name,
    count(*) AS people,
    count(*) FILTER (WHERE dl > 0) AS downloaders,
    sum(op) AS opens,
    sum(cl) AS clicks,
    count(*) FILTER (WHERE dm) AS decision_makers,
    count(*) FILTER (WHERE active) AS active_90d,
    (sum(cl) * 3 + sum(op) + count(*) * 2 + count(*) FILTER (WHERE dm) * 4 + count(*) FILTER (WHERE active) * 5)::numeric AS score
  FROM c
  WHERE NOT public.is_free_email_domain(domain)
  GROUP BY domain
  HAVING count(*) >= 2
  ORDER BY score DESC
  LIMIT greatest(1, least(coalesce(p_limit, 50), 200));
$$;
REVOKE EXECUTE ON FUNCTION public.get_engaged_organisations(int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_organisations(int) TO service_role;

-- Rollback:
--   DROP FUNCTION public.get_engaged_contacts(int, text);
--   DROP FUNCTION public.get_engaged_organisations(int);
--   DROP FUNCTION public.is_decision_maker_seniority(text);
--   DROP FUNCTION public.is_free_email_domain(text);
