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
  const organisationId = searchParams.get('organisation_id')
  const contactId = searchParams.get('contact_id')

  try {
    let query = supabase
      .from('interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (organisationId) {
      query = query.eq('organisation_id', organisationId)
    }
    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ interactions: data || [] })
  } catch (err) {
    console.error('Interactions GET error:', err)
    return NextResponse.json({ error: 'Failed to load interactions' }, { status: 500 })
  }
}

export async function POST(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { contact_id, organisation_id, type, summary, next_action, next_action_date } = await request.json()

    if (!type || !summary) {
      return NextResponse.json({ error: 'Type and summary are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        contact_id: contact_id || null,
        organisation_id: organisation_id || null,
        type,
        summary,
        next_action: next_action || null,
        date: new Date().toISOString(),
        next_action_date: next_action_date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Interaction POST error:', err)
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 })
  }
}
