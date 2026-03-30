/**
 * Manual trigger for the newsletter send cron.
 *
 * Password-protected with ADMIN_PASSWORD.
 * Respects all the same config and safety rails as the cron job.
 * Useful for testing or sending an extra batch on the same day.
 */

export const maxDuration = 300

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Forward to the cron handler with proper auth
  const cronUrl = new URL('/api/cron/newsletter-send', request.url)
  const response = await fetch(cronUrl, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  })

  const data = await response.json()
  return Response.json(data, { status: response.status })
}
