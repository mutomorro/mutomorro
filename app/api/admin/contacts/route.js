import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Commercial lenses + Overview funnel drill-downs. When one is active the
// Contacts surface switches to "targeted mode" and ranks via get_engaged_contacts
// (same set the Engagement page used). 'all' is browse-mode and is NOT listed here.
const ENGAGEMENT_PRESETS = new Set([
  'recent', 'decision_makers', 'repeat', 'clickers', 'enquirers', 'uk', 'golden', 'engaged',
  'uk_subscribed', 'uk_engaged', 'uk_target', 'uk_notsub', 'uk_target_audience', 'uk_optedout',
])

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
  const zb = searchParams.get('zb') || ''
  const tag = searchParams.get('tag') || ''
  const segment = searchParams.get('segment') || ''
  const sector = searchParams.get('sector') || ''
  const scope = searchParams.get('scope') || ''
  const preset = searchParams.get('preset') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || 'created_at'
  const perPage = 20
  const offset = (page - 1) * perPage

  try {
    // ── Targeted mode ──────────────────────────────────────────────
    // A commercial preset (the Engagement lenses + the Overview funnel
    // drill-downs) delegates to get_engaged_contacts, which ranks by the
    // weighted score and returns the "reasons" fields the chips need. These
    // sets are small (tens), so no pagination. Browse-mode raw filters do not
    // apply here by design — it is a different data path on the same surface.
    if (ENGAGEMENT_PRESETS.has(preset)) {
      // 500 is the RPC's hard cap. Covers every funnel box except Total UK
      // (~552), which shows the top 500 by score — the lowest-scoring ~50 (UK and
      // nothing else) are trimmed. Fine for an action surface; revisit in the
      // Phase 5 UX pass if the big top-of-funnel boxes want a full browse view.
      const { data, error } = await supabase.rpc('get_engaged_contacts', { p_limit: 500, p_filter: preset })
      if (error) throw error
      const rows = (data || []).map((r) => ({
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        signup_email: r.signup_email,
        organisation_name: r.organisation_name,
        role: r.role,
        seniority: r.seniority,
        industry: r.industry,
        sector: r.sector,
        out_of_scope: false,
        tier: r.tier,
        newsletter_status: null,
        newsletter_opens: r.newsletter_opens,
        newsletter_clicks: r.newsletter_clicks,
        last_download_date: r.last_download_date,
        download_count: r.download_count,
        first_source: null,
        created_at: null,
        engagement_score: r.score,
        // reasons (drive the targeted-mode chips)
        high_signals: Number(r.high_signals) || 0,
        is_decision_maker: r.is_decision_maker,
        active_30d: r.active_30d,
        active_90d: r.active_90d,
        is_uk: r.is_uk,
        is_org_email: r.is_org_email,
        latest_signal_detail: null,
        latest_signal_type: null,
      }))
      return NextResponse.json({ contacts: rows, total: rows.length, page: 1, pages: 1, mode: 'targeted', preset })
    }

    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, signup_email, organisation_name, role, seniority, industry, sector, out_of_scope, enriched, tier, newsletter_status, newsletter_opens, newsletter_clicks, last_download_date, sources, first_source, tags, download_count, engagement_score, created_at', { count: 'exact' })

    // Search
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,signup_email.ilike.%${search}%,organisation_name.ilike.%${search}%`)
    }

    // Filters
    if (tier === '(unset)') {
      query = query.is('tier', null)
    } else if (tier) {
      query = query.eq('tier', tier)
    }
    if (source) {
      query = query.eq('first_source', source)
    }
    if (newsletter) {
      if (newsletter === 'never') {
        // 'never' is stored as a literal for most rows, but some legacy rows are
        // NULL — match both so the filter agrees with the KPI bucket.
        query = query.or('newsletter_status.is.null,newsletter_status.eq.never')
      } else {
        query = query.eq('newsletter_status', newsletter)
      }
    }
    if (zb) {
      if (zb === 'unverified') {
        query = query.is('zb_status', null)
      } else {
        query = query.eq('zb_status', zb)
      }
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }
    // Sector curation filters.
    if (sector === '(none)') {
      query = query.is('sector', null)
    } else if (sector) {
      query = query.eq('sector', sector)
    }
    if (scope === 'out') {
      query = query.eq('out_of_scope', true)
    } else if (scope === 'in') {
      query = query.eq('out_of_scope', false)
    }

    // Working-segment filters (drive the header chips).
    if (segment === 'no_company') {
      query = query.is('organisation_name', null)
    } else if (segment === 'decision_makers') {
      query = query.in('seniority', ['manager', 'director', 'c_suite', 'head', 'vp', 'founder', 'partner', 'owner'])
    } else if (segment === 'active_30d') {
      const thirty = new Date(Date.now() - 30 * 86400000).toISOString()
      query = query.gte('last_download_date', thirty)
    } else if (segment === 'enriched') {
      query = query.eq('enriched', true)
    } else if (segment === 'uk') {
      // country looks UK OR the email domain ends in .uk (mirrors is_uk_contact).
      query = query.or('country.ilike.%united kingdom%,country.ilike.%northern ireland%,country.ilike.england,country.ilike.scotland,country.ilike.wales,country.ilike.uk,country.ilike.gb,country.ilike.great britain,signup_email.ilike.%.uk')
    }

    // Sort
    const ascending = sort.startsWith('+')
    const sortField = sort.replace(/^[+-]/, '') || 'created_at'
    if (sortField === 'engagement_score') {
      // Keep unscored rows (rare — backfilled daily) out of the top of a DESC
      // sort, and add a stable tiebreak so pages don't drift.
      query = query.order('engagement_score', { ascending, nullsFirst: false }).order('id', { ascending: true })
    } else {
      query = query.order(sortField, { ascending })
    }

    // Pagination
    query = query.range(offset, offset + perPage - 1)

    const { data, count, error } = await query

    if (error) throw error

    // Enrich contacts with latest signal detail
    let enrichedContacts = data || []
    if (enrichedContacts.length > 0) {
      const contactIds = enrichedContacts.map((c) => c.id)
      const { data: signals } = await supabase
        .from('signals')
        .select('contact_id, type, detail')
        .in('contact_id', contactIds)
        .order('date', { ascending: false })

      if (signals) {
        // Build map of contact_id -> latest signal
        const signalMap = {}
        signals.forEach((s) => {
          if (!signalMap[s.contact_id]) {
            signalMap[s.contact_id] = s
          }
        })
        enrichedContacts = enrichedContacts.map((c) => ({
          ...c,
          latest_signal_detail: signalMap[c.id]?.detail || null,
          latest_signal_type: signalMap[c.id]?.type || null,
        }))
      }
    }

    return NextResponse.json({
      contacts: enrichedContacts,
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
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Column allow-list — never spread the raw body into .update().
    const updates = pickEditable(body)
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // 23505 = unique violation (e.g. another contact already has that email).
      const msg = error.code === '23505'
        ? 'That email is already used by another contact.'
        : 'Failed to update contact.'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Contacts PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

// Delete a contact. interactions + newsletter_recipients cascade; signals +
// diagnostic_responses null out; a linked handoff (NO ACTION) blocks the delete.
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

    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) {
      const msg = error.code === '23503'
        ? 'This contact is linked to a handoff. Unlink it there first, then delete.'
        : 'Failed to delete contact.'
      return NextResponse.json({ error: msg }, { status: 409 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contacts DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}

// Bulk sector / scope curation for the selected contacts.
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
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((n) => Number.isFinite(Number(n))).map(Number)
      : []
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids are required' }, { status: 400 })
    }

    const updates = {}
    if ('sector' in body) {
      const s = typeof body.sector === 'string' ? body.sector.trim() : ''
      updates.sector = s === '' ? null : s
    }
    if (typeof body.out_of_scope === 'boolean') {
      updates.out_of_scope = body.out_of_scope
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .in('id', ids)
      .select('id')
    if (error) throw error

    return NextResponse.json({ updated: (data || []).length })
  } catch (err) {
    console.error('Contacts bulk POST error:', err)
    return NextResponse.json({ error: 'Failed to bulk update' }, { status: 500 })
  }
}

// Fields a curator may edit on a contact. Anything else in the body is ignored.
const EDITABLE_FIELDS = ['first_name', 'last_name', 'signup_email', 'location', 'country', 'tags', 'tier', 'newsletter_status', 'sector', 'out_of_scope', 'organisation_name', 'seniority', 'role', 'industry', 'notes']
function pickEditable(body) {
  const out = {}
  for (const k of EDITABLE_FIELDS) {
    if (k in body) out[k] = k === 'sector' && body[k] === '' ? null : body[k]
  }
  return out
}
