/**
 * Tender Finder cron - Stage 3: Daily Digest
 *
 * Runs daily at 06:30 UTC (07:30 BST) via Vercel cron.
 * Builds and sends the daily digest email, plus any hot alerts.
 *
 * Schedule configured in vercel.json:
 *   "30 6 * * *" = every day at 06:30 UTC (07:30 BST)
 */

import { runDigestStage } from '../../../../lib/tender-finder/pipeline.js'

export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const summary = await runDigestStage()

    return Response.json({
      success: true,
      stage: 'digest',
      summary,
    })
  } catch (error) {
    console.error('Tender finder digest stage failed:', error)
    return Response.json(
      { success: false, stage: 'digest', error: error.message },
      { status: 500 }
    )
  }
}
