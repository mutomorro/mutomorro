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
