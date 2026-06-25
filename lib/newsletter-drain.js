/**
 * Paced newsletter drain — the shared core called by BOTH the cron route
 * (/api/cron/newsletter-drain) and (later) the create-queue inline first tick.
 *
 * One `drainOnce(sendId, { supabase, resend })` call claims and sends as many
 * waves of a single 'draining' send as fit in its time budget, then returns.
 * The cron fires it every minute; the send drains over many ticks. State lives
 * entirely in newsletter_recipients.status via the RPCs from the paced-send
 * migrations (claim_newsletter_wave / reclaim_stuck_waves / mark_wave_sent).
 *
 * Dependencies (supabase, resend) are injected so the test harness can run the
 * real drain against a mock Resend (no emails leave) — see
 * scripts/test-paced-drain.mjs.
 */

import { fetchAllPaginated } from './supabase-paginate.js'

// newsletter-render is imported LAZILY (inside renderForRecipient) because it
// pulls in the JSX email templates; deferring keeps drainOnce importable in a
// plain Node test harness, which injects a stub renderFn instead.

export const DRAIN_CONFIG = {
  WAVE_SIZE: 200,        // approved 150–250; 200 = exactly two batch.send calls
  RESEND_BATCH: 100,     // Resend hard cap per batch.send()
  BATCH_SPACING_MS: 600, // ≥600ms keeps two calls under Resend's 2 req/s default
  CLAIM_TIMEOUT_S: 300,  // reclaim 'claimed' older than 5 min — MUST exceed a
                         // tick's duration so an in-flight wave is never reclaimed
                         // (else a slow/concurrent tick could re-send it)
  TIME_BUDGET_MS: 50_000,// < maxDuration AND < the 60s cron interval (no overlap)
}

const FROM = 'James from Mutomorro <hello@mutomorro.com>'
const SUMMARY_FALLBACK = 'james@mutomorro.com'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function isEditorial(content) {
  return (typeof content?.observationBody === 'string' && content.observationBody.trim() !== '')
    || (Array.isArray(content?.sections) && content.sections.length > 0)
}

/** Render one recipient's email from the frozen content_json snapshot. */
async function renderForRecipient(content, { firstName, email, recipientId, issueKey }) {
  const { renderEditorial, renderPromo, generateUnsubscribeUrl, capitaliseFirstName } =
    await import('./newsletter-render.js')
  const unsubscribeUrl = generateUnsubscribeUrl(email)
  const html = isEditorial(content)
    ? await renderEditorial(content, {
        firstName: capitaliseFirstName(firstName),
        unsubscribeUrl,
        viewInBrowserUrl: `https://mutomorro.com/newsletter/${issueKey}`,
        recipientId,
      })
    : await renderPromo(content, { firstName, unsubscribeUrl, recipientId })
  return { html, unsubscribeUrl }
}

function classifyResendError(error) {
  const name = String(error?.name || '').toLowerCase()
  const msg = String(error?.message || '').toLowerCase()
  const code = error?.statusCode
  if (name.includes('rate_limit') || code === 429 || msg.includes('rate limit')) return 'rate_limit'
  if (name.includes('quota') || msg.includes('quota')) return 'quota'
  return 'other'
}

/** Oldest 'draining' send (FIFO across concurrent issues), or null. */
export async function findActiveDrainingSend(supabase) {
  const { data } = await supabase
    .from('newsletter_sends')
    .select('id, issue_key, subject, content_json, status')
    .eq('status', 'draining')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data || null
}

async function statusCounts(supabase, sendId) {
  const { data } = await supabase.rpc('get_send_status_counts', { p_send_id: sendId })
  const map = {}
  for (const r of (data || [])) map[r.status] = Number(r.count)
  return map
}

/**
 * Drain one send for up to budgetMs. Returns a summary; never throws on a
 * single bad recipient or a transient Resend error (those leave the row
 * 'claimed' for the next tick to reclaim).
 */
export async function drainOnce(sendId, opts = {}) {
  const { supabase, resend } = opts
  const budgetMs = opts.budgetMs ?? DRAIN_CONFIG.TIME_BUDGET_MS
  // Reclaim lease age. Override (e.g. 0) only in tests to exercise reclaim fast.
  const claimTimeoutS = opts.claimTimeoutS ?? DRAIN_CONFIG.CLAIM_TIMEOUT_S
  // Test harness injects a stub renderFn to avoid loading the JSX templates.
  const renderFn = opts.renderFn || renderForRecipient
  const log = opts.log || (() => {})
  const startMs = Date.now()

  const { data: send } = await supabase
    .from('newsletter_sends')
    .select('id, issue_key, subject, content_json, status')
    .eq('id', sendId)
    .maybeSingle()
  if (!send) return { sendId, error: 'send not found' }
  if (send.status !== 'draining') return { sendId, status: send.status, skipped: 'not draining' }

  const { content_json: content, subject, issue_key: issueKey } = send

  await supabase.from('newsletter_sends')
    .update({ drain_heartbeat_at: new Date().toISOString() })
    .eq('id', sendId)

  await supabase.rpc('reclaim_stuck_waves', {
    p_send_id: sendId, p_timeout_secs: claimTimeoutS,
  })

  let sent = 0, failed = 0, waves = 0, timedOut = false, paused = false

  while (true) {
    if (Date.now() - startMs > budgetMs) { timedOut = true; break }

    const { data: wave, error: claimErr } = await supabase.rpc('claim_newsletter_wave', {
      p_send_id: sendId, p_wave_size: DRAIN_CONFIG.WAVE_SIZE,
    })
    if (claimErr) { log(`claim error: ${claimErr.message}`); break }

    if (!wave || wave.length === 0) {
      const counts = await statusCounts(supabase, sendId)
      if ((counts.queued || 0) === 0 && (counts.claimed || 0) === 0) {
        await finalize(supabase, resend, send)
        return { sendId, status: 'complete', sent, failed, waves, timedOut: false }
      }
      // Rows still claimed elsewhere (in-flight or awaiting reclaim) — stop.
      break
    }
    waves++

    // Render the wave. A render error is deterministic for that contact, so
    // mark it failed (terminal) rather than retrying forever.
    const renderable = []
    for (const row of wave) {
      try {
        const r = await renderFn(content, {
          firstName: row.first_name, email: row.email, recipientId: row.id, issueKey,
        })
        renderable.push({ id: row.id, email: row.email, ...r })
      } catch (e) {
        failed++
        await supabase.from('newsletter_recipients')
          .update({ status: 'failed', claimed_at: null, error: `render: ${String(e?.message || e)}`.slice(0, 400) })
          .eq('id', row.id)
        log(`render failed for ${row.id}: ${e?.message || e}`)
      }
    }

    for (let i = 0; i < renderable.length; i += DRAIN_CONFIG.RESEND_BATCH) {
      if (Date.now() - startMs > budgetMs) { timedOut = true; break }
      const chunk = renderable.slice(i, i + DRAIN_CONFIG.RESEND_BATCH)
      const minId = chunk.reduce((m, r) => (r.id < m ? r.id : m), chunk[0].id)

      const payloads = chunk.map((r) => ({
        from: FROM,
        to: [r.email],
        subject,
        html: r.html,
        headers: {
          'List-Unsubscribe': `<${r.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [
          { name: 'newsletter_send_id', value: sendId },
          { name: 'type', value: 'newsletter' },
        ],
      }))

      let resendData, resendError
      try {
        ({ data: resendData, error: resendError } = await resend.batch.send(
          payloads, { idempotencyKey: `${sendId}:${minId}` }
        ))
      } catch (e) {
        log(`batch.send threw: ${e?.message || e}`)
        break // leave chunk 'claimed'; reclaimed next tick
      }

      if (resendError) {
        const kind = classifyResendError(resendError)
        if (kind === 'rate_limit') { log('rate limited; ending tick'); timedOut = true; break }
        if (kind === 'quota') {
          await supabase.from('newsletter_sends')
            .update({ status: 'paused_quota', failure_reason: `Resend quota: ${resendError.name || resendError.message}` })
            .eq('id', sendId)
          await sendDrainEmail(resend, supabase, send, { paused: true, sent, reason: resendError.name || resendError.message })
          paused = true; break
        }
        log(`batch error (${kind}): ${resendError.message || resendError.name}`)
        break // unknown — leave 'claimed'
      }

      const results = resendData?.data || resendData || []
      const ids = [], resendIds = []
      for (let j = 0; j < chunk.length; j++) {
        const rid = Array.isArray(results) ? results[j]?.id : null
        if (rid) { ids.push(chunk[j].id); resendIds.push(rid) }
      }
      if (ids.length > 0) {
        const { error: markErr } = await supabase.rpc('mark_wave_sent', {
          p_recipient_ids: ids, p_resend_ids: resendIds, p_sent_at: new Date().toISOString(),
        })
        if (markErr) log(`mark_wave_sent error: ${markErr.message}`)
        else sent += ids.length
      }
      // Partial: rows with no returned id stay 'claimed' → reclaimed next tick.

      if (i + DRAIN_CONFIG.RESEND_BATCH < renderable.length) await sleep(DRAIN_CONFIG.BATCH_SPACING_MS)
    }

    if (timedOut || paused) break
  }

  return { sendId, status: paused ? 'paused_quota' : 'draining', sent, failed, waves, timedOut }
}

async function finalize(supabase, resend, send) {
  // total_sent is DERIVED from the durable resend_id marker (never the mutable
  // status, never a per-wave increment) so retries/reclaims can't over-count.
  const { count } = await supabase
    .from('newsletter_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('send_id', send.id)
    .not('resend_id', 'is', null)

  await supabase.from('newsletter_sends')
    .update({ status: 'complete', total_sent: count || 0, completed_at: new Date().toISOString() })
    .eq('id', send.id)

  await reconcileSend(send.id, { supabase, resend })
  await sendDrainEmail(resend, supabase, send, { complete: true, sent: count || 0 })
  // NOTE: calendar_items 'published' marking is intentionally not done here (the
  // send row doesn't carry the calendar_item_id). The public archive is gated by
  // newsletter_sends.is_public, which create-queue already set. Cutover follow-up.
}

/**
 * Post-send reconciliation (spec §8). Asserts ONE send per contact across the
 * whole issue_key's send set (the (send_id, contact_id) unique constraint
 * already forbids within-send dupes; this catches cross-batch ones) and that
 * nobody owed the issue was missed. Anchors on the durable resend_id, never the
 * mutable status. Writes reconciled_at on a clean pass; alerts on any dupe/miss.
 */
export async function reconcileSend(sendId, { supabase, resend } = {}) {
  const { data: send } = await supabase
    .from('newsletter_sends')
    .select('id, issue_key, subject, total_recipients')
    .eq('id', sendId)
    .maybeSingle()
  if (!send) return { ok: false, reason: 'send not found' }

  const { data: siblings } = await supabase
    .from('newsletter_sends').select('id').eq('issue_key', send.issue_key)
  const sendIds = (siblings || []).map((s) => s.id)

  // One-send-per-contact across the issue. Paginated with a stable unique
  // ORDER BY (send_id, contact_id) so a page boundary can't skip a row.
  const delivered = await fetchAllPaginated((from, to) => supabase
    .from('newsletter_recipients')
    .select('contact_id')
    .in('send_id', sendIds)
    .not('resend_id', 'is', null)
    .order('send_id', { ascending: true })
    .order('contact_id', { ascending: true })
    .range(from, to))
  const seen = new Map()
  for (const r of delivered) seen.set(r.contact_id, (seen.get(r.contact_id) || 0) + 1)
  const dupContacts = [...seen.values()].filter((n) => n > 1).length

  // Miss-delta for this send: everyone owed ends up sent, skipped, or failed.
  const counts = await statusCounts(supabase, sendId)
  const { count: deliveredThis } = await supabase
    .from('newsletter_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('send_id', sendId)
    .not('resend_id', 'is', null)
  const expected = (send.total_recipients || 0) - (counts.skipped || 0) - (counts.failed || 0)
  const missing = expected - (deliveredThis || 0)

  const ok = dupContacts === 0 && missing <= 0
  if (ok) {
    await supabase.from('newsletter_sends')
      .update({ reconciled_at: new Date().toISOString() })
      .eq('id', sendId)
  } else if (resend) {
    await sendReconcileAlert(resend, supabase, send, { dupContacts, missing })
  }
  return { ok, dupContacts, missing }
}

async function sendReconcileAlert(resend, supabase, send, { dupContacts, missing }) {
  let to
  try { to = await resolveSummaryEmail(supabase) } catch { to = SUMMARY_FALLBACK }
  const issues = [
    dupContacts > 0 ? `${dupContacts} contact(s) received this issue more than once` : '',
    missing > 0 ? `${missing} contact(s) owed the issue were not delivered` : '',
  ].filter(Boolean).join('; ')
  const html = `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#FAF6F1;font-family:'Source Sans 3',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;">
    <tr><td style="padding:24px 32px;background:rgba(255,66,121,0.08);border-left:3px solid #FF4279;">
      <p style="margin:0 0 8px;font-size:14px;color:#FF4279;font-weight:400;">Newsletter reconciliation found a problem</p>
      <p style="margin:0;font-size:15px;color:#221C2B;line-height:1.5;">${escapeHtml(issues)}</p>
    </td></tr>
    <tr><td style="padding:16px 32px;">
      <p style="margin:0;font-size:13px;color:rgba(0,0,0,0.6);">Issue: ${escapeHtml(send.issue_key || '')}<br/>Subject: ${escapeHtml(send.subject || '')}</p>
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
      <a href="https://mutomorro.com/admin/newsletter" style="color:#9B51E0;font-size:13px;text-decoration:none;">Open Command Centre</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`
  try {
    await resend.emails.send({ from: 'Mutomorro System <hello@mutomorro.com>', to: [to], subject: `ALERT: Newsletter reconciliation — ${send.subject}`, html })
  } catch (err) {
    console.error('drain: reconcile alert email failed:', err?.message || err)
  }
}

async function resolveSummaryEmail(supabase) {
  const { data } = await supabase.from('newsletter_config').select('summary_email').limit(1).maybeSingle()
  return data?.summary_email || SUMMARY_FALLBACK
}

async function sendDrainEmail(resend, supabase, send, { complete, paused, sent, reason }) {
  let to
  try { to = await resolveSummaryEmail(supabase) } catch { to = SUMMARY_FALLBACK }
  const title = paused ? 'Newsletter send paused (Resend quota)' : 'Newsletter send complete'
  const subject = paused
    ? `PAUSED: Newsletter — ${send.subject}`
    : `Newsletter: ${sent} sent — ${send.subject}`
  const accent = paused ? '#FF4279' : '#80388F'
  const html = `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#FAF6F1;font-family:'Source Sans 3',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;">
    <tr><td style="background:${accent};height:4px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td style="padding:24px 32px;">
      <p style="margin:0 0 8px;font-size:12px;color:rgba(0,0,0,0.35);text-transform:uppercase;letter-spacing:0.1em;">${title}</p>
      <p style="margin:0 0 12px;font-size:20px;color:#221C2B;">${escapeHtml(send.subject || '')}</p>
      <p style="margin:0;font-size:14px;color:rgba(0,0,0,0.6);">Issue: ${escapeHtml(send.issue_key || '')}<br/>Sent: ${sent}${reason ? `<br/>Reason: ${escapeHtml(String(reason))}` : ''}</p>
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
      <a href="https://mutomorro.com/admin/newsletter" style="color:#9B51E0;font-size:13px;text-decoration:none;">Open Command Centre</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`
  try {
    await resend.emails.send({ from: 'Mutomorro System <hello@mutomorro.com>', to: [to], subject, html })
  } catch (err) {
    console.error('drain: summary email failed:', err?.message || err)
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
