/**
 * Tender Finder cron job
 *
 * Runs daily at 7:00 UTC via Vercel cron.
 * Protected by CRON_SECRET header.
 *
 * Schedule configured in vercel.json:
 *   "0 7 * * *" = every day at 7:00 UTC
 */

import { runPipeline } from '../../../../lib/tender-finder/pipeline.js'

export const maxDuration = 300 // 5 minutes (Vercel Pro limit)

export async function GET(request) {
  // Verify legitimate cron call
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const summary = await runPipeline({
      sendDigest: true,
      sendHotAlerts: true,
    })

    return Response.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('Tender finder cron failed:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
