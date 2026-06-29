import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One composable query. The commercial facets below are the building-blocks; a
// "lens" (Target, Golden, …) is just a facet-set the UI applies. Each facet mirrors
// the predicate the Overview funnel / get_engaged_contacts use, so counts agree.

// Manager-and-above = "fit" (mirrors is_decision_maker_seniority).
const DM_SENIORITY = ['manager', 'director', 'head', 'vp', 'c_suite', 'founder', 'partner', 'owner']
// UK predicate as a PostgREST or-group (mirrors is_uk_contact, incl. 'britain').
const UK_OR = 'country.ilike.%united kingdom%,country.ilike.%northern ireland%,country.ilike.uk,country.ilike.gb,country.ilike.great britain,country.ilike.britain,country.ilike.england,country.ilike.scotland,country.ilike.wales,signup_email.ilike.%.uk'
// Newsletter-status sets (NULL counts as "never subscribed", so notsub/contactable
// each OR in is.null — avoids NOT IN excluding the large null-status population).
const NS_SUBSCRIBED = ['active', 'confirmed']
const NS_NOT_SUBSCRIBED = ['pending_confirmation', 'opted-in-not-added', 'never', 'unsubscribed', 'bounced']
const NS_CONTACTABLE = ['active', 'confirmed', 'pending_confirmation', 'opted-in-not-added', 'never']

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
  const p = (k) => searchParams.get(k) || ''
  const search = p('search')
  const tier = p('tier')
  const source = p('source')
  const newsletter = p('newsletter')
  const zb = p('zb')
  const tag = p('tag')
  const segment = p('segment')
  const sector = p('sector')
  const scope = p('scope')
  // Commercial facets (compose with the above; lenses are facet-sets the UI applies).
  const uk = p('uk') === '1'
  const dm = p('dm') === '1'
  const engaged = p('engaged') === '1'
  const enquired = p('enquired') === '1'
  const sub = p('sub')                 // subscribed | notsub | optedout
  const contactable = p('contactable') === '1'
  const due = p('due') === '1'
  const scoreMin = p('score_min')
  const scoreMax = p('score_max')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || '-engagement_score'
  const perPage = 20
  const offset = (page - 1) * perPage

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
    const todayStr = new Date().toISOString().slice(0, 10)

    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, signup_email, organisation_name, role, seniority, industry, sector, out_of_scope, enriched, tier, newsletter_status, newsletter_opens, newsletter_clicks, last_download_date, sources, first_source, tags, download_count, engagement_score, high_signals_count, country, created_at', { count: 'exact' })
      // The owner's own rows are never prospects (mirrors the funnel exclusion).
      .not('signup_email', 'ilike', '%@mutomorro.com')

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
      query = query.or(UK_OR)
    }

    // ── Commercial facets (lens building-blocks; all AND-composed) ──
    if (uk) query = query.or(UK_OR)
    if (dm) query = query.in('seniority', DM_SENIORITY)
    if (sub === 'subscribed') query = query.in('newsletter_status', NS_SUBSCRIBED)
    else if (sub === 'notsub') query = query.or(`newsletter_status.is.null,newsletter_status.in.(${NS_NOT_SUBSCRIBED.join(',')})`)
    else if (sub === 'optedout') query = query.eq('newsletter_status', 'unsubscribed')
    if (contactable) query = query.or(`newsletter_status.is.null,newsletter_status.in.(${NS_CONTACTABLE.join(',')})`)
    if (engaged) query = query.or(`newsletter_clicks.gt.0,last_download_date.gte.${ninetyDaysAgo},high_signals_count.gt.0`)
    if (enquired) query = query.gt('high_signals_count', 0)
    if (due) query = query.lte('next_nudge_date', todayStr)
    if (scoreMin !== '' && Number.isFinite(Number(scoreMin))) query = query.gte('engagement_score', Number(scoreMin))
    if (scoreMax !== '' && Number.isFinite(Number(scoreMax))) query = query.lte('engagement_score', Number(scoreMax))

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
const EDITABLE_FIELDS = ['first_name', 'last_name', 'signup_email', 'location', 'country', 'tags', 'tier', 'newsletter_status', 'sector', 'out_of_scope', 'organisation_name', 'seniority', 'role', 'industry', 'notes', 'next_nudge_date']
function pickEditable(body) {
  const out = {}
  for (const k of EDITABLE_FIELDS) {
    if (k in body) out[k] = k === 'sector' && body[k] === '' ? null : body[k]
  }
  return out
}
