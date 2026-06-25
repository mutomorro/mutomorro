import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inbound enquiry inbox — contact_submissions, the warmest leads in the CRM.
// Matches each submission's email to an existing contact so an enquiry from an
// already-engaged subscriber (downloads / newsletter opens) is obvious at a glance.

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()

  try {
    const { data: subs, error } = await supabase
      .from('contact_submissions')
      .select('id, name, email, organisation, service, message, source_page, created_at, responded, responded_at, notes')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error

    const rows = subs || []

    // One batched lookup to enrich with the matching contact record.
    const emails = [...new Set(rows.map((r) => (r.email || '').toLowerCase()).filter(Boolean))]
    const matchByEmail = new Map()
    if (emails.length > 0) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, signup_email, download_count, newsletter_opens, newsletter_clicks, newsletter_status, tier')
        .in('signup_email', emails)
      for (const c of contacts || []) {
        if (c.signup_email) matchByEmail.set(c.signup_email.toLowerCase(), c)
      }
    }

    const items = rows.map((r) => {
      const c = matchByEmail.get((r.email || '').toLowerCase()) || null
      return {
        ...r,
        contact: c
          ? {
              id: c.id,
              downloadCount: c.download_count || 0,
              opens: c.newsletter_opens || 0,
              clicks: c.newsletter_clicks || 0,
              newsletterStatus: c.newsletter_status || null,
              tier: c.tier || null,
              engaged: (c.download_count || 0) > 0 || (c.newsletter_opens || 0) > 0,
            }
          : null,
      }
    })

    return NextResponse.json({
      items,
      counts: {
        total: items.length,
        unresponded: items.filter((i) => !i.responded).length,
      },
    })
  } catch (err) {
    console.error('Enquiries GET error:', err)
    return NextResponse.json({ error: 'Failed to load enquiries' }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!request.cookies.get('admin_session')?.value) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = client()

  try {
    const body = await request.json()
    const { id, responded, notes } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Column allow-list — never spread the raw body into .update().
    const updates = {}
    if (responded !== undefined) {
      updates.responded = !!responded
      updates.responded_at = responded ? new Date().toISOString() : null
    }
    if (notes !== undefined) updates.notes = notes

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Enquiries PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
  }
}
