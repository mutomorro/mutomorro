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
  const tag = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || 'created_at'
  const perPage = 20
  const offset = (page - 1) * perPage

  try {
    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, signup_email, organisation_name, role, tier, newsletter_status, sources, first_source, tags, download_count, created_at', { count: 'exact' })

    // Search
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,signup_email.ilike.%${search}%,organisation_name.ilike.%${search}%`)
    }

    // Filters
    if (tier) {
      query = query.eq('tier', tier)
    }
    if (source) {
      query = query.eq('first_source', source)
    }
    if (newsletter) {
      if (newsletter === 'never') {
        query = query.is('newsletter_status', null)
      } else {
        query = query.eq('newsletter_status', newsletter)
      }
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Sort
    const ascending = sort.startsWith('+')
    const sortField = sort.replace(/^[+-]/, '') || 'created_at'
    query = query.order(sortField, { ascending })

    // Pagination
    query = query.range(offset, offset + perPage - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      contacts: data || [],
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
