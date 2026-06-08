/**
 * Pre-send link checker for newsletters.
 *
 * Extracts every link from a rendered email and verifies each one resolves,
 * so a broken link (typo'd slug, stray character) can't quietly ship to the
 * whole list. Surfaced as a pass/fail checklist in the admin preview — it does
 * NOT gate sending.
 *
 * Read-only by design: links with side effects (unsubscribe, click tracking)
 * are never fetched. The preview HTML is rendered without a recipientId, so
 * links here are the canonical targets, not the /api/newsletter/track wrappers.
 */

// Schemes / fragments we never probe.
const SKIP_SCHEMES = ['mailto:', 'tel:']
// Endpoints with side effects — fetching them would unsubscribe someone or
// record a fake open/click. Never hit these.
const SIDE_EFFECT_PATHS = ['/api/unsubscribe', '/api/newsletter/track']

const PROBE_TIMEOUT_MS = 7000
const CONCURRENCY = 6

/** Pull unique hrefs out of rendered email HTML. */
export function extractLinks(html) {
  if (!html || typeof html !== 'string') return []
  const seen = new Set()
  const links = []
  const re = /href\s*=\s*"([^"]+)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    // Decode the handful of entities a URL can carry (mainly &amp;).
    const url = m[1].trim().replace(/&amp;/g, '&')
    if (!url || seen.has(url)) continue
    seen.add(url)
    links.push(url)
  }
  return links
}

function isMutomorro(url) {
  try {
    return new URL(url).hostname === 'mutomorro.com'
  } catch {
    return false
  }
}

/** Decide whether/how a link should be checked. */
export function classify(url) {
  const lower = url.toLowerCase()
  if (lower.startsWith('#')) return { kind: 'skip', reason: 'anchor' }
  if (SKIP_SCHEMES.some((s) => lower.startsWith(s))) return { kind: 'skip', reason: lower.split(':')[0] }
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return { kind: 'invalid', reason: 'unparseable' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { kind: 'skip', reason: parsed.protocol.replace(':', '') }
  }
  if (SIDE_EFFECT_PATHS.some((p) => parsed.pathname.startsWith(p))) {
    return { kind: 'skip', reason: 'not checked (side effect)' }
  }
  return { kind: isMutomorro(url) ? 'internal' : 'external' }
}

async function probe(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS)
  const opts = {
    redirect: 'follow',
    signal: ctrl.signal,
    headers: { 'user-agent': 'MutomorroLinkCheck/1.0 (+newsletter pre-send check)' },
  }
  try {
    // HEAD is lightest; some servers reject it, so fall back to GET.
    let res = await fetch(url, { ...opts, method: 'HEAD' })
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { ...opts, method: 'GET' })
    }
    return { status: res.status, redirected: res.redirected, finalUrl: res.url }
  } finally {
    clearTimeout(timer)
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return out
}

/**
 * Extract and check every link in the rendered email HTML.
 * Returns { summary, links: [{ url, type, verdict, status?, redirected?, finalUrl?, note? }] }.
 *
 * Verdicts:
 *   ok          – 2xx (note 'redirect' if it resolved via a redirect)
 *   broken      – internal link that 404s / errors / times out  (the real risk)
 *   unverified  – external link we couldn't confirm (may just block bots)
 *   skipped     – anchors, mailto, unsubscribe/tracking (never fetched)
 */
export async function lintLinks(html) {
  const urls = extractLinks(html)

  const links = await mapLimit(urls, CONCURRENCY, async (url) => {
    const c = classify(url)
    if (c.kind === 'skip' || c.kind === 'invalid') {
      return { url, type: c.kind, verdict: 'skipped', note: c.reason }
    }
    try {
      const { status, redirected, finalUrl } = await probe(url)
      const ok = status >= 200 && status < 300
      const verdict = ok ? 'ok' : c.kind === 'internal' ? 'broken' : 'unverified'
      return {
        url,
        type: c.kind,
        verdict,
        status,
        redirected,
        finalUrl: redirected && finalUrl !== url ? finalUrl : undefined,
        note: redirected ? 'resolved via redirect' : undefined,
      }
    } catch (err) {
      const timedOut = err?.name === 'AbortError'
      return {
        url,
        type: c.kind,
        verdict: c.kind === 'internal' ? 'broken' : 'unverified',
        note: timedOut ? 'timed out' : 'unreachable',
      }
    }
  })

  const summary = {
    total: links.length,
    ok: links.filter((l) => l.verdict === 'ok').length,
    broken: links.filter((l) => l.verdict === 'broken').length,
    unverified: links.filter((l) => l.verdict === 'unverified').length,
    skipped: links.filter((l) => l.verdict === 'skipped').length,
  }
  return { summary, links }
}
