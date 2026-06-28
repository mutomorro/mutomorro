#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// PACED BACKFILL of tender AI scores
//
// WHY: the scorer's model id was retired (404) around 15 Jun, so ~13 days of
// tenders arrived unscored (keyword-only → mostly archived). After the model fix,
// the daily cron only re-scores the last 48h, so the older backlog needs a one-off
// pass. This re-scores the gap.
//
// PACED, NOT A BURST: this pipeline shares Supabase with the live website, and the
// 25-Jun newsletter send overloaded that shared DB. So this script scores in small,
// bounded runs with a delay between each call. Run it repeatedly to drain the
// backlog gently, rather than firing hundreds of calls (and writes) at once.
//
// Idempotent: only touches rows where ai_score IS NULL, and only those the live
// pipeline would actually score (shouldAiScore). Re-running never double-scores.
//
// USAGE:
//   node scripts/backfill-tender-scores.mjs --dry-run            # count what qualifies, no spend
//   node scripts/backfill-tender-scores.mjs --limit 25           # score up to 25, then stop
//   node scripts/backfill-tender-scores.mjs --since 2026-06-14 --limit 50 --delay 1500
//
// Defaults: --since 2026-06-14 (just before the breakage), --limit 25, --delay 1000ms.
// Uses the model from lib/tender-finder/config.js (TENDER_SCORING_MODEL or default).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Load .env.local into process.env (so config.js + the SDK see the keys).
try {
  for (const line of readFileSync(resolve(ROOT, '.env.local'), 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0 && !process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1)
  }
} catch { /* rely on existing env */ }

const { createClient } = await import('@supabase/supabase-js')
const { fetchAllPaginated } = await import('../lib/supabase-paginate.js')
const { aiScoreTender, shouldAiScore } = await import('../lib/tender-finder/ai-scorer.js')
const { recalculateWithAi } = await import('../lib/tender-finder/scorer.js')
const { SCORING_MODEL } = await import('../lib/tender-finder/config.js')

const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const DRY = has('--dry-run')
const LIMIT = parseInt(val('--limit', '25'), 10)
const SINCE = val('--since', '2026-06-14')
const DELAY = parseInt(val('--delay', '1000'), 10)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

console.log('Paced tender-score backfill (READ-then-WRITE; idempotent on ai_score IS NULL)')
console.log(`  model: ${SCORING_MODEL}   since: ${SINCE}   limit: ${LIMIT}   delay: ${DELAY}ms   ${DRY ? '(DRY RUN — no AI calls, no writes)' : ''}`)

// Fetch all unscored tenders since the cutoff (stable order by id — see CLAUDE.md).
const unscored = await fetchAllPaginated((from, to) => supabase
  .from('tenders')
  .select('*')
  .is('ai_score', null)
  .gte('found_at', `${SINCE}T00:00:00Z`)
  .order('id', { ascending: true })
  .range(from, to)
)

// Only the ones the live pipeline would actually score.
const eligible = unscored.filter((t) => shouldAiScore(t))
console.log(`\n${unscored.length} unscored since ${SINCE}; ${eligible.length} eligible for AI scoring (rest are intentionally skipped noise).`)

if (DRY) {
  console.log(`\nDRY RUN — would score up to ${Math.min(LIMIT, eligible.length)} this run.`)
  console.log('Run without --dry-run (and tune --limit) to score a batch.')
  process.exit(0)
}

if (eligible.length === 0) { console.log('\nNothing to backfill. Done.'); process.exit(0) }

const batch = eligible.slice(0, LIMIT)
console.log(`\nScoring ${batch.length} tender(s), ${DELAY}ms apart…\n`)

let scored = 0, errors = 0
const tempChanges = {}
for (let i = 0; i < batch.length; i++) {
  const tender = batch[i]
  const result = await aiScoreTender(tender)
  if (result.score == null) {
    errors++
    console.log(`  [${i + 1}/${batch.length}] ERROR  ${tender.title.slice(0, 60)}`)
  } else {
    tender.ai_score = result.score
    tender.ai_summary = result.summary
    const recalc = recalculateWithAi(tender)
    const { error } = await supabase.from('tenders').update({
      ai_score: result.score,
      ai_summary: result.summary,
      total_score: recalc.total_score,
      temperature: recalc.temperature,
    }).eq('id', tender.id)
    if (error) { errors++; console.log(`  [${i + 1}/${batch.length}] DB ERROR ${error.message}`) }
    else {
      scored++
      tempChanges[recalc.temperature] = (tempChanges[recalc.temperature] || 0) + 1
      console.log(`  [${i + 1}/${batch.length}] ${result.score}/10 → ${recalc.temperature}  ${tender.title.slice(0, 55)}`)
    }
  }
  if (i < batch.length - 1) await sleep(DELAY)
}

const remaining = eligible.length - scored
console.log(`\n── done ── scored ${scored}, errors ${errors}. Temperatures: ${JSON.stringify(tempChanges)}`)
if (errors === batch.length && batch.length > 0) {
  console.log('ALL FAILED — check the model id resolves: node docs/stack-checks/check-anthropic-model.mjs')
  process.exit(1)
}
if (remaining > 0) console.log(`~${remaining} eligible tenders still unscored. Re-run to continue draining the backlog at your pace.`)
else console.log('Backlog cleared for this --since window.')
process.exit(0)
