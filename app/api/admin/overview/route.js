import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { queryPostHog, trendsQuery } from '../../../../lib/posthog-admin'
import { getSequences } from '../../../../lib/apollo'

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

    const twoWeeksAgoISO = new Date(now.getTime() - 14 * 86400000).toISOString()

    const [
      contactsThisWeek,
      contactsPreviousWeek,
      recentSignals,
      pipelineSnapshot,
      newsletterCount,
      newsletterCountPrevWeek,
      calendarThisWeek,
      pipelineTotal,
      lastNewsletter,
      phVisitors,
      phPageviews,
      phReferrers,
      apolloSequences,
      tenderHot,
      tenderUnreviewed,
      tenderUrgent,
      handoffsOpen,
      handoffsRecent,
    ] = await Promise.all([
      supabase.from('contacts').select('first_source').gte('created_at', weekAgoISO),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', twoWeeksAgoISO).lt('created_at', weekAgoISO),
      supabase.from('signals').select('id, type, detail, strength, date, contact_id').gte('date', weekAgoISO).order('date', { ascending: false }).limit(20),
      supabase.from('organisations').select('status'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']).gte('newsletter_consent_date', weekAgoISO),
      supabase.from('calendar_items').select('*').or(`scheduled_date.gte.${mondayStr},due_date.gte.${mondayStr}`).or(`scheduled_date.lte.${sundayStr},due_date.lte.${sundayStr}`).order('scheduled_date', { ascending: true }),
      supabase.from('organisations').select('id', { count: 'exact', head: true }).neq('status', 'new'),
      supabase.from('newsletter_sends').select('subject, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at').neq('status', 'draft').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      queryPostHog(trendsQuery({ math: 'dau', dateRange: '-7d', interval: 'day' })).catch(() => null),
      queryPostHog(trendsQuery({ math: 'total', dateRange: '-7d', interval: 'day' })).catch(() => null),
      queryPostHog(trendsQuery({ dateRange: '-7d', breakdownProperty: '$referring_domain', breakdownLimit: 5 })).catch(() => null),
      process.env.APOLLO_API_KEY ? getSequences().catch(() => null) : Promise.resolve(null),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('temperature', 'hot'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).gt('deadline', new Date().toISOString()).lt('deadline', new Date(Date.now() + 7 * 86400000).toISOString()),
      supabase.from('handoffs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('handoffs').select('id, title, source_project, target_project').eq('status', 'open').order('created_at', { ascending: false }).limit(3),
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

    // Enrich signals and sort by strength (high first), then date
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
      const strengthOrder = { high: 1, medium: 2, low: 3 }
      enrichedSignals = recentSignals.data
        .map((s) => ({
          ...s,
          created_at: s.date,
          contact: contactMap[s.contact_id] || null,
        }))
        .sort((a, b) => {
          const sa = strengthOrder[a.strength] || 3
          const sb = strengthOrder[b.strength] || 3
          if (sa !== sb) return sa - sb
          return new Date(b.created_at) - new Date(a.created_at)
        })
    }

    // Pipeline
    const pipelineCounts = {}
    if (pipelineSnapshot.data) {
      pipelineSnapshot.data.forEach((o) => {
        const status = o.status || 'new'
        pipelineCounts[status] = (pipelineCounts[status] || 0) + 1
      })
    }

    // Analytics from PostHog - keep same response shape as before
    let analytics = null
    const visitors = sumPostHogSeries(phVisitors)
    const pageviews = sumPostHogSeries(phPageviews)

    if (visitors !== null || pageviews !== null) {
      const referrers = extractPostHogBreakdown(phReferrers)

      analytics = {
        visitors: visitors || 0,
        pageviews: pageviews || 0,
        bounceRate: 0,
        avgDuration: 0,
        activeVisitors: 0,
        topReferrers: referrers.map((r) => ({
          referrer: r.label === '$direct' || r.label === 'null' ? '(direct)' : r.label,
          views: r.count,
        })),
      }

      // Fire-and-forget snapshot
      writeSnapshot(supabase, analytics).catch(() => {})
    }

    return NextResponse.json({
      contactsThisWeek: { total: totalContactsThisWeek, previousWeek: contactsPreviousWeek.count || 0, bySource: contactsBySource },
      signals: enrichedSignals,
      pipeline: { counts: pipelineCounts, activeTotal: pipelineTotal.count || 0 },
      newsletterSubscribers: newsletterCount.count || 0,
      newsletterNewThisWeek: newsletterCountPrevWeek.count || 0,
      calendar: calendarThisWeek.data || [],
      lastNewsletter: lastNewsletter.data || null,
      outreach: apolloSequences ? {
        activeSequences: apolloSequences.filter((s) => s.active && !s.archived).length,
        totalContacts: apolloSequences.filter((s) => s.active && !s.archived).reduce((sum, s) => sum + (s.unique_scheduled || 0), 0),
        totalReplies: apolloSequences.reduce((sum, s) => sum + (s.unique_replied || 0), 0),
      } : null,
      analytics,
      handoffs: {
        openCount: handoffsOpen.count || 0,
        recent: handoffsRecent.data || [],
      },
      tenders: {
        hot: tenderHot.count || 0,
        unreviewed: tenderUnreviewed.count || 0,
        urgent: tenderUrgent.count || 0,
      },
    })
  } catch (err) {
    console.error('Overview API error:', err)
    return NextResponse.json({ error: 'Failed to load overview data' }, { status: 500 })
  }
}

// Sum all daily values from a PostHog TrendsQuery result
function sumPostHogSeries(result) {
  if (!result?.results?.[0]?.data) return null
  return result.results[0].data.reduce((sum, v) => sum + v, 0)
}

// Extract breakdown data from PostHog result
function extractPostHogBreakdown(result) {
  if (!result?.results) return []
  return result.results
    .map((r) => ({
      label: String(r.breakdown_value ?? r.label ?? 'Unknown'),
      count: (r.data || []).reduce((sum, v) => sum + v, 0),
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
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
