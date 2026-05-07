/**
 * Newsletter audience filtering.
 *
 * Audiences are stored in the `newsletter_audiences` table with a structured
 * `filter_definition` JSON. This helper translates a definition into a
 * Supabase query restricted to active subscribers, plus a paginated fetcher
 * for use during the actual send.
 *
 * Supported filter types (must stay in sync with the count_audience_contacts
 * RPC defined in scripts/migrations/2026-05-07_newsletter_send_ui.sql):
 *   - { type: 'all_active' }
 *   - { type: 'flag', flag: 'flag:proven-sector' }
 *   - { type: 'sector', values: ['Social Housing', ...] }
 *   - { type: 'seniority', values: ['Director', 'VP', ...] }
 *   - { type: 'tag', tag: 'competence-conduct' }
 *   - { type: 'compound', operator: 'AND', filters: [...] }
 */

import { fetchAllPaginated } from './supabase-paginate.js'

function applyFilter(query, filterDef) {
  switch (filterDef.type) {
    case 'all_active':
      return query
    case 'flag':
      return query.contains('flags', [filterDef.flag])
    case 'sector':
      return query.in('apollo_industry', filterDef.values)
    case 'seniority':
      return query.in('apollo_seniority', filterDef.values)
    case 'tag':
      return query.contains('tags', [filterDef.tag])
    case 'compound': {
      // AND — apply each sub-filter sequentially. Compound-of-compound is
      // not supported (no real need yet) and would require a different
      // strategy with the PostgREST builder.
      let q = query
      for (const sub of filterDef.filters || []) {
        q = applyFilter(q, sub)
      }
      return q
    }
    default:
      throw new Error(`Unknown audience filter type: ${filterDef.type}`)
  }
}

/**
 * Build a Supabase query that selects active contacts matching a filter.
 * Caller decides which columns to select via `selectClause`.
 *
 * @param {object} supabase  Supabase client
 * @param {object} filterDef  filter_definition JSON
 * @param {string} selectClause  PostgREST select string
 */
export function buildAudienceQuery(supabase, filterDef, selectClause = 'id, signup_email, first_name, zb_status, zb_verified_at') {
  const base = supabase
    .from('contacts')
    .select(selectClause)
    .eq('newsletter_status', 'active')

  return applyFilter(base, filterDef)
}

/**
 * Fetch every contact matching an audience, paginated to bypass the
 * PostgREST 1,000-row default cap.
 */
export async function fetchAudienceContacts(supabase, filterDef, selectClause) {
  return fetchAllPaginated((from, to) => {
    const q = buildAudienceQuery(supabase, filterDef, selectClause)
    return q.range(from, to)
  })
}

/**
 * Get the count for an audience using the count_audience_contacts RPC.
 * Falls back to a paginated fetch if the RPC fails (e.g. unknown type).
 */
export async function countAudience(supabase, filterDef) {
  const { data, error } = await supabase.rpc('count_audience_contacts', {
    filter_def: filterDef,
  })
  if (error) {
    // Fall back: count via a paginated id-only fetch
    const rows = await fetchAudienceContacts(supabase, filterDef, 'id')
    return rows.length
  }
  return Number(data) || 0
}
