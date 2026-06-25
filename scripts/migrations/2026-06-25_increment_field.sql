-- Atomic per-row counter increment for newsletter_sends aggregates
-- Date: 2026-06-25
--
-- Both the Resend webhook (app/api/webhooks/resend/route.js) and the
-- first-party open/click tracker (app/api/newsletter/track/route.js) bump the
-- per-send aggregate counters (total_delivered / total_opened / total_clicked /
-- total_bounced) on a SINGLE newsletter_sends row — the same row for every
-- recipient of an issue.
--
-- Two defects this closes:
--
--   1. The webhook called rpc('increment_field', ...) which never existed, so
--      every email.delivered event 404'd. Because supabase-js *resolves* (it
--      does not reject) on a PostgREST 404, the handler's .catch() fallback
--      never ran — total_delivered was silently never incremented at all.
--
--   2. The opened/clicked/bounced paths used a non-atomic SELECT-then-UPDATE
--      read-modify-write. During a send, thousands of receipts land on that one
--      row concurrently, so two handlers read the same value and both write
--      value+1 — a classic lost update. The counters undercounted under load.
--
-- A single `UPDATE ... SET col = col + 1` is atomic under MVCC (the per-row
-- write lock serialises concurrent writers), correct, and ONE round trip
-- instead of two — which also trims the receipt-storm query volume that
-- saturated the shared database in the 25 Jun 2026 send-gateway incident
-- (docs/newsletter/incident-2026-06-25-send-gateway-overload.md).
--
-- field_name is whitelisted (this is SECURITY DEFINER) so it can only ever
-- touch the known counter columns — no dynamic-column injection — and
-- search_path is pinned for the same reason.
--
-- Apply via Supabase MCP (matches existing migration workflow). Apply this
-- BEFORE deploying the code that calls it; the code keeps a reachable fallback
-- so an out-of-order deploy still counts, just non-atomically.

CREATE OR REPLACE FUNCTION increment_field(row_id uuid, field_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF field_name NOT IN (
    'total_delivered',
    'total_opened',
    'total_clicked',
    'total_bounced',
    'total_complained'
  ) THEN
    RAISE EXCEPTION 'increment_field: % is not an allowed counter column', field_name;
  END IF;

  -- %I quotes the identifier; the whitelist above already guarantees it is one
  -- of the five known columns. coalesce keeps it correct even if the column is
  -- nullable rather than DEFAULT 0.
  EXECUTE format(
    'UPDATE newsletter_sends SET %I = coalesce(%I, 0) + 1 WHERE id = $1',
    field_name, field_name
  ) USING row_id;
END;
$$;

COMMENT ON FUNCTION increment_field(uuid, text) IS
  'Atomically increment one whitelisted integer counter column on a newsletter_sends row. Used by the Resend webhook and the first-party open/click tracker so concurrent receipts during a send cannot lose updates (and to halve the per-event query count). Whitelisted to the total_* counter columns only.';
