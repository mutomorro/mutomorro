#!/usr/bin/env node

/**
 * Backfill AI scoring for existing tenders
 *
 * Runs the AI scorer against all tenders in Supabase where ai_score IS NULL
 * and temperature IN ('warm', 'cool'). Skips archived tenders.
 *
 * Usage:
 *   node --env-file=.env.local lib/tender-finder/backfill-ai.js
 */

import { readFileSync } from 'fs'
try {
  const envFile = readFileSync('.env.local', 'utf8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
    }
  }
} catch { /* .env.local not found - rely on existing env */ }

import { createClient } from '@supabase/supabase-js'
import { fetchAllPaginated } from '../supabase-paginate.js'
import { aiScoreTender } from './ai-scorer.js'
import { recalculateWithAi } from './scorer.js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const AI_DELAY_MS = 500
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function backfill() {
  console.log('AI Scoring Backfill')
  console.log('===================')
  console.log(`Date: ${new Date().toISOString()}\n`)

  // Fetch all unscored warm + cool tenders
  let tenders
  try {
    tenders = await fetchAllPaginated((from, to) => supabase
      .from('tenders')
      .select('*')
      .is('ai_score', null)
      .in('temperature', ['warm', 'cool'])
      .order('total_score', { ascending: false })
      .range(from, to)
    )
  } catch (err) {
    console.error(`Supabase fetch error: ${err.message}`)
    process.exit(1)
  }

  console.log(`Found ${tenders.length} unscored warm/cool tenders\n`)

  if (tenders.length === 0) {
    console.log('Nothing to do.')
    process.exit(0)
  }

  // Track temperature changes
  const changes = []
  let scored = 0
  let errors = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0

  for (let i = 0; i < tenders.length; i++) {
    const tender = tenders[i]
    const oldTemp = tender.temperature

    console.log(`[${i + 1}/${tenders.length}] ${tender.title.slice(0, 70)}`)

    const result = await aiScoreTender(tender)

    if (result.score !== null) {
      scored++

      // Recalculate total score with AI
      tender.ai_score = result.score
      tender.ai_summary = result.summary
      const recalc = recalculateWithAi(tender)

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('tenders')
        .update({
          ai_score: result.score,
          ai_summary: result.summary,
          total_score: recalc.total_score,
          temperature: recalc.temperature,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tender.id)

      if (updateError) {
        console.error(`  Update error: ${updateError.message}`)
        errors++
      } else if (recalc.temperature !== oldTemp) {
        changes.push({
          title: tender.title.slice(0, 60),
          from: oldTemp,
          to: recalc.temperature,
          aiScore: result.score,
        })
        console.log(`  ↕ ${oldTemp} → ${recalc.temperature}`)
      }
    } else {
      errors++
    }

    // Rate limit
    await sleep(AI_DELAY_MS)
  }

  // Summary
  console.log('\n=== Backfill Complete ===')
  console.log(`Scored: ${scored}/${tenders.length} (${errors} errors)`)

  if (changes.length > 0) {
    console.log(`\nTemperature changes (${changes.length}):`)

    // Group by change direction
    const grouped = {}
    for (const c of changes) {
      const key = `${c.from} → ${c.to}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(c)
    }

    for (const [direction, items] of Object.entries(grouped)) {
      console.log(`\n  ${direction} (${items.length}):`)
      for (const item of items) {
        console.log(`    AI ${item.aiScore}/10 - ${item.title}`)
      }
    }
  } else {
    console.log('\nNo temperature changes.')
  }
}

backfill().then(() => process.exit(0)).catch(err => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
