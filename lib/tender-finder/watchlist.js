/**
 * Organisation watchlist change detection
 *
 * Monitors procurement/tender pages for organisations Mutomorro is interested in.
 * Fetches pages, hashes content, detects changes, and sends changed content
 * to Claude for tender identification.
 */

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const DELAY_MS = 2000 // Respectful delay between page fetches
const USER_AGENT = 'Mutomorro Tender Monitor (contact: hello@mutomorro.com)'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function hashContent(text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

/**
 * Strip HTML to plain text for comparison and AI analysis.
 */
function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build the watchlist analysis prompt for Claude.
 */
function buildWatchlistPrompt(organisation, newContent) {
  // Truncate to keep tokens manageable
  const truncated = newContent.slice(0, 4000)

  return `A procurement/tender page has changed for ${organisation}.

Here is the new content from the page:

${truncated}

Is there a new tender, procurement opportunity, or contract notice here that relates to organisational development, change management, leadership, culture change, employee experience, service design, or similar consultancy services?

If YES, respond in this format:
FOUND: YES
TITLE: [tender title]
DEADLINE: [deadline if visible, otherwise "Not specified"]
VALUE: [value if visible, otherwise "Not specified"]
SUMMARY: [one-line description]

If NO relevant tender is found:
FOUND: NO
SUMMARY: [brief note on what the page contains]`
}

/**
 * Parse the watchlist AI response.
 */
function parseWatchlistResponse(text) {
  const foundMatch = text.match(/FOUND:\s*(YES|NO)/i)
  const found = foundMatch ? foundMatch[1].toUpperCase() === 'YES' : false

  if (!found) {
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/)
    return { found: false, summary: summaryMatch ? summaryMatch[1].trim() : '' }
  }

  const titleMatch = text.match(/TITLE:\s*(.+)/)
  const deadlineMatch = text.match(/DEADLINE:\s*(.+)/)
  const valueMatch = text.match(/VALUE:\s*(.+)/)
  const summaryMatch = text.match(/SUMMARY:\s*(.+)/)

  return {
    found: true,
    title: titleMatch ? titleMatch[1].trim() : 'Untitled opportunity',
    deadline: deadlineMatch ? deadlineMatch[1].trim() : null,
    value: valueMatch ? valueMatch[1].trim() : null,
    summary: summaryMatch ? summaryMatch[1].trim() : '',
  }
}

/**
 * Fetch a watchlist URL and return stripped text + hash.
 */
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const html = await res.text()
  const text = stripHtml(html)
  const hash = hashContent(text)

  return { text, hash }
}

/**
 * Check all active watchlist entries for changes.
 * Returns any new tender objects found.
 *
 * @returns {Promise<{ tenders: Array, checked: number, changed: number, errors: number }>}
 */
export async function checkWatchlist() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Load active watchlist organisations from Supabase
  const { data: entries, error } = await supabase
    .from('watchlist')
    .select('id, name, procurement_url, content_hash, lane, notes')
    .eq('monitoring_active', true)
    .not('procurement_url', 'is', null)

  if (error) {
    throw new Error(`Failed to load watchlist: ${error.message}`)
  }

  if (!entries || entries.length === 0) {
    console.log('  No active watchlist entries')
    return { tenders: [], checked: 0, changed: 0, errors: 0 }
  }

  console.log(`  ${entries.length} watchlist URLs to check`)

  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  let anthropic = null
  if (hasApiKey) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  const tenders = []
  let changed = 0
  let errors = 0

  for (const entry of entries) {
    console.log(`  Checking: ${entry.name}...`)

    try {
      const { text, hash } = await fetchPage(entry.procurement_url)

      // Update last_checked
      await supabase
        .from('watchlist')
        .update({ last_checked: new Date().toISOString() })
        .eq('id', entry.id)

      if (hash === entry.content_hash) {
        console.log(`    No change`)
        await sleep(DELAY_MS)
        continue
      }

      // Content changed!
      changed++
      console.log(`    CHANGED - analysing...`)

      // Update the watchlist record with new hash and timestamp
      await supabase
        .from('watchlist')
        .update({
          content_hash: hash,
          last_checked: new Date().toISOString(),
          last_change_detected: new Date().toISOString(),
        })
        .eq('id', entry.id)

      // Ask Claude to analyse the change (if API key available)
      if (anthropic) {
        try {
          const prompt = buildWatchlistPrompt(entry.name, text)
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
          })

          const result = parseWatchlistResponse(response.content[0].text)

          if (result.found) {
            console.log(`    TENDER FOUND: ${result.title}`)
            tenders.push({
              source: 'watchlist',
              source_id: `watchlist-${entry.id}-${hash.slice(0, 8)}`,
              source_url: entry.procurement_url,
              title: result.title,
              description: result.summary,
              organisation: entry.name,
              value_low: null,
              value_high: null,
              currency: 'GBP',
              deadline: result.deadline !== 'Not specified' ? result.deadline : null,
              cpv_codes: [],
              notice_type: 'watchlist',
            })
          } else {
            console.log(`    Changed but no relevant tender: ${result.summary?.slice(0, 60)}`)
          }
        } catch (aiErr) {
          console.error(`    AI analysis failed: ${aiErr.message}`)
        }
      } else {
        console.log(`    No API key - skipping AI analysis`)
      }
    } catch (fetchErr) {
      errors++
      console.error(`    Fetch failed: ${fetchErr.message}`)
    }

    await sleep(DELAY_MS)
  }

  return { tenders, checked: entries.length, changed, errors }
}
