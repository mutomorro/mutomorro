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

    const { firstName, email } = formData

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailNormalised = email.toLowerCase().trim()

    // Check if this person already exists
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_name, newsletter_status')
      .eq('signup_email', emailNormalised)
      .single()

    if (existing) {
      // Don't override if they've previously unsubscribed
      if (existing.newsletter_status === 'unsubscribed') {
        return Response.json({ success: true, alreadyUnsubscribed: true })
      }

      // Merge sources and tags
      const mergedSources = [...new Set([...(existing.sources || []), 'newsletter-signup'])]
      const mergedTags = [...new Set([...(existing.tags || []), 'newsletter-signup'])]

      const updates = {
        first_name: existing.first_name || firstName || null,
        sources: mergedSources,
        tags: mergedTags,
        newsletter_status: 'active',
        newsletter_consent_date: existing.newsletter_status === 'active'
          ? undefined  // don't overwrite existing consent date
          : new Date().toISOString(),
      }

      // Remove undefined keys
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Supabase contact update error:', updateError)
      }

    } else {
      // New person
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          signup_email: emailNormalised,
          first_name: firstName || null,
          sources: ['newsletter-signup'],
          first_source: 'newsletter-signup',
          tags: ['newsletter-signup'],
          newsletter_status: 'active',
          newsletter_consent_date: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Supabase contact insert error:', insertError)
      }
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Newsletter signup error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}