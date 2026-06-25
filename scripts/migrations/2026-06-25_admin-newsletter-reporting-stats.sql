-- Paced-send rebuild — PR-2: server-side /admin newsletter reporting stats
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §7.3
--
-- Fixes the "/admin shows 6,120 Sent" bug. The admin route summed recipient ROWS
-- across the batches of an issue (3,818+1,601+601+100 = 6,120 attempt rows) and
-- displayed that as "Sent", when the issue actually reached 3,818 DISTINCT
-- contacts — inflating the headline and DEFLATING every rate (opens/6,120 instead
-- of opens/3,818). It also loaded the ENTIRE newsletter_recipients table into JS
-- on every admin load via a paginated fetch with NO stable ORDER BY (the
-- CLAUDE.md page-dup/skip gotcha), which both doesn't scale and can itself skew
-- the counts.
--
-- These two STABLE read-only aggregations replace that JS work with server-side
-- GROUP BY:
--   get_newsletter_issue_stats() — per issue (or standalone no-key send): DISTINCT
--     contact counts, so multi-batch retries are deduped. This is the headline.
--   get_newsletter_send_stats()  — per send: plain row counts for the per-batch
--     expand detail (within a send (send_id, contact_id) is unique, so rows = the
--     batch's distinct recipients).
--
-- "delivered" = distinct contacts in the delivered bucket (resend_id present, or
-- status in sent/delivered/opened/clicked/bounced) — the same bucket the dedup
-- logic treats as "already sent". Service-role only (the admin API uses the
-- service-role key; confirmed no anon caller).

CREATE OR REPLACE FUNCTION public.get_newsletter_issue_stats()
RETURNS TABLE (
  group_key  text,
  issue_key  text,
  recipients bigint,
  delivered  bigint,
  opened     bigint,
  clicked    bigint,
  bounced    bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(ns.issue_key, '__no_key__' || ns.id::text) AS group_key,
    ns.issue_key,
    count(DISTINCT nr.contact_id)                                              AS recipients,
    count(DISTINCT nr.contact_id) FILTER (
      WHERE nr.resend_id IS NOT NULL
         OR nr.status IN ('sent','delivered','opened','clicked','bounced'))    AS delivered,
    count(DISTINCT nr.contact_id) FILTER (WHERE nr.opened_at  IS NOT NULL)     AS opened,
    count(DISTINCT nr.contact_id) FILTER (WHERE nr.clicked_at IS NOT NULL)     AS clicked,
    count(DISTINCT nr.contact_id) FILTER (WHERE nr.status = 'bounced')         AS bounced
  FROM newsletter_sends ns
  JOIN newsletter_recipients nr ON nr.send_id = ns.id
  GROUP BY COALESCE(ns.issue_key, '__no_key__' || ns.id::text), ns.issue_key;
$$;
REVOKE EXECUTE ON FUNCTION public.get_newsletter_issue_stats() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_newsletter_issue_stats() TO service_role;
COMMENT ON FUNCTION public.get_newsletter_issue_stats() IS
  'Per-issue (or standalone no-key send) DISTINCT-contact engagement for /admin: recipients, delivered, opened, clicked, bounced. Dedupes multi-batch retries. Service-role only.';

CREATE OR REPLACE FUNCTION public.get_newsletter_send_stats()
RETURNS TABLE (
  send_id uuid,
  total   bigint,
  opened  bigint,
  clicked bigint,
  bounced bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    nr.send_id,
    count(*)                                            AS total,
    count(*) FILTER (WHERE nr.opened_at  IS NOT NULL)   AS opened,
    count(*) FILTER (WHERE nr.clicked_at IS NOT NULL)   AS clicked,
    count(*) FILTER (WHERE nr.status = 'bounced')       AS bounced
  FROM newsletter_recipients nr
  GROUP BY nr.send_id;
$$;
REVOKE EXECUTE ON FUNCTION public.get_newsletter_send_stats() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_newsletter_send_stats() TO service_role;
COMMENT ON FUNCTION public.get_newsletter_send_stats() IS
  'Per-send row counts (= per-batch distinct recipients) for the /admin batch-detail expand. Service-role only.';

-- Rollback:
--   DROP FUNCTION public.get_newsletter_issue_stats();
--   DROP FUNCTION public.get_newsletter_send_stats();
