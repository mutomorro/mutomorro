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
  const search = searchParams.get('search') || ''
  const tier = searchParams.get('tier') || ''
  const source = searchParams.get('source') || ''
  const newsletter = searchParams.get('newsletter') || ''
  const zb = searchParams.get('zb') || ''
  const tag = searchParams.get('tag') || ''
  const segment = searchParams.get('segment') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || 'created_at'
  const perPage = 20
  const offset = (page - 1) * perPage

  try {
    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, signup_email, organisation_name, role, seniority, industry, enriched, tier, newsletter_status, newsletter_opens, newsletter_clicks, last_download_date, sources, first_source, tags, download_count, created_at', { count: 'exact' })

    // Search
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,signup_email.ilike.%${search}%,organisation_name.ilike.%${search}%`)
    }

    // Filters
    if (tier === '(unset)') {
      query = query.is('tier', null)
    } else if (tier) {
      query = query.eq('tier', tier)
    }
    if (source) {
      query = query.eq('first_source', source)
    }
    if (newsletter) {
      if (newsletter === 'never') {
        // 'never' is stored as a literal for most rows, but some legacy rows are
        // NULL — match both so the filter agrees with the KPI bucket.
        query = query.or('newsletter_status.is.null,newsletter_status.eq.never')
      } else {
        query = query.eq('newsletter_status', newsletter)
      }
    }
    if (zb) {
      if (zb === 'unverified') {
        query = query.is('zb_status', null)
      } else {
        query = query.eq('zb_status', zb)
      }
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Working-segment filters (drive the header chips).
    if (segment === 'no_company') {
      query = query.is('organisation_name', null)
    } else if (segment === 'decision_makers') {
      query = query.in('seniority', ['director', 'c_suite', 'head', 'vp', 'founder', 'partner', 'owner'])
    } else if (segment === 'active_30d') {
      const thirty = new Date(Date.now() - 30 * 86400000).toISOString()
      query = query.gte('last_download_date', thirty)
    } else if (segment === 'enriched') {
      query = query.eq('enriched', true)
    } else if (segment === 'uk') {
      // country looks UK OR the email domain ends in .uk (mirrors is_uk_contact).
      query = query.or('country.ilike.%united kingdom%,country.ilike.%northern ireland%,country.ilike.england,country.ilike.scotland,country.ilike.wales,country.ilike.uk,country.ilike.gb,country.ilike.great britain,signup_email.ilike.%.uk')
    }

    // Sort
    const ascending = sort.startsWith('+')
    const sortField = sort.replace(/^[+-]/, '') || 'created_at'
    query = query.order(sortField, { ascending })

    // Pagination
    query = query.range(offset, offset + perPage - 1)

    const { data, count, error } = await query

    if (error) throw error

    // Enrich contacts with latest signal detail
    let enrichedContacts = data || []
    if (enrichedContacts.length > 0) {
      const contactIds = enrichedContacts.map((c) => c.id)
      const { data: signals } = await supabase
        .from('signals')
        .select('contact_id, type, detail')
        .in('contact_id', contactIds)
        .order('date', { ascending: false })

      if (signals) {
        // Build map of contact_id -> latest signal
        const signalMap = {}
        signals.forEach((s) => {
          if (!signalMap[s.contact_id]) {
            signalMap[s.contact_id] = s
          }
        })
        enrichedContacts = enrichedContacts.map((c) => ({
          ...c,
          latest_signal_detail: signalMap[c.id]?.detail || null,
          latest_signal_type: signalMap[c.id]?.type || null,
        }))
      }
    }

    return NextResponse.json({
      contacts: enrichedContacts,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / perPage),
    })
  } catch (err) {
    console.error('Contacts GET error:', err)
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Contacts PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}
