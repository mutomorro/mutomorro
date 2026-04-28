import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { verifyEmail, getCachedVerification } from '../../../components/email-verification'
import { isPersonalEmail, PERSONAL_EMAIL_ERROR } from '../../../lib/personal-email-domains'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const NOTIFY_TO = 'hello@statesofvitality.com'

export async function POST(request) {
  try {
    const { fax_number, _t, ...formData } = await request.json()

    // Honeypot
    if (fax_number) {
      return Response.json({ success: true }, { status: 200 })
    }
    // Time-based check
    if (_t && (Date.now() - _t) < 3000) {
      return Response.json({ success: true }, { status: 200 })
    }

    const { name, email, organisation, employees, message } = formData

    if (!name || !email || !organisation || !employees) {
      return Response.json(
        { error: 'Name, work email, organisation and number of employees are required' },
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
    const timestamp = new Date().toISOString()

    const { data: existing } = await supabase
      .from('contacts')
      .select('id, sources, tags, first_name, last_name, organisation_name, zb_status')
      .eq('signup_email', emailNormalised)
      .single()

    const verification = getCachedVerification(existing) || await verifyEmail(emailNormalised)

    // 1. Notification email to SoV inbox
    try {
      await resend.emails.send({
        from: 'States of Vitality <hello@mutomorro.com>',
        to: NOTIFY_TO,
        replyTo: emailNormalised,
        subject: `New SoV quote request from ${name} (${organisation})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #221C2B;">New States of Vitality quote request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600; width: 160px;">Name</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${escapeHtml(email)}</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Organisation</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${escapeHtml(organisation)}</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Approx. employees</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${escapeHtml(employees)}</td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Message</td>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${escapeHtml(message)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 0.75rem 0; font-weight: 600;">Submitted</td>
                <td style="padding: 0.75rem 0;">${timestamp}</td>
              </tr>
            </table>
            ${verification.shouldBlock ? `
            <p style="margin-top: 1.5rem; padding: 0.75rem; background: #fff3cd; border-left: 3px solid #ffc107; font-size: 0.85rem;">
              Email verification flagged this address as <strong>${escapeHtml(verification.status)}</strong>. No contact record was created.
            </p>
            ` : ''}
            <p style="margin-top: 2rem; color: #888; font-size: 0.85rem;">
              Sent from mutomorro.com/states-of-vitality - reply directly to this email to respond to ${escapeHtml(email)}.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('SoV quote notification email failed:', emailError)
    }

    // 2. Store in contact_submissions for an audit trail
    try {
      const submissionMessage = [
        `Approx. employees: ${employees}`,
        message ? `\n\n${message}` : '',
      ].join('').trim()

      const { error: submissionError } = await supabase
        .from('contact_submissions')
        .insert({
          name,
          email: emailNormalised,
          organisation,
          service: 'States of Vitality - Quote Request',
          message: submissionMessage,
          source_page: '/states-of-vitality',
        })
      if (submissionError) console.error('Supabase contact_submissions insert error:', submissionError)
    } catch (dbError) {
      console.error('SoV quote Supabase storage failed:', dbError)
    }

    // 3. Confirmation email to submitter (skip if blocked)
    if (!verification.shouldBlock) {
      try {
        await resend.emails.send({
          from: 'States of Vitality <hello@mutomorro.com>',
          to: emailNormalised,
          subject: 'Thanks for your quote request',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #221C2B;">
              <p style="font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(firstName)},</p>
              <p style="font-size: 16px; line-height: 1.6;">Thanks for your interest in the States of Vitality assessment. We've received your details and will be in touch shortly with a tailored quote and next steps.</p>
              <p style="font-size: 16px; line-height: 1.6;">Best wishes,<br/>The States of Vitality team</p>
            </div>
          `,
        })
      } catch (confirmError) {
        console.error('SoV quote confirmation email failed:', confirmError)
      }
    }

    // 4. If blocked: skip contact/signal creation
    if (verification.shouldBlock) {
      console.log(`Blocked SoV quote for ${emailNormalised}: zb_status=${verification.status}`)
      return Response.json({ success: true })
    }

    // 5. Upsert contact + signal
    try {
      let contactId = null

      if (existing) {
        const mergedSources = [...new Set([...(existing.sources || []), 'sov-quote'])]
        const mergedTags = [...new Set([...(existing.tags || []), 'sov-quote', 'inbound-enquiry'])]

        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            first_name: existing.first_name || firstName,
            last_name: existing.last_name || lastName,
            organisation_name: existing.organisation_name || organisation,
            sources: mergedSources,
            tags: mergedTags,
            zb_status: verification.status,
          })
          .eq('id', existing.id)
        if (updateError) console.error('Supabase contact update error:', updateError)
        contactId = existing.id
      } else {
        const { data: created, error: insertError } = await supabase
          .from('contacts')
          .insert({
            signup_email: emailNormalised,
            first_name: firstName,
            last_name: lastName,
            organisation_name: organisation,
            sources: ['sov-quote'],
            first_source: 'sov-quote',
            tags: ['sov-quote', 'inbound-enquiry'],
            tier: 'Tier 1',
            zb_status: verification.status,
          })
          .select('id')
          .single()
        if (insertError) console.error('Supabase contact insert error:', insertError)
        contactId = created?.id
      }

      if (contactId) {
        const detailParts = [`Employees: ${employees}`]
        if (message) detailParts.push(message.substring(0, 500))
        const { error: signalError } = await supabase
          .from('signals')
          .insert({
            contact_id: contactId,
            type: 'sov-quote-request',
            detail: detailParts.join(' | '),
            strength: 'high',
          })
        if (signalError) console.error('Supabase signal insert error:', signalError)
      }
    } catch (contactDbError) {
      console.error('SoV quote contact/signal storage failed:', contactDbError)
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('SoV quote error:', error)
    return Response.json({ success: true })
  }
}

function escapeHtml(value) {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
