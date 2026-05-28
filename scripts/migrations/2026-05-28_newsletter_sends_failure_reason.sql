-- Add failure_reason to newsletter_sends
-- Date: 2026-05-28
--
-- newsletter_sends rows can be marked 'failed' from several paths:
--   - dedup-assertion overlap detected
--   - recipient insert failure
--   - unhandled exception in the background runSend()
--   - new: auto-recovery sweep at the top of POST that marks any row stuck
--     in 'sending' for >15 minutes as failed (function-timeout cleanup)
--
-- Until now there was no audit trail for why a row failed. failure_reason
-- gives operators a single text field to read when investigating.
--
-- Applied via Supabase MCP as migration `newsletter_sends_failure_reason`.

ALTER TABLE newsletter_sends
  ADD COLUMN IF NOT EXISTS failure_reason text;

COMMENT ON COLUMN newsletter_sends.failure_reason IS
  'Free-text reason a send was marked failed. Populated by auto-recovery of stuck sends or by error paths in the send function.';
