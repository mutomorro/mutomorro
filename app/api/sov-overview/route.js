import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildConfirmationEmail } from '../../../components/emails/confirmation-email'
import { verifyEmail, getCachedVerification } from '../../../components/email-verification'
import { isPersonalEmail, PERSONAL_EMAIL_ERROR } from '../../../lib/personal-email-domains'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const RESOURCE_TITLE = 'States of Vitality - Overview'
const RESOURCE_SLUG = 'states-of-vitality-overview'

export async function POST(request) {
  try {
    const { fax_number, _t, ...formData } = await request.json()

    // Honeypot check
    if (fax_number) {
      return Response.json({ success: true }, { status: 200 })
    }
    // Time-based check - reject submissions faster than 3 seconds
    if (_t && (Date.now() - _t) < 3000) {
      return Response.json({ success: true }, { status: 200 })
    }

    const { name, email, organisation, newsletterOptIn } = formData

    if (!name || !email || !organisation) {
      return Response.json(
        { error: 'Name, work email and organisation are required' },
        { status: 400 }
      )
    }

    const emailNormalised = email.toLowerCase().trim()

    if (isPersonalEmail(emailNormalised)) {
      return Response.json({ error: PERSONAL_EMAIL_ERROR }, { status: 400 })
    }

    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    // 1. Check if this person already exists
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_name, last_name, organisation_name, downloaded_items, download_count, newsletter_status, confirmation_token, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    // 2. Verify email
    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // 3. If blocked: silent success, no contact, no email
    if (verification.shouldBlock) {
      console.log(`Blocked SoV overview for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 4. Create or update contact
    let contactId = null
    let shouldSendConfirmation = false

    if (existing) {
      const mergedSources = [...new Set([...(existing.sources || []), 'sov-overview'])]
      const mergedTags = [...new Set([...(existing.tags || []), 'sov-overview'])]
      const mergedDownloads = [...new Set([...(existing.downloaded_items || []), RESOURCE_TITLE])]

      const updates = {
        first_name: existing.first_name || firstName,
        last_name: existing.last_name || lastName,
        organisation_name: existing.organisation_name || organisation,
        sources: mergedSources,
        tags: mergedTags,
        downloaded_items: mergedDownloads,
        download_count: mergedDownloads.length,
        last_download_date: new Date().toISOString(),
        zb_status: verification.status,
      }

      if (newsletterOptIn && !['confirmed', 'active', 'unsubscribed'].includes(existing.newsletter_status)) {
        if (!existing.confirmation_token) {
          const token = crypto.randomUUID()
          updates.confirmation_token = token
          updates.confirmation_token_created_at = new Date().toISOString()
          updates.newsletter_status = 'pending_confirmation'
          updates.confirmation_reminder_sent = false
          shouldSendConfirmation = true
        }
      }

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', existing.id)

      if (updateError) console.error('Supabase contact update error:', updateError)
      contactId = existing.id

    } else {
      const newContact = {
        signup_email: emailNormalised,
        first_name: firstName,
        last_name: lastName,
        organisation_name: organisation,
        sources: ['sov-overview'],
        first_source: 'sov-overview',
        tags: ['sov-overview'],
        downloaded_items: [RESOURCE_TITLE],
        download_count: 1,
        last_download_date: new Date().toISOString(),
        tier: 'Tier 2',
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

      if (insertError) console.error('Supabase contact insert error:', insertError)
      contactId = created?.id
    }

    // 5. Log a high-strength signal
    if (contactId) {
      const { error: signalError } = await supabase
        .from('signals')
        .insert({
          contact_id: contactId,
          type: 'sov-overview-download',
          detail: RESOURCE_TITLE,
          strength: 'high',
        })
      if (signalError) console.error('Supabase signal insert error:', signalError)
    }

    // 6. Fire-and-forget confirmation email
    if (shouldSendConfirmation && contactId) {
      sendConfirmationEmail(contactId, firstName, emailNormalised).catch(err => {
        console.error('Failed to send confirmation email:', err)
      })
    }

    return Response.json({ success: true, slug: RESOURCE_SLUG })

  } catch (error) {
    console.error('SoV overview error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail(contactId, firstName, email) {
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
