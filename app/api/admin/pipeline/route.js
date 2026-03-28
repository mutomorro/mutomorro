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

  try {
    const { data: orgs, error } = await supabase
      .from('organisations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // For each org, get contacts (names) and latest interaction
    const enriched = await Promise.all(
      (orgs || []).map(async (org) => {
        const [contactResult, lastInteraction] = await Promise.all([
          supabase
            .from('contacts')
            .select('id, first_name, last_name')
            .eq('organisation_name', org.name)
            .limit(10),
          supabase
            .from('interactions')
            .select('created_at, next_action')
            .eq('organisation_id', org.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

        const contacts = contactResult.data || []
        const contactNames = contacts
          .map((c) => [c.first_name, c.last_name].filter(Boolean).join(' '))
          .filter(Boolean)

        return {
          ...org,
          contact_count: contacts.length,
          contact_names: contactNames,
          last_interaction_date: lastInteraction.data?.created_at || null,
          next_action: lastInteraction.data?.next_action || null,
        }
      })
    )

    return NextResponse.json({ organisations: enriched })
  } catch (err) {
    console.error('Pipeline GET error:', err)
    return NextResponse.json({ error: 'Failed to load pipeline' }, { status: 500 })
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
      .from('organisations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Pipeline PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update organisation' }, { status: 500 })
  }
}
