import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { countAudience } from '../../../../../lib/newsletter-audiences.js'

export const maxDuration = 30

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET() {
  const supabase = client()
  try {
    const { data, error } = await supabase
      .from('newsletter_audiences')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    const audiences = await Promise.all(
      (data || []).map(async (a) => {
        let count = null
        try {
          count = await countAudience(supabase, a.filter_definition)
        } catch (e) {
          console.error(`Audience count failed for ${a.id}:`, e)
        }
        return { ...a, count }
      })
    )

    return NextResponse.json({ audiences })
  } catch (err) {
    console.error('Audiences GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load audiences' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = client()
  try {
    const body = await request.json()
    const { name, description, filter_definition, sort_order } = body

    if (!name || !filter_definition) {
      return NextResponse.json({ error: 'name and filter_definition are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('newsletter_audiences')
      .insert({
        name,
        description: description || null,
        filter_definition,
        sort_order: typeof sort_order === 'number' ? sort_order : 99,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Audiences POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create audience' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const supabase = client()
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('newsletter_audiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Audiences PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update audience' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const supabase = client()
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Refuse to delete the default audience
    const { data: existing } = await supabase
      .from('newsletter_audiences')
      .select('is_default')
      .eq('id', id)
      .maybeSingle()

    if (existing?.is_default) {
      return NextResponse.json({ error: 'Cannot delete the default audience' }, { status: 400 })
    }

    const { error } = await supabase.from('newsletter_audiences').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Audiences DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete audience' }, { status: 500 })
  }
}
