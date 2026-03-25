import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStats, getActiveVisitors, getTopReferrers } from '../../../../lib/umami'

export async function GET(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const mondayStr = monday.toISOString().split('T')[0]
    const sundayStr = sunday.toISOString().split('T')[0]

    const [
      contactsThisWeek,
      recentSignals,
      pipelineSnapshot,
      newsletterCount,
      calendarThisWeek,
      pipelineTotal,
      lastNewsletter,
      umamiStats,
      umamiActive,
      umamiReferrers,
    ] = await Promise.all([
      supabase.from('contacts').select('first_source').gte('created_at', weekAgoISO),
      supabase.from('signals').select('id, type, detail, strength, date, contact_id').order('date', { ascending: false }).limit(10),
      supabase.from('organisations').select('status'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'active'),
      supabase.from('calendar_items').select('*').or(`scheduled_date.gte.${mondayStr},due_date.gte.${mondayStr}`).or(`scheduled_date.lte.${sundayStr},due_date.lte.${sundayStr}`).order('scheduled_date', { ascending: true }),
      supabase.from('organisations').select('id', { count: 'exact', head: true }).neq('status', 'new'),
      supabase.from('newsletter_sends').select('subject, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at').neq('status', 'draft').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      getStats('7d').catch(() => null),
      getActiveVisitors().catch(() => null),
      getTopReferrers('7d', 5).catch(() => null),
    ])

    // Process contacts
    const contactsBySource = {}
    let totalContactsThisWeek = 0
    if (contactsThisWeek.data) {
      contactsThisWeek.data.forEach((c) => {
        const source = c.first_source || 'unknown'
        contactsBySource[source] = (contactsBySource[source] || 0) + 1
        totalContactsThisWeek++
      })
    }

    // Enrich signals
    let enrichedSignals = []
    if (recentSignals.data && recentSignals.data.length > 0) {
      const contactIds = [...new Set(recentSignals.data.map((s) => s.contact_id).filter(Boolean))]
      let contactMap = {}
      if (contactIds.length > 0) {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, signup_email, organisation_name')
          .in('id', contactIds)
        if (contacts) {
          contacts.forEach((c) => { contactMap[c.id] = c })
        }
      }
      enrichedSignals = recentSignals.data.map((s) => ({
        ...s,
        created_at: s.date,
        contact: contactMap[s.contact_id] || null,
      }))
    }

    // Pipeline
    const pipelineCounts = {}
    if (pipelineSnapshot.data) {
      pipelineSnapshot.data.forEach((o) => {
        const status = o.status || 'new'
        pipelineCounts[status] = (pipelineCounts[status] || 0) + 1
      })
    }

    // Analytics - flat number format: { pageviews: N, visitors: N, bounces: N, totaltime: N }
    let analytics = null
    if (umamiStats) {
      const visitors = umamiStats.visitors ?? 0
      const pageviews = umamiStats.pageviews ?? 0
      const bounces = umamiStats.bounces ?? 0
      const totaltime = umamiStats.totaltime ?? 0
      const activeCount = umamiActive?.visitors ?? 0

      analytics = {
        visitors,
        pageviews,
        bounceRate: visitors > 0 ? parseFloat(((bounces / visitors) * 100).toFixed(1)) : 0,
        avgDuration: visitors > 0 ? Math.round(totaltime / visitors) : 0,
        activeVisitors: activeCount,
        topReferrers: Array.isArray(umamiReferrers)
          ? umamiReferrers.map((r) => ({ referrer: r.x || '(direct)', views: r.y }))
          : [],
      }

      // Fire-and-forget snapshot
      writeSnapshot(supabase, analytics).catch(() => {})
    }

    return NextResponse.json({
      contactsThisWeek: { total: totalContactsThisWeek, bySource: contactsBySource },
      signals: enrichedSignals,
      pipeline: { counts: pipelineCounts, activeTotal: pipelineTotal.count || 0 },
      newsletterSubscribers: newsletterCount.count || 0,
      calendar: calendarThisWeek.data || [],
      lastNewsletter: lastNewsletter.data || null,
      analytics,
    })
  } catch (err) {
    console.error('Overview API error:', err)
    return NextResponse.json({ error: 'Failed to load overview data' }, { status: 500 })
  }
}

async function writeSnapshot(supabase, analytics) {
  await supabase
    .from('analytics_snapshots')
    .delete()
    .eq('period', '7d')
    .lt('captured_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  await supabase
    .from('analytics_snapshots')
    .insert({
      period: '7d',
      visitors: analytics.visitors,
      pageviews: analytics.pageviews,
      bounce_rate: analytics.bounceRate,
      avg_visit_duration: analytics.avgDuration,
      top_pages: [],
      top_referrers: analytics.topReferrers,
      active_visitors: analytics.activeVisitors,
    })
}
