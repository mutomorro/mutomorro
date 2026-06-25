/**
 * Paced newsletter drain cron.
 *
 * Fires every minute. If a newsletter_sends row is 'draining', it claims and
 * sends the next waves within a time budget, then exits; the send drains over
 * many ticks. When nothing is draining it returns immediately (one cheap query)
 * — that idle no-op is the stop condition.
 *
 * All the real work + the exactly-once guarantees live in drainOnce()
 * (lib/newsletter-drain.js) and the paced-send RPCs. This route is just the
 * authenticated, time-bounded driver, mirroring the zerobounce-verify cron.
 *
 * Auth: Bearer ${CRON_SECRET}. maxDuration is small — a tick is a few waves of
 * one send, never the whole send.
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { findActiveDrainingSend, drainOnce, DRAIN_CONFIG } from '../../../../lib/newsletter-drain.js'

export const maxDuration = 120

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const resend = new Resend(process.env.RESEND_API_KEY)

  const send = await findActiveDrainingSend(supabase)
  if (!send) {
    return Response.json({ status: 'idle', sends: 0 })
  }

  const summary = await drainOnce(send.id, {
    supabase,
    resend,
    budgetMs: DRAIN_CONFIG.TIME_BUDGET_MS,
    log: (m) => console.log(`[drain ${send.issue_key}] ${m}`),
  })

  return Response.json(summary)
}
