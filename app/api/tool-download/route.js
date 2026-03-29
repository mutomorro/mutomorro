import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildConfirmationEmail } from '../../../components/emails/confirmation-email'
import { verifyEmail, getCachedVerification } from '../../../components/email-verification'

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
      .select('id, sources, tags, first_name, last_name, downloaded_items, download_count, newsletter_status, confirmation_token, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    // 2. Verify email - use cached result if available, otherwise call ZeroBounce
    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // 3. If blocked: return success (silent rejection) but don't create contact or send email
    if (verification.shouldBlock) {
      console.log(`Blocked tool download for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 4. Create or update contact
    let contactId = null
    let shouldSendConfirmation = false

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
        zb_status: verification.status,
      }

      // Double opt-in: only trigger for contacts not already confirmed/active/unsubscribed
      if (newsletterOptIn && !['confirmed', 'active', 'unsubscribed'].includes(existing.newsletter_status)) {
        // Only generate a new token if they don't already have one (pending_confirmation)
        if (!existing.confirmation_token) {
          const token = crypto.randomUUID()
          updates.confirmation_token = token
          updates.confirmation_token_created_at = new Date().toISOString()
          updates.newsletter_status = 'pending_confirmation'
          updates.confirmation_reminder_sent = false
          shouldSendConfirmation = true
        }
        // If they already have a token (pending_confirmation), don't regenerate
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
        zb_status: verification.status,
      }

      if (newsletterOptIn) {
        const token = crypto.randomUUID()
        newContact.confirmation_token = token
        newContact.confirmation_token_created_at = new Date().toISOString()
        newContact.newsletter_status = 'pending_confirmation'
        shouldSendConfirmation = true
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

    // 5. Log a medium-strength signal
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

    // 6. Fire-and-forget: send confirmation email if needed
    if (shouldSendConfirmation && contactId) {
      sendConfirmationEmail(contactId, firstName, emailNormalised).catch(err => {
        console.error('Failed to send confirmation email:', err)
      })
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

async function sendConfirmationEmail(contactId, firstName, email) {
  // Fetch the token we just wrote
  const { data: contact } = await supabase
    .from('contacts')
    .select('confirmation_token')
    .eq('id', contactId)
    .single()

  if (!contact?.confirmation_token) return

  const confirmUrl = `https://mutomorro.com/api/confirm?token=${contact.confirmation_token}`
  const html = buildConfirmationEmail({ firstName, confirmUrl })

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Mutomorro <hello@mutomorro.com>',
    to: [email],
    subject: 'Confirm your email address',
    html,
  })
}
