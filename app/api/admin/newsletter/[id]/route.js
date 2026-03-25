import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const [sendResult, statusBreakdown, engagedRecipients] = await Promise.all([
      // The send record (exclude heavy fields)
      supabase
        .from('newsletter_sends')
        .select('id, subject, preview_text, status, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at, completed_at')
        .eq('id', id)
        .single(),

      // Recipient status breakdown
      supabase
        .from('newsletter_recipients')
        .select('status')
        .eq('send_id', id),

      // Engaged recipients with contact info
      supabase
        .from('newsletter_recipients')
        .select('email, status, opened_at, clicked_at, bounced_at, contact_id')
        .eq('send_id', id)
        .not('opened_at', 'is', null)
        .order('opened_at', { ascending: false })
        .limit(30),
    ])

    if (sendResult.error) throw sendResult.error

    // Group status breakdown
    const statusCounts = {}
    if (statusBreakdown.data) {
      statusBreakdown.data.forEach((r) => {
        const s = r.status || 'unknown'
        statusCounts[s] = (statusCounts[s] || 0) + 1
      })
    }

    // Enrich engaged recipients with contact names
    let enrichedRecipients = []
    if (engagedRecipients.data && engagedRecipients.data.length > 0) {
      const contactIds = [...new Set(engagedRecipients.data.map((r) => r.contact_id).filter(Boolean))]
      let contactMap = {}

      if (contactIds.length > 0) {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, organisation_name')
          .in('id', contactIds)

        if (contacts) {
          contacts.forEach((c) => { contactMap[c.id] = c })
        }
      }

      enrichedRecipients = engagedRecipients.data.map((r) => ({
        ...r,
        contact: contactMap[r.contact_id] || null,
      }))
    }

    // Also fetch bounced recipients separately
    const { data: bouncedRecipients } = await supabase
      .from('newsletter_recipients')
      .select('email, status, bounced_at, contact_id')
      .eq('send_id', id)
      .not('bounced_at', 'is', null)
      .order('bounced_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      send: sendResult.data,
      statusBreakdown: statusCounts,
      engaged: enrichedRecipients,
      bounced: bouncedRecipients || [],
    })
  } catch (err) {
    console.error('Newsletter send detail error:', err)
    return NextResponse.json({ error: 'Failed to load send detail' }, { status: 500 })
  }
}
