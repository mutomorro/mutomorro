#!/usr/bin/env node

/**
 * Tender Finder manual test run
 *
 * Load .env.local values, giving them priority over any inherited env vars
 * (e.g. Claude Code sets its own ANTHROPIC_API_KEY which shadows the user's).
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

/**
 * Usage:
 *   node lib/tender-finder/test-run.js
 *   node lib/tender-finder/test-run.js --dry-run
 *   node lib/tender-finder/test-run.js --skip-ai
 *   node lib/tender-finder/test-run.js --channel=contracts-finder
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=find-a-tender
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=google-alerts
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=watchlist
 *
 * Or via the API route (with dev server running):
 *   curl http://localhost:3000/api/tender-finder/test?dryRun=true
 *   curl http://localhost:3000/api/tender-finder/test?skipAi=true
 */

import { runPipeline } from './pipeline.js'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipAi = args.includes('--skip-ai')
const channelArg = args.find(a => a.startsWith('--channel='))
const channelName = channelArg ? channelArg.split('=')[1] : null

const channels = {
  contractsFinder: !channelName || channelName === 'contracts-finder',
  findATender: !channelName || channelName === 'find-a-tender',
  googleAlerts: !channelName || channelName === 'google-alerts',
  watchlist: !channelName || channelName === 'watchlist',
}

console.log('Tender Finder - Manual Test Run')
console.log('================================')
console.log(`Date: ${new Date().toISOString()}`)
console.log(`Dry run: ${dryRun} | Skip AI: ${skipAi}`)
if (channelName) console.log(`Channel: ${channelName} only`)
console.log()

try {
  const summary = await runPipeline({
    publishedFrom: '2026-01-01',
    dryRun,
    skipAi,
    channels,
  })

  console.log('\nFinal summary:')
  console.log(JSON.stringify(summary, null, 2))

  process.exit(0)
} catch (error) {
  console.error('Pipeline failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}
