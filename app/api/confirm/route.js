import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildWelcomeEmail } from '../../../components/emails/welcome-email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FREE_EMAIL_DOMAINS = [
  'gmail', 'yahoo', 'hotmail', 'outlook.com', 'icloud', 'aol', 'live.', 'protonmail',
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return Response.redirect(new URL('/confirm?status=error', request.url))
  }

  // Look up the contact by token
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, signup_email, enriched, needs_enrichment, tags')
    .eq('confirmation_token', token)
    .single()

  if (!contact) {
    return Response.redirect(new URL('/confirm?status=error', request.url))
  }

  // Determine if this is an org email worth enriching
  const emailLower = contact.signup_email.toLowerCase()
  const isFreeEmail = FREE_EMAIL_DOMAINS.some(d => emailLower.includes(d))
  const shouldEnrich = !isFreeEmail && !contact.enriched

  // Update the contact
  const updatedTags = [...new Set([...(contact.tags || []), 'newsletter-confirmed'])]

  const { error: updateError } = await supabase
    .from('contacts')
    .update({
      newsletter_status: 'confirmed',
      newsletter_consent_date: new Date().toISOString(),
      confirmation_token: null,
      tags: updatedTags,
      needs_enrichment: shouldEnrich || contact.needs_enrichment,
    })
    .eq('id', contact.id)

  if (updateError) {
    console.error('Failed to update contact on confirm:', updateError)
    return Response.redirect(new URL('/confirm?status=error', request.url))
  }

  // Fire-and-forget: send welcome email with a short delay
  sendWelcomeEmailDelayed(contact.first_name, contact.signup_email).catch(err => {
    console.error('Failed to send welcome email:', err)
  })

  return Response.redirect(new URL('/confirm?status=success', request.url))
}

async function sendWelcomeEmailDelayed(firstName, email) {
  // 2-minute delay so it feels less automated
  await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000))

  const unsubscribeToken = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
    .update(email)
    .digest('hex')
  const unsubscribeUrl = `https://mutomorro.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`

  const html = buildWelcomeEmail({ firstName, unsubscribeUrl })
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'James Freeman-Gray, Mutomorro <hello@mutomorro.com>',
    to: [email],
    subject: 'Seeing the unseen',
    html,
  })
}
