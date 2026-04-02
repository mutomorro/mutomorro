/**
 * Tender Finder cron - Cleanup
 *
 * Runs weekly on Sunday at 04:00 UTC via Vercel cron.
 * Deletes archived tenders older than 30 days that James hasn't rated.
 * Keeps the database lean without affecting deduplication (items this old
 * are unlikely to reappear in feeds).
 *
 * Schedule configured in vercel.json:
 *   "0 4 * * 0" = every Sunday at 04:00 UTC
 */

import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Delete archived tenders older than 30 days with no james_rating
    const { data, error } = await supabase
      .from('tenders')
      .delete()
      .eq('temperature', 'archived')
      .is('james_rating', null)
      .lt('created_at', cutoff)
      .select('id')

    if (error) {
      throw new Error(`Cleanup failed: ${error.message}`)
    }

    const deleted = data?.length || 0
    console.log(`Tender cleanup: deleted ${deleted} archived tenders older than 30 days`)

    return Response.json({
      success: true,
      stage: 'cleanup',
      deleted,
      cutoff,
    })
  } catch (error) {
    console.error('Tender cleanup failed:', error)
    return Response.json(
      { success: false, stage: 'cleanup', error: error.message },
      { status: 500 }
    )
  }
}
