import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  // Verify the request is from Vercel Cron (not a random visitor)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Get unresolved 404s with more than 1 hit, ordered by hit count
  const { data: misses, error } = await supabase
    .from('missed_redirects')
    .select('path, hit_count, first_hit_at, last_hit_at, referrer')
    .eq('resolved', false)
    .gt('hit_count', 1)
    .order('hit_count', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Supabase error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // If nothing new, don't send an email
  if (!misses || misses.length === 0) {
    return new Response(JSON.stringify({ message: 'No unresolved 404s with multiple hits' }), { status: 200 })
  }

  // Build the email
  const rows = misses.map(m => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 13px;">${m.path}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${m.hit_count}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${m.referrer || '-'}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${new Date(m.last_hit_at).toLocaleDateString('en-GB')}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2 style="color: #221C2B;">Mutomorro 404 Digest</h2>
      <p style="color: #555;">${misses.length} unresolved 404${misses.length === 1 ? '' : 's'} with 2+ hits.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="background: #FAF6F1;">
            <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Path</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 13px;">Hits</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Referrer</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Last hit</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        To resolve: add a redirect in next.config.mjs, then mark as resolved in Supabase.<br/>
        Paths with only 1 hit are hidden (usually bots).
      </p>
    </div>
  `

  const { error: emailError } = await resend.emails.send({
    from: 'Mutomorro Website <hello@mutomorro.com>',
    to: 'hello@mutomorro.com',
    subject: `404 Digest: ${misses.length} unresolved path${misses.length === 1 ? '' : 's'}`,
    html,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return new Response(JSON.stringify({ error: emailError.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ message: `Digest sent with ${misses.length} paths` }), { status: 200 })
}
