/**
 * Tender Finder test endpoint
 *
 * GET /api/tender-finder/test
 * GET /api/tender-finder/test?dryRun=true
 * GET /api/tender-finder/test?skipAi=true
 * GET /api/tender-finder/test?from=2026-03-01
 * GET /api/tender-finder/test?channel=contracts-finder
 *
 * Runs the pipeline and returns results as JSON.
 */

import { runPipeline } from '../../../../lib/tender-finder/pipeline.js'

export async function GET(request) {
  // Gate with CRON_SECRET, matching the /api/cron/tender-finder* routes. This
  // endpoint runs the full pipeline (including paid Anthropic scoring), so it
  // must not be reachable unauthenticated. For a local/dev trigger, pass the
  // header: curl -H "Authorization: Bearer $CRON_SECRET" .../api/tender-finder/test
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') === 'true'
  const skipAi = searchParams.get('skipAi') === 'true'
  const publishedFrom = searchParams.get('from') || '2026-01-01'
  const channelName = searchParams.get('channel')

  const channels = {
    contractsFinder: !channelName || channelName === 'contracts-finder',
    findATender: !channelName || channelName === 'find-a-tender',
    googleAlerts: !channelName || channelName === 'google-alerts',
    watchlist: !channelName || channelName === 'watchlist',
  }

  try {
    const summary = await runPipeline({ publishedFrom, dryRun, skipAi, channels })

    return Response.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('Tender Finder pipeline error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
