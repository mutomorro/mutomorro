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
    const { company_website, _t, ...formData } = await request.json()

    // Honeypot check - bots fill hidden fields, humans don't
    if (company_website) {
      return Response.json({ success: true }, { status: 200 })
    }

    // Time-based check - reject submissions faster than 3 seconds
    if (_t && (Date.now() - _t) < 3000) {
      return Response.json({ success: true }, { status: 200 })
    }

    const { name, email, organisation, message, service } = formData

    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      )
    }

    // Split name into first/last for Supabase
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    const emailNormalised = email.toLowerCase().trim()

    // Check if this person already exists (for cached verification)
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    // Verify email - use cached result if available, otherwise call ZeroBounce
    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // 1. Always send the internal notification email (goes to hello@mutomorro.com, no bounce risk)
    await resend.emails.send({
      from: 'Mutomorro Website <hello@mutomorro.com>',
      to: 'hello@mutomorro.com',
      replyTo: email,
      subject: service ? `New enquiry from ${name} - ${service}` : `New enquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #221C2B;">New enquiry from the Mutomorro website</h2>
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
              <td style="padding: 0.75rem 0; font-weight: 600; vertical-align: top;">Message</td>
              <td style="padding: 0.75rem 0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          ${verification.shouldBlock ? `
          <p style="margin-top: 1.5rem; padding: 0.75rem; background: #fff3cd; border-left: 3px solid #ffc107; font-size: 0.85rem;">
            ⚠️ Email verification flagged this address as <strong>${verification.status}</strong>. No contact record was created.
          </p>
          ` : ''}
          <p style="margin-top: 2rem; color: #888; font-size: 0.85rem;">
            Sent from mutomorro.com/contact - reply directly to this email to respond.
          </p>
        </div>
      `,
    })

    // 2. If blocked: skip contact creation but still return success
    if (verification.shouldBlock) {
      console.log(`Blocked contact form for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 3. Upsert contact in Supabase
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

    // 4. Log a high-strength signal
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

    return Response.json({ success: true })

  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}
