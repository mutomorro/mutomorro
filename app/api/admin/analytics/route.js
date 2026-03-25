import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStats, getTopReferrers, getTopCountries, getPageviews } from '../../../../lib/umami'

export async function GET(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '7d'
  const unit = period === '24h' ? 'hour' : 'day'

  try {
    const [stats, topReferrers, topCountries, pageviewsData] = await Promise.all([
      getStats(period),
      getTopReferrers(period, 10),
      getTopCountries(period, 10),
      getPageviews(period, unit),
    ])

    const visitors = stats.visitors ?? 0
    const pageviews = stats.pageviews ?? 0
    const bounces = stats.bounces ?? 0
    const totaltime = stats.totaltime ?? 0

    const result = {
      visitors,
      pageviews,
      bounceRate: visitors > 0 ? parseFloat(((bounces / visitors) * 100).toFixed(1)) : 0,
      avgDuration: visitors > 0 ? Math.round(totaltime / visitors) : 0,
      topReferrers: Array.isArray(topReferrers) ? topReferrers.map((r) => ({ referrer: r.x || '(direct)', views: r.y })) : [],
      topCountries: Array.isArray(topCountries) ? topCountries.map((c) => ({ country: c.x, views: c.y })) : [],
      pageviewsByDay: pageviewsData?.pageviews || [],
      sessionsByDay: pageviewsData?.sessions || [],
      period,
    }

    // Fire-and-forget snapshot
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    supabase
      .from('analytics_snapshots')
      .delete()
      .eq('period', period)
      .lt('captured_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .then(() =>
        supabase.from('analytics_snapshots').insert({
          period,
          visitors,
          pageviews,
          bounce_rate: result.bounceRate,
          avg_visit_duration: result.avgDuration,
          top_pages: [],
          top_referrers: result.topReferrers,
        })
      )
      .catch(() => {})

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analytics API error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
