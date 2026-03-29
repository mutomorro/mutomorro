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
  const status = searchParams.get('status')
  const showCompleted = searchParams.get('showCompleted') === 'true'
  const target = searchParams.get('target')
  const source = searchParams.get('source')
  const type = searchParams.get('type')
  const priority = searchParams.get('priority')

  try {
    let query = supabase
      .from('handoffs')
      .select(`
        *,
        contacts:contact_id (id, first_name, last_name, signup_email),
        organisations:organisation_id (id, name)
      `)

    // Status filtering
    if (status) {
      query = query.eq('status', status)
    } else if (!showCompleted) {
      query = query.in('status', ['open', 'picked-up'])
    }

    if (target) query = query.eq('target_project', target)
    if (source) query = query.eq('source_project', source)
    if (type) query = query.eq('type', type)
    if (priority) query = query.eq('priority', priority)

    // Order by priority (high first), then created_at descending
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    // Sort by priority in JS since Supabase can't order by enum
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const sorted = (data || []).sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1
      const pb = priorityOrder[b.priority] ?? 1
      if (pa !== pb) return pa - pb
      return new Date(b.created_at) - new Date(a.created_at)
    })

    // Also fetch summary counts
    const [openCount, pickedUpCount, completedWeek] = await Promise.all([
      supabase.from('handoffs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('handoffs').select('id', { count: 'exact', head: true }).eq('status', 'picked-up'),
      supabase.from('handoffs').select('id', { count: 'exact', head: true })
        .eq('status', 'done')
        .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ])

    return NextResponse.json({
      handoffs: sorted,
      counts: {
        open: openCount.count || 0,
        pickedUp: pickedUpCount.count || 0,
        completedThisWeek: completedWeek.count || 0,
      },
    })
  } catch (err) {
    console.error('Handoffs GET error:', err)
    return NextResponse.json({ error: 'Failed to load handoffs' }, { status: 500 })
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
    const { source_project, target_project, type, title, detail, contact_id, organisation_id, priority } = body

    if (!source_project || !target_project || !title) {
      return NextResponse.json({ error: 'source_project, target_project and title are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('handoffs')
      .insert({
        source_project,
        target_project,
        type: type || 'task',
        title,
        detail: detail || null,
        contact_id: contact_id || null,
        organisation_id: organisation_id || null,
        priority: priority || 'medium',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Handoffs POST error:', err)
    return NextResponse.json({ error: 'Failed to create handoff' }, { status: 500 })
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

    // Auto-set timestamps based on status changes
    if (updates.status === 'picked-up' && !updates.picked_up_at) {
      updates.picked_up_at = new Date().toISOString()
    }
    if ((updates.status === 'done' || updates.status === 'dismissed') && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('handoffs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Handoffs PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update handoff' }, { status: 500 })
  }
}
