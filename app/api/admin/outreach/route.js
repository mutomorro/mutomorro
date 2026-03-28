import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSequences, getOutreachEmails } from '../../../../lib/apollo'

export async function GET(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Check Apollo key exists
  if (!process.env.APOLLO_API_KEY) {
    return NextResponse.json({
      error: null,
      noKey: true,
      sequences: [],
      recentReplies: [],
      crossovers: [],
    })
  }

  let sequences = []
  let recentReplies = []
  let crossovers = []
  let apolloError = null

  // Fetch Apollo data - wrapped in try/catch
  try {
    const [seqResult, repliesResult, recentEmailsResult] = await Promise.all([
      getSequences().catch(() => []),
      getOutreachEmails({ status: 'replied', per_page: 10 }).catch(() => ({ emails: [] })),
      getOutreachEmails({ per_page: 100 }).catch(() => ({ emails: [] })),
    ])

    // Process sequences
    sequences = seqResult.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.active ? 'active' : (s.archived ? 'archived' : 'paused'),
      contacts_count: s.unique_scheduled || s.contacts_count || 0,
      emails_sent: s.unique_delivered || 0,
      replies: s.unique_replied || 0,
      bounces: s.unique_bounced || 0,
      last_used: s.last_used_at || s.updated_at,
    }))

    // Build sequence ID-to-name map for reply enrichment
    const seqNameMap = {}
    seqResult.forEach((s) => { seqNameMap[s.id] = s.name })

    // Process recent replies - enrich with sequence names and contact lookup
    const replyEmails = repliesResult.emails.map((e) => {
      const contactName = e.contact?.name || e.contact?.first_name
        || [e.contact?.first_name, e.contact?.last_name].filter(Boolean).join(' ')
        || null
      const email = e.contact?.email || e.email_address || ''
      const seqName = e.emailer_campaign?.name || seqNameMap[e.emailer_campaign_id] || null

      return { contactName, email, seqName, replied_at: e.last_activity_date || e.updated_at }
    })

    // Cross-reference unknown replies against Supabase contacts
    const unknownEmails = replyEmails
      .filter((r) => !r.contactName && r.email)
      .map((r) => r.email.toLowerCase())

    let supabaseContactMap = {}
    if (unknownEmails.length > 0) {
      const { data: matchedContacts } = await supabase
        .from('contacts')
        .select('first_name, last_name, signup_email')
        .in('signup_email', unknownEmails)
      if (matchedContacts) {
        matchedContacts.forEach((c) => {
          supabaseContactMap[c.signup_email?.toLowerCase()] =
            [c.first_name, c.last_name].filter(Boolean).join(' ')
        })
      }
    }

    recentReplies = replyEmails.map((r) => ({
      contact_name: r.contactName || supabaseContactMap[r.email?.toLowerCase()] || r.email || 'Unknown',
      email: r.email,
      sequence_name: r.seqName || 'Unknown sequence',
      replied_at: r.replied_at,
    }))

    // Crossover detection - match Apollo emails against Supabase contacts
    const apolloEmails = recentEmailsResult.emails
      .map((e) => e.contact?.email || e.email_address)
      .filter(Boolean)

    if (apolloEmails.length > 0) {
      // Extract unique domains
      const domains = [...new Set(apolloEmails.map((e) => e.split('@')[1]).filter(Boolean))]

      // Build email-to-sequence map
      const emailSeqMap = {}
      recentEmailsResult.emails.forEach((e) => {
        const email = e.contact?.email || e.email_address
        if (email) {
          emailSeqMap[email.toLowerCase()] = e.emailer_campaign?.name || 'Unknown'
        }
      })

      // Query Supabase for matching contacts (exact email or domain match)
      // Using individual queries since Supabase doesn't support SPLIT_PART easily
      const { data: exactMatches } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, signup_email, organisation_name, sources, downloaded_items, first_source')
        .in('signup_email', apolloEmails.map((e) => e.toLowerCase()))

      // Domain matches - check contacts from matching orgs
      // Only check non-free email domains
      const freeDomains = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'])
      const corpDomains = domains.filter((d) => !freeDomains.has(d.toLowerCase()))

      let domainMatches = []
      if (corpDomains.length > 0) {
        // Check for domain matches in batches
        const { data: domainContacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, signup_email, organisation_name, sources, downloaded_items, first_source')
          .not('signup_email', 'is', null)

        if (domainContacts) {
          domainMatches = domainContacts.filter((c) => {
            if (!c.signup_email) return false
            const contactDomain = c.signup_email.split('@')[1]?.toLowerCase()
            return corpDomains.includes(contactDomain)
          })
        }
      }

      // Combine and deduplicate
      const allMatches = [...(exactMatches || []), ...domainMatches]
      const seen = new Set()
      const uniqueMatches = allMatches.filter((c) => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })

      crossovers = uniqueMatches.map((c) => {
        const contactDomain = c.signup_email?.split('@')[1]?.toLowerCase()
        const matchingApolloEmail = apolloEmails.find((e) =>
          e.toLowerCase() === c.signup_email?.toLowerCase() ||
          e.split('@')[1]?.toLowerCase() === contactDomain
        )

        const downloads = c.downloaded_items?.length || 0
        const signal = c.signup_email?.toLowerCase() === matchingApolloEmail?.toLowerCase()
          ? `Exact email match - ${c.first_source || 'engaged on website'}`
          : `Same domain (${contactDomain}) - ${downloads > 0 ? `downloaded ${downloads} tool${downloads > 1 ? 's' : ''}` : c.first_source || 'website contact'}`

        return {
          apollo_email: matchingApolloEmail || '',
          sequence_name: emailSeqMap[matchingApolloEmail?.toLowerCase()] || 'Unknown',
          supabase_contact: {
            id: c.id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.signup_email,
            email: c.signup_email,
            organisation: c.organisation_name,
            downloads: c.downloaded_items || [],
            source: c.first_source,
          },
          signal,
        }
      })
    }
  } catch (err) {
    console.error('Apollo API error:', err.message)
    apolloError = err.message
  }

  return NextResponse.json({
    sequences,
    recentReplies,
    crossovers,
    apolloError,
  })
}
