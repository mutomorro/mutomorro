import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    console.error('Tender GET error:', err)
    return NextResponse.json({ error: 'Failed to load tender' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()

    // Auto-set timestamps
    const updates = { ...body, updated_at: new Date().toISOString() }
    if (body.james_rating !== undefined) {
      updates.rated_at = new Date().toISOString()
    }
    if (body.status && body.status !== 'new') {
      updates.reviewed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tenders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Tender PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update tender' }, { status: 500 })
  }
}
