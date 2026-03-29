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
      .select('id, sources, tags, first_name, newsletter_status, confirmation_token, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    // Verify email - use cached result if available, otherwise call ZeroBounce
    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // If blocked: return success (silent rejection) but don't create contact or send email
    if (verification.shouldBlock) {
      console.log(`Blocked newsletter signup for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    let contactId = null
    let shouldSendConfirmation = false

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
        zb_status: verification.status,
      }

      // Double opt-in: only trigger for contacts not already confirmed/active/unsubscribed
      if (!['confirmed', 'active', 'unsubscribed'].includes(existing.newsletter_status)) {
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
      const token = crypto.randomUUID()
      const newContact = {
        signup_email: emailNormalised,
        first_name: firstName || null,
        sources: ['newsletter-signup'],
        first_source: 'newsletter-signup',
        tags: ['newsletter-signup'],
        confirmation_token: token,
        confirmation_token_created_at: new Date().toISOString(),
        newsletter_status: 'pending_confirmation',
        zb_status: verification.status,
      }
      shouldSendConfirmation = true

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

    // Fire-and-forget: send confirmation email if needed
    if (shouldSendConfirmation && contactId) {
      sendConfirmationEmail(contactId, firstName, emailNormalised).catch(err => {
        console.error('Failed to send confirmation email:', err)
      })
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
