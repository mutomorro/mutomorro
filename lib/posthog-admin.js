const POSTHOG_API_URL = 'https://eu.posthog.com'

export async function queryPostHog(queryBody) {
  const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !apiKey) {
    console.error('PostHog credentials missing: NEXT_PUBLIC_POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY')
    return null
  }

  const res = await fetch(
    `${POSTHOG_API_URL}/api/environments/${projectId}/query/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: queryBody }),
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) {
    console.error('PostHog query failed:', res.status, await res.text())
    return null
  }

  return res.json()
}

// Helper to build a TrendsQuery
export function trendsQuery({ event = '$pageview', math = 'total', dateRange = '-30d', interval = 'day', properties = [], breakdownProperty = null, breakdownLimit = 10 }) {
  const series = [{
    kind: 'EventsNode',
    event,
    math,
    ...(properties.length > 0 ? { properties } : {}),
  }]

  const query = {
    kind: 'TrendsQuery',
    series,
    dateRange: { date_from: dateRange },
    ...(interval ? { interval } : {}),
  }

  if (breakdownProperty) {
    query.breakdownFilter = {
      breakdowns: [{ property: breakdownProperty, type: 'event' }],
      breakdown_limit: breakdownLimit,
    }
  }

  return query
}

// Helper for multi-series trends (e.g. multiple custom events)
export function multiSeriesTrendsQuery({ series, dateRange = '-30d', interval = 'day' }) {
  return {
    kind: 'TrendsQuery',
    series: series.map(s => ({
      kind: 'EventsNode',
      event: s.event,
      math: s.math || 'total',
      ...(s.properties ? { properties: s.properties } : {}),
    })),
    dateRange: { date_from: dateRange },
    interval,
  }
}
