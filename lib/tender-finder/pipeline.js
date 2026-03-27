/**
 * Tender Finder pipeline
 *
 * Ties together the Contracts Finder API client and scorer.
 * Fetches tenders, deduplicates against Supabase, scores, and stores.
 */

import { createClient } from '@supabase/supabase-js'
import { searchContractsFinder } from './contracts-finder.js'
import { scoreTender } from './scorer.js'

/**
 * Run the full pipeline: fetch, deduplicate, score, store.
 *
 * @param {Object} options
 * @param {string} [options.publishedFrom] - ISO date string to limit search window
 * @param {boolean} [options.dryRun=false] - If true, skip Supabase writes
 * @returns {Object} Summary of the run
 */
export async function runPipeline(options = {}) {
  const { publishedFrom, dryRun = false } = options

  // Create Supabase client inside the function (not module level)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('\n=== Tender Finder Pipeline ===')
  console.log(`Published from: ${publishedFrom || 'all time'}`)
  console.log(`Dry run: ${dryRun}\n`)

  // 1. Fetch tenders from Contracts Finder
  console.log('Step 1: Fetching tenders from Contracts Finder...')
  const rawTenders = await searchContractsFinder(publishedFrom)
  console.log(`  Fetched ${rawTenders.length} unique active tenders\n`)

  if (rawTenders.length === 0) {
    return {
      fetched: 0,
      new: 0,
      duplicates: 0,
      stored: 0,
      byTemperature: {},
    }
  }

  // 2. Deduplicate against existing tenders in Supabase
  console.log('Step 2: Deduplicating against existing tenders...')
  const sourceIds = rawTenders.map(t => t.source_id).filter(Boolean)

  // Batch the .in() queries (Supabase/PostgREST has URL length limits)
  const existingIds = new Set()
  const BATCH = 50
  for (let i = 0; i < sourceIds.length; i += BATCH) {
    const batch = sourceIds.slice(i, i + BATCH)
    const { data: existing, error: lookupError } = await supabase
      .from('tenders')
      .select('source_id')
      .eq('source', 'contracts-finder')
      .in('source_id', batch)

    if (lookupError) {
      throw new Error(`Supabase lookup error: ${lookupError.message}`)
    }

    for (const t of (existing || [])) {
      existingIds.add(t.source_id)
    }
  }
  const newTenders = rawTenders.filter(t => !existingIds.has(t.source_id))
  const duplicates = rawTenders.length - newTenders.length

  console.log(`  ${duplicates} duplicates skipped, ${newTenders.length} new tenders\n`)

  if (newTenders.length === 0) {
    return {
      fetched: rawTenders.length,
      new: 0,
      duplicates,
      stored: 0,
      byTemperature: {},
    }
  }

  // 3. Score each new tender
  console.log('Step 3: Scoring tenders...')
  const scoredTenders = newTenders.map(tender => {
    const scores = scoreTender(tender)
    return { ...tender, ...scores }
  })

  // Count by temperature
  const byTemperature = {}
  for (const t of scoredTenders) {
    byTemperature[t.temperature] = (byTemperature[t.temperature] || 0) + 1
  }

  console.log(`  Temperature breakdown: ${JSON.stringify(byTemperature)}\n`)

  // Log hot and warm tenders
  const interesting = scoredTenders.filter(t => t.temperature === 'hot' || t.temperature === 'warm')
  if (interesting.length > 0) {
    console.log('  Interesting tenders:')
    for (const t of interesting) {
      console.log(`  [${t.temperature.toUpperCase()}] ${t.total_score}pts - ${t.title.slice(0, 80)}`)
      if (t.keywords_matched.length > 0) {
        console.log(`    Keywords: ${t.keywords_matched.join(', ')}`)
      }
      console.log(`    Org: ${t.organisation || 'Unknown'} | Value: ${t.value_high || 'Not stated'} | Deadline: ${t.deadline || 'Not stated'}`)
    }
    console.log()
  }

  // 4. Store in Supabase
  if (dryRun) {
    console.log('Step 4: DRY RUN - skipping Supabase storage\n')
    return {
      fetched: rawTenders.length,
      new: newTenders.length,
      duplicates,
      stored: 0,
      byTemperature,
      tenders: scoredTenders,
    }
  }

  console.log('Step 4: Storing in Supabase...')

  // Insert in batches of 50
  const batchSize = 50
  let stored = 0

  for (let i = 0; i < scoredTenders.length; i += batchSize) {
    const batch = scoredTenders.slice(i, i + batchSize)

    const { error: insertError } = await supabase
      .from('tenders')
      .insert(batch)

    if (insertError) {
      console.error(`  Batch insert error: ${insertError.message}`)
      throw new Error(`Supabase insert error: ${insertError.message}`)
    }

    stored += batch.length
  }

  console.log(`  Stored ${stored} tenders\n`)

  // Summary
  const summary = {
    fetched: rawTenders.length,
    new: newTenders.length,
    duplicates,
    stored,
    byTemperature,
  }

  console.log('=== Pipeline complete ===')
  console.log(`Found ${summary.fetched} tenders, ${summary.new} new, ${summary.stored} stored`)
  console.log(`Hot: ${byTemperature.hot || 0}, Warm: ${byTemperature.warm || 0}, Cool: ${byTemperature.cool || 0}, Archived: ${byTemperature.archived || 0}`)

  return summary
}
