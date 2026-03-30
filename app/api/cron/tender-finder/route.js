/**
 * Tender Finder cron - Stage 1: Fetch & Store
 *
 * Runs daily at 06:00 UTC (07:00 BST) via Vercel cron.
 * Fetches from all channels, deduplicates, keyword scores, and stores.
 * AI scoring happens in a separate stage to avoid timeouts.
 *
 * Schedule configured in vercel.json:
 *   "0 6 * * *" = every day at 06:00 UTC (07:00 BST)
 */

import { runFetchStage } from '../../../../lib/tender-finder/pipeline.js'

export const maxDuration = 800

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const summary = await runFetchStage()

    return Response.json({
      success: true,
      stage: 'fetch',
      summary,
    })
  } catch (error) {
    console.error('Tender finder fetch stage failed:', error)
    return Response.json(
      { success: false, stage: 'fetch', error: error.message },
      { status: 500 }
    )
  }
}
