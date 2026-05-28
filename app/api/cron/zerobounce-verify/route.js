/**
 * Daily ZeroBounce verification sweep.
 *
 * Runs at 03:00 UTC. Verifies all subscribed contacts whose ZeroBounce
 * record is missing or older than 30 days, so the newsletter send function
 * never has to call ZeroBounce inline.
 *
 * Self-healing: if the run hits its time budget, anything left over is
 * picked up on tomorrow's run because the candidate query re-selects
 * everything stale.
 *
 * If ZeroBounce returns an out-of-credits error, the loop halts immediately
 * (instead of burning more failed requests) and sends an alert to the
 * `newsletter_config.summary_email` address.
 *
 * Auth: Bearer ${CRON_SECRET} on the Authorization header. Required so an
 * unauthenticated caller can't drain ZeroBounce credits.
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyEmail } from '../../../../components/email-verification.js'
import { fetchAllPaginated } from '../../../../lib/supabase-paginate.js'

export const maxDuration = 800

const STALE_DAYS = 30
const BLOCKED_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail'])
// 12 minutes. Leaves ~80s headroom under the 800s maxDuration for cleanup,
// summary email, and serverless overhead.
const TIME_BUDGET_MS = 12 * 60 * 1000
// Small pause between ZeroBounce calls. ~5 req/s is a polite cadence and
// matches the inline verification path the send function used to run.
const PER_CALL_PAUSE_MS = 200
const DEFAULT_SUMMARY_EMAIL = 'james@mutomorro.com'

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

  const runStartedAt = new Date()
  const startMs = Date.now()
  const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).getTime()

  // Load all subscribed contacts and filter in JS. With ~3k contacts the
  // memory cost is trivial; an .or() PostgREST filter for the four conditions
  // is brittle to escape, and an RPC would be more code than it's worth.
  let allSubscribed
  try {
    allSubscribed = await fetchAllPaginated((from, to) => supabase
      .from('contacts')
      .select('id, signup_email, zb_status, zb_verified_at')
      .in('newsletter_status', ['active', 'confirmed'])
      .order('zb_verified_at', { ascending: true, nullsFirst: true })
      .range(from, to)
    )
  } catch (err) {
    console.error('ZB cron: candidate query failed:', err)
    return Response.json({ error: 'Candidate query failed' }, { status: 500 })
  }

  const candidates = allSubscribed.filter((c) => {
    if (!c.signup_email) return false
    if (!c.zb_status) return true
    if (c.zb_status === 'unknown') return true
    if (!c.zb_verified_at) return true
    return new Date(c.zb_verified_at).getTime() < staleThreshold
  })

  if (candidates.length === 0) {
    return Response.json({
      processed: 0,
      remaining: 0,
      message: 'No candidates need verification',
    })
  }

  // Keys match what ZeroBounce actually returns in `status`. Note that ZB
  // mixes hyphenated (`catch-all`) and underscored (`do_not_mail`) statuses.
  const results = { valid: 0, invalid: 0, abuse: 0, spamtrap: 0, do_not_mail: 0, 'catch-all': 0, unknown: 0, other: 0, blocked: 0 }
  let processed = 0
  let timedOut = false
  let creditsExhausted = false

  for (const contact of candidates) {
    if (Date.now() - startMs > TIME_BUDGET_MS) {
      timedOut = true
      break
    }

    let verification
    try {
      verification = await verifyEmail(contact.signup_email)
    } catch (err) {
      console.error(`ZB cron: verifyEmail threw for contact ${contact.id}:`, err)
      results.other++
      continue
    }

    if (verification.creditsExhausted) {
      creditsExhausted = true
      break
    }

    const status = verification.status || 'unknown'
    const bucket = Object.prototype.hasOwnProperty.call(results, status) ? status : 'other'
    results[bucket]++

    const updates = {
      zb_status: status,
      zb_verified_at: new Date().toISOString(),
    }
    if (BLOCKED_STATUSES.has(status)) {
      updates.newsletter_status = 'bounced'
      results.blocked++
    }

    const { error: updateErr } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contact.id)
    if (updateErr) {
      console.error(`ZB cron: contact update failed for ${contact.id}:`, updateErr)
    }
    processed++

    if (PER_CALL_PAUSE_MS) await new Promise((r) => setTimeout(r, PER_CALL_PAUSE_MS))
  }

  // Resolve the summary recipient
  const { data: config } = await supabase
    .from('newsletter_config')
    .select('summary_email')
    .limit(1)
    .maybeSingle()
  const summaryEmail = config?.summary_email || DEFAULT_SUMMARY_EMAIL

  const remaining = candidates.length - processed
  const runFinishedAt = new Date()

  try {
    if (creditsExhausted) {
      await sendCreditsAlertEmail(resend, summaryEmail, {
        runStartedAt,
        runFinishedAt,
        processed,
        remaining,
        results,
      })
    } else {
      await sendSummaryEmail(resend, summaryEmail, {
        runStartedAt,
        runFinishedAt,
        processed,
        remaining,
        results,
        timedOut,
      })
    }
  } catch (err) {
    console.error('ZB cron: summary email failed:', err)
  }

  return Response.json({
    processed,
    remaining,
    results,
    creditsExhausted,
    timedOut,
  })
}

const FONT_FAMILY = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

function row(label, value, highlight) {
  return `<tr>
    <td style="padding:6px 0;font-family:${FONT_FAMILY};font-size:14px;color:rgba(0,0,0,0.5);">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-family:${FONT_FAMILY};font-size:14px;color:${highlight || '#221C2B'};text-align:right;font-weight:${highlight ? '400' : '300'};">${escapeHtml(String(value))}</td>
  </tr>`
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDuration(start, end) {
  const ms = end.getTime() - start.getTime()
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${s}s`
}

async function sendSummaryEmail(resend, to, { runStartedAt, runFinishedAt, processed, remaining, results, timedOut }) {
  const adminUrl = 'https://mutomorro.com/admin/newsletter'
  const rows = [
    row('Started', runStartedAt.toISOString()),
    row('Duration', formatDuration(runStartedAt, runFinishedAt)),
    row('Processed', processed, '#221C2B'),
    row('Remaining (next run)', remaining, remaining > 0 ? '#FFA200' : '#221C2B'),
    row('Valid', results.valid),
    row('Invalid', results.invalid),
    row('Catch-all', results['catch-all']),
    row('Unknown', results.unknown),
    results.spamtrap > 0 ? row('Spamtrap', results.spamtrap, '#FF4279') : '',
    results.abuse > 0 ? row('Abuse', results.abuse, '#FF4279') : '',
    results.do_not_mail > 0 ? row('Do not mail', results.do_not_mail, '#FF4279') : '',
    results.blocked > 0 ? row('Newly marked bounced', results.blocked, '#FF4279') : '',
    timedOut ? row('Status', 'Hit time budget — will resume tomorrow', '#FFA200') : '',
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:${FONT_FAMILY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background:#fff;">
    <tr><td style="background:linear-gradient(90deg,#80388F,#FF4279,#FFA200);height:4px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td style="padding:28px 36px 0;">
      <p style="margin:0 0 4px;font-size:12px;color:rgba(0,0,0,0.35);text-transform:uppercase;letter-spacing:0.1em;">ZeroBounce verification</p>
      <p style="margin:0;font-size:22px;color:#221C2B;letter-spacing:-0.02em;">Daily sweep ${timedOut ? 'partial' : 'complete'}</p>
    </td></tr>
    <tr><td style="padding:16px 36px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
    <tr><td style="padding:20px 36px;border-top:1px solid rgba(0,0,0,0.06);">
      <p style="margin:0;font-size:13px;color:rgba(0,0,0,0.35);"><a href="${adminUrl}" style="color:#9B51E0;text-decoration:none;">Open Command Centre</a></p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

  await resend.emails.send({
    from: 'Mutomorro System <hello@mutomorro.com>',
    to: [to],
    subject: `ZeroBounce sweep: ${processed} verified${remaining > 0 ? `, ${remaining} pending` : ''}`,
    html,
  })
}

async function sendCreditsAlertEmail(resend, to, { runStartedAt, runFinishedAt, processed, remaining, results }) {
  const adminUrl = 'https://mutomorro.com/admin/newsletter'
  const rows = [
    row('Started', runStartedAt.toISOString()),
    row('Duration before halt', formatDuration(runStartedAt, runFinishedAt)),
    row('Processed before halt', processed),
    row('Unverified', remaining, '#FF4279'),
    row('Valid', results.valid),
    row('Invalid', results.invalid),
    row('Unknown', results.unknown),
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:${FONT_FAMILY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background:#fff;">
    <tr><td style="padding:24px 32px;background:rgba(255,66,121,0.08);border-left:3px solid #FF4279;">
      <p style="margin:0 0 8px;font-size:14px;color:#FF4279;font-weight:400;">ZeroBounce credits exhausted</p>
      <p style="margin:0;font-size:15px;color:#221C2B;line-height:1.5;">The daily verification cron halted because ZeroBounce returned an out-of-credits response. Top up the account and re-run the cron before the next send.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
      <a href="${adminUrl}" style="color:#9B51E0;font-size:13px;text-decoration:none;">Open Command Centre</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

  await resend.emails.send({
    from: 'Mutomorro System <hello@mutomorro.com>',
    to: [to],
    subject: `ALERT: ZeroBounce credits exhausted — ${remaining} contacts unverified`,
    html,
  })
}
