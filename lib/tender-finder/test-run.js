#!/usr/bin/env node

/**
 * Tender Finder manual test run
 *
 * Usage:
 *   node --env-file=.env.local lib/tender-finder/test-run.js
 *   node --env-file=.env.local lib/tender-finder/test-run.js --dry-run
 *
 * Or via the API route (with dev server running):
 *   curl http://localhost:3003/api/tender-finder/test?dryRun=true
 */

import { runPipeline } from './pipeline.js'

const dryRun = process.argv.includes('--dry-run')
const publishedFrom = '2026-01-01'

console.log('Tender Finder - Manual Test Run')
console.log('================================')
console.log(`Date: ${new Date().toISOString()}`)
console.log(`Dry run: ${dryRun}`)
console.log()

try {
  const summary = await runPipeline({ publishedFrom, dryRun })

  console.log()
  console.log('Final summary:')
  console.log(JSON.stringify(summary, null, 2))

  process.exit(0)
} catch (error) {
  console.error('Pipeline failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}
