/**
 * Tender Finder pipeline
 *
 * Three-stage architecture for Vercel cron (each stage under 300s):
 *   Stage 1 (runFetchStage)   - Fetch all channels, deduplicate, keyword score, store
 *   Stage 2 (runAiScoreStage) - AI score any unscored tenders from the last 24h
 *   Stage 3 (runDigestStage)  - Build and send the daily digest (hot tenders only)
 *
 * The original runPipeline function is kept for manual/test runs where
 * time limits aren't a concern.
 */

import { createClient } from '@supabase/supabase-js'
import { fetchAllPaginated } from '../supabase-paginate.js'
import { searchContractsFinder } from './contracts-finder.js'
import { searchFindATender } from './find-a-tender.js'
import { searchGoogleAlerts } from './google-alerts.js'
import { checkWatchlist } from './watchlist.js'
import { searchPCS } from './pcs.js'
import { scoreTender, recalculateWithAi } from './scorer.js'
import { aiScoreBatch } from './ai-scorer.js'
// import { sendHotAlerts } from './alerts.js' // disabled — digest is the only notification now
import { buildDigest, sendDigest } from './digest.js'

const DEDUP_BATCH = 50

/**
 * Pre-filter obvious noise from Google Alerts before storing.
 * Portal results (contracts-finder, find-a-tender, pcs, watchlist) are NEVER filtered.
 * Returns { kept: [], filtered: number, reasons: {} }
 */
function preFilterNoise(tenders) {
  const kept = []
  let filtered = 0
  const reasons = {}

  function reject(reason) {
    filtered++
    reasons[reason] = (reasons[reason] || 0) + 1
  }

  // Domain blocklist - sites that never produce tender opportunities
  const BLOCKED_DOMAINS = [
    // News sites and aggregators
    'bbc.co.uk', 'bbc.com', 'theguardian.com', 'telegraph.co.uk',
    'independent.co.uk', 'mirror.co.uk', 'express.co.uk', 'dailymail.co.uk',
    'msn.com', 'news.sky.com', 'itv.com', 'channel4.com',
    'heraldscotland.com', 'scotsman.com', 'glasgowlive.co.uk',
    'edinburghlive.co.uk', 'dailyrecord.co.uk', 'pressandjournal.co.uk',
    'eveningexpress.co.uk', 'thecourier.co.uk', 'bordertelegraph.com',
    'pressreader.com', 'aol.com', 'yahoo.com', 'huffpost.com',
    'miragenews.com', 'reuters.com', 'apnews.com',
    // International news
    'adomonline.com', 'ghanaweb.com', 'punchng.com', 'aljazeera.com',
    // Social media and video
    'youtube.com', 'linkedin.com', 'facebook.com', 'twitter.com',
    'x.com', 'reddit.com', 'tiktok.com', 'instagram.com', 'wikipedia.org',
    // Investment and finance
    'investegate.co.uk', 'morningstar.co.uk', 'morningstar.com',
    'londonstockexchange.com', 'investorschronicle.co.uk',
    'sharesmagazine.co.uk', 'proactiveinvestors.co.uk',
    // PR and marketing industry
    'prweek.co.uk', 'prweek.com', 'campaignlive.co.uk',
    'marketingweek.com', 'thedrum.com', 'adweek.com',
    // International grants (not UK procurement)
    'fundsforngos.org', 'devex.com',
    // Construction
    'constructionenquirer.com', 'constructionnews.co.uk',
    'building.co.uk', 'constructionindustrycouncil.co.uk',
    // Entertainment
    'broadwayworld.com', 'whatsonstage.com',
    // Property listings
    'rightmove.co.uk', 'zoopla.co.uk', 'onthemarket.com',
  ]

  // Title patterns that indicate noise (case-insensitive)
  const BLOCKED_TITLE_PATTERNS = [
    // Already-awarded contracts
    /\bawarded?\b/i,
    /\bcontract award\b/i,
    /\bwins contract\b/i,
    /\bappoints\b/i,
    /\bsecures contract\b/i,
    // Job ads (not consultancy calls)
    /\binternship\b/i,
    /\bgraduate (programme|scheme|role)\b/i,
    /\bapprentice(ship)?\b/i,
    // Streaming and entertainment
    /\b(netflix|disney\+?|hbo|amazon prime|paramount)\b/i,
    // Stock market / financial
    /\binterim results\b/i,
    /\bblock listing\b/i,
    /\bshare(holder|s)? (update|notice|price)\b/i,
    /\b(annual|quarterly) report\b/i,
    /\bipo\b/i,
    /\btrading update\b/i,
  ]

  for (const tender of tenders) {
    // NEVER filter portal results
    if (tender.source !== 'google-alerts') {
      kept.push(tender)
      continue
    }

    // Check domain blocklist
    if (tender.source_url) {
      try {
        const hostname = new URL(tender.source_url).hostname.replace(/^www\./, '')
        if (BLOCKED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
          reject('blocked_domain')
          continue
        }
      } catch {
        // If URL parsing fails, let it through
      }
    }

    // Check title patterns
    const title = tender.title || ''
    if (BLOCKED_TITLE_PATTERNS.some(pattern => pattern.test(title))) {
      reject('blocked_title_pattern')
      continue
    }

    // Passed all checks
    kept.push(tender)
  }

  return { kept, filtered, reasons }
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

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


// ═══════════════════════════════════════════════════════
// STAGE 1: Fetch, deduplicate, keyword score, store
// ═══════════════════════════════════════════════════════

/**
 * Stage 1: Fetch from all channels, deduplicate, keyword score, store.
 * AI scoring is left for Stage 2 to keep this within the time limit.
 */
export async function runFetchStage(options = {}) {
  const {
    publishedFrom,
    updatedFrom,
    channels = { contractsFinder: true, findATender: true, pcs: true, googleAlerts: true, watchlist: true },
  } = options

  const supabase = getSupabase()

  const summary = {
    stage: 'fetch',
    contractsFinder: { fetched: 0, new: 0 },
    findATender: { fetched: 0, new: 0 },
    pcs: { fetched: 0, new: 0 },
    googleAlerts: { fetched: 0, new: 0, triggerEvents: 0, feedsChecked: 0 },
    watchlist: { checked: 0, changed: 0, tendersFound: 0, errors: 0 },
    crossSourceDuplicates: 0,
    preFiltered: 0,
    preFilterReasons: {},
    dbDuplicates: 0,
    scored: 0,
    stored: 0,
    byTemperature: {},
  }

  console.log('\n=== Tender Finder Pipeline - Stage 1: Fetch ===')
  console.log(`Channels: ${Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(', ')}\n`)

  // ── Fetch from all channels ──

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

  if (channels.pcs) {
    console.log('Channel 5: Public Contracts Scotland...')
    try {
      const pcsResults = await searchPCS()
      summary.pcs.fetched = pcsResults.length
      allRaw.push(...pcsResults)
      console.log(`  ${pcsResults.length} tenders\n`)
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

  // ── Pre-filter noise ──

  console.log('\nPre-filtering noise...')
  const { kept: preFiltered, filtered: noiseCount, reasons: filterReasons } = preFilterNoise(allRaw)
  summary.preFiltered = noiseCount
  summary.preFilterReasons = filterReasons
  console.log(`  ${noiseCount} noise items removed (${JSON.stringify(filterReasons)})`)
  console.log(`  ${preFiltered.length} items passed filter`)

  // ── Cross-source deduplication ──

  console.log('\nDeduplicating across sources...')
  const deduplicated = deduplicateAcrossSources(preFiltered)
  summary.crossSourceDuplicates = preFiltered.length - deduplicated.length
  console.log(`  ${summary.crossSourceDuplicates} cross-source duplicates removed, ${deduplicated.length} unique`)

  // ── Database deduplication ──

  console.log('\nDeduplicating against database...')
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
    else if (t.source === 'pcs') summary.pcs.new++
  }

  console.log(`  ${summary.dbDuplicates} already in DB, ${newTenders.length} new`)

  if (newTenders.length === 0) {
    console.log('\nNo new tenders to process. Done.\n')
    return summary
  }

  // ── Keyword score (no AI - that's Stage 2) ──

  console.log(`\nKeyword scoring ${newTenders.length} tenders...`)
  const scoredTenders = newTenders.map(tender => {
    const scores = scoreTender(tender)
    return { ...tender, ...scores }
  })

  summary.scored = scoredTenders.length

  for (const t of scoredTenders) {
    summary.byTemperature[t.temperature] = (summary.byTemperature[t.temperature] || 0) + 1
  }

  // ── Store ──

  console.log(`\nStoring ${scoredTenders.length} tenders...`)

  const toStore = scoredTenders.map(t => {
    const clean = { ...t }
    delete clean.ai_service
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

  console.log(`  Stored ${stored} tenders (keyword scores only - AI scoring in Stage 2)`)
  console.log(`  Temperature: ${JSON.stringify(summary.byTemperature)}`)
  console.log('\n=== Stage 1 complete ===\n')

  return summary
}


// ═══════════════════════════════════════════════════════
// STAGE 2: AI score unscored tenders
// ═══════════════════════════════════════════════════════

/**
 * Stage 2: AI score any tenders that don't have an AI score yet.
 * Looks back 24 hours to catch anything from Stage 1.
 */
export async function runAiScoreStage(options = {}) {
  const supabase = getSupabase()

  const summary = {
    stage: 'ai-score',
    found: 0,
    scored: 0,
    errors: 0,
    byTemperature: {},
  }

  console.log('\n=== Tender Finder Pipeline - Stage 2: AI Score ===')

  // Find unscored tenders from the last 48 hours (safety net: if Stage 2
  // fails one day, missed tenders get picked up the next morning)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  let unscored
  try {
    unscored = await fetchAllPaginated((from, to) => supabase
      .from('tenders')
      .select('*')
      .is('ai_score', null)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .range(from, to)
    )
  } catch (err) {
    throw new Error(`Supabase query error: ${err.message}`)
  }

  summary.found = unscored.length
  console.log(`Found ${summary.found} unscored tenders from the last 48h`)

  if (unscored.length === 0) {
    console.log('Nothing to score. Done.\n')
    return summary
  }

  // Prioritise portal results over Google Alerts
  // Portal tenders are real procurement notices - score them first
  const SOURCE_PRIORITY = {
    'contracts-finder': 1,
    'find-a-tender': 1,
    'pcs': 1,
    'watchlist': 2,
    'google-alerts': 3,
  }

  unscored.sort((a, b) => {
    const pa = SOURCE_PRIORITY[a.source] || 99
    const pb = SOURCE_PRIORITY[b.source] || 99
    return pa - pb
  })

  console.log(`  Priority order: ${unscored.filter(t => t.source !== 'google-alerts').length} portal, ${unscored.filter(t => t.source === 'google-alerts').length} alerts`)

  // AI score with time budget (stop gracefully before 800s limit)
  const stageStart = Date.now()
  const TIME_BUDGET_MS = 700 * 1000 // Stop at 700s to leave margin for DB updates

  console.log(`\nAI scoring ${unscored.length} tenders (700s budget)...`)
  const aiResult = await aiScoreBatch(unscored, { timeBudgetMs: TIME_BUDGET_MS, startTime: stageStart })
  summary.scored = aiResult.aiCalls
  summary.errors = aiResult.aiErrors
  summary.stoppedEarly = aiResult.stoppedEarly || false
  summary.skippedByBudget = aiResult.skippedByBudget || 0
  console.log(`  ${aiResult.aiCalls} AI calls (${aiResult.aiErrors} errors)${aiResult.stoppedEarly ? ` | STOPPED EARLY - ${aiResult.skippedByBudget} left for tomorrow` : ''}`)

  // Update each scored tender in Supabase
  console.log('\nUpdating scores in database...')
  let updated = 0

  for (const tender of unscored) {
    if (tender.ai_score == null) continue

    const recalc = recalculateWithAi(tender)

    const { error: updateError } = await supabase
      .from('tenders')
      .update({
        ai_score: tender.ai_score,
        ai_summary: tender.ai_summary,
        total_score: recalc.total_score,
        temperature: recalc.temperature,
      })
      .eq('id', tender.id)

    if (updateError) {
      console.error(`  Update error for ${tender.id}: ${updateError.message}`)
      summary.errors++
    } else {
      updated++
      summary.byTemperature[recalc.temperature] = (summary.byTemperature[recalc.temperature] || 0) + 1
    }
  }

  console.log(`  Updated ${updated} tenders`)
  console.log(`  Temperature: ${JSON.stringify(summary.byTemperature)}`)
  console.log('\n=== Stage 2 complete ===\n')

  return summary
}


// ═══════════════════════════════════════════════════════
// STAGE 3: Daily digest (hot tenders only)
// ═══════════════════════════════════════════════════════

/**
 * Stage 3: Build and send the daily digest email (hot tenders only).
 */
export async function runDigestStage() {
  const summary = {
    stage: 'digest',
    digestSent: false,
  }

  console.log('\n=== Tender Finder Pipeline - Stage 3: Digest ===')

  // Daily digest (hot tenders only — individual hot alerts disabled)
  console.log('\nBuilding daily digest...')
  try {
    const digestContent = await buildDigest()
    if (digestContent.stats.hot > 0) {
      await sendDigest(digestContent, { stage: 'digest' })
      summary.digestSent = true
      console.log(`  Digest sent (${digestContent.stats.hot} hot tenders)`)
    } else {
      console.log('  No hot tenders today - digest skipped')
    }
  } catch (err) {
    console.error(`  Digest error: ${err.message}`)
  }

  console.log('\n=== Stage 3 complete ===\n')

  return summary
}


// ═══════════════════════════════════════════════════════
// FULL PIPELINE (kept for manual/test runs)
// ═══════════════════════════════════════════════════════

/**
 * Run the full pipeline: all channels > deduplicate > keyword score > AI score > store.
 * This is the original all-in-one function, kept for manual test runs
 * where Vercel's 300s limit doesn't apply.
 *
 * @param {Object} options
 * @param {string} [options.publishedFrom] - ISO date for Contracts Finder
 * @param {string} [options.updatedFrom] - ISO date for Find a Tender
 * @param {boolean} [options.dryRun=false] - Skip Supabase writes
 * @param {boolean} [options.skipAi=false] - Skip AI scoring
 * @param {boolean} [options.sendDigest=false] - Send daily digest email (hot tenders only)
 * @param {Object} [options.channels] - Which channels to run
 * @returns {Object} Summary
 */
export async function runPipeline(options = {}) {
  const {
    publishedFrom,
    updatedFrom,
    dryRun = false,
    skipAi = false,
    // sendHotAlerts option removed — alerts disabled
    sendDigest: doSendDigest = false,
    channels = { contractsFinder: true, findATender: true, pcs: true, googleAlerts: true, watchlist: true },
  } = options

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const summary = {
    contractsFinder: { fetched: 0, new: 0 },
    findATender: { fetched: 0, new: 0 },
    pcs: { fetched: 0, new: 0 },
    googleAlerts: { fetched: 0, new: 0, triggerEvents: 0, feedsChecked: 0 },
    watchlist: { checked: 0, changed: 0, tendersFound: 0, errors: 0 },
    crossSourceDuplicates: 0,
    preFiltered: 0,
    preFilterReasons: {},
    dbDuplicates: 0,
    scored: 0,
    aiScoring: { calls: 0, errors: 0 },
    stored: 0,
    byTemperature: {},
  }

  console.log('\n=== Tender Finder Pipeline (full) ===')
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

  if (channels.pcs) {
    console.log('Channel 5: Public Contracts Scotland...')
    try {
      const pcsResults = await searchPCS()
      summary.pcs.fetched = pcsResults.length
      allRaw.push(...pcsResults)
      console.log(`  ${pcsResults.length} tenders\n`)
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

  // ── Pre-filter noise ──

  console.log('\nPre-filtering noise...')
  const { kept: preFiltered, filtered: noiseCount, reasons: filterReasons } = preFilterNoise(allRaw)
  summary.preFiltered = noiseCount
  summary.preFilterReasons = filterReasons
  console.log(`  ${noiseCount} noise items removed (${JSON.stringify(filterReasons)})`)
  console.log(`  ${preFiltered.length} items passed filter`)

  // ── Step 2: Cross-source deduplication ──

  console.log('\nStep 2: Cross-source deduplication...')
  const deduplicated = deduplicateAcrossSources(preFiltered)
  summary.crossSourceDuplicates = preFiltered.length - deduplicated.length
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
    else if (t.source === 'pcs') summary.pcs.new++
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

  // ── Step 7: Notifications ──

  summary.notifications = { hotAlerts: 0, digestSent: false }

  // Hot alerts disabled — digest is the only notification now
  // (alerts.js kept in repo in case we want to re-enable later)

  // Daily digest
  if (doSendDigest) {
    console.log('\nStep 7b: Daily digest...')
    try {
      const digestContent = await buildDigest()
      if (digestContent.stats.hot > 0) {
        await sendDigest(digestContent, summary)
        summary.notifications.digestSent = true
      } else {
        console.log('  No hot tenders today - digest skipped')
      }
    } catch (err) {
      console.error(`  Digest error: ${err.message}`)
    }
  }

  // ── Summary ──

  console.log('\n=== Pipeline complete ===')
  console.log(`Contracts Finder: ${summary.contractsFinder.fetched} fetched, ${summary.contractsFinder.new} new`)
  console.log(`Find a Tender: ${summary.findATender.fetched} fetched, ${summary.findATender.new} new`)
  console.log(`Google Alerts: ${summary.googleAlerts.fetched} items, ${summary.googleAlerts.new} new (${summary.googleAlerts.triggerEvents} trigger events)`)
  console.log(`PCS: ${summary.pcs.fetched} fetched, ${summary.pcs.new} new`)
  console.log(`Watchlist: ${summary.watchlist.checked} checked, ${summary.watchlist.changed} changed, ${summary.watchlist.tendersFound} tenders`)
  console.log(`AI scoring: ${summary.aiScoring.calls} calls (${summary.aiScoring.errors} errors)`)
  console.log(`Stored: ${summary.stored}`)
  console.log(`Hot: ${summary.byTemperature.hot || 0}, Warm: ${summary.byTemperature.warm || 0}, Cool: ${summary.byTemperature.cool || 0}, Archived: ${summary.byTemperature.archived || 0}`)
  if (summary.notifications?.digestSent) console.log(`📧 Daily digest sent`)
  console.log()

  return summary
}
