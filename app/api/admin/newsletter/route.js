import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 30)

  try {
    const [
      activeCount,
      unsubCount,
      bouncedCount,
      newWeek,
      newMonth,
      sends,
      byTier,
      bySource,
    ] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'active'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'unsubscribed'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'bounced'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'active').gte('newsletter_consent_date', weekAgo.toISOString()),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'active').gte('newsletter_consent_date', monthAgo.toISOString()),
      supabase.from('newsletter_sends').select('id, subject, status, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at, completed_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('contacts').select('tier').eq('newsletter_status', 'active'),
      supabase.from('contacts').select('first_source').eq('newsletter_status', 'active'),
    ])

    // Group by tier
    const tierCounts = {}
    if (byTier.data) {
      byTier.data.forEach((c) => {
        const t = c.tier || 'Unset'
        tierCounts[t] = (tierCounts[t] || 0) + 1
      })
    }

    // Group by source
    const sourceCounts = {}
    if (bySource.data) {
      bySource.data.forEach((c) => {
        const s = c.first_source || 'unknown'
        sourceCounts[s] = (sourceCounts[s] || 0) + 1
      })
    }

    // Sort source by count desc
    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }))

    return NextResponse.json({
      subscribers: {
        active: activeCount.count || 0,
        unsubscribed: unsubCount.count || 0,
        bounced: bouncedCount.count || 0,
        newThisWeek: newWeek.count || 0,
        newThisMonth: newMonth.count || 0,
      },
      sends: sends.data || [],
      byTier: Object.entries(tierCounts).sort((a, b) => {
        if (a[0] === 'Unset') return 1
        if (b[0] === 'Unset') return -1
        return a[0].localeCompare(b[0])
      }).map(([tier, count]) => ({ tier, count })),
      bySource: sortedSources,
    })
  } catch (err) {
    console.error('Newsletter API error:', err)
    return NextResponse.json({ error: 'Failed to load newsletter data' }, { status: 500 })
  }
}
