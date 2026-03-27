/**
 * Find a Tender OCDS API client
 *
 * Uses the OCDS release packages API endpoint which provides structured JSON.
 * No keyword search available via API, so we fetch all recent tenders
 * and let the scorer handle relevance filtering.
 *
 * API endpoint: /api/1.0/ocdsReleasePackages
 * Params: stages, limit, cursor, updatedFrom, updatedTo
 */

const BASE_URL = 'https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages'
const PAGE_LIMIT = 100
const MAX_PAGES = 10
const DELAY_MS = 2000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch a single page of results from the FaT OCDS API.
 */
async function fetchPage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url)

    if (res.status === 429) {
      const backoff = Math.pow(2, attempt) * DELAY_MS
      console.log(`  Rate limited. Backing off ${backoff}ms...`)
      await sleep(backoff)
      continue
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Find a Tender API error ${res.status}: ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    return {
      releases: data.releases || [],
      nextUrl: data.links?.next || null,
    }
  }

  throw new Error('Find a Tender API: max retries exceeded')
}

/**
 * Parse an OCDS release from Find a Tender into a flat tender object.
 */
function parseRelease(release) {
  const tender = release.tender || {}
  const value = tender.value || {}

  // Find the buyer from parties
  const buyer = (release.parties || []).find(p =>
    (p.roles || []).includes('buyer')
  )

  // Extract CPV code
  const cpvCode = tender.classification?.id
  const cpvCodes = cpvCode ? [cpvCode] : []

  // Build the source URL
  const ocid = release.ocid || ''
  const noticeRef = ocid.replace('ocds-h6vhtk-', '')
  const sourceUrl = noticeRef
    ? `https://www.find-tender.service.gov.uk/Notice/${noticeRef}`
    : null

  // Map OCDS procurement method to notice type
  let noticeType = 'tender'
  const tag = (release.tag || [])[0]
  if (tag === 'planning' || tag === 'planningUpdate') {
    noticeType = 'PIN'
  }

  return {
    source: 'find-a-tender',
    source_id: release.ocid || release.id,
    source_url: sourceUrl,
    title: tender.title || '',
    description: tender.description || '',
    organisation: buyer?.name || '',
    value_low: value.amount || null,
    value_high: value.amount || null,
    currency: value.currency || 'GBP',
    deadline: tender.tenderPeriod?.endDate || null,
    cpv_codes: cpvCodes,
    notice_type: noticeType,
  }
}

/**
 * Fetch recent tenders from Find a Tender.
 * Uses the OCDS API with date filtering.
 *
 * @param {string} [updatedFrom] - ISO date string, defaults to 7 days ago
 * @returns {Promise<Array>} Array of parsed tender objects
 */
export async function searchFindATender(updatedFrom) {
  // Default to last 7 days if no date provided
  if (!updatedFrom) {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    updatedFrom = weekAgo.toISOString()
  } else if (!updatedFrom.includes('T')) {
    // Add time component if only date provided
    updatedFrom = `${updatedFrom}T00:00:00Z`
  }

  const seen = new Set()
  const allTenders = []

  const params = new URLSearchParams({
    stages: 'tender',
    limit: String(PAGE_LIMIT),
    updatedFrom,
  })

  let url = `${BASE_URL}?${params.toString()}`
  let pageCount = 0

  console.log(`  Fetching from ${updatedFrom}...`)

  while (url && pageCount < MAX_PAGES) {
    pageCount++
    const { releases, nextUrl } = await fetchPage(url)

    for (const release of releases) {
      // Only include active tenders
      if (release.tender?.status !== 'active') continue

      const tender = parseRelease(release)
      if (!seen.has(tender.source_id)) {
        seen.add(tender.source_id)
        allTenders.push(tender)
      }
    }

    console.log(`  Page ${pageCount}: ${releases.length} releases, ${allTenders.length} active unique total`)

    url = nextUrl
    if (url) await sleep(DELAY_MS)
  }

  return allTenders
}
