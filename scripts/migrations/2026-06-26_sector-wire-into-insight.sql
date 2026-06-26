-- Wire out_of_scope (HE-noise scrub) into the buyer-insight RPCs, and surface
-- sector on the engagement drill-downs.
-- Date: 2026-06-26
--
-- Both insight functions now exclude out_of_scope contacts the same way they
-- exclude the owner's own records, so the funnel and the engagement leaderboard
-- show the genuine addressable pool (no student/junior skew). get_engaged_contacts
-- also returns `sector` so the drill-down lists and curation can show it.

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
  is_uk boolean, country text, industry text, sector text, score numeric
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
      c.country, c.industry, c.sector,
      coalesce(c.newsletter_status, '') AS ns
    FROM contacts c LEFT JOIN sig s ON s.contact_id = c.id
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
      AND NOT coalesce(c.out_of_scope, false)
  ),
  scored AS (
    SELECT *,
      (ns IN ('active', 'confirmed')) AS subscribed,
      (newsletter_clicks > 0 OR active_90d OR high_signals > 0) AS engaged,
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
    is_decision_maker, active_30d, active_90d, is_uk, country, industry, sector, score
  FROM scored
  WHERE CASE coalesce(p_filter, 'all')
    WHEN 'recent' THEN active_90d
    WHEN 'decision_makers' THEN is_decision_maker
    WHEN 'repeat' THEN download_count >= 3
    WHEN 'clickers' THEN newsletter_clicks > 0
    WHEN 'enquirers' THEN high_signals > 0
    WHEN 'uk' THEN is_uk
    WHEN 'golden' THEN is_uk AND is_decision_maker
    WHEN 'engaged' THEN is_uk AND is_decision_maker AND engaged
    WHEN 'uk_subscribed' THEN is_uk AND subscribed
    WHEN 'uk_engaged' THEN is_uk AND subscribed AND engaged
    WHEN 'uk_target' THEN is_uk AND subscribed AND engaged AND is_decision_maker
    WHEN 'uk_notsub' THEN is_uk AND NOT subscribed
    WHEN 'uk_target_audience' THEN is_uk AND NOT subscribed AND is_decision_maker AND ns NOT IN ('unsubscribed', 'bounced')
    WHEN 'uk_optedout' THEN is_uk AND ns = 'unsubscribed'
    ELSE true
  END
  ORDER BY score DESC, newsletter_clicks DESC, last_download_date DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(p_limit, 100), 500));
$$;
REVOKE EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_engaged_contacts(int, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) TO service_role;

-- Funnel: exclude out_of_scope too.
CREATE OR REPLACE FUNCTION public.get_overview_pool_stats()
RETURNS TABLE (
  total_contacts   bigint,
  all_subscribers  bigint,
  uk_total         bigint,
  uk_subscribed    bigint,
  uk_sub_engaged   bigint,
  uk_target        bigint,
  uk_notsub        bigint,
  ta_all           bigint,
  ta_contactable   bigint,
  ta_warm          bigint,
  uk_optedout      bigint,
  uk_bounced       bigint,
  seniority_known  bigint,
  location_known   bigint,
  free_email       bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH sig AS (
    SELECT contact_id,
      count(*) FILTER (WHERE strength = 'high') AS high_signals,
      count(*) AS any_signals
    FROM signals GROUP BY contact_id
  ),
  flagged AS (
    SELECT
      coalesce(c.newsletter_status, '') AS ns,
      (coalesce(c.newsletter_status, '') IN ('active', 'confirmed')) AS subscribed,
      public.is_decision_maker_seniority(c.seniority) AS fit,
      public.is_uk_contact(c.country, c.signup_email) AS uk,
      (coalesce(c.newsletter_clicks, 0) > 0
        OR c.last_download_date >= now() - interval '90 days'
        OR coalesce(s.high_signals, 0) > 0) AS engaged,
      (coalesce(c.download_count, 0) > 0 OR coalesce(c.newsletter_opens, 0) > 0
        OR coalesce(c.newsletter_clicks, 0) > 0 OR coalesce(s.any_signals, 0) > 0) AS ever_interacted,
      (coalesce(c.newsletter_status, '') NOT IN ('unsubscribed', 'bounced')) AS contactable,
      (c.seniority IS NOT NULL AND btrim(c.seniority) <> '' AND lower(c.seniority) <> 'unknown') AS sen_known,
      ((c.country IS NOT NULL AND btrim(c.country) <> '')
        OR lower(split_part(c.signup_email, '@', 2)) ~ '\.uk$') AS loc_known,
      public.is_free_email_domain(lower(split_part(c.signup_email, '@', 2))) AS free_em
    FROM contacts c LEFT JOIN sig s ON s.contact_id = c.id
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
      AND NOT coalesce(c.out_of_scope, false)
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE subscribed),
    count(*) FILTER (WHERE uk),
    count(*) FILTER (WHERE uk AND subscribed),
    count(*) FILTER (WHERE uk AND subscribed AND engaged),
    count(*) FILTER (WHERE uk AND subscribed AND engaged AND fit),
    count(*) FILTER (WHERE uk AND NOT subscribed),
    count(*) FILTER (WHERE uk AND NOT subscribed AND fit),
    count(*) FILTER (WHERE uk AND NOT subscribed AND fit AND contactable),
    count(*) FILTER (WHERE uk AND NOT subscribed AND fit AND contactable AND ever_interacted),
    count(*) FILTER (WHERE uk AND NOT subscribed AND ns = 'unsubscribed'),
    count(*) FILTER (WHERE uk AND NOT subscribed AND ns = 'bounced'),
    count(*) FILTER (WHERE sen_known),
    count(*) FILTER (WHERE loc_known),
    count(*) FILTER (WHERE free_em)
  FROM flagged;
$$;
REVOKE EXECUTE ON FUNCTION public.get_overview_pool_stats() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_overview_pool_stats() TO service_role;

-- Per-sector breakdown of the in-scope UK pool (powers the sector view).
CREATE OR REPLACE FUNCTION public.get_uk_sector_breakdown()
RETURNS TABLE (
  sector text, people bigint, fit bigint, subscribed bigint,
  engaged bigint, target bigint, target_audience bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH uk AS (
    SELECT
      coalesce(nullif(btrim(c.sector), ''), 'Unknown') AS sector,
      (coalesce(c.newsletter_status, '') IN ('active', 'confirmed')) AS subscribed,
      public.is_decision_maker_seniority(c.seniority) AS fit,
      (coalesce(c.newsletter_clicks, 0) > 0
        OR c.last_download_date >= now() - interval '90 days'
        OR coalesce((SELECT count(*) FROM signals s WHERE s.contact_id = c.id AND s.strength = 'high'), 0) > 0) AS engaged,
      (coalesce(c.newsletter_status, '') NOT IN ('unsubscribed', 'bounced')) AS contactable
    FROM contacts c
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
      AND NOT coalesce(c.out_of_scope, false)
      AND public.is_uk_contact(c.country, c.signup_email)
  )
  SELECT sector,
    count(*),
    count(*) FILTER (WHERE fit),
    count(*) FILTER (WHERE subscribed),
    count(*) FILTER (WHERE subscribed AND engaged),
    count(*) FILTER (WHERE subscribed AND engaged AND fit),
    count(*) FILTER (WHERE NOT subscribed AND fit AND contactable)
  FROM uk GROUP BY sector ORDER BY count(*) DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.get_uk_sector_breakdown() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_uk_sector_breakdown() TO service_role;

-- Rollback: re-apply 2026-06-26_uk-pool-funnel.sql (drops out_of_scope clause +
--   sector column from the two functions); DROP FUNCTION get_uk_sector_breakdown().
