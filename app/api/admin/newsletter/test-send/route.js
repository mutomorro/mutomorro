import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import {
  loadEditorialContentFromCalendar,
  renderEditorial,
  renderPromo,
  generateUnsubscribeUrl,
  capitaliseFirstName,
} from '../../../../../lib/newsletter-render.js'

export const maxDuration = 60

const TEST_RECIPIENT = 'james@mutomorro.com'

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const body = await request.json()
    const { template, content = {} } = body

    // Look up James's contact record so the test send mirrors a real recipient
    const { data: jamesContact } = await supabase
      .from('contacts')
      .select('id, signup_email, first_name')
      .eq('signup_email', TEST_RECIPIENT)
      .maybeSingle()

    const firstName = capitaliseFirstName(jamesContact?.first_name) || 'James'
    const unsubscribeUrl = generateUnsubscribeUrl(TEST_RECIPIENT)

    let subject, html, previewText

    if (template === 'editorial') {
      const loaded = await loadEditorialContentFromCalendar(supabase, content.calendarItemId)
      if (!loaded.ok) {
        return NextResponse.json({ error: loaded.reason }, { status: 400 })
      }

      const merged = {
        ...loaded.content,
        subject: content.subject ?? loaded.content.subject,
        previewText: content.previewText ?? loaded.content.previewText,
      }

      subject = `[TEST] ${merged.subject}`
      previewText = merged.previewText
      html = await renderEditorial(merged, {
        firstName,
        unsubscribeUrl,
        viewInBrowserUrl: 'https://mutomorro.com',
      })
    } else if (template === 'promo') {
      const required = ['subject', 'previewText', 'headline', 'body', 'ctaText', 'ctaUrl']
      for (const k of required) {
        if (!content[k] || String(content[k]).trim() === '') {
          return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 })
        }
      }

      subject = `[TEST] ${content.subject}`
      previewText = content.previewText
      html = await renderPromo(content, { unsubscribeUrl })
    } else {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'James from Mutomorro <hello@mutomorro.com>',
      to: [TEST_RECIPIENT],
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'type', value: 'newsletter_test' },
        { name: 'template', value: template },
      ],
    })

    if (error) {
      console.error('Newsletter test-send error:', error)
      return NextResponse.json({ error: error.message || 'Resend error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resendId: data?.id || null, subject, previewText })
  } catch (err) {
    console.error('Newsletter test-send error:', err)
    return NextResponse.json({ error: err.message || 'Test send failed' }, { status: 500 })
  }
}
