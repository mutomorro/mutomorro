// Apollo people enrichment — fills company / title / seniority on contacts.
// Used by the in-admin "Enrich" button (app/api/admin/contacts/enrich) and the
// backfill script (scripts/enrich-missing-orgs.mjs). Costs 1 Apollo credit per
// MATCHED person (0 for no-match) — always gate behind an explicit action.

const APOLLO_BASE = 'https://api.apollo.io'

// Multi-label public suffixes (so subsidiary.nhs.uk -> nhs.uk, not subsidiary.nhs).
const MULTI_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'nhs.uk', 'sch.uk', 'me.uk', 'net.uk', 'ltd.uk', 'plc.uk',
  'com.au', 'net.au', 'org.au', 'gov.au', 'edu.au', 'asn.au', 'co.nz', 'org.nz', 'govt.nz', 'ac.nz',
  'com.br', 'com.sg', 'com.hk', 'co.za', 'co.in', 'co.jp',
])

// The registrable ("organisation") part of a domain, e.g. supplychain.nhs.uk -> nhs.uk.
export function registrableDomain(domain) {
  if (!domain) return ''
  const d = String(domain).toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  const parts = d.split('.').filter(Boolean)
  if (parts.length <= 2) return d
  const last2 = parts.slice(-2).join('.')
  return MULTI_LABEL_SUFFIXES.has(last2) ? parts.slice(-3).join('.') : last2
}

function orgDomain(org) {
  if (!org) return null
  const raw = org.primary_domain || org.website_url || null
  if (!raw) return null
  return String(raw).toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
}

// Apollo's seniority enum (owner/founder/c_suite/partner/vp/head/director/manager/
// senior/entry/intern) maps 1:1 to our contacts.seniority vocabulary.
export function mapApolloPerson(m) {
  if (!m) return null
  const org = m.organization || m.account || null
  const location = [m.city, m.state].filter(Boolean).join(', ') || null
  return {
    organisation_name: org?.name || null,
    org_domain: orgDomain(org),
    role: m.title || null,
    seniority: m.seniority || null,
    industry: org?.industry || null,
    linkedin_url: m.linkedin_url || null,
    location,
    country: m.country || null,
    apollo_contact_id: m.id || null,
  }
}

// We only enrich WORK-email contacts, so the email domain is the ground truth for
// where someone actually is. Apollo's profile employer can be stale/wrong (e.g. a
// Rolls-Royce record returned for an @nhs.uk email). Trust the match only if
// Apollo's company domain agrees with the email domain. If Apollo gives no domain
// (independents/small orgs) we can't disprove it, so we accept.
export function matchIsTrustworthy(contactEmail, mapped) {
  if (!mapped) return false
  if (!mapped.org_domain) return true
  const emailDomain = (contactEmail || '').split('@')[1] || ''
  return registrableDomain(emailDomain) === registrableDomain(mapped.org_domain)
}

// Build a Supabase update object — only set fields Apollo actually returned, so we
// never wipe existing data with nulls. Always stamps the enrichment metadata.
export function buildEnrichUpdate(mapped, nowIso) {
  const u = {
    enriched: true,
    enrichment_source: 'apollo',
    enrichment_date: nowIso || new Date().toISOString(),
    needs_enrichment: false,
  }
  if (!mapped) return u
  for (const k of ['organisation_name', 'role', 'seniority', 'industry', 'linkedin_url', 'location', 'country', 'apollo_contact_id']) {
    if (mapped[k]) u[k] = mapped[k]
  }
  return u
}

// A mapped person is "useful" if Apollo gave us at least a company or a title.
export function isUsefulMatch(mapped) {
  return !!(mapped && (mapped.organisation_name || mapped.role || mapped.seniority))
}

// Match up to 10 emails per Apollo call. Returns Map<lowerEmail, mappedFields|null>.
// Resilient: a failed batch records nulls and continues rather than throwing.
export async function bulkMatchByEmail(emails, apiKey) {
  const key = apiKey || process.env.APOLLO_API_KEY
  const result = new Map()
  const clean = [...new Set((emails || []).map((e) => (e || '').trim().toLowerCase()).filter((e) => e.includes('@')))]

  for (let i = 0; i < clean.length; i += 10) {
    const batch = clean.slice(i, i + 10)
    try {
      const res = await fetch(`${APOLLO_BASE}/v1/people/bulk_match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': key },
        // email stays the primary key; domain is a hint that lifts the match rate
        // on ambiguous addresses without risking a wrong-person fallback.
        body: JSON.stringify({
          details: batch.map((email) => ({ email, domain: email.split('@')[1] })),
          reveal_personal_emails: false,
        }),
      })
      if (!res.ok) {
        for (const e of batch) result.set(e, null)
        continue
      }
      const data = await res.json()
      const matches = Array.isArray(data.matches) ? data.matches : []
      // Apollo preserves request order and returns null for no-match.
      batch.forEach((email, idx) => {
        const m = matches[idx]
        result.set(email, m ? mapApolloPerson(m) : null)
      })
    } catch {
      for (const e of batch) result.set(e, null)
    }
  }
  return result
}
