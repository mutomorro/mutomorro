-- Paced-send rebuild — M5: mark_wave_sent (durable, guarded confirm)
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §3.4
-- Requires: M1 ('claimed' status + claimed_at column).
--
-- Called immediately after a successful resend.batch.send to record the wave.
-- Two guarantees the legacy mark_newsletter_recipients_sent did NOT give:
--   (a) resend_id is stored whenever it is still NULL, REGARDLESS of status — so
--       the durable "this email went out" marker can never be lost, even if a
--       receipt had somehow already advanced the row (the reclaim + reconciliation
--       both anchor on resend_id, never on the mutable status).
--   (b) status only advances claimed -> sent; a row a webhook already moved to
--       'delivered'/'opened' is never downgraded.
-- Returns the row count it touched (for logging only — total_sent is DERIVED at
-- finalize from count(resend_id IS NOT NULL), never incremented per wave, so a
-- retry/reclaim overlap cannot over-count).

CREATE OR REPLACE FUNCTION public.mark_wave_sent(
  p_recipient_ids uuid[],
  p_resend_ids    text[],
  p_sent_at       timestamptz)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  IF coalesce(array_length(p_recipient_ids, 1), 0)
     <> coalesce(array_length(p_resend_ids, 1), 0) THEN
    RAISE EXCEPTION 'p_recipient_ids and p_resend_ids must be the same length';
  END IF;

  UPDATE newsletter_recipients nr
     SET resend_id  = COALESCE(nr.resend_id, d.resend_id),                 -- never lose the marker
         status     = CASE WHEN nr.status = 'claimed' THEN 'sent' ELSE nr.status END,
         sent_at    = COALESCE(nr.sent_at, p_sent_at),
         claimed_at = NULL
    FROM unnest(p_recipient_ids, p_resend_ids) AS d(recipient_id, resend_id)
   WHERE nr.id = d.recipient_id;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_wave_sent(uuid[], text[], timestamptz) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_wave_sent(uuid[], text[], timestamptz) TO service_role;

COMMENT ON FUNCTION public.mark_wave_sent(uuid[], text[], timestamptz) IS
  'Record a sent wave: store resend_id whenever still NULL (durable marker), advance status claimed->sent only (never downgrade a delivered/opened row), clear the claim lease. Service-role only.';

-- Rollback: DROP FUNCTION public.mark_wave_sent(uuid[], text[], timestamptz);
