/**
 * sanity-remove-trailing-slashes.js
 *
 * Walks Portable Text body fields across all Sanity document types and strips
 * trailing slashes from absolute mutomorro.com URLs in inline link annotations
 * (markDefs of type "link").
 *
 * Companion to strip-trailing-slashes.js, which handles internal "/path/" hrefs.
 * This one handles absolute "https://mutomorro.com/path/" hrefs.
 *
 * Default behaviour is DRY RUN — every change is logged but nothing is
 * written. Pass --apply to commit patches to Sanity.
 *
 * Patches are committed against the document _id as returned by the query,
 * which means both published documents and any "drafts.<id>" siblings get
 * patched — so a stale draft won't reintroduce slashes when published.
 *
 * Usage:
 *   SANITY_TOKEN=xxx node scripts/sanity-remove-trailing-slashes.js              # dry run
 *   SANITY_TOKEN=xxx node scripts/sanity-remove-trailing-slashes.js --apply      # commit
 */

const { createClient } = require('@sanity/client')

// ─── Configuration ──────────────────────────────────────────────────────────

const SANITY_PROJECT_ID = 'c6pg4t4h'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2024-01-01'

const APPLY = process.argv.includes('--apply')

if (!process.env.SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is required.')
  console.error('Get a token at https://sanity.io/manage (project c6pg4t4h, Editor role or above).')
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  perspective: 'raw', // include drafts so we patch both published and draft siblings
})

// ─── Field map ──────────────────────────────────────────────────────────────
//
// Mirrors strip-trailing-slashes.js so the two scripts stay in lock-step.
// If schemas drift, update both.

const TOP_LEVEL_FIELDS = {
  article: ['body'],
  tool: ['body'],
  course: ['body'],
  project: ['clientAndContext', 'theObjective', 'theApproach', 'whatChanged', 'keyInsight'],
  service: ['contextBody', 'perspectiveBody', 'approachIntro', 'recognitionBridge'],
  capabilityService: ['audienceBody'],
  dimension: ['body'],
  dimensionArticle: ['body'],
  sectorLandingPage: ['contextBody'],
  frameworkOverview: ['body'],
  resource: ['introduction'],
  pageCallout: ['body'],
}

const NESTED_FIELDS = {
  service: [{ parent: 'stages', child: 'stageBody' }],
  serviceSubPage: [{ parent: 'sections', child: 'body' }],
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Take an href and return the cleaned-up version (path's trailing slash
 * stripped while preserving query string and fragment), or null if no
 * change is needed.
 *
 * Rules:
 *   - Only absolute mutomorro.com URLs (http or https) are touched.
 *   - The bare domain "https://mutomorro.com" / "https://mutomorro.com/" is
 *     left alone.
 *   - Any other host (LinkedIn, Sanity CDN, etc.) is left alone.
 *   - Hostname check is strict — "mutomorro.com.evil.com" is NOT a match.
 *   - "https://mutomorro.com/foo/"           → "https://mutomorro.com/foo"
 *   - "https://mutomorro.com/foo/?q=1"       → "https://mutomorro.com/foo?q=1"
 *   - "https://mutomorro.com/foo/#bit"       → "https://mutomorro.com/foo#bit"
 */
function transformHref(href) {
  if (typeof href !== 'string') return null
  let url
  try {
    url = new URL(href)
  } catch {
    return null
  }
  if (url.hostname !== 'mutomorro.com') return null
  if (url.pathname === '/' || url.pathname === '') return null
  if (!url.pathname.endsWith('/')) return null
  url.pathname = url.pathname.slice(0, -1)
  return url.toString()
}

/**
 * Walk a Portable Text array, mutating link markDefs in place. Pushes a row
 * to `changes` for every link modified. Returns true if anything changed.
 */
function transformBlocks(blocks, ctx, changes) {
  if (!Array.isArray(blocks)) return false
  let modified = false
  for (const block of blocks) {
    if (!block || !Array.isArray(block.markDefs)) continue
    for (const mark of block.markDefs) {
      if (mark._type !== 'link') continue
      const next = transformHref(mark.href)
      if (next === null) continue
      changes.push({ ...ctx, oldHref: mark.href, newHref: next })
      mark.href = next
      modified = true
    }
  }
  return modified
}

// ─── Per-type processing ────────────────────────────────────────────────────

async function processType(type) {
  const topFields = TOP_LEVEL_FIELDS[type] || []
  const nested = NESTED_FIELDS[type] || []

  const projectionFields = ['_id', '_rev', ...topFields, ...nested.map(n => n.parent)]
  const projection = projectionFields.join(', ')

  const query = `*[_type == $type]{ ${projection} }`
  const docs = await client.fetch(query, { type })

  const changes = []
  const patches = []

  for (const doc of docs) {
    const setOps = {}
    let docModified = false

    for (const field of topFields) {
      const val = doc[field]
      if (!Array.isArray(val)) continue
      const cloned = JSON.parse(JSON.stringify(val))
      const ctx = { type, id: doc._id, field }
      if (transformBlocks(cloned, ctx, changes)) {
        setOps[field] = cloned
        docModified = true
      }
    }

    for (const { parent, child } of nested) {
      const arr = doc[parent]
      if (!Array.isArray(arr)) continue
      const arrClone = JSON.parse(JSON.stringify(arr))
      let parentModified = false
      arrClone.forEach((item, idx) => {
        if (!item || !Array.isArray(item[child])) return
        const ctx = { type, id: doc._id, field: `${parent}[${idx}].${child}` }
        if (transformBlocks(item[child], ctx, changes)) {
          parentModified = true
        }
      })
      if (parentModified) {
        setOps[parent] = arrClone
        docModified = true
      }
    }

    if (docModified) {
      patches.push({ id: doc._id, set: setOps })
    }
  }

  return { docCount: docs.length, changes, patches }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('sanity-remove-trailing-slashes.js')
  console.log(`Mode: ${APPLY ? 'APPLY (will write to Sanity)' : 'DRY RUN (no writes)'}`)
  console.log(`Project: ${SANITY_PROJECT_ID} / ${SANITY_DATASET}`)
  console.log()

  const types = Object.keys(TOP_LEVEL_FIELDS)
  for (const t of Object.keys(NESTED_FIELDS)) {
    if (!types.includes(t)) types.push(t)
  }

  let totalDocs = 0
  let totalLinks = 0
  let allPatches = []
  const docIdsTouched = new Set()

  for (const type of types) {
    const { docCount, changes, patches } = await processType(type)
    totalDocs += docCount
    totalLinks += changes.length
    allPatches = allPatches.concat(patches)
    for (const p of patches) docIdsTouched.add(p.id)

    if (changes.length === 0) {
      console.log(`── ${type}: ${docCount} docs scanned, 0 links to update`)
      continue
    }

    console.log(`── ${type}: ${docCount} docs scanned, ${changes.length} link(s) across ${patches.length} doc(s)`)
    for (const c of changes) {
      console.log(`     ${c.id}`)
      console.log(`       ${c.field}`)
      console.log(`       ${c.oldHref}  →  ${c.newHref}`)
    }
    console.log()
  }

  console.log('─────────────────────────────────────────────')
  console.log(`Totals: ${totalLinks} link(s) in ${allPatches.length} doc(s) (${totalDocs} docs scanned across ${types.length} types)`)

  // Show published vs draft breakdown
  const draftIds = [...docIdsTouched].filter(id => id.startsWith('drafts.'))
  const publishedIds = [...docIdsTouched].filter(id => !id.startsWith('drafts.'))
  console.log(`  Published docs: ${publishedIds.length}`)
  console.log(`  Draft docs:     ${draftIds.length}`)

  if (!APPLY) {
    console.log()
    console.log('This was a DRY RUN. Re-run with --apply to commit changes.')
    return
  }

  if (allPatches.length === 0) {
    console.log('Nothing to patch. Done.')
    return
  }

  console.log()
  console.log('Committing patches in batches of 50...')

  const BATCH_SIZE = 50
  let committed = 0
  for (let i = 0; i < allPatches.length; i += BATCH_SIZE) {
    const batch = allPatches.slice(i, i + BATCH_SIZE)
    const tx = client.transaction()
    for (const p of batch) {
      tx.patch(p.id, { set: p.set })
    }
    await tx.commit()
    committed += batch.length
    console.log(`  ${committed} / ${allPatches.length} committed`)
  }

  console.log()
  console.log(`Done. Patched ${committed} document(s) (published and drafts).`)
  console.log('Spot-check a few in Sanity Studio to confirm.')
}

main().catch(err => {
  console.error()
  console.error('Error:', err.message)
  if (err.response?.body) console.error(err.response.body)
  process.exit(1)
})
