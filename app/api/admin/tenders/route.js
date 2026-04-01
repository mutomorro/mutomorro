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
      query = query.not('status', 'in', '(cancelled,dismissed,passed)')
    } else if (status) {
      query = query.eq('status', status)
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
      },
    })
  } catch (err) {
    console.error('Tenders GET error:', err)
    return NextResponse.json({ error: 'Failed to load tenders' }, { status: 500 })
  }
}
