/**
 * Tender Finder cron - Stage 2: AI Score
 *
 * Runs daily at 06:15 UTC (07:15 BST) via Vercel cron.
 * Picks up any tenders stored in Stage 1 that don't have an AI score yet,
 * scores them with Claude, and updates the database.
 *
 * Schedule configured in vercel.json:
 *   "15 6 * * *" = every day at 06:15 UTC (07:15 BST)
 */

import { runAiScoreStage } from '../../../../lib/tender-finder/pipeline.js'

export const maxDuration = 800

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const summary = await runAiScoreStage()

    return Response.json({
      success: true,
      stage: 'ai-score',
      summary,
    })
  } catch (error) {
    console.error('Tender finder AI score stage failed:', error)
    return Response.json(
      { success: false, stage: 'ai-score', error: error.message },
      { status: 500 }
    )
  }
}
