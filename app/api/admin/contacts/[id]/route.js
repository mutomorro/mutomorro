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
    // Get contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    if (contactError) throw contactError

    // Get signals and interactions in parallel
    const [signalsResult, interactionsResult] = await Promise.all([
      supabase
        .from('signals')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('interactions')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    return NextResponse.json({
      contact,
      signals: signalsResult.data || [],
      interactions: interactionsResult.data || [],
    })
  } catch (err) {
    console.error('Contact detail error:', err)
    return NextResponse.json({ error: 'Failed to load contact' }, { status: 500 })
  }
}
