-- Paced-send rebuild — M6: guarded receipt RPCs (the claimed-floor)
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §7.1
-- Requires: M1 (widened recipient status CHECK).
--
-- Closes the live clobber bug (spec finding #1): the first-party pixel matches by
-- recipient id and advanced status through a JS list that omitted 'claimed', so an
-- open/click landing during a wave's in-flight window could move a 'claimed' row to
-- 'opened'/'clicked', losing its resend_id and orphaning it. (32 prod rows are
-- already opened/clicked with resend_id IS NULL AND sent_at IS NULL.)
--
-- THE FLOOR: a receipt may set its timestamp ALWAYS, but may only ADVANCE status
-- when the row is durably sent (resend_id IS NOT NULL) and the new status outranks
-- the current one. A receipt can never move a row out of queued/claimed/failed/skipped.
-- These RPCs encode the floor in SQL and fold lookup+update into one round trip
-- (also the §7.2 query-count collapse). They are wired into the receipt handlers in
-- a later PR; created here so the object exists ahead of that code.

-- Pixel path (open / click) — matched by newsletter_recipients.id (rid).
CREATE OR REPLACE FUNCTION public.mark_receipt(
  p_recipient_id uuid,
  p_kind         text,
  p_at           timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_kind = 'opened' THEN
    UPDATE newsletter_recipients
       SET opened_at = COALESCE(opened_at, p_at),
           status    = CASE
                         WHEN resend_id IS NOT NULL AND status IN ('sent','delivered')
                         THEN 'opened' ELSE status END
     WHERE id = p_recipient_id;

  ELSIF p_kind = 'clicked' THEN
    UPDATE newsletter_recipients
       SET clicked_at = COALESCE(clicked_at, p_at),
           opened_at  = COALESCE(opened_at, p_at),                 -- a click implies an open
           status     = CASE
                          WHEN resend_id IS NOT NULL AND status IN ('sent','delivered','opened')
                          THEN 'clicked' ELSE status END
     WHERE id = p_recipient_id;

  ELSE
    RAISE EXCEPTION 'mark_receipt: unsupported kind % (expected opened|clicked)', p_kind;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_receipt(uuid, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_receipt(uuid, text, timestamptz) TO service_role;

COMMENT ON FUNCTION public.mark_receipt(uuid, text, timestamptz) IS
  'First-party pixel receipt: stamp opened_at/clicked_at always; advance status only when the row is durably sent (resend_id IS NOT NULL) and outranked. Never clobbers an in-flight claim. Service-role only.';

-- Webhook path (delivered / bounced / complained) — matched by resend_id, which
-- only exists once the email was sent, so the floor is already satisfied. Returns
-- send_id + contact_id so the handler can apply contacts suppression and refresh
-- derived counts. CASE guards prevent downgrading a complained row to bounced.
CREATE OR REPLACE FUNCTION public.mark_receipt_by_resend(
  p_resend_id text,
  p_kind      text,
  p_at        timestamptz)
RETURNS TABLE (send_id uuid, contact_id bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_kind = 'delivered' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET delivered_at = COALESCE(nr.delivered_at, p_at),
           status       = CASE WHEN nr.status = 'sent' THEN 'delivered' ELSE nr.status END
     WHERE nr.resend_id = p_resend_id
     RETURNING nr.send_id, nr.contact_id;

  ELSIF p_kind = 'bounced' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET bounced_at = COALESCE(nr.bounced_at, p_at),
           status     = CASE WHEN nr.status <> 'complained' THEN 'bounced' ELSE nr.status END
     WHERE nr.resend_id = p_resend_id
     RETURNING nr.send_id, nr.contact_id;

  ELSIF p_kind = 'complained' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET status = 'complained'
     WHERE nr.resend_id = p_resend_id
     RETURNING nr.send_id, nr.contact_id;

  ELSE
    RAISE EXCEPTION 'mark_receipt_by_resend: unsupported kind % (expected delivered|bounced|complained)', p_kind;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) TO service_role;

COMMENT ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) IS
  'Webhook receipt matched by resend_id (already past the sent-floor): stamp delivered/bounced timestamps, advance/guard status, and return send_id + contact_id for contacts suppression. Service-role only.';

-- Rollback:
--   DROP FUNCTION public.mark_receipt(uuid, text, timestamptz);
--   DROP FUNCTION public.mark_receipt_by_resend(text, text, timestamptz);
