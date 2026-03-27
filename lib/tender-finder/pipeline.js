/**
 * Tender Finder pipeline
 *
 * Runs all four input channels, deduplicates across sources,
 * keyword scores, AI scores, and stores in Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import { searchContractsFinder } from './contracts-finder.js'
import { searchFindATender } from './find-a-tender.js'
import { searchGoogleAlerts } from './google-alerts.js'
import { checkWatchlist } from './watchlist.js'
import { scoreTender, recalculateWithAi } from './scorer.js'
import { aiScoreBatch } from './ai-scorer.js'

const DEDUP_BATCH = 50

/**
 * Normalise a title for fuzzy deduplication.
 */
function normaliseTitle(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Cross-source deduplication within a batch of tenders.
 * Removes duplicates by: source_url match, or normalised title + organisation match.
 * When duplicates found, keeps the one with the longer description.
 */
function deduplicateAcrossSources(tenders) {
  const byUrl = new Map()
  const byTitleOrg = new Map()
  const kept = []

  for (const tender of tenders) {
    if (tender.source_url) {
      const existing = byUrl.get(tender.source_url)
      if (existing) {
        if ((tender.description || '').length > (existing.description || '').length) {
          const idx = kept.indexOf(existing)
          if (idx >= 0) kept[idx] = tender
          byUrl.set(tender.source_url, tender)
        }
        continue
      }
      byUrl.set(tender.source_url, tender)
    }

    const normTitle = normaliseTitle(tender.title)
    const normOrg = normaliseTitle(tender.organisation)
    if (normTitle && normOrg) {
      const key = `${normTitle}::${normOrg}`
      const existing = byTitleOrg.get(key)
      if (existing) {
        if ((tender.description || '').length > (existing.description || '').length) {
          const idx = kept.indexOf(existing)
          if (idx >= 0) kept[idx] = tender
          byTitleOrg.set(key, tender)
        }
        continue
      }
      byTitleOrg.set(key, tender)
    }

    kept.push(tender)
  }

  return kept.filter(Boolean)
}

/**
 * Check which tenders already exist in Supabase.
 */
async function findExistingIds(supabase, tenders) {
  const existingIds = new Set()
  const existingUrls = new Set()

  const sourceGroups = {}
  for (const t of tenders) {
    if (!t.source_id) continue
    if (!sourceGroups[t.source]) sourceGroups[t.source] = []
    sourceGroups[t.source].push(t.source_id)
  }

  for (const [source, ids] of Object.entries(sourceGroups)) {
    for (let i = 0; i < ids.length; i += DEDUP_BATCH) {
      const batch = ids.slice(i, i + DEDUP_BATCH)
      const { data, error } = await supabase
        .from('tenders')
        .select('source_id, source_url')
        .eq('source', source)
        .in('source_id', batch)

      if (error) throw new Error(`Supabase lookup error: ${error.message}`)

      for (const row of (data || [])) {
        existingIds.add(`${source}::${row.source_id}`)
        if (row.source_url) existingUrls.add(row.source_url)
      }
    }
  }

  const urls = tenders.map(t => t.source_url).filter(Boolean)
  for (let i = 0; i < urls.length; i += DEDUP_BATCH) {
    const batch = urls.slice(i, i + DEDUP_BATCH)
    const { data, error } = await supabase
      .from('tenders')
      .select('source_url')
      .in('source_url', batch)

    if (!error && data) {
      for (const row of data) {
        if (row.source_url) existingUrls.add(row.source_url)
      }
    }
  }

  return { existingIds, existingUrls }
}

/**
 * Run the full pipeline: all channels > deduplicate > keyword score > AI score > store.
 *
 * @param {Object} options
 * @param {string} [options.publishedFrom] - ISO date for Contracts Finder
 * @param {string} [options.updatedFrom] - ISO date for Find a Tender
 * @param {boolean} [options.dryRun=false] - Skip Supabase writes
 * @param {boolean} [options.skipAi=false] - Skip AI scoring
 * @param {Object} [options.channels] - Which channels to run
 * @returns {Object} Summary
 */
export async function runPipeline(options = {}) {
  const {
    publishedFrom,
    updatedFrom,
    dryRun = false,
    skipAi = false,
    channels = { contractsFinder: true, findATender: true, googleAlerts: true, watchlist: true },
  } = options

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const summary = {
    contractsFinder: { fetched: 0, new: 0 },
    findATender: { fetched: 0, new: 0 },
    googleAlerts: { fetched: 0, new: 0, triggerEvents: 0, feedsChecked: 0 },
    watchlist: { checked: 0, changed: 0, tendersFound: 0, errors: 0 },
    crossSourceDuplicates: 0,
    dbDuplicates: 0,
    scored: 0,
    aiScoring: { calls: 0, errors: 0 },
    stored: 0,
    byTemperature: {},
  }

  console.log('\n=== Tender Finder Pipeline ===')
  console.log(`Dry run: ${dryRun} | Skip AI: ${skipAi}`)
  console.log(`Channels: ${Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(', ')}\n`)

  // ── Step 1: Fetch from all channels ──

  let allRaw = []

  if (channels.contractsFinder) {
    console.log('Channel 1: Contracts Finder...')
    try {
      const cfResults = await searchContractsFinder(publishedFrom)
      summary.contractsFinder.fetched = cfResults.length
      allRaw.push(...cfResults)
      console.log(`  ${cfResults.length} tenders\n`)
    } catch (err) {
      console.error(`  Error: ${err.message}\n`)
    }
  }

  if (channels.findATender) {
    console.log('Channel 2: Find a Tender...')
    try {
      const fatResults = await searchFindATender(updatedFrom)
      summary.findATender.fetched = fatResults.length
      allRaw.push(...fatResults)
      console.log(`  ${fatResults.length} tenders\n`)
    } catch (err) {
      console.error(`  Error: ${err.message}\n`)
    }
  }

  if (channels.googleAlerts) {
    console.log('Channel 3: Google Alerts...')
    try {
      const gaResults = await searchGoogleAlerts()
      summary.googleAlerts.fetched = gaResults.tenders.length
      summary.googleAlerts.triggerEvents = gaResults.triggerCount
      summary.googleAlerts.feedsChecked = gaResults.feedsChecked
      allRaw.push(...gaResults.tenders)
      console.log(`  ${gaResults.tenders.length} items (${gaResults.triggerCount} trigger events)\n`)
    } catch (err) {
      console.error(`  Error: ${err.message}\n`)
    }
  }

  if (channels.watchlist) {
    console.log('Channel 4: Watchlist...')
    try {
      const wlResults = await checkWatchlist()
      summary.watchlist.checked = wlResults.checked
      summary.watchlist.changed = wlResults.changed
      summary.watchlist.tendersFound = wlResults.tenders.length
      summary.watchlist.errors = wlResults.errors
      allRaw.push(...wlResults.tenders)
      console.log(`  ${wlResults.checked} checked, ${wlResults.changed} changed, ${wlResults.tenders.length} tenders found\n`)
    } catch (err) {
      console.error(`  Error: ${err.message}\n`)
    }
  }

  const totalFetched = allRaw.length
  console.log(`Total fetched: ${totalFetched}`)

  if (totalFetched === 0) {
    console.log('No tenders found. Done.\n')
    return summary
  }

  // ── Step 2: Cross-source deduplication ──

  console.log('\nStep 2: Cross-source deduplication...')
  const deduplicated = deduplicateAcrossSources(allRaw)
  summary.crossSourceDuplicates = totalFetched - deduplicated.length
  console.log(`  ${summary.crossSourceDuplicates} cross-source duplicates removed, ${deduplicated.length} unique`)

  // ── Step 3: Database deduplication ──

  console.log('\nStep 3: Database deduplication...')
  const { existingIds, existingUrls } = await findExistingIds(supabase, deduplicated)

  const newTenders = deduplicated.filter(t => {
    const idKey = `${t.source}::${t.source_id}`
    if (existingIds.has(idKey)) return false
    if (t.source_url && existingUrls.has(t.source_url)) return false
    return true
  })

  summary.dbDuplicates = deduplicated.length - newTenders.length

  for (const t of newTenders) {
    if (t.source === 'contracts-finder') summary.contractsFinder.new++
    else if (t.source === 'find-a-tender') summary.findATender.new++
    else if (t.source === 'google-alerts') summary.googleAlerts.new++
  }

  console.log(`  ${summary.dbDuplicates} already in DB, ${newTenders.length} new`)

  if (newTenders.length === 0) {
    console.log('\nNo new tenders to process. Done.\n')
    return summary
  }

  // ── Step 4: Keyword score ──

  console.log(`\nStep 4: Keyword scoring ${newTenders.length} tenders...`)
  const scoredTenders = newTenders.map(tender => {
    const scores = scoreTender(tender)
    return { ...tender, ...scores }
  })

  summary.scored = scoredTenders.length

  // ── Step 5: AI score ──

  if (!skipAi) {
    console.log(`\nStep 5: AI scoring...`)
    const aiResult = await aiScoreBatch(scoredTenders)
    summary.aiScoring.calls = aiResult.aiCalls
    summary.aiScoring.errors = aiResult.aiErrors
    console.log(`  ${aiResult.aiCalls} AI calls (${aiResult.aiErrors} errors)`)

    // Recalculate totals with AI scores
    for (const tender of scoredTenders) {
      if (tender.ai_score != null) {
        const recalc = recalculateWithAi(tender)
        tender.total_score = recalc.total_score
        tender.temperature = recalc.temperature
      }
    }
  } else {
    console.log('\nStep 5: AI scoring SKIPPED')
  }

  // Count temperatures
  for (const t of scoredTenders) {
    summary.byTemperature[t.temperature] = (summary.byTemperature[t.temperature] || 0) + 1
  }
  console.log(`\n  Temperature: ${JSON.stringify(summary.byTemperature)}`)

  // Log interesting tenders
  const interesting = scoredTenders.filter(t => t.temperature === 'hot' || t.temperature === 'warm')
  if (interesting.length > 0) {
    console.log('\n  Interesting tenders:')
    for (const t of interesting) {
      const aiTag = t.ai_score != null ? ` | AI: ${t.ai_score}/10` : ''
      console.log(`  [${t.temperature.toUpperCase()}] ${t.total_score}pts${aiTag} - ${t.title.slice(0, 80)}`)
      if (t.ai_summary) {
        console.log(`    ${t.ai_summary.slice(0, 100)}`)
      }
      if (t.keywords_matched?.length > 0) {
        console.log(`    Keywords: ${t.keywords_matched.join(', ')}`)
      }
      console.log(`    Source: ${t.source} | Org: ${t.organisation || 'N/A'} | Value: ${t.value_high || 'N/A'}`)
    }
  }

  // ── Step 6: Store ──

  if (dryRun) {
    console.log('\nStep 6: DRY RUN - skipping storage\n')
    return summary
  }

  console.log(`\nStep 6: Storing ${scoredTenders.length} tenders...`)

  // Clean tenders for Supabase (remove fields not in the table)
  const toStore = scoredTenders.map(t => {
    const clean = { ...t }
    delete clean.ai_service // Not a column in the tenders table
    return clean
  })

  const batchSize = 50
  let stored = 0

  for (let i = 0; i < toStore.length; i += batchSize) {
    const batch = toStore.slice(i, i + batchSize)
    const { error: insertError } = await supabase
      .from('tenders')
      .insert(batch)

    if (insertError) {
      console.error(`  Batch insert error: ${insertError.message}`)
      throw new Error(`Supabase insert error: ${insertError.message}`)
    }
    stored += batch.length
  }

  summary.stored = stored
  console.log(`  Stored ${stored} tenders`)

  // ── Summary ──

  console.log('\n=== Pipeline complete ===')
  console.log(`Contracts Finder: ${summary.contractsFinder.fetched} fetched, ${summary.contractsFinder.new} new`)
  console.log(`Find a Tender: ${summary.findATender.fetched} fetched, ${summary.findATender.new} new`)
  console.log(`Google Alerts: ${summary.googleAlerts.fetched} items, ${summary.googleAlerts.new} new (${summary.googleAlerts.triggerEvents} trigger events)`)
  console.log(`Watchlist: ${summary.watchlist.checked} checked, ${summary.watchlist.changed} changed, ${summary.watchlist.tendersFound} tenders`)
  console.log(`AI scoring: ${summary.aiScoring.calls} calls (${summary.aiScoring.errors} errors)`)
  console.log(`Stored: ${summary.stored}`)
  console.log(`Hot: ${summary.byTemperature.hot || 0}, Warm: ${summary.byTemperature.warm || 0}, Cool: ${summary.byTemperature.cool || 0}, Archived: ${summary.byTemperature.archived || 0}\n`)

  return summary
}
