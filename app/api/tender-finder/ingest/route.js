/**
 * Portal email ingest endpoint
 *
 * Receives parsed tenders from Google Apps Script (or any external source).
 * Deduplicates against existing tenders, keyword scores, and stores.
 * Stage 2 AI scoring picks them up automatically.
 *
 * POST /api/tender-finder/ingest
 * Headers: x-ingest-key: <PORTAL_INGEST_KEY>
 * Body: { tenders: [{ source, source_id, source_url, title, organisation, deadline, notice_type }] }
 */

import { createClient } from '@supabase/supabase-js'
import { scoreTender } from '@/lib/tender-finder/scorer'

export const maxDuration = 30

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  // Auth check
  const ingestKey = request.headers.get('x-ingest-key')
  if (!ingestKey || ingestKey !== process.env.PORTAL_INGEST_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tenders } = body
  if (!Array.isArray(tenders) || tenders.length === 0) {
    return Response.json({ error: 'No tenders provided' }, { status: 400 })
  }

  // Cap at 50 per request to avoid abuse
  if (tenders.length > 50) {
    return Response.json({ error: 'Too many tenders (max 50)' }, { status: 400 })
  }

  const supabase = getSupabase()
  const results = { received: tenders.length, stored: 0, duplicates: 0, errors: 0 }

  for (const tender of tenders) {
    try {
      // Validate required fields
      if (!tender.source || !tender.source_id || !tender.title) {
        results.errors++
        continue
      }

      // Check for duplicates by source + source_id
      const { data: existing } = await supabase
        .from('tenders')
        .select('id')
        .eq('source', tender.source)
        .eq('source_id', tender.source_id)
        .limit(1)

      if (existing && existing.length > 0) {
        results.duplicates++
        continue
      }

      // Also check by source_url (cross-source dedup)
      if (tender.source_url) {
        const { data: urlMatch } = await supabase
          .from('tenders')
          .select('id')
          .eq('source_url', tender.source_url)
          .limit(1)

        if (urlMatch && urlMatch.length > 0) {
          results.duplicates++
          continue
        }
      }

      // Keyword score
      const scores = scoreTender({
        title: tender.title || '',
        description: tender.description || '',
        organisation: tender.organisation || '',
        cpv_codes: tender.cpv_codes || [],
      })

      // Build the row
      const row = {
        source: tender.source,
        source_id: tender.source_id,
        source_url: tender.source_url || null,
        title: tender.title,
        description: tender.description || '',
        organisation: tender.organisation || '',
        value_low: tender.value_low || null,
        value_high: tender.value_high || null,
        currency: tender.currency || 'GBP',
        deadline: tender.deadline || null,
        cpv_codes: tender.cpv_codes || [],
        notice_type: tender.notice_type || 'tender',
        keyword_score: scores.keyword_score,
        sector_score: scores.sector_score,
        value_score: scores.value_score || 0,
        total_score: scores.keyword_score + scores.sector_score + (scores.value_score || 0),
        temperature: 'warm', // Placeholder until AI scores in Stage 2
        status: 'new',
        keywords_matched: scores.keywords_matched || [],
      }

      const { error } = await supabase.from('tenders').insert(row)
      if (error) {
        console.error(`Insert error for ${tender.source_id}: ${error.message}`)
        results.errors++
      } else {
        results.stored++
      }
    } catch (err) {
      console.error(`Processing error: ${err.message}`)
      results.errors++
    }
  }

  console.log(`Portal ingest: ${results.received} received, ${results.stored} stored, ${results.duplicates} duplicates, ${results.errors} errors`)

  return Response.json(results)
}
