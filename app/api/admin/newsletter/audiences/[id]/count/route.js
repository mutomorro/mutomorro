import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { countAudience } from '../../../../../../../lib/newsletter-audiences.js'

export const maxDuration = 30

export async function GET(_request, { params }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data: audience, error } = await supabase
      .from('newsletter_audiences')
      .select('id, name, filter_definition')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!audience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    const count = await countAudience(supabase, audience.filter_definition)
    return NextResponse.json({ count, name: audience.name })
  } catch (err) {
    console.error('Audience count error:', err)
    return NextResponse.json({ error: err.message || 'Count failed' }, { status: 500 })
  }
}
