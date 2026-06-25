import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function GET(_request, { params }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data: send, error } = await supabase
      .from('newsletter_sends')
      .select('id, status, subject, issue_key, total_recipients, total_sent, completed_at, created_at')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!send) {
      return NextResponse.json({ error: 'Send not found' }, { status: 404 })
    }

    // Live count of recipients actually sent — keyed on the durable resend_id,
    // not status='sent' (webhooks advance rows to delivered/opened during a
    // paced drain, which would otherwise undercount progress).
    const { count: sentCount } = await supabase
      .from('newsletter_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('send_id', id)
      .not('resend_id', 'is', null)

    return NextResponse.json({
      sendId: send.id,
      status: send.status,
      subject: send.subject,
      issueKey: send.issue_key,
      sent: sentCount ?? send.total_sent ?? 0,
      total: send.total_recipients ?? 0,
      completedAt: send.completed_at,
      createdAt: send.created_at,
    })
  } catch (err) {
    console.error('Send status error:', err)
    return NextResponse.json({ error: err.message || 'Status fetch failed' }, { status: 500 })
  }
}
