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
      .select('id, sources, tags, first_name, last_name, organisation_name, downloaded_items, download_count, newsletter_status, confirmation_token, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    // 2. Verify email - use cached result if available, otherwise call ZeroBounce
    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // 3. If blocked: return success (silent rejection) but don't create contact or send email
    if (verification.shouldBlock) {
      console.log(`Blocked resource download for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 4. Create or update contact
    let contactId = null
    let shouldSendConfirmation = false

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
        zb_status: verification.status,
      }

      // Double opt-in: only trigger for contacts not already confirmed/active/unsubscribed
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

    // 5. Log a medium-high strength signal
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

    // 6. Fire-and-forget: send confirmation email if needed
    if (shouldSendConfirmation && contactId) {
      sendConfirmationEmail(contactId, firstName, emailNormalised).catch(err => {
        console.error('Failed to send confirmation email:', err)
      })
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
