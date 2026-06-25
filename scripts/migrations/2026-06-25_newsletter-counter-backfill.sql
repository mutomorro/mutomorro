-- Newsletter counter reconciliation — per-send full engagement stats incl. delivered bucket
-- Date: 2026-06-25
--
-- Backs the /admin/newsletter "Counter integrity" panel + one-click backfill.
-- The stored newsletter_sends.total_* counters drifted badly (total_delivered=0 on
-- 47/49 sends; opens 4,018 stored vs 5,007 real) because the historical webhook
-- .catch() swallowed delivered events and opens were once double-counted (see the
-- newsletter-counter-fix work + lib/newsletter-tracking.js). The dashboards already
-- recompute from newsletter_recipients via get_newsletter_issue_stats /
-- get_newsletter_send_stats, so on-screen rates are correct — but the STORED columns
-- are still wrong, a latent landmine for any future raw reader.
--
-- get_newsletter_send_stats() returns per-send ROW counts but NOT the delivered
-- bucket. This adds that bucket per send so the admin can (a) compare stored-vs-truth
-- and (b) backfill the stored columns to match. Read-only + service-role only; the
-- actual UPDATE is done by the gated reconcile route, not here.

CREATE OR REPLACE FUNCTION public.get_newsletter_send_stats_full()
RETURNS TABLE (
  send_id    uuid,
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
  -- Within a single send, (send_id, contact_id) is unique, so count(*) = the send's
  -- distinct recipients. "delivered" mirrors get_newsletter_issue_stats: a row counts
  -- as delivered if it has a resend_id or a sent/delivered/opened/clicked/bounced status.
  SELECT
    nr.send_id,
    count(*)                                                                  AS recipients,
    count(*) FILTER (
      WHERE nr.resend_id IS NOT NULL
         OR nr.status IN ('sent','delivered','opened','clicked','bounced'))   AS delivered,
    count(*) FILTER (WHERE nr.opened_at  IS NOT NULL)                         AS opened,
    count(*) FILTER (WHERE nr.clicked_at IS NOT NULL)                         AS clicked,
    count(*) FILTER (WHERE nr.status = 'bounced')                             AS bounced
  FROM newsletter_recipients nr
  GROUP BY nr.send_id;
$$;
REVOKE EXECUTE ON FUNCTION public.get_newsletter_send_stats_full() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_newsletter_send_stats_full() TO service_role;
COMMENT ON FUNCTION public.get_newsletter_send_stats_full() IS
  'Per-send DISTINCT-recipient engagement incl. the delivered bucket, for the /admin counter-integrity panel and stored-counter backfill. Service-role only.';

-- Rollback:
--   DROP FUNCTION public.get_newsletter_send_stats_full();
