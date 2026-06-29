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
  article: { sanityType: 'article', bodyField: 'body', fields: { overview: 'heroImage' } },
  // `bodyStyle: 'nested'` — case-study body images carry FREE-FORM descriptive imageSlugs
  // (derived from alt, not a controlled role vocabulary), which the flat `<slug>-<role>`
  // parser can't split. Their canonical body URL is the structurally-unambiguous nested
  // form `/img/project/<slug>/body/<imageSlug>` instead of the flat 2-segment shape.
  project: { sanityType: 'project', bodyField: 'body', bodyStyle: 'nested', fields: { overview: 'heroImage' } },
  service: { sanityType: 'service', fields: { overview: 'heroImage', proposition: 'propositionImage' } },
  training: { sanityType: 'course', fields: { overview: 'heroImage' } },
  develop: { sanityType: 'capabilityService', fields: { overview: 'heroImage' } },
  sectors: { sanityType: 'sectorLandingPage', fields: { overview: 'seoImage' } },
  resources: { sanityType: 'resource', fields: { overview: 'previewImage' } },
}

// Recognised role suffixes on the FLAT 2-segment path `<slug>-<role>`:
//   - `overview`                       the main / hero diagram (also the body master)
//   - `proposition`                    a second fixed single-field role (service)
//   - `statistic` | `diagram` | `pull-quote`  a body image named by what it IS (articles)
//   - `step-N-<name>` / `stage-N-<name>`      a sequenced body diagram (tools)
// The named tail is what lets a body image share the hero's flat path shape; the role is
// split off the END, so a slug that contains hyphens is safe. KEEP the controlled body
// role words IN SYNC with IMAGE_SLUG_RE in sanity/schemas/_imageSlug.js.
const ROLE_SUFFIX = /^(.+)-(overview|proposition|statistic|diagram|pull-quote|(?:step|stage)-\d+(?:-[a-z0-9]+)*)$/

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
// Whole-type rollout: every doc of these types emits proxy URLs (heroes resolve by their
// fixed image field — no per-image backfill needed). NEVER add 'tool' here — tools stay
// per-slug (ENABLED_SLUGS) so the 22 deliberately-excluded best-rankers are never switched
// on wholesale.
export const ENABLED_TYPES = new Set(['training', 'develop', 'resources', 'sectors', 'service', 'article', 'project'])

export function isProxyEnabled(typeSegment, slug) {
  if (!RESOLVE[typeSegment]) return false
  if (ENABLED_TYPES.has(typeSegment)) return true
  return ENABLED_SLUGS.has(`${typeSegment}:${slug}`)
}

// ── URL builders ─────────────────────────────────────────────────────────────
export function overviewPath(typeSegment, slug) {
  return `${PROXY_BASE}/${typeSegment}/${slug}-overview`
}

// Human-readable URL/filename descriptor from a body image's alt text. Kebab,
// word-capped. NOTE: deriving the descriptor from alt means editing the alt changes
// the emitted URL (a soft re-eval) — but the route resolves by the trailing `_key`,
// so a changed descriptor never serves the WRONG image (old + new URLs both resolve).
export function altToDescriptor(alt) {
  if (!alt) return ''
  const words = String(alt).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 10)
  let s = words.join('-')
  if (s.length > 70) s = s.slice(0, 70).replace(/-[^-]*$/, '')
  return s
}

// Title-case a kebab descriptor into a download filename base (no extension).
export function descriptorToName(descriptor) {
  if (!descriptor) return null
  const n = descriptor.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
  return n || null
}

// Body (in-body diagram) path — `<descriptor>-<_key>`. The descriptor (from alt) is
// the human-readable part; the trailing block `_key` is the stable, reorder-safe
// resolution anchor. Falls back to bare `<_key>` when there is no alt.
export function bodyPath(typeSegment, slug, alt, key) {
  const d = altToDescriptor(alt)
  return d
    ? `${PROXY_BASE}/${typeSegment}/${slug}/body/${d}-${key}`
    : `${PROXY_BASE}/${typeSegment}/${slug}/body/${key}`
}

// Clean, house-pattern body path. `imageSlug` is a permanent slug stored on the image,
// decoupled from both alt and the asset. With no `_key` in the URL the slug is
// LOAD-BEARING: the route resolves purely by it, so an imageSlug is set once and never
// changed. Two canonical shapes, chosen by the type's `bodyStyle`:
//   - FLAT (default)  `/img/<type>/<slug>-<imageSlug>` — controlled role words (tools/
//     articles). Same shape as the hero; for `overview` it collapses onto the hero URL
//     (same asset) — a deliberate consolidation, not a clash.
//   - NESTED          `/img/<type>/<slug>/body/<imageSlug>` — FREE-FORM descriptive slugs
//     (case studies). Separate path segments, so a hyphen-rich descriptive slug can never
//     be mis-split against the doc slug.
export function bodyPathBySlug(typeSegment, slug, imageSlug) {
  return RESOLVE[typeSegment]?.bodyStyle === 'nested'
    ? `${PROXY_BASE}/${typeSegment}/${slug}/body/${imageSlug}`
    : `${PROXY_BASE}/${typeSegment}/${slug}-${imageSlug}`
}

// Title-case an imageSlug for a download filename component: `step-1-assumed`
// -> `Step-1-Assumed`. Reuses the descriptor casing.
export function imageSlugToName(imageSlug) {
  return descriptorToName(imageSlug)
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

// Body-image canonical PNG (param-less). `id` = { imageSlug, alt, key }. Prefers the
// clean, flat imageSlug path; falls back to the legacy `/body/<descriptor>-<_key>` form
// for any image not yet backfilled, so the page never emits a broken src mid-backfill.
export function bodyCanonicalUrl(typeSegment, slug, { imageSlug, alt, key } = {}, { absolute = false } = {}) {
  const path = imageSlug
    ? bodyPathBySlug(typeSegment, slug, imageSlug)
    : bodyPath(typeSegment, slug, alt, key)
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
export function bodyRenderSrcSet(typeSegment, slug, { imageSlug, alt, key } = {}, widths, fmt) {
  const path = imageSlug
    ? bodyPathBySlug(typeSegment, slug, imageSlug)
    : bodyPath(typeSegment, slug, alt, key)
  return buildSrcSet(path, widths, fmt)
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
// A FALSY fallback means the doc has no asset for this role — return it unchanged so a
// missing image never becomes a phantom proxy URL that 404s (the gate is type/slug-based
// and can't otherwise tell whether the underlying field is populated; e.g. develop pages
// with no heroImage, sectors with no seoImage).
export function ogImage(typeSegment, slug, fallbackAbsUrl) {
  if (!fallbackAbsUrl) return fallbackAbsUrl
  return isProxyEnabled(typeSegment, slug) ? ogCropUrl(typeSegment, slug) : fallbackAbsUrl
}

export function jsonLdImage(typeSegment, slug, fallbackAbsUrl) {
  if (!fallbackAbsUrl) return fallbackAbsUrl
  return isProxyEnabled(typeSegment, slug) ? canonicalPngUrl(typeSegment, slug, { absolute: true }) : fallbackAbsUrl
}

export function sitemapImage(typeSegment, slug, fallbackUrl) {
  if (!fallbackUrl) return fallbackUrl
  return isProxyEnabled(typeSegment, slug) ? canonicalPngUrl(typeSegment, slug, { absolute: true }) : fallbackUrl
}

// Body image for the sitemap (gated). `id` = { imageSlug, alt, key }; emits the clean
// flat imageSlug URL when present, else the legacy keyed URL, else the raw CDN fallback.
export function bodySitemapImage(typeSegment, slug, id, fallbackUrl) {
  return isProxyEnabled(typeSegment, slug)
    ? bodyCanonicalUrl(typeSegment, slug, id, { absolute: true })
    : fallbackUrl
}

// Sitemap image for a named FIXED role other than overview (e.g. service `proposition`).
// `role` must be a value the route's ROLE_SUFFIX recognises and RESOLVE maps to a field.
export function roleSitemapImage(typeSegment, slug, role, fallbackUrl) {
  if (!fallbackUrl) return fallbackUrl
  return isProxyEnabled(typeSegment, slug) ? `${SITE_URL}${PROXY_BASE}/${typeSegment}/${slug}-${role}` : fallbackUrl
}
