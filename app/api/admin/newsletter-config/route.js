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
    const { data: config, error } = await supabase
      .from('newsletter_config')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
    }

    // Calculate remaining pool size
    const { count: activeContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .in('newsletter_status', ['active', 'confirmed'])

    const { count: alreadySent } = await supabase
      .from('newsletter_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')

    // Unique contacts who've been sent to
    const { data: sentContactIds } = await supabase
      .from('newsletter_recipients')
      .select('contact_id')

    const uniqueSentCount = new Set((sentContactIds || []).map(r => r.contact_id)).size

    return NextResponse.json({
      config,
      pool: {
        activeContacts: activeContacts || 0,
        uniqueSent: uniqueSentCount,
        remaining: Math.max(0, (activeContacts || 0) - uniqueSentCount),
      },
    })
  } catch (err) {
    console.error('Newsletter config API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
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

    // Whitelist allowed fields
    const allowed = ['enabled', 'batch_size', 'daily_cap', 'bounce_rate_threshold', 'skip_weekends', 'domain_exclusions_enabled', 'summary_email']
    const updates = {}

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // If re-enabling, clear paused state
    if (updates.enabled === true) {
      updates.paused_reason = null
      updates.paused_at = null
    }

    updates.updated_at = new Date().toISOString()

    const { data: config, error } = await supabase
      .from('newsletter_config')
      .update(updates)
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Newsletter config update error:', error)
      return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
    }

    return NextResponse.json({ config })
  } catch (err) {
    console.error('Newsletter config PATCH error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
