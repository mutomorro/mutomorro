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
      supabase.from('contact_honeypot_log').insert({
        name: formData.name || null,
        email: formData.email || null,
        honeypot_value: fax_number,
      }).then() // fire-and-forget
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

    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null
    const emailNormalised = email.toLowerCase().trim()
    const timestamp = new Date().toISOString()

    // Check if this person already exists (for cached verification)
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_source, first_name, last_name, organisation_name, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // Run notification email, submission storage, and contact upsert independently
    // so one failure doesn't block the others

    // 1. Send notification email to James
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
      console.error('Contact form notification email failed:', emailError)
    }

    // 2. Store submission in contact_submissions table
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
        console.error('Supabase contact_submissions insert error:', submissionError)
      }
    } catch (dbError) {
      console.error('Contact form Supabase storage failed:', dbError)
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
              <p style="font-size: 16px; line-height: 1.6;">Thanks for getting in touch. We've received your message and will get back to you shortly.</p>
              <p style="font-size: 16px; line-height: 1.6;">Best wishes,<br/>Mutomorro</p>
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

    // 5. Create or update contact in Supabase
    try {
      let contactId = null

      if (existing) {
        // Merge sources and tags - don't overwrite
        const mergedSources = [...new Set([...(existing.sources || []), 'contact-form'])]
        const mergedTags = [...new Set([...(existing.tags || []), 'inbound-enquiry'])]

        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            first_name: existing.first_name || firstName,
            last_name: existing.last_name || lastName,
            organisation_name: existing.organisation_name || organisation || null,
            sources: mergedSources,
            tags: mergedTags,
            zb_status: verification.status,
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error('Supabase contact update error:', updateError)
        }
        contactId = existing.id

      } else {
        // New contact
        const { data: created, error: insertError } = await supabase
          .from('contacts')
          .insert({
            signup_email: emailNormalised,
            first_name: firstName,
            last_name: lastName,
            organisation_name: organisation || null,
            sources: ['contact-form'],
            first_source: 'contact-form',
            tags: ['inbound-enquiry'],
            zb_status: verification.status,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Supabase contact insert error:', insertError)
        }
        contactId = created?.id
      }

      // 6. Log a high-strength signal
      if (contactId) {
        const { error: signalError } = await supabase
          .from('signals')
          .insert({
            contact_id: contactId,
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
    console.error('Contact form error:', error)
    return Response.json({ success: true })
  }
}
