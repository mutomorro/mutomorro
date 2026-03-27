/**
 * Manual trigger for the Tender Finder pipeline
 *
 * POST /api/tender-finder/run
 * Body: { password, sendDigest?, sendHotAlerts?, skipAi?, channel? }
 *
 * Protected by ADMIN_PASSWORD.
 */

import { runPipeline } from '../../../../lib/tender-finder/pipeline.js'

export const maxDuration = 300

export async function POST(request) {
  const body = await request.json()
  const { password, sendDigest, sendHotAlerts, skipAi, channel } = body

  if (password !== process.env.ADMIN_PASSWORD) {
    return new Response('Unauthorised', { status: 401 })
  }

  const channels = {
    contractsFinder: !channel || channel === 'contracts-finder',
    findATender: !channel || channel === 'find-a-tender',
    googleAlerts: !channel || channel === 'google-alerts',
    watchlist: !channel || channel === 'watchlist',
  }

  try {
    const summary = await runPipeline({
      sendDigest: sendDigest || false,
      sendHotAlerts: sendHotAlerts || false,
      skipAi: skipAi || false,
      channels,
    })

    return Response.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('Tender finder manual run failed:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
