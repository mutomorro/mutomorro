import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { firstName, lastName, email, organisation, newsletterOptIn, resourceSlug, resourceTitle, resourceType } = await request.json()

    if (!firstName || !lastName || !email || !resourceSlug || !resourceTitle) {
      return Response.json(
        { error: 'First name, last name, email, resource slug and resource title are required' },
        { status: 400 }
      )
    }

    const emailNormalised = email.toLowerCase().trim()

    // 1. Check if this person already exists
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_name, last_name, organisation_name, downloaded_items, download_count, newsletter_status')
      .eq('signup_email', emailNormalised)
      .single()

    let contactId = null

    if (existing) {
      // Merge sources, tags, and downloaded_items
      const mergedSources = [...new Set([...(existing.sources || []), 'resource-download'])]
      const mergedTags = [...new Set([...(existing.tags || []), 'resource-download'])]
      const mergedDownloads = [...new Set([...(existing.downloaded_items || []), resourceTitle])]

      const updates = {
        first_name: existing.first_name || firstName,
        last_name: existing.last_name || lastName,
        organisation_name: existing.organisation_name || organisation || null,
        sources: mergedSources,
        tags: mergedTags,
        downloaded_items: mergedDownloads,
        download_count: mergedDownloads.length,
        last_download_date: new Date().toISOString(),
      }

      // If they opted in and aren't already active or unsubscribed, set to active
      if (newsletterOptIn && existing.newsletter_status !== 'active' && existing.newsletter_status !== 'unsubscribed') {
        updates.newsletter_status = 'active'
        updates.newsletter_consent_date = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Supabase contact update error:', updateError)
      }
      contactId = existing.id

    } else {
      // New person
      const newContact = {
        signup_email: emailNormalised,
        first_name: firstName,
        last_name: lastName,
        organisation_name: organisation || null,
        sources: ['resource-download'],
        first_source: 'resource-download',
        tags: ['resource-download'],
        downloaded_items: [resourceTitle],
        download_count: 1,
        last_download_date: new Date().toISOString(),
        tier: 'Tier 2',
      }

      if (newsletterOptIn) {
        newContact.newsletter_status = 'active'
        newContact.newsletter_consent_date = new Date().toISOString()
      }

      const { data: created, error: insertError } = await supabase
        .from('contacts')
        .insert(newContact)
        .select('id')
        .single()

      if (insertError) {
        console.error('Supabase contact insert error:', insertError)
      }
      contactId = created?.id
    }

    // 2. Log a medium-high strength signal
    if (contactId) {
      const signalDetail = resourceType
        ? `${resourceType}: ${resourceTitle}`
        : resourceTitle

      const { error: signalError } = await supabase
        .from('signals')
        .insert({
          contact_id: contactId,
          type: 'resource-download',
          detail: signalDetail,
          strength: 'high',
        })

      if (signalError) {
        console.error('Supabase signal insert error:', signalError)
      }
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Resource download error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}
