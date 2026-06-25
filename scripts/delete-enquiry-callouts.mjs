// Deletes the 13 develop/training "Enquiry - X" sidebar callouts AFTER their
// copy has been migrated to each page's `sidebarPrimary` field (see
// migrate-enquiry-primaries.mjs) and the new code is deployed and verified.
// Ids are listed explicitly (no pattern) to avoid deleting anything else.
//
// Run: node scripts/delete-enquiry-callouts.mjs

import dotenv from 'dotenv'
import { createClient } from 'next-sanity'

dotenv.config({ path: '.env.local' })

const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('Missing SANITY_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const ids = [
  'callout-develop-enquiry-executive-coaching',
  'callout-develop-enquiry-leadership-facilitation',
  'callout-develop-enquiry-mission-vision-values',
  'callout-develop-enquiry-strategic-thinking-partner',
  'callout-develop-enquiry-team-sessions',
  'callout-bespoke-change-management',
  'callout-bespoke-continuous-improvement',
  'callout-bespoke-customer-experience',
  'callout-bespoke-process-mapping-workshop',
  'callout-bespoke-scenario-planning-workshop',
  'callout-bespoke-systems-thinking',
  'callout-bespoke-team-effectiveness',
  'callout-bespoke-theory-of-change-workshop',
]

let n = 0
for (const id of ids) {
  await client.delete(id)
  n++
  console.log('  deleted', id)
}
console.log(`Done: ${n}/${ids.length} callouts deleted`)
