import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  loadEditorialContentFromCalendar,
  renderEditorial,
  renderPromo,
} from '../../../../../lib/newsletter-render.js'

export const maxDuration = 30

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()
    const { template, content = {} } = body

    if (template === 'editorial') {
      const loaded = await loadEditorialContentFromCalendar(supabase, content.calendarItemId)
      if (!loaded.ok) {
        return NextResponse.json({ error: loaded.reason }, { status: 400 })
      }

      // Allow ad-hoc overrides from the request (e.g. user edits before saving)
      const merged = {
        ...loaded.content,
        subject: content.subject ?? loaded.content.subject,
        previewText: content.previewText ?? loaded.content.previewText,
      }

      const html = await renderEditorial(merged)
      return NextResponse.json({
        html,
        subject: merged.subject,
        previewText: merged.previewText,
      })
    }

    if (template === 'promo') {
      const required = ['subject', 'previewText', 'headline', 'body', 'ctaText', 'ctaUrl']
      for (const k of required) {
        if (!content[k] || String(content[k]).trim() === '') {
          return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 })
        }
      }

      const html = await renderPromo(content)
      return NextResponse.json({
        html,
        subject: content.subject,
        previewText: content.previewText,
      })
    }

    return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
  } catch (err) {
    console.error('Newsletter preview error:', err)
    return NextResponse.json({ error: err.message || 'Preview failed' }, { status: 500 })
  }
}
