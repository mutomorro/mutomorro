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

    // Unique contacts who've been sent to (paginated to avoid PostgREST's
    // 1000-row default cap, which previously under-counted by 40%+).
    const sentContactIds = new Set()
    {
      const PAGE = 1000
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('newsletter_recipients')
          .select('contact_id')
          .range(from, from + PAGE - 1)
        if (!data || data.length === 0) break
        for (const r of data) sentContactIds.add(r.contact_id)
        if (data.length < PAGE) break
        from += PAGE
      }
    }
    const uniqueSentCount = sentContactIds.size

    // Per-issue coverage + dedup health (for Command Centre panel).
    const issues = []
    const { data: issueRows } = await supabase
      .from('newsletter_sends')
      .select('id, issue_key, subject')
      .not('issue_key', 'is', null)
      .range(0, 9999)

    const byIssue = new Map()
    for (const r of issueRows || []) {
      if (!byIssue.has(r.issue_key)) byIssue.set(r.issue_key, { sendIds: [], subject: r.subject })
      byIssue.get(r.issue_key).sendIds.push(r.id)
    }

    for (const [issueKey, info] of byIssue) {
      const recipientsByContact = new Map()
      const PAGE = 1000
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('newsletter_recipients')
          .select('contact_id')
          .in('send_id', info.sendIds)
          .range(from, from + PAGE - 1)
        if (!data || data.length === 0) break
        for (const r of data) {
          recipientsByContact.set(r.contact_id, (recipientsByContact.get(r.contact_id) || 0) + 1)
        }
        if (data.length < PAGE) break
        from += PAGE
      }
      let totalSent = 0
      let duplicatedContacts = 0
      for (const count of recipientsByContact.values()) {
        totalSent += count
        if (count > 1) duplicatedContacts++
      }
      issues.push({
        issueKey,
        subject: info.subject,
        uniqueRecipients: recipientsByContact.size,
        totalSent,
        duplicatedContacts,
        dedupOk: duplicatedContacts === 0,
      })
    }

    return NextResponse.json({
      config,
      pool: {
        activeContacts: activeContacts || 0,
        uniqueSent: uniqueSentCount,
        remaining: Math.max(0, (activeContacts || 0) - uniqueSentCount),
      },
      issues,
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

    // Get the single config row ID first (Supabase requires a filter on updates)
    const { data: existing } = await supabase
      .from('newsletter_config')
      .select('id')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Config row not found' }, { status: 404 })
    }

    const { data: config, error } = await supabase
      .from('newsletter_config')
      .update(updates)
      .eq('id', existing.id)
      .select('*')
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
