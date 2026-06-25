-- Paced-send rebuild — PR-3: enrich the receipt RPCs for one-round-trip handlers
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §7
-- Supersedes the void/2-col versions from paced-send-05 (which had no callers yet).
--
-- PR-3 wires the receipt handlers to these RPCs and drops their old per-event
-- SELECT + contacts read-modify-write + the 2 s pixel connection-hold. To do that
-- in ONE round trip the handlers need, back from the guarded update: send_id (for
-- the aggregate counter), contact_id (suppression / click signal), and whether
-- this was the FIRST such event for the row so the counter is bumped once per
-- recipient, not once per event (the old webhook bumped total_opened on every
-- open event — a large over-count this removes).
--
-- EXACTLY-ONCE PATTERN: the UPDATE is guarded by `... AND <ts> IS NULL`. Under
-- READ COMMITTED, Postgres re-evaluates that predicate against the latest row
-- version after taking the row lock, so two concurrent duplicate events: the
-- first matches and stamps the timestamp; the second re-checks, finds it set,
-- and matches ZERO rows. A returned row therefore IS the first event. The
-- `counted` flag additionally reports whether the row is durably sent
-- (resend_id IS NOT NULL) so a pre-send pixel hit on a still-`claimed` row stamps
-- the timestamp and is floored, but is NOT counted. No row returned = duplicate
-- (or no match) = the handler does nothing.
--
-- Return-type changes vs paced-send-05 require DROP + CREATE.

-- Pixel path (open/click), matched by recipient id; claimed-floor preserved.
DROP FUNCTION IF EXISTS public.mark_receipt(uuid, text, timestamptz);
CREATE FUNCTION public.mark_receipt(p_recipient_id uuid, p_kind text, p_at timestamptz)
RETURNS TABLE (send_id uuid, contact_id bigint, counted boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_kind = 'opened' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET opened_at = p_at,
           status    = CASE WHEN nr.resend_id IS NOT NULL AND nr.status IN ('sent','delivered')
                            THEN 'opened' ELSE nr.status END
     WHERE nr.id = p_recipient_id AND nr.opened_at IS NULL          -- first open only
     RETURNING nr.send_id, nr.contact_id, (nr.resend_id IS NOT NULL);
  ELSIF p_kind = 'clicked' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET clicked_at = p_at,
           opened_at  = COALESCE(nr.opened_at, p_at),               -- a click implies an open
           status     = CASE WHEN nr.resend_id IS NOT NULL AND nr.status IN ('sent','delivered','opened')
                             THEN 'clicked' ELSE nr.status END
     WHERE nr.id = p_recipient_id AND nr.clicked_at IS NULL         -- first click only
     RETURNING nr.send_id, nr.contact_id, (nr.resend_id IS NOT NULL);
  ELSE
    RAISE EXCEPTION 'mark_receipt: unsupported kind % (expected opened|clicked)', p_kind;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.mark_receipt(uuid, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_receipt(uuid, text, timestamptz) TO service_role;
COMMENT ON FUNCTION public.mark_receipt(uuid, text, timestamptz) IS
  'First-party pixel receipt: on the FIRST open/click for a recipient, stamp the timestamp and advance status only when durably sent (resend_id IS NOT NULL; never clobbers a claim). Returns one row only on that first event: send_id, contact_id, counted (=durably sent). No row on duplicates. Service-role only.';

-- Webhook path (delivered/bounced/complained), matched by resend_id.
DROP FUNCTION IF EXISTS public.mark_receipt_by_resend(text, text, timestamptz);
CREATE FUNCTION public.mark_receipt_by_resend(p_resend_id text, p_kind text, p_at timestamptz)
RETURNS TABLE (send_id uuid, contact_id bigint, counted boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_kind = 'delivered' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET delivered_at = p_at,
           status = CASE WHEN nr.status = 'sent' THEN 'delivered' ELSE nr.status END
     WHERE nr.resend_id = p_resend_id AND nr.delivered_at IS NULL
     RETURNING nr.send_id, nr.contact_id, true;
  ELSIF p_kind = 'bounced' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET bounced_at = p_at,
           status = CASE WHEN nr.status <> 'complained' THEN 'bounced' ELSE nr.status END
     WHERE nr.resend_id = p_resend_id AND nr.bounced_at IS NULL
     RETURNING nr.send_id, nr.contact_id, true;
  ELSIF p_kind = 'complained' THEN
    RETURN QUERY
    UPDATE newsletter_recipients nr
       SET status = 'complained'
     WHERE nr.resend_id = p_resend_id AND nr.status <> 'complained'
     RETURNING nr.send_id, nr.contact_id, true;
  ELSE
    RAISE EXCEPTION 'mark_receipt_by_resend: unsupported kind % (expected delivered|bounced|complained)', p_kind;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) TO service_role;
COMMENT ON FUNCTION public.mark_receipt_by_resend(text, text, timestamptz) IS
  'Webhook receipt matched by resend_id (already past the sent-floor): on the FIRST delivered/bounced/complained for the row, stamp + guard status against downgrade and return send_id, contact_id, counted=true. No row on duplicates. Service-role only.';

-- Rollback: re-apply paced-send-05 to restore the void / 2-col versions.
