/**
 * Newsletter confirmation reminder cron job
 *
 * Runs daily. Sends a single reminder to contacts who haven't confirmed
 * after 7 days. Only sends once per contact.
 *
 * Schedule configured in vercel.json.
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildConfirmationEmail } from '../../../../components/emails/confirmation-email'
import { fetchAllPaginated } from '../../../../lib/supabase-paginate.js'

export const maxDuration = 60

export async function GET(request) {
  // Verify legitimate cron call
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Find contacts needing a reminder: pending > 7 days, not yet reminded
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    let contacts
    try {
      contacts = await fetchAllPaginated((from, to) => supabase
        .from('contacts')
        .select('id, first_name, signup_email, confirmation_token')
        .eq('newsletter_status', 'pending_confirmation')
        .lt('confirmation_token_created_at', sevenDaysAgo)
        .eq('confirmation_reminder_sent', false)
        .not('confirmation_token', 'is', null)
        .range(from, to)
      )
    } catch (queryError) {
      console.error('Reminder query error:', queryError)
      return Response.json({ error: 'Query failed' }, { status: 500 })
    }

    if (contacts.length === 0) {
      return Response.json({ reminded: 0 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    let reminded = 0

    for (const contact of contacts) {
      try {
        const confirmUrl = `https://mutomorro.com/api/confirm?token=${contact.confirmation_token}`
        const html = buildConfirmationEmail({
          firstName: contact.first_name,
          confirmUrl,
        })

        await resend.emails.send({
          from: 'Mutomorro <hello@mutomorro.com>',
          to: [contact.signup_email],
          subject: 'Still interested? Confirm your email',
          html,
        })

        await supabase
          .from('contacts')
          .update({ confirmation_reminder_sent: true })
          .eq('id', contact.id)

        reminded++
      } catch (err) {
        console.error(`Reminder failed for contact ${contact.id}:`, err)
      }
    }

    return Response.json({ reminded, total: contacts.length })

  } catch (error) {
    console.error('Newsletter reminder cron error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
