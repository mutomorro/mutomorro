-- Paced-send rebuild — M7: harden the two existing newsletter RPCs
-- Date: 2026-06-25  ·  Spec: docs/newsletter/rebuild-design-spec.md §3, §12 (M7)
--
-- mark_newsletter_recipients_sent and count_audience_contacts are both
-- SECURITY DEFINER but were created WITHOUT `SET search_path` (advisor lint 0011 —
-- a mutable search_path on a definer function is a privilege-escalation surface)
-- and with the default EXECUTE-to-PUBLIC grant (advisor 0028/0029 — anon-callable).
--
-- Confirmed (codebase grep) that both are called ONLY from server routes using the
-- SUPABASE_SERVICE_ROLE_KEY (no client/anon caller), so pinning search_path and
-- revoking the public grant is pure hardening with no behavioural change.
-- Bodies are left untouched — ALTER FUNCTION sets the config without recreating.

ALTER FUNCTION public.mark_newsletter_recipients_sent(uuid[], text[], timestamptz)
  SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.mark_newsletter_recipients_sent(uuid[], text[], timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_newsletter_recipients_sent(uuid[], text[], timestamptz)
  TO service_role;

ALTER FUNCTION public.count_audience_contacts(jsonb)
  SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.count_audience_contacts(jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.count_audience_contacts(jsonb)
  TO service_role;

-- Note: get_send_status_counts(uuid) already pins search_path; it is also
-- server-only and may be revoked from PUBLIC in a later hardening pass.

-- Rollback (re-open — not recommended):
--   ALTER FUNCTION public.mark_newsletter_recipients_sent(uuid[], text[], timestamptz) RESET search_path;
--   GRANT EXECUTE ON FUNCTION public.mark_newsletter_recipients_sent(uuid[], text[], timestamptz) TO PUBLIC;
--   ALTER FUNCTION public.count_audience_contacts(jsonb) RESET search_path;
--   GRANT EXECUTE ON FUNCTION public.count_audience_contacts(jsonb) TO PUBLIC;
