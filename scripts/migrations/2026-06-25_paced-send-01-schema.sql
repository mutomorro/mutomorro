-- Paced-send rebuild — M1: state-machine schema (columns, widened CHECKs, indexes, RLS fix)
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §2, §3.1
--
-- Reshapes the newsletter send from one synchronous burst into a create-queue +
-- drain-cron pipeline whose entire state lives in newsletter_recipients.status
-- (queued -> claimed -> sent, plus failed/skipped) and a couple of liveness
-- columns on newsletter_sends. This migration only adds the *room* for that
-- machine; the RPCs that drive it are in the sibling 02..05 migrations.
--
-- ADDITIVE AND REVERSIBLE. Safe to apply while the legacy burst send still runs:
--   - new recipient columns are nullable / defaulted,
--   - the new status values are unused by the old code,
--   - the RLS rewrite is behaviour-preserving (same predicate, evaluated once
--     per statement instead of once per row).
-- Cutover is the later code + NEWSLETTER_SEND_MODE flag flip, never this SQL.
--
-- Apply via Supabase MCP apply_migration (test branch first, then prod).

-- 1. Recipient lease/claim/retry columns -------------------------------------
--    claimed_at   = when this row was leased to an in-flight wave (reclaim key).
--    attempt_count= bounded retries before a row is parked as 'failed'.
--    error        = last render/send failure or skip reason, for triage.
ALTER TABLE public.newsletter_recipients
  ADD COLUMN IF NOT EXISTS claimed_at    timestamptz,
  ADD COLUMN IF NOT EXISTS attempt_count smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error         text;

-- 2. Widen the recipient status CHECK: + 'claimed','failed','skipped' ---------
--    (current set: queued/sent/delivered/opened/clicked/bounced/complained)
--    The new set is a superset, so every existing row already validates.
ALTER TABLE public.newsletter_recipients
  DROP CONSTRAINT newsletter_recipients_status_check;
ALTER TABLE public.newsletter_recipients
  ADD CONSTRAINT newsletter_recipients_status_check
  CHECK (status = ANY (ARRAY[
    'queued','claimed','sent','delivered','opened','clicked',
    'bounced','complained','failed','skipped'
  ]));

-- 3. Send liveness + reconciliation columns ----------------------------------
--    drain_heartbeat_at = stamped each tick that touches a draining send; the
--      real liveness signal a stuck-send alert keys on (replaces created_at age).
--    reconciled_at      = set when post-send reconciliation passes (§8).
ALTER TABLE public.newsletter_sends
  ADD COLUMN IF NOT EXISTS drain_heartbeat_at timestamptz,
  ADD COLUMN IF NOT EXISTS reconciled_at      timestamptz;

-- 4. Widen the send status CHECK: + 'draining','paused_quota' -----------------
--    (current set: draft/sending/paused/complete/failed — 'sending'/'paused'
--    kept for the legacy path during cutover.) Superset; existing rows validate.
ALTER TABLE public.newsletter_sends
  DROP CONSTRAINT newsletter_sends_status_check;
ALTER TABLE public.newsletter_sends
  ADD CONSTRAINT newsletter_sends_status_check
  CHECK (status = ANY (ARRAY[
    'draft','sending','paused','draining','paused_quota','complete','failed'
  ]));

-- 5. Indexes -----------------------------------------------------------------
--    (send_id, status) = the claim-scan key (WHERE send_id=$ AND status='queued'
--      ORDER BY id LIMIT n) becomes an index range instead of a send_id scan +
--      filter — matters once most of a 10k issue is already 'sent'.
--    contact_id = the previously-unindexed FK (advisor 0001); speeds the claim's
--      contacts JOIN, bounce/complaint suppression, and reconciliation GROUP BY.
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_send_status
  ON public.newsletter_recipients (send_id, status);
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_contact_id
  ON public.newsletter_recipients (contact_id);

-- 6. RLS init-plan fix (advisor 0003) ----------------------------------------
--    Wrap auth.role() in a scalar subquery so the planner evaluates it ONCE per
--    statement rather than once per row. The drain re-scans newsletter_recipients
--    every minute, so this strips a per-row function call from every scan.
--    Same predicate, same {public} role targeting — behaviour-preserving.
ALTER POLICY "Service role full access on newsletter_recipients"
  ON public.newsletter_recipients
  USING       ((select auth.role()) = 'service_role')
  WITH CHECK  ((select auth.role()) = 'service_role');
ALTER POLICY "Service role full access on newsletter_sends"
  ON public.newsletter_sends
  USING       ((select auth.role()) = 'service_role')
  WITH CHECK  ((select auth.role()) = 'service_role');

-- Rollback (manual):
--   ALTER TABLE newsletter_recipients DROP COLUMN claimed_at, DROP COLUMN attempt_count, DROP COLUMN error;
--   ALTER TABLE newsletter_sends DROP COLUMN drain_heartbeat_at, DROP COLUMN reconciled_at;
--   DROP INDEX idx_newsletter_recipients_send_status, idx_newsletter_recipients_contact_id;
--   -- restore the two original CHECK lists and the bare auth.role() policies.
