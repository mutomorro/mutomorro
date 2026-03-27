/**
 * Google Alerts RSS (Atom) feed parser
 *
 * Fetches all active alert feeds from Supabase, parses the Atom XML,
 * extracts new items, and returns them as tender objects for scoring.
 *
 * Google Alerts feeds use Atom XML format. Items contain redirect URLs
 * that need to be unwrapped to get the actual destination.
 */

import { createClient } from '@supabase/supabase-js'

const DELAY_MS = 500 // Half second between feed fetches
const BATCH_SIZE = 10 // Fetch feeds in parallel batches of 10

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Extract the real destination URL from a Google redirect URL.
 */
function extractRealUrl(googleRedirectUrl) {
  try {
    const url = new URL(googleRedirectUrl)
    return url.searchParams.get('url') || googleRedirectUrl
  } catch {
    // Fallback: regex extraction
    const match = googleRedirectUrl.match(/[?&]url=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : googleRedirectUrl
  }
}

/**
 * Parse Atom XML feed content into an array of entries.
 * Uses regex since the Atom structure is simple and predictable.
 */
function parseAtomFeed(xml) {
  const entries = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1]

    const id = extractTag(entryXml, 'id')
    const title = extractTag(entryXml, 'title')
    const content = extractTag(entryXml, 'content')
    const published = extractTag(entryXml, 'published')
    const updated = extractTag(entryXml, 'updated')

    // Link is self-closing: <link href="..." />
    const linkMatch = entryXml.match(/<link\s+href="([^"]*)"/)
    const rawUrl = linkMatch ? decodeHtmlEntities(linkMatch[1]) : ''

    entries.push({
      id,
      title: decodeHtmlEntities(stripHtml(title)),
      content: stripHtml(decodeHtmlEntities(content)),
      published: published || updated,
      rawUrl,
      realUrl: extractRealUrl(rawUrl),
    })
  }

  return entries
}

/**
 * Extract text content of a simple XML tag.
 */
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`)
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

/**
 * Decode common HTML entities.
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
}

/**
 * Convert a Google Alert entry into a tender-shaped object.
 */
function entryToTender(entry, feed) {
  // Use the alert category to determine notice type
  const noticeType = feed.category === 'trigger' ? 'trigger_event' : 'google_alert'

  return {
    source: 'google-alerts',
    source_id: entry.id,
    source_url: entry.realUrl,
    title: entry.title,
    description: entry.content,
    organisation: '', // Google Alerts don't have structured org data
    value_low: null,
    value_high: null,
    currency: 'GBP',
    deadline: null,
    cpv_codes: [],
    notice_type: noticeType,
  }
}

/**
 * Fetch and parse a single feed. Returns entries array.
 */
async function fetchFeed(feed, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(feed.rss_url)
      if (!res.ok) {
        if (attempt === retries) {
          console.log(`  Warning: Feed "${feed.alert_name}" returned ${res.status}`)
          return []
        }
        await sleep(1000)
        continue
      }

      const xml = await res.text()
      return parseAtomFeed(xml)
    } catch (err) {
      if (attempt === retries) {
        console.log(`  Warning: Feed "${feed.alert_name}" failed: ${err.message}`)
        return []
      }
      await sleep(1000)
    }
  }
  return []
}

/**
 * Fetch all active Google Alert feeds, parse new items, return tender objects.
 *
 * @returns {Promise<{ tenders: Array, triggerCount: number, feedsChecked: number }>}
 */
export async function searchGoogleAlerts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Get all active feeds
  const { data: feeds, error } = await supabase
    .from('tender_alert_feeds')
    .select('*')
    .eq('is_active', true)
    .order('id')

  if (error) {
    throw new Error(`Failed to load alert feeds: ${error.message}`)
  }

  if (!feeds || feeds.length === 0) {
    console.log('  No active alert feeds found')
    return { tenders: [], triggerCount: 0, feedsChecked: 0 }
  }

  console.log(`  ${feeds.length} active feeds to check`)

  const seen = new Set()
  const allTenders = []
  let triggerCount = 0
  let totalEntries = 0
  const feedUpdates = []

  // Process feeds in batches
  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    const batch = feeds.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(feed => fetchFeed(feed))
    )

    for (let j = 0; j < batch.length; j++) {
      const feed = batch[j]
      const entries = results[j]

      // Filter to new entries only (after last_item_id)
      let newEntries = entries
      if (feed.last_item_id) {
        const lastIdx = entries.findIndex(e => e.id === feed.last_item_id)
        if (lastIdx >= 0) {
          newEntries = entries.slice(0, lastIdx) // Entries before the last seen one
        }
      }

      totalEntries += newEntries.length

      for (const entry of newEntries) {
        const tender = entryToTender(entry, feed)
        // Deduplicate by real URL (different alerts may find the same page)
        const dedupeKey = tender.source_url || tender.source_id
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey)
          allTenders.push(tender)
          if (tender.notice_type === 'trigger_event') triggerCount++
        }
      }

      // Track feed update (newest entry ID becomes last_item_id)
      if (entries.length > 0) {
        feedUpdates.push({
          id: feed.id,
          last_item_id: entries[0].id,
          last_polled: new Date().toISOString(),
        })
      } else {
        feedUpdates.push({
          id: feed.id,
          last_polled: new Date().toISOString(),
        })
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < feeds.length) {
      await sleep(DELAY_MS)
    }
  }

  // Update feed polling timestamps in Supabase
  for (const update of feedUpdates) {
    const updateData = { last_polled: update.last_polled }
    if (update.last_item_id) {
      updateData.last_item_id = update.last_item_id
    }
    await supabase
      .from('tender_alert_feeds')
      .update(updateData)
      .eq('id', update.id)
  }

  console.log(`  Checked ${feeds.length} feeds, ${totalEntries} total entries, ${allTenders.length} unique new items`)

  return {
    tenders: allTenders,
    triggerCount,
    feedsChecked: feeds.length,
  }
}

export { extractRealUrl, parseAtomFeed }
