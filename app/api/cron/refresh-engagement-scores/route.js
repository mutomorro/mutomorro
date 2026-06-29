/**
 * Daily engagement-score refresh.
 *
 * Recomputes contacts.engagement_score for every contact. The score is a
 * snapshot (the 30/90-day recency windows move and newsletter activity changes),
 * so it is rebuilt once a day. The on-enrich path re-scores touched contacts
 * inline; this keeps everyone else current.
 *
 * Cheap: refresh_engagement_scores() only writes rows whose score actually
 * changed (IS DISTINCT FROM guard), so most days it touches a handful.
 *
 * Auth: Bearer ${CRON_SECRET} — the RPC is a mutating, service-role-only function.
 */

import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase.rpc('refresh_engagement_scores')
  if (error) {
    console.error('refresh-engagement-scores cron failed:', error)
    return Response.json({ error: 'Refresh failed' }, { status: 500 })
  }

  return Response.json({ rescored: data ?? 0 })
}
