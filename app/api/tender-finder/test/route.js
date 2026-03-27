/**
 * Tender Finder test endpoint
 *
 * GET /api/tender-finder/test
 * GET /api/tender-finder/test?dryRun=true
 * GET /api/tender-finder/test?from=2026-03-01
 *
 * Runs the pipeline and returns results as JSON.
 */

import { runPipeline } from '../../../../lib/tender-finder/pipeline.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') === 'true'
  const publishedFrom = searchParams.get('from') || '2026-01-01'

  try {
    const summary = await runPipeline({ publishedFrom, dryRun })

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
