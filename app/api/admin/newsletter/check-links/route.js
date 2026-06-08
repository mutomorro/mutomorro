import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  loadEditorialContentFromCalendar,
  renderEditorial,
  renderPromo,
} from '../../../../../lib/newsletter-render.js'
import { lintLinks } from '../../../../../lib/newsletter-lint.js'

// Link probing makes a handful of outbound requests; give it headroom.
export const maxDuration = 30

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()
    const { template, content = {} } = body

    // Render the email server-side from the same inputs as the preview, so we
    // check exactly what would ship — not client-supplied HTML.
    let html
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
      html = await renderEditorial(merged)
    } else if (template === 'promo') {
      html = await renderPromo(content)
    } else {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }

    const report = await lintLinks(html)
    return NextResponse.json(report)
  } catch (err) {
    console.error('Newsletter link check error:', err)
    return NextResponse.json({ error: err.message || 'Link check failed' }, { status: 500 })
  }
}
