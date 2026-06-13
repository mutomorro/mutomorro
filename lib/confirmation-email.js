import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import { buildConfirmationEmail } from '@/components/emails/confirmation-email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FROM = 'Mutomorro <hello@mutomorro.com>'

/**
 * Send the double opt-in confirmation email for a contact and record the Resend
 * message id + status on the contact row, so the Resend webhook can later
 * reconcile delivery / bounce / complaint events against it.
 *
 * Shared by the newsletter, tool-download and resource-download signup routes
 * and the reminder cron — previously each had its own copy that ignored the
 * Resend response, so a rejected send vanished and the contact sat in
 * pending_confirmation forever.
 *
 * Throws if Resend rejects the send (after recording 'send_failed'), so the
 * caller's existing try/catch logs it.
 *
 * @param {object} args
 * @param {string} args.contactId
 * @param {string} [args.firstName]
 * @param {string} args.email
 * @param {string} [args.subject]  Override for the reminder send.
 * @returns {Promise<string|undefined>} the Resend message id, if sent
 */
export async function sendConfirmationEmail({
  contactId,
  firstName,
  email,
  subject = 'Confirm your email address',
}) {
  const { data: contact } = await supabase
    .from('contacts')
    .select('confirmation_token')
    .eq('id', contactId)
    .single()

  if (!contact?.confirmation_token) return

  const confirmUrl = `https://mutomorro.com/api/confirm?token=${contact.confirmation_token}`
  const html = buildConfirmationEmail({ firstName, confirmUrl })
  const now = new Date().toISOString()

  let id
  try {
    const data = await sendEmail({ from: FROM, to: [email], subject, html })
    id = data?.id
  } catch (err) {
    // Record the failure so it's visible, then rethrow for the caller to log.
    await supabase
      .from('contacts')
      .update({ confirmation_email_status: 'send_failed', confirmation_email_sent_at: now })
      .eq('id', contactId)
    throw err
  }

  await supabase
    .from('contacts')
    .update({
      confirmation_email_id: id,
      confirmation_email_status: 'sent',
      confirmation_email_sent_at: now,
    })
    .eq('id', contactId)

  return id
}
