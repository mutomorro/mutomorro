import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 404 triage — missed_redirects, hit-weighted. Surfaces the URLs people actually
// hit that 404, separates bot/scanner noise from real misses, and flags
// self-inflicted broken internal links (referrer on our own domain).
//
// Resolving records the decision on missed_redirects (resolved + resolved_to).
// NB: this does NOT itself create a live redirect — those live in next.config.
// Wiring resolved rows into an actual middleware redirect is a deliberate
// follow-up (see the admin roadmap open questions).

// Paths that are almost always automated scanners, not real visitors.
const BOT_PATTERNS = [
  /^\/\.well-known/i,
  /\/wp-(admin|login|content|includes)/i,
  /\.(php|asp|aspx|env|git|sql|bak)(\/|$)/i,
  /\/(xmlrpc|phpmyadmin|adminer|wlwmanifest)/i,
  /\/(cgi-bin|vendor|\.vscode|\.idea)/i,
  /captcha/i,
]

function isBotPath(path) {
  return BOT_PATTERNS.some((re) => re.test(path || ''))
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()
  const { searchParams } = new URL(request.url)
  const includeResolved = searchParams.get('resolved') === '1'

  try {
    let query = supabase
      .from('missed_redirects')
      .select('id, path, referrer, hit_count, first_hit_at, last_hit_at, resolved, resolved_to, notes')
      .order('hit_count', { ascending: false })
      .order('last_hit_at', { ascending: false })
      .limit(500)
    if (!includeResolved) query = query.eq('resolved', false)

    const { data, error } = await query
    if (error) throw error

    const rows = (data || []).map((r) => ({
      ...r,
      isBot: isBotPath(r.path),
      isInternal: /mutomorro\.com/i.test(r.referrer || ''),
    }))

    const real = rows.filter((r) => !r.isBot)
    return NextResponse.json({
      items: rows,
      counts: {
        total: rows.length,
        real: real.length,
        bot: rows.length - real.length,
        brokenInternal: rows.filter((r) => r.isInternal && !r.isBot).length,
        realHits: real.reduce((a, r) => a + (r.hit_count || 0), 0),
      },
    })
  } catch (err) {
    console.error('Redirects GET error:', err)
    return NextResponse.json({ error: 'Failed to load 404s' }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()

  try {
    const body = await request.json()
    const { id, resolved_to, dismiss } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Column allow-list. Resolve with a target, or dismiss as noise.
    const updates = { resolved: true }
    if (dismiss) {
      updates.resolved_to = null
      updates.notes = 'Dismissed as noise'
    } else {
      if (!resolved_to) return NextResponse.json({ error: 'A target path is required' }, { status: 400 })
      updates.resolved_to = resolved_to
    }

    const { data, error } = await supabase
      .from('missed_redirects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Redirects PATCH error:', err)
    return NextResponse.json({ error: 'Failed to resolve' }, { status: 500 })
  }
}
