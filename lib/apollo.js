const APOLLO_BASE = 'https://api.apollo.io'

async function apolloPost(endpoint, body = {}) {
  const response = await fetch(`${APOLLO_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.APOLLO_API_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Apollo API error ${response.status}: ${text.slice(0, 200)}`)
  }
  return response.json()
}

export async function getSequences() {
  const data = await apolloPost('/v1/emailer_campaigns/search', {
    per_page: 50,
    sort_by_key: 'last_used_at',
    sort_ascending: false,
  })
  return data.emailer_campaigns || []
}

export async function getOutreachEmails(options = {}) {
  const body = {
    per_page: options.per_page || 50,
    page: options.page || 1,
    sort_by_key: 'email_last_activity_date',
    sort_ascending: false,
  }

  if (options.status) body.email_status = [options.status]

  const data = await apolloPost('/v1/emailer_messages/search', body)
  return {
    emails: data.emailer_messages || [],
    total: data.pagination?.total_entries || 0,
    page: data.pagination?.page || 1,
    pages: data.pagination?.total_pages || 1,
  }
}
