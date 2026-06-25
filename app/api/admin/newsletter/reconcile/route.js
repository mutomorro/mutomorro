import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Counter integrity for /admin/newsletter.
//
// The dashboards already recompute engagement from newsletter_recipients (via
// get_newsletter_issue_stats / get_newsletter_send_stats), so on-screen rates are
// correct. But the STORED newsletter_sends.total_* columns drifted badly
// (total_delivered=0 on most sends; opens under-counted) and remain a latent
// landmine for any future raw reader. This route surfaces that drift (GET) and,
// on an explicit admin action, backfills the stored columns to match the
// source-of-truth row counts (POST).

function isAdmin(request) {
  return !!request.cookies.get('admin_session')?.value
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()

  try {
    const [sendsRes, statsRes] = await Promise.all([
      supabase
        .from('newsletter_sends')
        .select('id, subject, issue_key, status, created_at, total_delivered, total_opened, total_clicked, total_bounced, reconciled_at')
        .order('created_at', { ascending: false })
        .range(0, 9999),
      supabase.rpc('get_newsletter_send_stats_full'),
    ])

    if (sendsRes.error) throw sendsRes.error
    if (statsRes.error) throw statsRes.error

    const real = new Map()
    for (const r of statsRes.data || []) {
      real.set(r.send_id, {
        delivered: Number(r.delivered),
        opened: Number(r.opened),
        clicked: Number(r.clicked),
        bounced: Number(r.bounced),
      })
    }

    const rows = (sendsRes.data || []).map((s) => {
      const t = real.get(s.id) || { delivered: 0, opened: 0, clicked: 0, bounced: 0 }
      const stored = {
        delivered: s.total_delivered || 0,
        opened: s.total_opened || 0,
        clicked: s.total_clicked || 0,
        bounced: s.total_bounced || 0,
      }
      const drift =
        stored.delivered !== t.delivered ||
        stored.opened !== t.opened ||
        stored.clicked !== t.clicked ||
        stored.bounced !== t.bounced
      return {
        id: s.id,
        subject: s.subject,
        issueKey: s.issue_key,
        status: s.status,
        createdAt: s.created_at,
        reconciledAt: s.reconciled_at,
        stored,
        real: t,
        drift,
      }
    })

    const sum = (arr, pick) => arr.reduce((a, r) => a + pick(r), 0)
    const summary = {
      sends: rows.length,
      drifted: rows.filter((r) => r.drift).length,
      storedDelivered: sum(rows, (r) => r.stored.delivered),
      realDelivered: sum(rows, (r) => r.real.delivered),
      storedOpened: sum(rows, (r) => r.stored.opened),
      realOpened: sum(rows, (r) => r.real.opened),
    }

    return NextResponse.json({ summary, drifted: rows.filter((r) => r.drift) })
  } catch (err) {
    console.error('Newsletter reconcile GET error:', err)
    return NextResponse.json({ error: 'Failed to load reconciliation' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()

  try {
    const { data: stats, error } = await supabase.rpc('get_newsletter_send_stats_full')
    if (error) throw error

    const nowIso = new Date().toISOString()
    let updated = 0
    for (const r of stats || []) {
      const { error: upErr } = await supabase
        .from('newsletter_sends')
        .update({
          total_delivered: Number(r.delivered),
          total_opened: Number(r.opened),
          total_clicked: Number(r.clicked),
          total_bounced: Number(r.bounced),
          reconciled_at: nowIso,
        })
        .eq('id', r.send_id)
      if (upErr) {
        console.error('Reconcile update failed for send', r.send_id, upErr)
      } else {
        updated++
      }
    }

    return NextResponse.json({ updated })
  } catch (err) {
    console.error('Newsletter reconcile POST error:', err)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}
