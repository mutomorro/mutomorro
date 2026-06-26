import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { bulkMatchByEmail, buildEnrichUpdate, isUsefulMatch, matchIsTrustworthy } from '@/lib/apollo-enrich.mjs'

// Enrich selected contacts via Apollo (company / title / seniority / industry /
// LinkedIn / location). Costs 1 Apollo credit per matched person — only ever
// called from an explicit "Enrich" action in the admin UI.

const MAX_PER_REQUEST = 50

export async function POST(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  if (!process.env.APOLLO_API_KEY) {
    return NextResponse.json({ error: 'Apollo is not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids.filter((n) => Number.isFinite(Number(n))).map(Number) : []
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No contacts selected' }, { status: 400 })
    }
    if (ids.length > MAX_PER_REQUEST) {
      return NextResponse.json({ error: `Too many at once (max ${MAX_PER_REQUEST})` }, { status: 400 })
    }

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, signup_email')
      .in('id', ids)
    if (error) throw error

    const emails = (contacts || []).map((c) => c.signup_email).filter(Boolean)
    const matchMap = await bulkMatchByEmail(emails)

    const nowIso = new Date().toISOString()
    let enriched = 0
    let noMatch = 0
    for (const c of contacts || []) {
      const mapped = matchMap.get((c.signup_email || '').toLowerCase())
      // Reject matches where Apollo's company doesn't match the email domain.
      if (!isUsefulMatch(mapped) || !matchIsTrustworthy(c.signup_email, mapped)) { noMatch++; continue }
      const { error: upErr } = await supabase
        .from('contacts')
        .update(buildEnrichUpdate(mapped, nowIso))
        .eq('id', c.id)
      if (upErr) { console.error('Enrich update failed', c.id, upErr); noMatch++ }
      else enriched++
    }

    return NextResponse.json({ attempted: (contacts || []).length, enriched, noMatch })
  } catch (err) {
    console.error('Contacts enrich error:', err)
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 500 })
  }
}
