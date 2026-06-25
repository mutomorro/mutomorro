// Migrates the develop/training "Enquiry - X" sidebar callouts into a
// page-owned `sidebarPrimary` field on each target document. Idempotent:
// re-running sets the same values. Reads the callouts (which must still
// exist), so run this BEFORE deleting them (see delete-enquiry-callouts.mjs).
//
// Run: node scripts/migrate-enquiry-primaries.mjs

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

const callouts = await client.fetch(`*[_type == "pageCallout" && (_id match "callout-develop-enquiry-*" || _id match "callout-bespoke-*")]{
  _id, heading, "bodyText": body[0].children[0].text, linkLabel, linkUrl, "targetId": includePages[0]._ref
}`)

console.log(`Found ${callouts.length} enquiry callouts to migrate`)

let n = 0
for (const c of callouts) {
  if (!c.targetId) {
    console.warn('  SKIP (no target):', c._id)
    continue
  }
  await client
    .patch(c.targetId)
    .set({
      sidebarPrimary: {
        heading: c.heading || null,
        body: c.bodyText || null,
        label: c.linkLabel || null,
        url: c.linkUrl || null,
      },
    })
    .commit()
  n++
  console.log(`  set sidebarPrimary on ${c.targetId}  <-  ${c._id}`)
}
console.log(`Done: ${n}/${callouts.length} documents patched`)
