/**
 * List newsletter issues from calendar_items that are available to send.
 * Used by the /admin/newsletter/send page for the issue dropdown.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase
      .from('calendar_items')
      .select('id, title, description, scheduled_date, tags, status, subject, preview_text, content_json')
      .eq('type', 'newsletter')
      .in('status', ['planned', 'scheduled'])
      .order('scheduled_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) throw error

    const items = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      scheduled_date: row.scheduled_date,
      tags: row.tags || [],
      status: row.status,
      subject: row.subject || '',
      preview_text: row.preview_text || '',
      hasContent:
        (typeof row.content_json?.observationBody === 'string' && row.content_json.observationBody.trim() !== '') ||
        (Array.isArray(row.content_json?.sections) && row.content_json.sections.length > 0),
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error('Newsletter issues GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load issues' }, { status: 500 })
  }
}
