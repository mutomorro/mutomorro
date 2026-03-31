import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { verifyEmail, getCachedVerification } from '../../../components/email-verification'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { fax_number, _t, ...formData } = await request.json()

    // Honeypot check - bots fill hidden fields, humans don't
    if (fax_number) {
      console.log('[contact] Honeypot triggered, rejecting')
      return Response.json({ success: true }, { status: 200 })
    }

    // Time-based check - reject submissions faster than 3 seconds
    if (_t && (Date.now() - _t) < 3000) {
      console.log('[contact] Timing check failed, rejecting')
      return Response.json({ success: true }, { status: 200 })
    }

    const { name, email, organisation, message, service } = formData
    console.log(`[contact] Processing submission from ${name} <${email}>`)

    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      )
    }

    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null
    const emailNormalised = email.toLowerCase().trim()
    const timestamp = new Date().toISOString()

    // Check if this person already exists (for cached verification)
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)
    console.log(`[contact] Verification result: ${verification.status}, shouldBlock: ${verification.shouldBlock}`)

    // Run notification email, submission storage, and contact upsert independently
    // so one failure doesn't block the others

    // 1. Send notification email to James
    console.log('[contact] Sending notification email to james@mutomorro.com')
    try {
      await resend.emails.send({
        from: 'Mutomorro Website <hello@mutomorro.com>',
        to: 'james@mutomorro.com',
        replyTo: email,
        subject: `New contact form submission from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #221C2B;">New contact form submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600; width: 140px;">Name</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              ${organisation ? `
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Organisation</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${organisation}</td>
              </tr>
              ` : ''}
              ${service ? `
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Service interest</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${service}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Message</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message}</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 0; font-weight: 600;">Submitted</td>
                <td style="padding: 0.75rem 0;">${timestamp}</td>
              </tr>
            </table>
            ${verification.shouldBlock ? `
            <p style="margin-top: 1.5rem; padding: 0.75rem; background: #fff3cd; border-left: 3px solid #ffc107; font-size: 0.85rem;">
              Email verification flagged this address as <strong>${verification.status}</strong>. No contact record was created.
            </p>
            ` : ''}
            <p style="margin-top: 2rem; color: #888; font-size: 0.85rem;">
              Sent from mutomorro.com/contact - reply directly to this email to respond.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('[contact] Notification email FAILED:', emailError)
    }

    // 2. Store submission in contact_submissions table
    console.log('[contact] Storing in contact_submissions')
    try {
      const { error: submissionError } = await supabase
        .from('contact_submissions')
        .insert({
          name,
          email: emailNormalised,
          organisation: organisation || null,
          service: service || null,
          message,
          source_page: '/contact',
        })

      if (submissionError) {
        console.error('[contact] contact_submissions INSERT error:', JSON.stringify(submissionError))
      } else {
        console.log('[contact] contact_submissions stored OK')
      }
    } catch (dbError) {
      console.error('[contact] Supabase storage FAILED:', dbError)
    }

    // 3. Send confirmation email to the submitter (skip if email is blocked)
    if (!verification.shouldBlock) {
      try {
        await resend.emails.send({
          from: 'James from Mutomorro <hello@mutomorro.com>',
          to: emailNormalised,
          subject: 'Thanks for getting in touch',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #221C2B;">
              <p style="font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6;">Thanks for reaching out. I've received your message and will get back to you shortly.</p>
              <p style="font-size: 16px; line-height: 1.6;">James</p>
            </div>
          `,
        })
      } catch (confirmError) {
        console.error('Contact form confirmation email failed:', confirmError)
      }
    }

    // 4. If blocked: skip contact/signal creation but still return success
    if (verification.shouldBlock) {
      console.log(`Blocked contact form for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 5. Upsert contact in Supabase
    try {
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .upsert(
          {
            signup_email: emailNormalised,
            first_name: firstName,
            last_name: lastName,
            organisation_name: organisation || null,
            sources: ['contact-form'],
            first_source: 'contact-form',
            tags: ['inbound-enquiry'],
            zb_status: verification.status,
          },
          {
            onConflict: 'signup_email',
            ignoreDuplicates: false,
          }
        )
        .select('id')
        .single()

      if (contactError) {
        console.error('Supabase contact upsert error:', contactError)
      }

      // 6. Log a high-strength signal
      if (contact?.id) {
        const { error: signalError } = await supabase
          .from('signals')
          .insert({
            contact_id: contact.id,
            type: 'inbound-enquiry',
            detail: service
              ? `[${service}] ${message.substring(0, 500)}`
              : message.substring(0, 500),
            strength: 'high',
          })

        if (signalError) {
          console.error('Supabase signal insert error:', signalError)
        }
      }
    } catch (contactDbError) {
      console.error('Contact form contact/signal storage failed:', contactDbError)
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('[contact] TOP-LEVEL error:', error)
    return Response.json({ success: true })
  }
}
