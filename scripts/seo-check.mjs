// SEO baseline check — the §I3 enforcement gate.
//
// Two halves:
//   1. SCHEMA LINT (static, no network): every routable Sanity type carries
//      seoTitle + seoDescription, and every on-page image field has an `alt`
//      subfield (OG-only `seoImage` and the `previewImage`/`previewImageAlt`
//      sibling are excepted).
//   2. LIVE CHECK (network): one representative URL per route type (pulled from
//      the live sitemap) must emit exactly one <h1>, a canonical link, and an
//      og:image. Soft warnings (don't fail the build): a page-specific JSON-LD
//      type, and Sanity content images shipping without width/height (CLS).
//
// Exit code is non-zero if any HARD assertion fails — wire it into CI /
// pre-deploy so SEO regressions and new blind spots can't ship silently.
//
//   node scripts/seo-check.mjs                       # checks production
//   node scripts/seo-check.mjs https://preview-url   # checks a Vercel preview
//   node scripts/seo-check.mjs --schema-only         # skip the network half

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const SCHEMA_ONLY = args.includes('--schema-only')
const BASE_URL = (args.find((a) => a.startsWith('http')) || process.env.SEO_CHECK_BASE_URL || 'https://mutomorro.com').replace(/\/$/, '')

const ROUTABLE = [
  'tool', 'article', 'course', 'service', 'serviceSubPage', 'project',
  'dimension', 'dimensionArticle', 'frameworkOverview', 'capabilityService',
  'theme', 'sectorLandingPage', 'resource',
]

let hardFails = 0
const log = (s = '') => console.log(s)

// ── 1. Schema lint ──────────────────────────────────────────────────────────
function schemaLint() {
  log('── Schema lint ──')
  for (const type of ROUTABLE) {
    const file = join(ROOT, 'sanity', 'schemas', `${type}.js`)
    let src
    try { src = readFileSync(file, 'utf8') } catch { log(`  ✗ ${type}: schema file missing`); hardFails++; continue }
    const problems = []

    // SEO fields present (inline, or via the shared seoFields fragment).
    const usesSeoFields = /\.\.\.seoFields\b/.test(src)
    if (!usesSeoFields && !(/seoTitle/.test(src) && /seoDescription/.test(src))) {
      problems.push('missing seoTitle/seoDescription')
    }

    // Every on-page image field has an alt subfield.
    const lines = src.split('\n')
    const hasPreviewAlt = /previewImageAlt/.test(src)
    lines.forEach((line, i) => {
      if (!/type:\s*['"]image['"]/.test(line)) return
      // Identify the field name from a small window around the image type.
      const ctx = lines.slice(Math.max(0, i - 4), i + 16).join('\n')
      const name = (ctx.match(/name:\s*['"](\w+)['"]/) || [])[1] || ''
      if (name === 'seoImage') return                      // OG meta image — no alt needed
      if (name === 'previewImage' && hasPreviewAlt) return // sibling previewImageAlt
      const altInBlock = lines.slice(i, i + 16).some((l) => /name:\s*['"]alt['"]/.test(l)) || /imageWithAlt\(/.test(line)
      if (!altInBlock) problems.push(`image field "${name || '?'}" (line ${i + 1}) has no alt subfield`)
    })

    if (problems.length) { problems.forEach((p) => log(`  ✗ ${type}: ${p}`)); hardFails += problems.length }
    else log(`  ✓ ${type}`)
  }
  log()
}

// ── 2. Live check ───────────────────────────────────────────────────────────
// Specific patterns first so /tools/x/template beats /tools/x, etc.
const TYPE_PATTERNS = [
  ['tool-template', /\/tools\/[^/]+\/template$/],
  ['serviceSubPage', /\/services\/[^/]+\/[^/]+$/],
  ['dimensionArticle', /\/emergent-framework\/[^/]+\/[^/]+$/],
  ['frameworkOverview', /\/emergent-framework$/],
  ['dimension', /\/emergent-framework\/[^/]+$/],
  ['tool', /\/tools\/[^/]+$/],
  ['article', /\/articles\/[^/]+$/],
  ['course', /\/training\/[^/]+$/],
  ['service', /\/services\/[^/]+$/],
  ['project', /\/projects\/[^/]+$/],
  ['develop', /\/develop\/[^/]+$/],
  ['topic', /\/topics\/[^/]+$/],
  ['sector', /\/sectors\/[^/]+$/],
  ['resource', /\/resources\/[^/]+$/],
]
const PAGE_PRIMARY = /"@type"\s*:\s*"(Article|Course|Service|CreativeWork|WebPage|CollectionPage|HowTo)"/

async function pickUrls() {
  const xml = await (await fetch(`${BASE_URL}/sitemap.xml`)).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const picked = new Map([['home', BASE_URL + '/']])
  for (const loc of locs) {
    for (const [type, re] of TYPE_PATTERNS) {
      if (!picked.has(type) && re.test(loc)) { picked.set(type, loc); break }
    }
  }
  return picked
}

async function checkUrl(type, url) {
  let html
  try { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); html = await r.text() }
  catch (e) { log(`  ✗ ${type.padEnd(17)} ${url} — fetch failed: ${e.message}`); hardFails++; return }

  const h1 = (html.match(/<h1[\s>]/gi) || []).length
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(html)
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html)
  const jsonld = [...html.matchAll(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(' ')
  const primaryType = PAGE_PRIMARY.test(jsonld)
  const unsized = (html.match(/<img\b[^>]*>/gi) || []).filter((t) => /cdn\.sanity\.io/.test(t) && (!/\bwidth=/.test(t) || !/\bheight=/.test(t))).length

  const hard = []
  if (h1 !== 1) hard.push(`${h1} <h1> (need exactly 1)`)
  if (!canonical) hard.push('no canonical')
  if (!ogImage) hard.push('no og:image')

  const soft = []
  if (!primaryType) soft.push('no page-specific JSON-LD @type')
  if (unsized) soft.push(`${unsized} unsized Sanity <img> (CLS)`)

  if (hard.length) { log(`  ✗ ${type.padEnd(17)} ${url}`); hard.forEach((h) => log(`      HARD: ${h}`)); hardFails += hard.length }
  else log(`  ✓ ${type.padEnd(17)} ${url}`)
  soft.forEach((s) => log(`      warn: ${s}`))
}

async function liveCheck() {
  log(`── Live check (${BASE_URL}) ──`)
  let picked
  try { picked = await pickUrls() } catch (e) { log(`  ✗ could not read sitemap: ${e.message}`); hardFails++; return }
  for (const [type, url] of picked) await checkUrl(type, url)
  log()
}

// ── Run ─────────────────────────────────────────────────────────────────────
schemaLint()
if (!SCHEMA_ONLY) await liveCheck()

if (hardFails) { log(`❌ SEO check failed — ${hardFails} hard issue(s).`); process.exit(1) }
log('✅ SEO check passed (hard assertions). Review any warnings above.')
