-- Paced-send rebuild — M4: reclaim_stuck_waves (crashed-tick recovery)
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §3.3
-- Requires: M1 (the 'claimed' status + claimed_at column).
--
-- A tick can die after claiming a wave but before recording it (timeout/crash).
-- Those rows are left 'claimed'. This re-queues them once their lease is older
-- than p_timeout_secs so a later tick re-sends them.
--
-- The `resend_id IS NULL` guard is LOAD-BEARING: a tick that actually sent and
-- stored resend_id, then crashed before flipping status to 'sent', must NOT be
-- re-queued — re-queuing it would double-send. We only reclaim rows with no
-- proof the email left (resend_id still NULL). Combined with the receipt
-- claimed-floor (M5/receipt RPCs), nothing else can move a row out of 'claimed'.

CREATE OR REPLACE FUNCTION public.reclaim_stuck_waves(p_send_id uuid, p_timeout_secs int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  UPDATE newsletter_recipients
     SET status     = 'queued',
         claimed_at = NULL
   WHERE send_id    = p_send_id
     AND status     = 'claimed'
     AND resend_id  IS NULL                                    -- never re-queue a sent row
     AND claimed_at < now() - make_interval(secs => p_timeout_secs);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reclaim_stuck_waves(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.reclaim_stuck_waves(uuid, int) TO service_role;

COMMENT ON FUNCTION public.reclaim_stuck_waves(uuid, int) IS
  'Re-queue recipients left claimed by a crashed tick once their lease is older than p_timeout_secs, but only those with resend_id IS NULL (no proof the email was sent) so a reclaim can never double-send. Service-role only.';

-- Rollback: DROP FUNCTION public.reclaim_stuck_waves(uuid, int);
