/**
 * Newsletter audience filtering.
 *
 * Audiences are stored in the `newsletter_audiences` table with a structured
 * `filter_definition` JSON. This helper translates a definition into a
 * Supabase query restricted to subscribed contacts (newsletter_status
 * 'active' or 'confirmed'), plus a paginated fetcher for use during the send.
 *
 * Column mapping (must stay in sync with the count_audience_contacts RPC):
 *   - flags        → contacts.tags (flags are stored as tag values like "flag:proven-sector")
 *   - sector       → contacts.industry
 *   - seniority    → contacts.seniority
 *
 * Supported filter types:
 *   - { type: 'all_active' }
 *   - { type: 'flag', flag: 'flag:proven-sector' }       // matches contacts.tags
 *   - { type: 'sector', values: ['Social Housing', ...] } // matches contacts.industry
 *   - { type: 'seniority', values: ['Director', 'VP', ...] } // matches contacts.seniority
 *   - { type: 'tag', tag: 'sector:housing' }             // matches contacts.tags
 *   - { type: 'compound', operator: 'AND', filters: [...] }
 */

import { fetchAllPaginated } from './supabase-paginate.js'

function applyFilter(query, filterDef) {
  switch (filterDef.type) {
    case 'all_active':
      return query
    case 'flag':
      // Flags are stored as values inside the `tags` array column.
      return query.contains('tags', [filterDef.flag])
    case 'sector':
      return query.in('industry', filterDef.values)
    case 'seniority':
      return query.in('seniority', filterDef.values)
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
 * Build a Supabase query that selects subscribed contacts matching a filter.
 * Subscribed means newsletter_status 'active' (legacy) or 'confirmed'
 * (double opt-in) — both are deliverable, mirroring the rest of the codebase.
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
    .in('newsletter_status', ['active', 'confirmed'])

  return applyFilter(base, filterDef)
}

/**
 * Fetch every contact matching an audience, paginated to bypass the
 * PostgREST 1,000-row default cap.
 */
export async function fetchAudienceContacts(supabase, filterDef, selectClause) {
  return fetchAllPaginated((from, to) => {
    const q = buildAudienceQuery(supabase, filterDef, selectClause)
    // A stable, unique sort key is REQUIRED for paginated fetches. Without an
    // explicit ORDER BY, Postgres makes no ordering guarantee between separate
    // range requests, so rows near a page boundary can be returned twice (a
    // duplicate contact then trips the newsletter_recipients (send_id,
    // contact_id) unique constraint and aborts the send) or skipped entirely
    // (silent under-delivery). Ordering by the primary key fixes both.
    return q.order('id', { ascending: true }).range(from, to)
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
