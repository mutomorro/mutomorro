import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Headline contact distributions for the /admin/contacts KPI strip.
// Server-side GROUP BY via get_contact_kpis() — never aggregates the 7,583-row
// contacts table in JS (CLAUDE.md 1,000-row rule).

export async function GET(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase.rpc('get_contact_kpis')
    if (error) throw error

    const groups = { tier: [], newsletter: [], deliverability: [], total: 0 }
    for (const r of data || []) {
      const row = { val: r.val, count: Number(r.count) }
      if (groups[r.dim]) groups[r.dim].push(row)
    }
    // Total = sum of the tier dimension (every contact has exactly one tier bucket).
    groups.total = groups.tier.reduce((a, r) => a + r.count, 0)

    // Stable, meaningful ordering per dimension.
    const order = (arr, seq) =>
      arr.sort((a, b) => {
        const ia = seq.indexOf(a.val); const ib = seq.indexOf(b.val)
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
        return b.count - a.count
      })
    order(groups.tier, ['1', '2', '3', '4', '5', 'invalid', '(unset)'])
    order(groups.newsletter, ['active', 'confirmed', 'pending_confirmation', 'opted-in-not-added', 'never', 'unsubscribed', 'bounced'])
    order(groups.deliverability, ['valid', 'catch-all', 'unknown', 'unverified', 'invalid', 'do_not_mail', 'abuse'])

    return NextResponse.json(groups)
  } catch (err) {
    console.error('Contacts stats error:', err)
    return NextResponse.json({ error: 'Failed to load contact stats' }, { status: 500 })
  }
}
