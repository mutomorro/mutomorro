-- Overview real-numbers — the "denominator illusion" made first-class.
-- Date: 2026-06-26
--
-- The big list (7,578 contacts / 3,766 active subscribers) is a vanity number.
-- The real addressable market is the narrow pool the engagement work surfaced:
--   total -> UK -> UK decision-maker ("golden") -> engaged.
-- This single-row aggregate powers the reworked /admin Overview hero. Everything
-- is computed server-side (one row out) so there is no 1,000-row PostREST hazard.
--
-- Definitions (kept consistent with get_engaged_contacts so the headline cards
-- deep-link to a matching /admin/engagement list):
--   * golden  = is_uk AND is_decision_maker  (matches the 'golden' filter preset)
--   * engaged = golden AND demonstrated behaviour: clicked >=1 newsletter OR a
--               download in the last 90 days OR a high-strength intent signal.
--               (Opens are deliberately excluded — weight 1, noisy.)
-- Owner (Mutomorro) rows are excluded, mirroring the engagement RPCs.

CREATE OR REPLACE FUNCTION public.get_overview_pool_stats()
RETURNS TABLE (
  total_contacts    bigint,
  deliverable       bigint,
  active_subscribers bigint,
  uk                bigint,
  decision_makers   bigint,
  golden            bigint,
  engaged           bigint,
  golden_subscribed bigint,
  housing_tagged    bigint,
  housing_golden    bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH sig AS (
    SELECT contact_id, count(*) FILTER (WHERE strength = 'high') AS high_signals
    FROM signals GROUP BY contact_id
  ),
  base AS (
    SELECT
      coalesce(c.zb_status, '') AS zb,
      c.newsletter_status,
      coalesce(c.newsletter_clicks, 0) AS clicks,
      (c.last_download_date >= now() - interval '90 days') AS active_90d,
      coalesce(s.high_signals, 0) AS high_signals,
      public.is_decision_maker_seniority(c.seniority) AS dm,
      public.is_uk_contact(c.country, c.signup_email) AS uk,
      (c.tags @> ARRAY['housing-association']) AS housing
    FROM contacts c
    LEFT JOIN sig s ON s.contact_id = c.id
    WHERE coalesce(c.organisation_name, '') !~* 'mutomorro'
      AND lower(split_part(c.signup_email, '@', 2)) <> 'mutomorro.com'
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE zb NOT IN ('invalid', 'do_not_mail', 'abuse', 'bounced')),
    count(*) FILTER (WHERE newsletter_status IN ('active', 'confirmed')),
    count(*) FILTER (WHERE uk),
    count(*) FILTER (WHERE dm),
    count(*) FILTER (WHERE uk AND dm),
    count(*) FILTER (WHERE uk AND dm AND (clicks > 0 OR active_90d OR high_signals > 0)),
    count(*) FILTER (WHERE uk AND dm AND newsletter_status IN ('active', 'confirmed')),
    count(*) FILTER (WHERE housing),
    count(*) FILTER (WHERE housing AND uk AND dm)
  FROM base;
$$;

REVOKE EXECUTE ON FUNCTION public.get_overview_pool_stats() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_overview_pool_stats() TO service_role;

-- Rollback: DROP FUNCTION public.get_overview_pool_stats();
