-- Bulk-update RPC for newsletter recipient status
-- Date: 2026-05-28
--
-- The send function previously fired one supabase.update() per recipient
-- after each Resend batch. For ~3,900 emails that's ~3,900 sequential DB
-- round trips and dominated the Resend phase wall time.
--
-- This function takes parallel arrays of recipient IDs and Resend IDs (paired
-- by index, length-checked) and applies them in a single UPDATE using
-- unnest(a, b) AS data(...). One DB call per batch, regardless of batch size.
--
-- Applied via Supabase MCP as migration `mark_newsletter_recipients_sent`.

CREATE OR REPLACE FUNCTION mark_newsletter_recipients_sent(
  p_recipient_ids uuid[],
  p_resend_ids text[],
  p_sent_at timestamptz
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF coalesce(array_length(p_recipient_ids, 1), 0) <> coalesce(array_length(p_resend_ids, 1), 0) THEN
    RAISE EXCEPTION 'p_recipient_ids and p_resend_ids must be the same length';
  END IF;

  UPDATE newsletter_recipients nr
  SET resend_id = data.resend_id,
      status = 'sent',
      sent_at = p_sent_at
  FROM unnest(p_recipient_ids, p_resend_ids) AS data(recipient_id, resend_id)
  WHERE nr.id = data.recipient_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION mark_newsletter_recipients_sent(uuid[], text[], timestamptz) IS
  'Bulk-mark newsletter_recipients rows as sent. Used by the newsletter send route to apply per-recipient Resend IDs in a single round trip instead of N sequential .update() calls per batch.';
