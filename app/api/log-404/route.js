// app/api/log-404/route.js
// API route that logs 404 hits to Supabase
// Called from not-found.js when a page isn't found
//
// Last updated: 20 March 2026, 14:30 GMT

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { path, referrer, userAgent } = body

    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 })
    }

    // Check if this path has been logged before
    const { data: existing } = await supabase
      .from('missed_redirects')
      .select('id, hit_count')
      .eq('path', path)
      .single()

    if (existing) {
      // Increment hit count
      await supabase
        .from('missed_redirects')
        .update({
          hit_count: existing.hit_count + 1,
          last_hit_at: new Date().toISOString(),
          referrer: referrer || null,
          user_agent: userAgent || null,
        })
        .eq('id', existing.id)
    } else {
      // New 404 - insert
      await supabase
        .from('missed_redirects')
        .insert({
          path,
          referrer: referrer || null,
          user_agent: userAgent || null,
          hit_count: 1,
          first_hit_at: new Date().toISOString(),
          last_hit_at: new Date().toISOString(),
          resolved: false,
        })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('404 logging error:', error.message)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
