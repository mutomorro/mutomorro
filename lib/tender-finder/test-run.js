#!/usr/bin/env node

/**
 * Tender Finder manual test run
 *
 * Usage:
 *   node --env-file=.env.local lib/tender-finder/test-run.js
 *   node --env-file=.env.local lib/tender-finder/test-run.js --dry-run
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=contracts-finder
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=find-a-tender
 *   node --env-file=.env.local lib/tender-finder/test-run.js --channel=google-alerts
 *
 * Or via the API route (with dev server running):
 *   curl http://localhost:3000/api/tender-finder/test?dryRun=true
 */

import { runPipeline } from './pipeline.js'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const channelArg = args.find(a => a.startsWith('--channel='))
const channelName = channelArg ? channelArg.split('=')[1] : null

// Default: all channels on
const channels = {
  contractsFinder: !channelName || channelName === 'contracts-finder',
  findATender: !channelName || channelName === 'find-a-tender',
  googleAlerts: !channelName || channelName === 'google-alerts',
}

console.log('Tender Finder - Manual Test Run')
console.log('================================')
console.log(`Date: ${new Date().toISOString()}`)
console.log(`Dry run: ${dryRun}`)
if (channelName) console.log(`Channel: ${channelName} only`)
console.log()

try {
  const summary = await runPipeline({
    publishedFrom: '2026-01-01',
    dryRun,
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
