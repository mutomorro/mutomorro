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
  const view = searchParams.get('view') || 'week'
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

  // Calculate date range
  const anchor = new Date(dateParam + 'T00:00:00')
  let startDate, endDate

  if (view === 'month') {
    startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  } else {
    // Week view - find Monday
    const day = anchor.getDay()
    const diff = day === 0 ? 6 : day - 1
    startDate = new Date(anchor)
    startDate.setDate(anchor.getDate() - diff)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
  }

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('calendar_items')
      .select('*')
      .or(`and(scheduled_date.gte.${startStr},scheduled_date.lte.${endStr}),and(due_date.gte.${startStr},due_date.lte.${endStr})`)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (error) throw error

    return NextResponse.json({ items: data || [], start: startStr, end: endStr })
  } catch (err) {
    console.error('Calendar GET error:', err)
    return NextResponse.json({ error: 'Failed to load calendar' }, { status: 500 })
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
    const body = await request.json()
    const { title, description, type, platform, status, scheduled_date, scheduled_time, due_date, content_preview, url, tags } = body

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('calendar_items')
      .insert({
        title,
        description: description || null,
        type,
        platform: platform || null,
        status: status || 'planned',
        scheduled_date: scheduled_date || null,
        scheduled_time: scheduled_time || null,
        due_date: due_date || null,
        content_preview: content_preview || null,
        url: url || null,
        tags: tags || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Calendar POST error:', err)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
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

    updates.updated_at = new Date().toISOString()

    if (updates.status === 'done' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('calendar_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Calendar PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('calendar_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Calendar DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
