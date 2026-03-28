import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { queryPostHog, trendsQuery, multiSeriesTrendsQuery } from '../../../../lib/posthog-admin'

export async function GET(request) {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // Run all PostHog queries in parallel
    const [
      visitorsOverTime,
      pageviewsOverTime,
      topPagesAll,
      topPagesExploration,
      topToolPages,
      referralSources,
      countries,
      devices,
      customEvents,
      todayVisitors,
      todayPageviews,
      todayDownloads,
      todaySignups,
    ] = await Promise.all([
      // 1. Unique visitors per day, last 30 days
      queryPostHog(trendsQuery({ math: 'dau', dateRange: '-30d', interval: 'day' })),

      // 2. Total pageviews per day, last 30 days
      queryPostHog(trendsQuery({ math: 'total', dateRange: '-30d', interval: 'day' })),

      // 3. Top pages (all), last 30 days
      queryPostHog(trendsQuery({ dateRange: '-30d', breakdownProperty: '$pathname', breakdownLimit: 20 })),

      // 4. Top pages (exploration only - exclude /tools/)
      queryPostHog(trendsQuery({
        dateRange: '-30d',
        breakdownProperty: '$pathname',
        breakdownLimit: 15,
        properties: [{ key: '$pathname', operator: 'not_icontains', type: 'event', value: '/tools/' }],
      })),

      // 5. Top tool pages only
      queryPostHog(trendsQuery({
        dateRange: '-30d',
        breakdownProperty: '$pathname',
        breakdownLimit: 15,
        properties: [{ key: '$pathname', operator: 'icontains', type: 'event', value: '/tools/' }],
      })),

      // 6. Referral sources
      queryPostHog(trendsQuery({ dateRange: '-30d', breakdownProperty: '$referring_domain', breakdownLimit: 10 })),

      // 7. Countries
      queryPostHog(trendsQuery({ dateRange: '-30d', breakdownProperty: '$geoip_country_name', breakdownLimit: 10 })),

      // 8. Devices
      queryPostHog(trendsQuery({ dateRange: '-30d', breakdownProperty: '$device_type' })),

      // 9. Custom events over time
      queryPostHog(multiSeriesTrendsQuery({
        series: [
          { event: 'tool_download', math: 'total' },
          { event: 'resource_download', math: 'total' },
          { event: 'newsletter_signup', math: 'total' },
          { event: 'contact_form_submitted', math: 'total' },
        ],
        dateRange: '-30d',
        interval: 'day',
      })),

      // 10. Today's visitors
      queryPostHog(trendsQuery({ math: 'dau', dateRange: 'dStart', interval: 'day' })),

      // 11. Today's pageviews
      queryPostHog(trendsQuery({ math: 'total', dateRange: 'dStart', interval: 'day' })),

      // 12. Today's downloads
      queryPostHog(trendsQuery({ event: 'tool_download', math: 'total', dateRange: 'dStart', interval: 'day' })),

      // 13. Today's signups
      queryPostHog(trendsQuery({ event: 'newsletter_signup', math: 'total', dateRange: 'dStart', interval: 'day' })),
    ])

    const result = {
      // Time series
      visitorsOverTime: extractTimeSeries(visitorsOverTime),
      pageviewsOverTime: extractTimeSeries(pageviewsOverTime),

      // Top pages
      topPagesAll: extractBreakdown(topPagesAll),
      topPagesExploration: extractBreakdown(topPagesExploration),
      topToolPages: extractBreakdown(topToolPages),

      // Sources
      referralSources: extractBreakdown(referralSources),
      countries: extractBreakdown(countries),
      devices: extractBreakdown(devices),

      // Custom events (multi-series)
      customEvents: extractMultiSeries(customEvents),

      // Today's summary
      today: {
        visitors: extractTodayTotal(todayVisitors),
        pageviews: extractTodayTotal(todayPageviews),
        downloads: extractTodayTotal(todayDownloads),
        signups: extractTodayTotal(todaySignups),
      },
    }

    // Fire-and-forget snapshot to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    supabase
      .from('analytics_snapshots')
      .delete()
      .eq('period', '30d')
      .lt('captured_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .then(() =>
        supabase.from('analytics_snapshots').insert({
          period: '30d',
          visitors: result.today.visitors,
          pageviews: result.today.pageviews,
          bounce_rate: 0,
          avg_visit_duration: 0,
          top_pages: result.topPagesAll.slice(0, 10),
          top_referrers: result.referralSources.slice(0, 10),
        })
      )
      .catch(() => {})

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analytics API error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}

// Extract time series data from PostHog TrendsQuery result
function extractTimeSeries(result) {
  if (!result?.results?.[0]) return []
  const series = result.results[0]
  const days = series.days || series.labels || []
  const data = series.data || []
  return days.map((day, i) => ({ date: day, value: data[i] || 0 }))
}

// Extract breakdown data (sorted by total count)
function extractBreakdown(result) {
  if (!result?.results) return []
  return result.results
    .map(r => ({
      label: String(r.breakdown_value ?? r.label ?? 'Unknown'),
      count: (r.data || []).reduce((sum, v) => sum + v, 0),
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
}

// Extract multi-series data (custom events)
function extractMultiSeries(result) {
  if (!result?.results) return []
  return result.results.map(series => ({
    event: series.label || series.action?.name || 'Unknown',
    days: (series.days || series.labels || []).map((day, i) => ({
      date: day,
      value: (series.data || [])[i] || 0,
    })),
    total: (series.data || []).reduce((sum, v) => sum + v, 0),
  }))
}

// Extract a single total from a today query
function extractTodayTotal(result) {
  if (!result?.results?.[0]?.data) return 0
  return result.results[0].data.reduce((sum, v) => sum + v, 0)
}
