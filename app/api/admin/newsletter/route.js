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
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'unsubscribed'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'bounced'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']).gte('newsletter_consent_date', weekAgo.toISOString()),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']).gte('newsletter_consent_date', monthAgo.toISOString()),
      supabase.from('newsletter_sends').select('id, subject, status, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at, completed_at').gte('total_sent', 10).order('created_at', { ascending: false }).limit(20),
      supabase.rpc('get_newsletter_tier_counts'),
      supabase.rpc('get_newsletter_source_counts'),
    ])

    const tierRows = byTier.data || []
    const sourceRows = bySource.data || []

    // Sort source by count desc
    const sortedSources = sourceRows
      .map(r => ({ source: r.source, count: Number(r.count) }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      subscribers: {
        active: activeCount.count || 0,
        unsubscribed: unsubCount.count || 0,
        bounced: bouncedCount.count || 0,
        newThisWeek: newWeek.count || 0,
        newThisMonth: newMonth.count || 0,
      },
      sends: sends.data || [],
      byTier: tierRows
        .map(r => ({ tier: r.tier, count: Number(r.count) }))
        .sort((a, b) => {
          if (a.tier === 'Unset') return 1
          if (b.tier === 'Unset') return -1
          return a.tier.localeCompare(b.tier)
        }),
      bySource: sortedSources,
    })
  } catch (err) {
    console.error('Newsletter API error:', err)
    return NextResponse.json({ error: 'Failed to load newsletter data' }, { status: 500 })
  }
}
