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

  const { searchParams } = new URL(request.url)
  const temperature = searchParams.get('temperature') || ''
  const status = searchParams.get('status') || ''
  const rating = searchParams.get('rating') || ''
  const sector = searchParams.get('sector') || ''
  const source = searchParams.get('source') || ''
  const noticeType = searchParams.get('notice_type') || ''
  const aiScored = searchParams.get('ai_scored') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'score'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = 25
  const offset = (page - 1) * perPage

  try {
    let query = supabase
      .from('tenders')
      .select('id, title, organisation, sector, source, source_url, value_low, value_high, deadline, notice_type, keyword_score, keywords_matched, sector_score, value_score, ai_score, ai_summary, total_score, temperature, status, james_rating, rating_notes, notes, found_at, notified_at, reviewed_at, rated_at', { count: 'exact' })

    // Filters
    if (temperature) {
      if (temperature.includes(',')) {
        query = query.in('temperature', temperature.split(','))
      } else {
        query = query.eq('temperature', temperature)
      }
    }
    if (status === 'active') {
      query = query.in('status', ['new', 'reviewing', 'bidding', 'submitted'])
    } else if (status) {
      query = query.eq('status', status)
    }
    if (aiScored === 'scored') {
      query = query.not('ai_score', 'is', null)
    } else if (aiScored === 'unscored') {
      query = query.is('ai_score', null)
    }
    if (sector) query = query.ilike('sector', `%${sector}%`)
    if (source) query = query.eq('source', source)
    if (noticeType) query = query.eq('notice_type', noticeType)

    if (rating === 'unrated') {
      query = query.is('james_rating', null)
    } else if (rating) {
      query = query.eq('james_rating', rating)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,organisation.ilike.%${search}%,ai_summary.ilike.%${search}%`)
    }

    // Sort
    if (sort === 'score') {
      query = query.order('total_score', { ascending: false })
    } else if (sort === 'deadline') {
      query = query.order('deadline', { ascending: true, nullsFirst: false })
    } else if (sort === 'rated') {
      query = query.order('rated_at', { ascending: false, nullsFirst: false })
    } else {
      query = query.order('found_at', { ascending: false })
    }

    query = query.range(offset, offset + perPage - 1)

    const { data, count, error } = await query
    if (error) throw error

    // Also fetch stats
    const [hotRes, warmRes, archivedRes, unratedRes, triggerRes, totalRes] = await Promise.all([
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('temperature', 'hot'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('temperature', 'warm'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('temperature', 'archived'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).is('james_rating', null),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).eq('notice_type', 'trigger_event'),
      supabase.from('tenders').select('id', { count: 'exact', head: true }),
    ])

    // Triage queues — the genuine signal in a 7,964-row table.
    // Action queue: still open, unrated, status 'new', and scored worth a look.
    // (total_score>=40 ≈ 18 live items; every 'yes' James has ever given scored 80+.)
    const QUEUE_SCORE_THRESHOLD = 40
    const nowIso = new Date().toISOString()
    const in7Iso = new Date(Date.now() + 7 * 86400000).toISOString()
    const in14Iso = new Date(Date.now() + 14 * 86400000).toISOString()
    const triageFields = 'id, title, organisation, sector, total_score, ai_summary, deadline, source_url, source, value_low, value_high, status, james_rating'

    const [queueRes, queueCountRes, closingRes, closing7Res, closing14Res] = await Promise.all([
      supabase.from('tenders').select(triageFields)
        .eq('status', 'new').is('james_rating', null).gte('total_score', QUEUE_SCORE_THRESHOLD)
        .or(`deadline.is.null,deadline.gte.${nowIso}`)
        .order('total_score', { ascending: false }).limit(25),
      supabase.from('tenders').select('id', { count: 'exact', head: true })
        .eq('status', 'new').is('james_rating', null).gte('total_score', QUEUE_SCORE_THRESHOLD)
        .or(`deadline.is.null,deadline.gte.${nowIso}`),
      supabase.from('tenders').select(triageFields)
        .gte('deadline', nowIso).lt('deadline', in14Iso)
        .order('deadline', { ascending: true }).limit(25),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).gte('deadline', nowIso).lt('deadline', in7Iso),
      supabase.from('tenders').select('id', { count: 'exact', head: true }).gte('deadline', nowIso).lt('deadline', in14Iso),
    ])

    return NextResponse.json({
      tenders: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / perPage),
      stats: {
        total: totalRes.count || 0,
        hot: hotRes.count || 0,
        warm: warmRes.count || 0,
        archived: archivedRes.count || 0,
        unrated: unratedRes.count || 0,
        triggers: triggerRes.count || 0,
        actionQueue: queueCountRes.count || 0,
        closing7: closing7Res.count || 0,
        closing14: closing14Res.count || 0,
      },
      triage: {
        scoreThreshold: QUEUE_SCORE_THRESHOLD,
        queue: queueRes.data || [],
        closing: closingRes.data || [],
      },
    })
  } catch (err) {
    console.error('Tenders GET error:', err)
    return NextResponse.json({ error: 'Failed to load tenders' }, { status: 500 })
  }
}
