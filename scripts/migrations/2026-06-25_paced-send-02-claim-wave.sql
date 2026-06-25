-- Paced-send rebuild — M3: claim_newsletter_wave (atomic claim + suppression)
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §3.2
-- Requires: M1 (the 'claimed'/'skipped' statuses + claimed_at/error columns).
--
-- The heart of the drain. One statement, one snapshot:
--   1. Lock the next wave of this send's 'queued' rows in id order, skipping any
--      already locked by a concurrent tick (FOR UPDATE OF nr SKIP LOCKED) — so two
--      overlapping ticks claim DISJOINT sets and a contact is never picked twice.
--   2. Re-check suppression AT CLAIM via a contacts JOIN: anyone whose
--      newsletter_status is no longer active/confirmed (unsubscribed/bounced/
--      complained/etc. since the queue was built) is diverted to 'skipped' rather
--      than sent. This closes the unsubscribe/bounce-between-waves race regardless
--      of handler ordering.
--   3. Return the rows actually claimed for sending, with first_name for render.
--
-- A wave may return fewer than p_wave_size rows after skips — that is fine; the
-- next tick continues. Eligible set = ('active','confirmed') matches
-- count_audience_contacts and the create-queue eligibility filter.

CREATE OR REPLACE FUNCTION public.claim_newsletter_wave(p_send_id uuid, p_wave_size int)
RETURNS TABLE (id uuid, contact_id bigint, email text, first_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH cand AS (
    SELECT nr.id, nr.contact_id, nr.email, c.first_name, c.newsletter_status
    FROM   newsletter_recipients nr
    JOIN   contacts c ON c.id = nr.contact_id
    WHERE  nr.send_id = p_send_id
      AND  nr.status  = 'queued'
    ORDER BY nr.id                      -- unique key => stable across ticks, no dup/skip
    LIMIT  p_wave_size
    FOR UPDATE OF nr SKIP LOCKED        -- overlapping ticks never claim the same row
  ),
  skip_suppressed AS (
    UPDATE newsletter_recipients nr
       SET status     = 'skipped',
           claimed_at = NULL,
           error      = 'suppressed:' || cand.newsletter_status
      FROM cand
     WHERE nr.id = cand.id
       AND cand.newsletter_status NOT IN ('active','confirmed')
    RETURNING nr.id
  ),
  claimed AS (
    UPDATE newsletter_recipients nr
       SET status     = 'claimed',
           claimed_at = now()
      FROM cand
     WHERE nr.id = cand.id
       AND cand.newsletter_status IN ('active','confirmed')
    RETURNING nr.id, nr.contact_id, nr.email, cand.first_name
  )
  SELECT claimed.id, claimed.contact_id, claimed.email, claimed.first_name
  FROM claimed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_newsletter_wave(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.claim_newsletter_wave(uuid, int) TO service_role;

COMMENT ON FUNCTION public.claim_newsletter_wave(uuid, int) IS
  'Atomically lease the next wave of queued recipients for a send (FOR UPDATE SKIP LOCKED), divert now-suppressed contacts to status=skipped, and return the claimed rows (id, contact_id, email, first_name) for rendering. Service-role only.';

-- Rollback: DROP FUNCTION public.claim_newsletter_wave(uuid, int);
