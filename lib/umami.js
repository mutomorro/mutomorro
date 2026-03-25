let cachedToken = null
let tokenExpiry = null

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const response = await fetch(`${process.env.UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.UMAMI_USERNAME,
      password: process.env.UMAMI_PASSWORD,
    }),
  })

  if (!response.ok) throw new Error('Umami auth failed')

  const data = await response.json()
  cachedToken = data.token
  tokenExpiry = Date.now() + (60 * 60 * 1000)
  return cachedToken
}

async function umamiGet(endpoint, params = {}) {
  const token = await getToken()
  const url = new URL(`${process.env.UMAMI_URL}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`Umami API error: ${response.status}`)
  return response.json()
}

function periodToMs(period) {
  const map = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }
  return map[period] || map['7d']
}

// Returns: { pageviews: N, visitors: N, visits: N, bounces: N, totaltime: N }
export async function getStats(period = '7d') {
  const now = Date.now()
  const startAt = now - periodToMs(period)
  return umamiGet(`/api/websites/${process.env.UMAMI_WEBSITE_ID}/stats`, { startAt, endAt: now })
}

// Returns: { visitors: N }
export async function getActiveVisitors() {
  return umamiGet(`/api/websites/${process.env.UMAMI_WEBSITE_ID}/active`)
}

// Returns: [{ x: 'referrer', y: count }]
export async function getTopReferrers(period = '7d', limit = 10) {
  const now = Date.now()
  const startAt = now - periodToMs(period)
  return umamiGet(`/api/websites/${process.env.UMAMI_WEBSITE_ID}/metrics`, {
    startAt,
    endAt: now,
    type: 'referrer',
    limit,
  })
}

// Returns: [{ x: 'country code', y: count }]
export async function getTopCountries(period = '7d', limit = 10) {
  const now = Date.now()
  const startAt = now - periodToMs(period)
  return umamiGet(`/api/websites/${process.env.UMAMI_WEBSITE_ID}/metrics`, {
    startAt,
    endAt: now,
    type: 'country',
    limit,
  })
}

// Returns: { pageviews: [{x, y}], sessions: [{x, y}] }
export async function getPageviews(period = '7d', unit = 'day') {
  const now = Date.now()
  const startAt = now - periodToMs(period)
  return umamiGet(`/api/websites/${process.env.UMAMI_WEBSITE_ID}/pageviews`, {
    startAt,
    endAt: now,
    unit,
  })
}
