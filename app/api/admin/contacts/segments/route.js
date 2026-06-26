import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Working-segment counts for the reworked Contacts header (clickable filters).
// Server-side GROUP BY via get_contact_segments() — never aggregates the contacts
// table in JS (CLAUDE.md 1,000-row rule).

export async function GET(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase.rpc('get_contact_segments')
    if (error) throw error
    const row = (data && data[0]) || {}
    return NextResponse.json({
      total: Number(row.total) || 0,
      noCompany: Number(row.no_company) || 0,
      needsCompanyWorkmail: Number(row.needs_company_workmail) || 0,
      decisionMakers: Number(row.decision_makers) || 0,
      active30d: Number(row.active_30d) || 0,
      enriched: Number(row.enriched) || 0,
      uk: Number(row.uk) || 0,
    })
  } catch (err) {
    console.error('Contacts segments error:', err)
    return NextResponse.json({ error: 'Failed to load segments' }, { status: 500 })
  }
}
