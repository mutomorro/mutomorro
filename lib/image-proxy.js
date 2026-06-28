// Stable image proxy — single source of truth (Phase 1).
//
// WHY: Sanity serves every image from a content-hashed CDN URL, so re-uploading a
// diagram mints a new URL and Google resets that image's ranking. (See the 28 Jun
// investigation + delivery spec in docs/seo/.) The fix: serve the main image from
// our own stable address that resolves to whatever the current asset is.
//
// THE THREE NAMES (design-session principle):
//   - URL      — terse, lowercase, machine-legal:  /img/<type>/<slug>-overview
//   - alt      — the readable SEO phrase: the existing heroImage.alt (NOT here)
//   - filename — rich, Capitalised, real .png: built from the page TITLE (route side)
//
// DELIVERIES (all param-variants of ONE canonical path):
//   - canonical PNG   …/<slug>-overview                       → true PNG (save/share/Google/sitemap/<img> fallback)
//   - og-crop PNG     …/<slug>-overview?w=1200&h=630&fit=crop → true PNG social card
//   - AVIF/WebP skin  …/<slug>-overview?fmt=avif&w=<n>        → invisible <picture> render only
//
// Phase 1 = the main image ("overview"). Body images (step-n) are Phase 2.

export const SITE_URL = 'https://mutomorro.com'
export const PROXY_BASE = '/img'

// Sanity coordinates (kept local so the Edge route needn't import the Node client).
export const SANITY = {
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
}

// Device widths for the <picture> srcset (clamped to the route's 2000 cap).
export const RENDER_WIDTHS = [640, 828, 1200, 1600, 2000]

// ── Resolution table ─────────────────────────────────────────────────────────
// URL type-segment -> { sanityType, fields: { role: '<sanity image field>' } }.
// The URL role word is decoupled from the field name (the field is heroImage; the
// role is `overview`). The URL segment is NOT always the Sanity _type (training ->
// course, develop -> capabilityService, sectors -> sectorLandingPage). Field names
// are a fixed allow-list — never user input — so they are safe to interpolate.
export const RESOLVE = {
  tool: { sanityType: 'tool', bodyField: 'body', fields: { overview: 'heroImage' } },
  article: { sanityType: 'article', fields: { overview: 'heroImage' } },
  project: { sanityType: 'project', fields: { overview: 'heroImage' } },
  service: { sanityType: 'service', fields: { overview: 'heroImage', proposition: 'propositionImage' } },
  training: { sanityType: 'course', fields: { overview: 'heroImage' } },
  develop: { sanityType: 'capabilityService', fields: { overview: 'heroImage' } },
  sectors: { sanityType: 'sectorLandingPage', fields: { overview: 'seoImage' } },
  resources: { sanityType: 'resource', fields: { overview: 'previewImage' } },
}

// Recognised role suffixes. Phase 1: `overview`. Reserved: `stage-n` (resolvable to
// stages[] when wired), `step-n` (UNSOLVED — gated on the Phase 2 keying decision).
const ROLE_SUFFIX = /^(.+)-(overview|stage-\d+|step-\d+)$/

// Split a flattened segment `<slug>-<role>` -> { slug, role }, or null.
export function parseSegment(segment) {
  const m = ROLE_SUFFIX.exec(segment || '')
  if (!m) return null
  return { slug: m[1], role: m[2] }
}

// Resolve (type, role) -> { sanityType, field }, or null (route returns 404).
// Only fixed single-field roles resolve here; `stage-n`/`step-n` are not built.
export function resolveField(typeSegment, role) {
  const entry = RESOLVE[typeSegment]
  if (!entry) return null
  const field = entry.fields[role]
  if (!field) return null
  return { sanityType: entry.sanityType, field }
}

// ── Staged rollout ───────────────────────────────────────────────────────────
// Only enabled docs EMIT proxy URLs (the route itself resolves any slug), so a
// bug can never reach more than what's switched on. Rollout = add an entry.
//
// PHASE 1: the 37 reset-cohort tools — heroes re-uploaded 21 May–24 Jun 2026 as
// *-hero-master.png. Google already reset these, so moving them to the proxy is
// zero-loss and immunises them against the next accidental re-upload. The 22
// untouched best-rankers (7 Mar migration cohort: PESTLE, Kotter's, ADKAR, …) are
// DELIBERATELY excluded — a separate, eyes-open call. List is the authoritative
// Sanity asset set (filename match "*hero-master*" == upload date ≥ 2026-05-21).
const REUPLOADED_37 = [
  '4-stages-of-psychological-safety', '5-whys', '5ds-of-appreciative-inquiry',
  '6-team-conditions-for-team-effectiveness', '8-wastes-of-lean', 'audience-personas',
  'bpm-lifecycle', 'bridges-transition-model', 'competing-values-framework',
  'contextual-inquiry', 'cynefin-framework', 'daci-framework', 'disc-styles', 'dmaic',
  'empathy-map', 'five-dysfunctions-of-a-team', 'gemba-walk', 'heart-of-business',
  'iceberg-model', 'kaizen-cycle', 'lewins-change-model', 'mckinsey-7-s-model',
  'mendelow-power-interest-matrix', 'narrative-strategy', 'ooda-loop', 'orca',
  'pdca-cycle', 'problem-statement', 'process-mapping', 'rasci-framework',
  'satir-change-model', 'service-blueprints', 'star-method', 'tesi-model',
  'the-heros-journey', 'theory-of-change', 'wicked-problems',
]
export const ENABLED_SLUGS = new Set(REUPLOADED_37.map((s) => `tool:${s}`))
export const ENABLED_TYPES = new Set([])

export function isProxyEnabled(typeSegment, slug) {
  if (!RESOLVE[typeSegment]) return false
  if (ENABLED_TYPES.has(typeSegment)) return true
  return ENABLED_SLUGS.has(`${typeSegment}:${slug}`)
}

// ── URL builders ─────────────────────────────────────────────────────────────
export function overviewPath(typeSegment, slug) {
  return `${PROXY_BASE}/${typeSegment}/${slug}-overview`
}

// Body (in-body diagram) path — keyed by the Portable Text block `_key`, which is
// stable across image swaps and reorder-safe (Phase 2). Nested, not flattened: the
// last segment is the opaque key, so there is no name to carry in it.
export function bodyPath(typeSegment, slug, key) {
  return `${PROXY_BASE}/${typeSegment}/${slug}/body/${key}`
}

function withParams(path, params) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return qs ? `${path}?${qs}` : path
}

// Canonical PNG (param-less). Relative for the <img src>; absolute for og/JSON-LD/sitemap.
export function canonicalPngUrl(typeSegment, slug, { absolute = false } = {}) {
  const path = overviewPath(typeSegment, slug)
  return absolute ? SITE_URL + path : path
}

// Body-image canonical PNG (param-less), keyed by the block `_key`.
export function bodyCanonicalUrl(typeSegment, slug, key, { absolute = false } = {}) {
  const path = bodyPath(typeSegment, slug, key)
  return absolute ? SITE_URL + path : path
}

// og-crop PNG (absolute, honest 1200x630 card).
export function ogCropUrl(typeSegment, slug) {
  return SITE_URL + withParams(overviewPath(typeSegment, slug), { w: 1200, h: 630, fit: 'crop' })
}

// A <picture> <source> srcset for one format across widths (relative).
function buildSrcSet(path, widths, fmt) {
  return widths.map((w) => `${withParams(path, { fmt, w })} ${w}w`).join(', ')
}
export function renderSrcSet(typeSegment, slug, widths, fmt) {
  return buildSrcSet(overviewPath(typeSegment, slug), widths, fmt)
}
export function bodyRenderSrcSet(typeSegment, slug, key, widths, fmt) {
  return buildSrcSet(bodyPath(typeSegment, slug, key), widths, fmt)
}

// Rich download filename from the page title (case kept; runs of non-alphanumerics
// -> single hyphen). The route sets this as Content-Disposition on every delivery,
// with the extension matched to the format actually served (png/avif/webp) so a
// save is always honest and never bare.
export function titleToFilename(title, ext = 'png') {
  const base = (title || 'image').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image'
  return `${base}-Diagram.${ext}`
}

// ── Per-surface emitter helpers (gated) ──────────────────────────────────────
// Each returns the proxy URL when (type, slug) is rolled out, else the fallback.
export function ogImage(typeSegment, slug, fallbackAbsUrl) {
  return isProxyEnabled(typeSegment, slug) ? ogCropUrl(typeSegment, slug) : fallbackAbsUrl
}

export function jsonLdImage(typeSegment, slug, fallbackAbsUrl) {
  return isProxyEnabled(typeSegment, slug) ? canonicalPngUrl(typeSegment, slug, { absolute: true }) : fallbackAbsUrl
}

export function sitemapImage(typeSegment, slug, fallbackUrl) {
  return isProxyEnabled(typeSegment, slug) ? canonicalPngUrl(typeSegment, slug, { absolute: true }) : fallbackUrl
}

// Body image for the sitemap (gated). Keyed by the block `_key`.
export function bodySitemapImage(typeSegment, slug, key, fallbackUrl) {
  return isProxyEnabled(typeSegment, slug) ? bodyCanonicalUrl(typeSegment, slug, key, { absolute: true }) : fallbackUrl
}
