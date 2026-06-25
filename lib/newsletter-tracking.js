/**
 * Hosts whose links the newsletter rewrites through the first-party click
 * tracker at /api/newsletter/track.
 *
 * SINGLE SOURCE OF TRUTH — shared by:
 *   - the email templates (promo-template.jsx, newsletter-template.jsx),
 *     which decide whether to wrap an <a href> in the tracking redirect, and
 *   - the /api/newsletter/track route, whose open-redirect guard decides
 *     whether a click may redirect on to the requested target.
 *
 * These two MUST agree. If a host is wrapped by the templates but rejected by
 * the route, the click is logged and then the visitor is bounced to the
 * homepage instead of their destination — and if the route allowed a host the
 * templates never wrap, the click simply goes untracked. Keeping both on this
 * one constant is what prevents that drift.
 *
 * Matching is by EXACT hostname — no subdomain or suffix matching — so a
 * lookalike like "mutomorro.com.attacker.tld" is never treated as ours and the
 * redirect endpoint can't be turned into an open redirect. Add the precise host
 * (e.g. "www.moresapien.org", or a future campaign domain) when you want its
 * links tracked.
 */
export const TRACKABLE_HOSTS = new Set([
  'mutomorro.com',
  'moresapien.org',
  'toctoolkit.org',
  'fieldmarks.org',
  'competence-conduct.org',
])

/** True when `url` parses and its hostname is on the trackable allowlist. */
export function isTrackableUrl(url) {
  if (typeof url !== 'string') return false
  try {
    return TRACKABLE_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

/**
 * Atomically bump one aggregate counter on a newsletter_sends row.
 *
 * During a send, every recipient's delivery/open/click receipt increments the
 * SAME newsletter_sends row, so the previous SELECT-then-UPDATE read-modify-
 * write lost increments under concurrency. The increment_field() Postgres
 * function (scripts/migrations/2026-06-25_increment_field.sql) does it in one
 * atomic `SET col = col + 1` — correct under load and a single round trip.
 *
 * IMPORTANT: supabase-js *resolves* (it does not reject) on a PostgREST error,
 * so we MUST inspect the returned `error`. A `.catch()` here would never fire —
 * that dead `.catch()` is exactly why total_delivered was silently never
 * incremented. The fallback below is therefore genuinely reachable, and covers
 * the window where the code is deployed but the migration isn't applied yet
 * (just non-atomically, as before).
 *
 * @param supabase a service-role Supabase client
 * @param sendId   newsletter_sends.id
 * @param field    one of the whitelisted total_* counter columns
 */
export async function incrementSendCounter(supabase, sendId, field) {
  if (!sendId) return

  const { error } = await supabase.rpc('increment_field', {
    row_id: sendId,
    field_name: field,
  })
  if (!error) return

  // Fallback (reachable, unlike the original .catch): non-atomic read-modify-
  // write. Only runs if the RPC is missing/errors — e.g. migration not applied.
  console.warn(
    `incrementSendCounter: increment_field RPC failed for ${field} (${error.code || error.message}); ` +
      'using non-atomic fallback — apply scripts/migrations/2026-06-25_increment_field.sql'
  )
  const { data: send } = await supabase
    .from('newsletter_sends')
    .select(field)
    .eq('id', sendId)
    .single()
  if (send) {
    await supabase
      .from('newsletter_sends')
      .update({ [field]: (send[field] || 0) + 1 })
      .eq('id', sendId)
  }
}
