import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  // Session check (middleware handles redirect, but API routes need explicit check)
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Calculate date ranges
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    // Get Monday of current week
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const mondayStr = monday.toISOString().split('T')[0]
    const sundayStr = sunday.toISOString().split('T')[0]

    // Run all queries in parallel
    const [
      contactsThisWeek,
      recentSignals,
      pipelineSnapshot,
      newsletterCount,
      calendarThisWeek,
      pipelineTotal,
    ] = await Promise.all([
      // a) Contacts created in last 7 days
      supabase
        .from('contacts')
        .select('first_source')
        .gte('created_at', weekAgoISO),

      // b) Last 10 signals with contact info
      supabase
        .from('signals')
        .select('id, type, detail, strength, date, contact_id')
        .order('date', { ascending: false })
        .limit(10),

      // c) Organisations grouped by status
      supabase
        .from('organisations')
        .select('status'),

      // d) Newsletter subscriber count
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('newsletter_status', 'active'),

      // e) Calendar items this week
      supabase
        .from('calendar_items')
        .select('*')
        .or(`scheduled_date.gte.${mondayStr},due_date.gte.${mondayStr}`)
        .or(`scheduled_date.lte.${sundayStr},due_date.lte.${sundayStr}`)
        .order('scheduled_date', { ascending: true }),

      // f) Pipeline total (not 'new')
      supabase
        .from('organisations')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'new'),
    ])

    // Process contacts this week - group by source
    const contactsBySource = {}
    let totalContactsThisWeek = 0
    if (contactsThisWeek.data) {
      contactsThisWeek.data.forEach((c) => {
        const source = c.first_source || 'unknown'
        contactsBySource[source] = (contactsBySource[source] || 0) + 1
        totalContactsThisWeek++
      })
    }

    // Enrich signals with contact info
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
          contacts.forEach((c) => {
            contactMap[c.id] = c
          })
        }
      }

      enrichedSignals = recentSignals.data.map((s) => ({
        ...s,
        created_at: s.date,
        contact: contactMap[s.contact_id] || null,
      }))
    }

    // Process pipeline snapshot - group by status
    const pipelineCounts = {}
    if (pipelineSnapshot.data) {
      pipelineSnapshot.data.forEach((o) => {
        const status = o.status || 'new'
        pipelineCounts[status] = (pipelineCounts[status] || 0) + 1
      })
    }

    return NextResponse.json({
      contactsThisWeek: {
        total: totalContactsThisWeek,
        bySource: contactsBySource,
      },
      signals: enrichedSignals,
      pipeline: {
        counts: pipelineCounts,
        activeTotal: pipelineTotal.count || 0,
      },
      newsletterSubscribers: newsletterCount.count || 0,
      calendar: calendarThisWeek.data || [],
    })
  } catch (err) {
    console.error('Overview API error:', err)
    return NextResponse.json({ error: 'Failed to load overview data' }, { status: 500 })
  }
}
