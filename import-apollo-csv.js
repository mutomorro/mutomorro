#!/usr/bin/env node

/**
 * Import Apollo CSV enrichment results into Supabase contacts.
 *
 * Usage:
 *   node import-apollo-csv.js /path/to/enrichment-results.csv
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ---------------------------------------------------------------------------
// Seniority derivation from role/title
// ---------------------------------------------------------------------------
function deriveSeniority(role) {
  if (!role) return null
  const r = role.toLowerCase()

  if (/\b(ceo|coo|cfo|cto|cio|cmo|cpo|chro|chief)\b/.test(r)) return 'c_suite'
  if (/\b(vp|vice\s+president)\b/.test(r)) return 'vp'
  if (/\bdirector\b/.test(r)) return 'director'
  if (/\bhead\s+of\b/.test(r)) return 'head'
  if (/\bpartner\b/.test(r)) return 'partner'
  if (/\b(founder|co-founder)\b/.test(r)) return 'founder'
  if (/\bmanager\b/.test(r)) return 'manager'
  if (/\bsenior\b/.test(r)) return 'senior'
  return 'entry'
}

// ---------------------------------------------------------------------------
// Build location string from city + state
// ---------------------------------------------------------------------------
function buildLocation(city, state) {
  const parts = [city, state].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

// ---------------------------------------------------------------------------
// Main import
// ---------------------------------------------------------------------------
async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: node import-apollo-csv.js /path/to/file.csv')
    process.exit(1)
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`)
    process.exit(1)
  }

  // Parse CSV - use columns: false to get arrays (handles duplicate headers)
  const raw = fs.readFileSync(csvPath, 'utf-8')
  const rows = parse(raw, { columns: false, skip_empty_lines: true, relax_column_count: true })

  // Remove header row
  rows.shift()

  console.log(`\nParsed ${rows.length} rows from CSV\n`)

  let matched = 0
  let skipped = 0
  let noMatch = 0
  let notFound = 0
  const BATCH_SIZE = 15

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    for (const row of batch) {
      const signupEmail = (row[2] || '').trim().toLowerCase()
      const result = (row[3] || '').trim()

      if (!signupEmail) continue

      // Look up contact
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('id, role, linkedin_url, country, enrichment_email, organisation_name, industry, location, seniority, enrichment_source, enriched')
        .eq('signup_email', signupEmail)
        .maybeSingle()

      if (error) {
        console.error(`  Error looking up ${signupEmail}:`, error.message)
        continue
      }

      if (!contact) {
        notFound++
        continue
      }

      if (result === 'Matched') {
        // If already enriched, skip
        if (contact.enriched === true) {
          skipped++
          continue
        }

        // Build update object - only write NULL fields
        const update = {}

        const title = (row[6] || '').trim()
        const linkedinUrl = (row[7] || '').trim()
        const city = (row[8] || '').trim()
        const state = (row[9] || '').trim()
        const country = (row[10] || '').trim()
        const enrichmentEmail = (row[11] || '').trim().toLowerCase()
        const companyName = (row[12] || '').trim()
        const industry = (row[14] || '').trim()

        if (title && !contact.role) update.role = title
        if (linkedinUrl && !contact.linkedin_url) update.linkedin_url = linkedinUrl
        if (country && !contact.country) update.country = country
        if (enrichmentEmail && enrichmentEmail !== signupEmail && !contact.enrichment_email) {
          update.enrichment_email = enrichmentEmail
        }
        if (companyName && !contact.organisation_name) update.organisation_name = companyName
        if (industry && !contact.industry) update.industry = industry.toLowerCase()

        const location = buildLocation(city, state)
        if (location && !contact.location) update.location = location

        // Derive seniority from role
        const roleForSeniority = update.role || contact.role
        if (roleForSeniority && !contact.seniority) {
          const derived = deriveSeniority(roleForSeniority)
          if (derived) update.seniority = derived
        }

        update.enrichment_source = 'apollo'
        update.enrichment_date = new Date().toISOString()
        update.enriched = true

        const { error: updateErr } = await supabase
          .from('contacts')
          .update(update)
          .eq('id', contact.id)

        if (updateErr) {
          console.error(`  Error updating ${signupEmail}:`, updateErr.message)
          continue
        }

        matched++
      } else {
        // N/A - mark as processed only if not already enriched
        if (!contact.enrichment_source) {
          const { error: updateErr } = await supabase
            .from('contacts')
            .update({
              enrichment_source: 'apollo-no-match',
              enrichment_date: new Date().toISOString(),
            })
            .eq('id', contact.id)

          if (updateErr) {
            console.error(`  Error marking no-match ${signupEmail}:`, updateErr.message)
            continue
          }
        }
        noMatch++
      }
    }

    // Progress
    const done = Math.min(i + BATCH_SIZE, rows.length)
    process.stdout.write(`  Processed ${done}/${rows.length} rows\r`)
  }

  console.log('\n')

  // ---------------------------------------------------------------------------
  // Flagging rules
  // ---------------------------------------------------------------------------
  console.log('Running flagging rules...\n')

  // Helper: add flag to contacts matching a condition, only if they don't already have it
  async function addFlag(flag, whereClause) {
    // Find contacts that match the condition and don't have the flag
    const query = `
      UPDATE contacts
      SET tags = CASE
        WHEN tags IS NULL THEN ARRAY['${flag}']
        ELSE array_append(tags, '${flag}')
      END
      WHERE (tags IS NULL OR NOT ('${flag}' = ANY(tags)))
        AND (${whereClause})
    `
    const { error } = await supabase.rpc('exec_sql', { query })
    if (error) {
      // Fallback: use execute_sql via the MCP tool approach won't work here.
      // Instead, do it in batches via the JS client.
      await addFlagViaClient(flag, whereClause)
    }
  }

  // Since we can't run raw SQL through the JS client easily, let's use the
  // Supabase approach: fetch matching contacts, then update them.
  async function addFlagViaClient(flag, filterFn) {
    // Fetch all contacts with relevant fields
    let allContacts = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, tags, role, seniority, industry, organisation_name')
        .range(from, from + pageSize - 1)

      if (error) { console.error('  Error fetching contacts:', error.message); break }
      if (!data || data.length === 0) break
      allContacts = allContacts.concat(data)
      if (data.length < pageSize) break
      from += pageSize
    }

    const toUpdate = allContacts.filter(c => {
      const hasFlag = c.tags && c.tags.includes(flag)
      if (hasFlag) return false
      return filterFn(c)
    })

    for (let i = 0; i < toUpdate.length; i += 50) {
      const batch = toUpdate.slice(i, i + 50)
      for (const c of batch) {
        const newTags = c.tags ? [...c.tags, flag] : [flag]
        await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
      }
    }

    return toUpdate.length
  }

  async function removeFlag(flag) {
    // Fetch contacts that have the flag
    let allWithFlag = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, tags')
        .contains('tags', [flag])
        .range(from, from + pageSize - 1)

      if (error) { console.error('  Error fetching contacts:', error.message); break }
      if (!data || data.length === 0) break
      allWithFlag = allWithFlag.concat(data)
      if (data.length < pageSize) break
      from += pageSize
    }

    for (const c of allWithFlag) {
      const newTags = c.tags.filter(t => t !== flag)
      await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    }

    return allWithFlag.length
  }

  async function countFlag(flag) {
    const { count } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [flag])
    return count || 0
  }

  // We need all contacts for the flag rules - fetch once
  let allContacts = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, tags, role, seniority, industry, organisation_name')
      .range(from, from + pageSize - 1)

    if (error) { console.error('Error fetching contacts:', error.message); break }
    if (!data || data.length === 0) break
    allContacts = allContacts.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }

  console.log(`  Loaded ${allContacts.length} contacts for flagging\n`)

  // --- Flag 1: senior-leader ---
  const seniorSeniorities = ['c_suite', 'director', 'vp', 'partner', 'founder']
  const seniorRolePattern = /\b(chief|director|vice\s+president|head\s+of|managing\s+director|ceo|coo|cfo|cto|vp|president|partner|founder)\b/i

  const seniorLeaderFilter = (c) => {
    if (seniorSeniorities.includes(c.seniority)) return true
    if (c.role && seniorRolePattern.test(c.role)) return true
    return false
  }

  const seniorUpdates = allContacts.filter(c => {
    if (c.tags && c.tags.includes('flag:senior-leader')) return false
    return seniorLeaderFilter(c)
  })
  for (const c of seniorUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:senior-leader'] : ['flag:senior-leader']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags // update local copy
  }
  console.log(`  flag:senior-leader: added to ${seniorUpdates.length} contacts`)

  // --- Flag 2: proven-sector ---
  const provenIndustryPattern = /\b(housing|nonprofit|non-profit|government|civic|education|public\s+sector|international\s+development|international\s+trade|international\s+affairs|philanthropy|humanitarian)\b/i
  const provenOrgPattern = /\b(council|nhs|trust|housing|association|federation|royal\s+college|humanitarian|charity)\b/i

  const provenSectorFilter = (c) => {
    if (c.industry && provenIndustryPattern.test(c.industry)) return true
    if (c.organisation_name && provenOrgPattern.test(c.organisation_name)) return true
    return false
  }

  const provenUpdates = allContacts.filter(c => {
    if (c.tags && c.tags.includes('flag:proven-sector')) return false
    return provenSectorFilter(c)
  })
  for (const c of provenUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:proven-sector'] : ['flag:proven-sector']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags
  }
  console.log(`  flag:proven-sector: added to ${provenUpdates.length} contacts`)

  // --- Flag 3: practitioner ---
  const practitionerRolePattern = /\b(coach|consultant|mentor|facilitator|organisational\s+development|organizational\s+development|change\s+manag|od\s+specialist|od\s+lead)\b/i
  const practitionerIndustries = ['professional training & coaching', 'management consulting']

  const practitionerFilter = (c) => {
    if (c.role && practitionerRolePattern.test(c.role)) return true
    if (c.industry && practitionerIndustries.includes(c.industry)) return true
    return false
  }

  const practitionerUpdates = allContacts.filter(c => {
    if (c.tags && c.tags.includes('flag:practitioner')) return false
    return practitionerFilter(c)
  })
  for (const c of practitionerUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:practitioner'] : ['flag:practitioner']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags
  }
  console.log(`  flag:practitioner: added to ${practitionerUpdates.length} contacts`)

  // --- Flag 4: academic ---
  const academicRolePattern = /\b(professor|lecturer|researcher|academic|scholar)\b/i
  const academicFacultyPattern = /\b(faculty|teaching|lecturer|professor)\b/i

  const academicFilter = (c) => {
    if (c.role && academicRolePattern.test(c.role)) return true
    if (c.industry === 'research') return true
    if (c.industry === 'higher education' && c.role && academicFacultyPattern.test(c.role)) return true
    return false
  }

  const academicUpdates = allContacts.filter(c => {
    if (c.tags && c.tags.includes('flag:academic')) return false
    return academicFilter(c)
  })
  for (const c of academicUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:academic'] : ['flag:academic']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags
  }
  console.log(`  flag:academic: added to ${academicUpdates.length} contacts`)

  // --- Flag 5: potential-client (exclusion model) ---
  // First remove from all
  const removedPC = await removeFlag('flag:potential-client')
  // Update local tags
  allContacts.forEach(c => {
    if (c.tags) c.tags = c.tags.filter(t => t !== 'flag:potential-client')
  })

  const excludedIndustries = ['defense & space', 'military', 'tobacco', 'gambling & casinos']

  const potentialClientUpdates = allContacts.filter(c => {
    if (!c.tags || !c.tags.includes('flag:senior-leader')) return false
    if (c.tags.includes('flag:practitioner')) return false
    if (c.tags.includes('flag:academic')) return false
    if (c.industry && excludedIndustries.includes(c.industry)) return false
    return true
  })
  for (const c of potentialClientUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:potential-client'] : ['flag:potential-client']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags
  }
  console.log(`  flag:potential-client: removed ${removedPC}, added ${potentialClientUpdates.length}`)

  // --- Flag 6: newsletter-priority ---
  const removedNP = await removeFlag('flag:newsletter-priority')
  allContacts.forEach(c => {
    if (c.tags) c.tags = c.tags.filter(t => t !== 'flag:newsletter-priority')
  })

  const newsletterPriorityUpdates = allContacts.filter(c => {
    return c.tags && c.tags.includes('flag:potential-client')
  })
  for (const c of newsletterPriorityUpdates) {
    const newTags = c.tags ? [...c.tags, 'flag:newsletter-priority'] : ['flag:newsletter-priority']
    await supabase.from('contacts').update({ tags: newTags }).eq('id', c.id)
    c.tags = newTags
  }
  console.log(`  flag:newsletter-priority: removed ${removedNP}, added ${newsletterPriorityUpdates.length}`)

  // ---------------------------------------------------------------------------
  // Final counts
  // ---------------------------------------------------------------------------
  const flagCounts = {}
  for (const flag of ['flag:senior-leader', 'flag:proven-sector', 'flag:practitioner', 'flag:academic', 'flag:potential-client', 'flag:newsletter-priority']) {
    flagCounts[flag] = await countFlag(flag)
  }

  console.log(`
========================================
  IMPORT SUMMARY
========================================
  Processed: ${rows.length} rows
    Matched and updated: ${matched}
    Matched but already enriched (skipped): ${skipped}
    No match (N/A): ${noMatch}
    Not found in database: ${notFound}

  Flag counts after update:
    flag:senior-leader: ${flagCounts['flag:senior-leader']}
    flag:proven-sector: ${flagCounts['flag:proven-sector']}
    flag:practitioner: ${flagCounts['flag:practitioner']}
    flag:academic: ${flagCounts['flag:academic']}
    flag:potential-client: ${flagCounts['flag:potential-client']}
    flag:newsletter-priority: ${flagCounts['flag:newsletter-priority']}
========================================
`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
