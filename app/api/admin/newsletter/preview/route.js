import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  loadEditorialContentFromCalendar,
  renderEditorial,
  renderPromo,
} from '../../../../../lib/newsletter-render.js'

export const maxDuration = 30

// Scalar text fields the editor may override for a live preview. Mirrors the
// whitelist the editor's save endpoint writes back to content_json.
const EDITORIAL_OVERRIDE_KEYS = [
  'subject',
  'previewText',
  'monthYear',
  'subjectLine',
  'introText',
  'observationKicker',
  'observationTitle',
  'observationBody',
  'signOff',
  'ps',
]

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

      // Allow ad-hoc text overrides from the request so an unsaved edit in the
      // /admin/newsletter/edit editor previews live. Only these scalar text
      // fields are overridable; arrays/hero image always come from the saved
      // content. Existing callers (the send page) pass only subject/previewText,
      // so the rest are no-ops for them — this stays backward-compatible.
      const merged = { ...loaded.content }
      for (const key of EDITORIAL_OVERRIDE_KEYS) {
        if (content[key] !== undefined && content[key] !== null) {
          merged[key] = content[key]
        }
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
