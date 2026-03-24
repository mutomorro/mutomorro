import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { company_website, _t, ...formData } = await request.json()

    // Honeypot check - bots fill hidden fields, humans don't
    if (company_website) {
      return Response.json({ success: true }, { status: 200 })
    }

    // Time-based check - reject submissions faster than 3 seconds
    if (_t && (Date.now() - _t) < 3000) {
      return Response.json({ success: true }, { status: 200 })
    }

    const { firstName, lastName, email, toolTitle, toolSlug, newsletterOptIn } = formData

    if (!firstName || !email) {
      return Response.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const emailNormalised = email.toLowerCase().trim()

    // 1. Check if this person already exists
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_name, last_name, downloaded_items, download_count, newsletter_status')
      .eq('signup_email', emailNormalised)
      .single()

    let contactId = null

    if (existing) {
      // Merge sources, tags, and downloaded_items
      const mergedSources = [...new Set([...(existing.sources || []), 'template-download'])]
      const mergedTags = [...new Set([...(existing.tags || []), 'template-download'])]
      const mergedDownloads = [...new Set([...(existing.downloaded_items || []), toolTitle])]

      const updates = {
        first_name: existing.first_name || firstName,
        last_name: existing.last_name || lastName,
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
        last_name: lastName || null,
        sources: ['template-download'],
        first_source: 'template-download',
        tags: ['template-download'],
        downloaded_items: [toolTitle],
        download_count: 1,
        last_download_date: new Date().toISOString(),
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

    // 2. Log a medium-strength signal
    if (contactId) {
      const { error: signalError } = await supabase
        .from('signals')
        .insert({
          contact_id: contactId,
          type: 'template-download',
          detail: toolTitle,
          strength: 'medium',
        })

      if (signalError) {
        console.error('Supabase signal insert error:', signalError)
      }
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Tool download error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}