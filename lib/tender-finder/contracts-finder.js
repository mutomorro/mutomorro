/**
 * Contracts Finder V2 API client
 *
 * Uses the search_notices/json endpoint (V2) which provides:
 * - Proper keyword relevance scoring
 * - valueLow / valueHigh fields
 * - Deadline filtering
 * - Organisation name directly
 */

const BASE_URL = 'https://www.contractsfinder.service.gov.uk/api/rest/2/search_notices/json'

const SEARCH_KEYWORDS = [
  'organisational development',
  'change management',
  'culture change',
  'leadership development',
  'organisational design',
]

const PAGE_SIZE = 100
const DELAY_MS = 1000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Search for a single keyword via the V2 API.
 * Uses deadlineFrom to only get tenders still open.
 */
async function searchByKeyword(keyword, deadlineFrom, retries = 3) {
  const body = {
    searchCriteria: {
      keyword,
      stages: ['tender'],
      deadlineFrom: deadlineFrom || new Date().toISOString().split('T')[0],
    },
    size: PAGE_SIZE,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 429) {
      const backoff = Math.pow(2, attempt) * 1000
      console.log(`  Rate limited. Backing off ${backoff}ms...`)
      await sleep(backoff)
      continue
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Contracts Finder API error ${res.status}: ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    return data
  }

  throw new Error('Contracts Finder API: max retries exceeded (429)')
}

/**
 * Parse a V2 notice item into a flat tender object.
 */
function parseNotice(notice) {
  const item = notice.item || notice

  // Build source URL
  const noticeId = item.id
  const sourceUrl = noticeId
    ? `https://www.contractsfinder.service.gov.uk/Notice/${noticeId}`
    : null

  // Parse CPV codes
  const cpvCodes = item.cpvCodes
    ? item.cpvCodes.split(',').map(c => c.trim()).filter(Boolean)
    : []

  return {
    source: 'contracts-finder',
    source_id: item.id || item.noticeIdentifier,
    source_url: sourceUrl,
    title: item.title || '',
    description: item.description || '',
    organisation: item.organisationName || '',
    value_low: item.valueLow || null,
    value_high: item.valueHigh || null,
    currency: 'GBP',
    deadline: item.deadlineDate || null,
    cpv_codes: cpvCodes,
    notice_type: item.noticeType || 'tender',
  }
}

/**
 * Run searches for all keywords. Deduplicates by source_id.
 * Only returns tenders with status "Open" and deadline in the future.
 *
 * @param {string} [publishedFrom] - ISO date string (unused currently, kept for API compat)
 * @returns {Promise<Array>} Array of parsed tender objects
 */
export async function searchContractsFinder(publishedFrom) {
  const seen = new Set()
  const allTenders = []
  const today = new Date().toISOString().split('T')[0]

  for (const keyword of SEARCH_KEYWORDS) {
    console.log(`Searching: "${keyword}"...`)

    const data = await searchByKeyword(keyword, today)
    const notices = data.noticeList || []

    let added = 0
    for (const notice of notices) {
      const item = notice.item || notice

      // Only include Open tenders
      if (item.noticeStatus !== 'Open') continue

      const tender = parseNotice(notice)
      if (!seen.has(tender.source_id)) {
        seen.add(tender.source_id)
        allTenders.push(tender)
        added++
      }
    }

    console.log(`  ${data.hitCount || 0} hits, ${added} new open tenders added (${allTenders.length} unique total)`)

    // Delay between keyword searches
    await sleep(DELAY_MS)
  }

  return allTenders
}

export { SEARCH_KEYWORDS }
