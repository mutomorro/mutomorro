import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Engagement intelligence — surfaces the buried signals: who is most engaged,
// which organisations are engaging, and the interesting downloaders. Ranking is
// computed server-side via get_engaged_contacts / get_engaged_organisations
// (transparent weighted score; see the engagement-scoring migration).

const PEOPLE_FILTERS = new Set(['all', 'recent', 'decision_makers', 'repeat', 'clickers', 'enquirers', 'uk', 'golden'])

// Score weights — defaults reproduce the original scoring; the UI can override.
const DEFAULT_WEIGHTS = { wClick: 8, wOpen: 1, wDownload: 1.5, wRecent30: 20, wRecent90: 10, wSignal: 15, wDm: 12, wOrg: 6, wUk: 18 }
const RPC_WEIGHT_KEY = { wClick: 'w_click', wOpen: 'w_open', wDownload: 'w_download', wRecent30: 'w_recent30', wRecent90: 'w_recent90', wSignal: 'w_signal', wDm: 'w_dm', wOrg: 'w_org', wUk: 'w_uk' }

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
  const view = searchParams.get('view') || 'people'

  try {
    if (view === 'orgs') {
      const { data, error } = await supabase.rpc('get_engaged_organisations', { p_limit: 80 })
      if (error) throw error
      return NextResponse.json({ organisations: (data || []).map(normaliseOrg) })
    }

    if (view === 'org_people') {
      const domain = (searchParams.get('domain') || '').toLowerCase()
      if (!domain) return NextResponse.json({ people: [] })
      // All people at this domain (not just high scorers), most engaged first.
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, signup_email, role, seniority, download_count, newsletter_opens, newsletter_clicks, last_download_date')
        .ilike('signup_email', `%@${domain}`)
        .order('newsletter_clicks', { ascending: false })
        .order('newsletter_opens', { ascending: false })
        .limit(200)
      if (error) throw error
      return NextResponse.json({ people: data || [] })
    }

    // Default: ranked people, with a preset filter + (optional) custom weights.
    const filter = searchParams.get('filter') || 'all'
    const safeFilter = PEOPLE_FILTERS.has(filter) ? filter : 'all'
    const params = { p_limit: 150, p_filter: safeFilter }
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
      const raw = searchParams.get(key)
      const v = raw == null ? DEFAULT_WEIGHTS[key] : Number(raw)
      params[RPC_WEIGHT_KEY[key]] = Number.isFinite(v) ? v : DEFAULT_WEIGHTS[key]
    }
    const { data, error } = await supabase.rpc('get_engaged_contacts', params)
    if (error) throw error
    return NextResponse.json({ people: (data || []).map(normalisePerson) })
  } catch (err) {
    console.error('Engagement GET error:', err)
    return NextResponse.json({ error: 'Failed to load engagement data' }, { status: 500 })
  }
}

// Bulk-tag selected contacts → turns a ranked lead list into a segment
// (tags are a filter in /admin/contacts).
export async function POST(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()
  try {
    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids.filter((n) => Number.isFinite(Number(n))).map(Number) : []
    const tag = typeof body.tag === 'string' ? body.tag.trim() : ''
    if (ids.length === 0 || !tag) {
      return NextResponse.json({ error: 'ids and a tag are required' }, { status: 400 })
    }
    const { data, error } = await supabase.rpc('add_tag_to_contacts', { p_ids: ids, p_tag: tag })
    if (error) throw error
    return NextResponse.json({ tagged: Number(data) || 0 })
  } catch (err) {
    console.error('Engagement POST error:', err)
    return NextResponse.json({ error: 'Failed to tag contacts' }, { status: 500 })
  }
}

function normalisePerson(r) {
  return {
    id: r.id,
    name: [r.first_name, r.last_name].filter(Boolean).join(' ') || null,
    firstName: r.first_name || '',
    lastName: r.last_name || '',
    email: r.signup_email,
    organisation: r.organisation_name,
    role: r.role,
    seniority: r.seniority,
    tier: r.tier,
    domain: r.domain,
    isOrgEmail: r.is_org_email,
    downloads: r.download_count,
    opens: r.newsletter_opens,
    clicks: r.newsletter_clicks,
    lastDownload: r.last_download_date,
    highSignals: Number(r.high_signals) || 0,
    isDecisionMaker: r.is_decision_maker,
    active30d: r.active_30d,
    active90d: r.active_90d,
    isUk: r.is_uk,
    country: r.country,
    industry: r.industry,
    score: Math.round(Number(r.score) || 0),
  }
}

function normaliseOrg(r) {
  return {
    domain: r.domain,
    orgName: r.org_name,
    people: Number(r.people) || 0,
    downloaders: Number(r.downloaders) || 0,
    opens: Number(r.opens) || 0,
    clicks: Number(r.clicks) || 0,
    decisionMakers: Number(r.decision_makers) || 0,
    active90d: Number(r.active_90d) || 0,
    isUk: r.is_uk,
    score: Math.round(Number(r.score) || 0),
  }
}
