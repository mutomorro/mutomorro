/**
 * Read + write the editable text content of a single newsletter issue
 * (a `calendar_items` row of type 'newsletter'). Backs the
 * /admin/newsletter/edit/[id] editor.
 *
 * GET   → resolved editorial content (via the canonical resolver) plus a
 *         summary of the parts this editor does NOT touch yet.
 * PATCH → merges only a whitelist of text fields into content_json and
 *         updates the subject / preview_text columns. Everything else in
 *         content_json (index items, content blocks, hero image, …) is
 *         preserved untouched, so the send flow keeps working unchanged.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadEditorialContentFromCalendar, formatMonthYear } from '../../../../../../lib/newsletter-render.js'

export const maxDuration = 30

// The text fields the editor is allowed to change. Arrays (indexItems,
// contentBlocks) and the hero image are deliberately excluded — they're
// preserved as-is on save and only summarised on read.
const EDITABLE_TEXT_KEYS = [
  'monthYear',
  'subjectLine',
  'introText',
  'observationKicker',
  'observationTitle',
  'observationBody',
  'signOff',
  'ps',
]

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function unauthorised(request) {
  return !request.cookies.get('admin_session')?.value
}

export async function GET(request, { params }) {
  if (unauthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const supabase = supa()

  try {
    const { data: row, error } = await supabase
      .from('calendar_items')
      .select('id, title, type, status, scheduled_date, subject, preview_text, content_json')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!row) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }
    if (row.type !== 'newsletter') {
      return NextResponse.json({ error: 'Not a newsletter issue' }, { status: 400 })
    }

    const cj = row.content_json || {}

    // Resolve through the same helper the preview/send paths use, so the
    // editor shows exactly what would render (including derived defaults
    // like the month-year label).
    const loaded = await loadEditorialContentFromCalendar(supabase, id)
    const hasContent = loaded.ok && typeof loaded.content?.observationBody === 'string'

    const resolved = hasContent ? loaded.content : {}

    const monthYearDefault = cj.monthYear || (row.scheduled_date
      ? formatMonthYear(new Date(row.scheduled_date + 'T00:00:00'))
      : formatMonthYear())

    const editable = {
      subject: row.subject || resolved.subject || row.title || '',
      previewText: row.preview_text || resolved.previewText || '',
      monthYear: resolved.monthYear || monthYearDefault,
      subjectLine: resolved.subjectLine || cj.subjectLine || row.subject || row.title || '',
      introText: resolved.introText || cj.introText || '',
      observationKicker: resolved.observationKicker || cj.observationKicker || 'Observation',
      observationTitle: resolved.observationTitle || cj.observationTitle || '',
      observationBody: resolved.observationBody || cj.observationBody || '',
      signOff: resolved.signOff || cj.signOff || 'James',
      ps: resolved.ps || cj.ps || '',
    }

    // Parts the editor leaves alone — surfaced read-only so the user knows
    // what's on the issue without being able to break it here.
    const indexItems = Array.isArray(cj.indexItems) ? cj.indexItems : []
    const contentBlocks = Array.isArray(cj.contentBlocks) ? cj.contentBlocks : []
    const nonEditable = {
      indexItemCount: indexItems.length,
      contentBlockCount: contentBlocks.length,
      hasHeroImage: Boolean(cj.heroImageUrl),
      isLegacyFormat: Array.isArray(cj.sections) && cj.sections.length > 0 && !hasContent,
    }

    return NextResponse.json({
      id: row.id,
      title: row.title,
      status: row.status,
      scheduledDate: row.scheduled_date,
      hasContent,
      editable,
      nonEditable,
    })
  } catch (err) {
    console.error('Issue content GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load issue' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  if (unauthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const supabase = supa()

  try {
    const body = await request.json()
    const incoming = body.content && typeof body.content === 'object' ? body.content : {}

    // Load the current row so we merge into the existing content_json rather
    // than replacing it — this is what keeps index items, content blocks and
    // the hero image intact.
    const { data: row, error: loadErr } = await supabase
      .from('calendar_items')
      .select('id, type, content_json')
      .eq('id', id)
      .maybeSingle()

    if (loadErr) throw loadErr
    if (!row) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }
    if (row.type !== 'newsletter') {
      return NextResponse.json({ error: 'Not a newsletter issue' }, { status: 400 })
    }

    const nextContent = { ...(row.content_json || {}) }
    for (const key of EDITABLE_TEXT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(incoming, key)) {
        nextContent[key] = typeof incoming[key] === 'string' ? incoming[key] : ''
      }
    }

    const updates = {
      content_json: nextContent,
      updated_at: new Date().toISOString(),
    }
    if (typeof body.subject === 'string') updates.subject = body.subject
    if (typeof body.previewText === 'string') updates.preview_text = body.previewText

    const { error: saveErr } = await supabase
      .from('calendar_items')
      .update(updates)
      .eq('id', id)
      .eq('type', 'newsletter')

    if (saveErr) throw saveErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Issue content PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save issue' }, { status: 500 })
  }
}
