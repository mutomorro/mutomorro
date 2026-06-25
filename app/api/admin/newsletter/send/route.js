/**
 * Manual newsletter send.
 *
 * POST creates a newsletter_sends row and recipient queue, then runs the
 * actual delivery in the background via `after()`. The UI polls
 * /api/admin/newsletter/send/[id]/status to display progress.
 *
 * Safety rails — every one of these must remain in place:
 *   - Pagination (fetchAllPaginated) for any contact / recipient query
 *   - Dedup by issue_key (only 'delivered'-bucket statuses count as sent;
 *     'queued' rows from a stuck/timed-out previous send remain retryable)
 *   - Independent dedup-assertion query before delivery starts
 *   - Auto-recovery of stuck 'sending' rows older than 15 minutes
 *   - 10%-stale gate: refuse the send if too much of the audience has
 *     stale or missing zb_verified_at (the daily ZB cron is the source of
 *     truth — inline ZB was removed after the Drift-v1 timeout incident)
 *   - Domain exclusions (when newsletter_config.domain_exclusions_enabled)
 *   - Per-recipient rendering with unique signed unsubscribe URLs
 *   - issue_key uniqueness validated up front
 *   - Resend batches of RESEND_BATCH_SIZE with a short inter-batch pause
 *   - Bulk RPC per batch (mark_newsletter_recipients_sent) — one DB round
 *     trip per batch instead of one per recipient
 *   - Calendar item marked as 'published' after successful editorial send
 *   - Summary email to james@mutomorro.com
 */

import { NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import {
  loadEditorialContentFromCalendar,
  renderEditorial,
  renderPromo,
  generateUnsubscribeUrl,
  capitaliseFirstName,
  formatDate,
  slugify,
} from '../../../../../lib/newsletter-render.js'
import {
  fetchAudienceContacts,
} from '../../../../../lib/newsletter-audiences.js'
import { fetchAllPaginated } from '../../../../../lib/supabase-paginate.js'
import { drainOnce } from '../../../../../lib/newsletter-drain.js'

export const maxDuration = 800

const BLOCKED_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail'])
const STALE_DAYS = 30
// Resend's batch endpoint accepts up to 100 messages per call.
const RESEND_BATCH_SIZE = 100
// Brief inter-batch breather. Was 2000ms — Resend handles 100/req without
// rate-limit issues so this was over-conservative.
const RESEND_BATCH_PAUSE_MS = 500
const SUMMARY_RECIPIENT = 'james@mutomorro.com'
// Recipient statuses that mean an email actually went out. Anything else
// (notably 'queued') means the send never completed for that contact and they
// must be eligible for retry.
const DELIVERED_STATUSES = ['sent', 'delivered', 'opened', 'clicked', 'bounced']
// Paced create-queue: sends at or below this drain inline (finish in the
// request); the cron mops up anything left.
const INLINE_SEND_THRESHOLD = 250
const INLINE_DRAIN_BUDGET_MS = 15_000

const EXCLUDED_DOMAIN_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2,3}$/i,
  /\.ac\.uk$/i,
  /\.ac\.[a-z]{2,3}$/i,
  /\.gov$/i,
  /\.gov\.[a-z]{2,3}$/i,
  /\.mil$/i,
]

function isExcludedDomain(email) {
  return EXCLUDED_DOMAIN_PATTERNS.some(p => p.test(email))
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  const supabase = client()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Auto-recover stuck sends: any newsletter_sends row in 'sending' for
  // more than 15 minutes is marked failed before we start a new send.
  // Function timeouts orphan rows here; the dedup check would otherwise
  // block retries against them.
  const stuckThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { data: stuckRows } = await supabase
    .from('newsletter_sends')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      failure_reason: 'Auto-failed: stuck in sending for >15min (likely function timeout).',
    })
    .eq('status', 'sending')
    .lt('created_at', stuckThreshold)
    .select('id')
  if (stuckRows && stuckRows.length > 0) {
    console.log(`Newsletter send: auto-recovered ${stuckRows.length} stuck send(s)`)
  }

  // Recover paced sends whose drain cron has gone silent (E2): a 'draining' row
  // whose heartbeat is stale (or never stamped well after creation) means the
  // cron stopped. Flip to failed so the operator notices and dedup unblocks.
  const hbStale = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const neverStamped = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: stuckDraining } = await supabase
    .from('newsletter_sends')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      failure_reason: 'Auto-failed: draining with no recent drain-cron heartbeat (cron stopped).',
    })
    .eq('status', 'draining')
    .or(`drain_heartbeat_at.lt.${hbStale},and(drain_heartbeat_at.is.null,created_at.lt.${neverStamped})`)
    .select('id')
  if (stuckDraining && stuckDraining.length > 0) {
    console.log(`Newsletter send: auto-recovered ${stuckDraining.length} stuck draining send(s)`)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    template,
    content = {},
    subject: subjectOverride,
    previewText: previewOverride,
    audienceId,
    issueKey: issueKeyInput,
    confirmTestSent,
  } = body

  if (!confirmTestSent) {
    return NextResponse.json(
      { error: 'You must confirm a test was sent and reviewed before sending to an audience.' },
      { status: 400 }
    )
  }

  if (!audienceId) {
    return NextResponse.json({ error: 'audienceId is required' }, { status: 400 })
  }

  // Cutover flag (default 'legacy' = the synchronous burst). When 'paced', POST
  // only validates + snapshots content + materialises the 'queued' recipient
  // rows, and the drain cron sends them. The legacy burst stays one flag-flip
  // (or revert) away for rollback.
  const pacedMode = process.env.NEWSLETTER_SEND_MODE === 'paced'

  // ─── 1. Resolve template + content ────────────────────────────────
  let resolvedSubject = ''
  let resolvedPreview = ''
  let editorialItem = null
  let editorialContent = null
  let promoContent = null

  if (template === 'editorial') {
    const loaded = await loadEditorialContentFromCalendar(supabase, content.calendarItemId)
    if (!loaded.ok) {
      return NextResponse.json({ error: loaded.reason }, { status: 400 })
    }
    editorialItem = loaded.item
    editorialContent = {
      ...loaded.content,
      subject: subjectOverride ?? loaded.content.subject,
      previewText: previewOverride ?? loaded.content.previewText,
    }
    resolvedSubject = editorialContent.subject
    resolvedPreview = editorialContent.previewText
  } else if (template === 'promo') {
    const required = ['subject', 'previewText', 'headline', 'body', 'ctaText', 'ctaUrl']
    for (const k of required) {
      if (!content[k] || String(content[k]).trim() === '') {
        return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 })
      }
    }
    promoContent = {
      ...content,
      subject: subjectOverride ?? content.subject,
      previewText: previewOverride ?? content.previewText,
    }
    resolvedSubject = promoContent.subject
    resolvedPreview = promoContent.previewText
  } else {
    return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
  }

  // ─── 2. Resolve issue_key ────────────────────────────────────────
  let issueKey = issueKeyInput && issueKeyInput.trim()
  if (!issueKey) {
    if (template === 'editorial') {
      const lastTag = Array.isArray(editorialItem.tags) && editorialItem.tags.length > 0
        ? editorialItem.tags[editorialItem.tags.length - 1]
        : slugify(resolvedSubject)
      issueKey = `${slugify(lastTag)}-v1`
    } else {
      issueKey = `promo-${slugify(resolvedSubject)}-v1`
    }
  }
  issueKey = slugify(issueKey)

  // ─── 3. Validate issue_key uniqueness ────────────────────────────
  // It's fine if a previous newsletter_sends row exists with the same
  // issue_key (multi-batch sends use it intentionally for dedup) - but we
  // refuse if every contact in the requested audience would already be
  // dedup'd out. The existence check lives further down once we know the
  // audience.

  // ─── 4. Load audience + config ───────────────────────────────────
  const { data: audience, error: audErr } = await supabase
    .from('newsletter_audiences')
    .select('*')
    .eq('id', audienceId)
    .maybeSingle()

  if (audErr || !audience) {
    return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
  }

  const { data: config } = await supabase
    .from('newsletter_config')
    .select('domain_exclusions_enabled')
    .limit(1)
    .maybeSingle()

  // ─── 5. Fetch audience (paginated) ───────────────────────────────
  let audienceContacts
  try {
    audienceContacts = await fetchAudienceContacts(
      supabase,
      audience.filter_definition,
      'id, signup_email, first_name, zb_status, zb_verified_at'
    )
  } catch (e) {
    console.error('Audience fetch failed:', e)
    return NextResponse.json({ error: 'Failed to fetch audience contacts' }, { status: 500 })
  }

  // Defensive dedup: collapse any duplicate contacts to one row each. A
  // duplicate here (unstable pagination order, overlapping compound filters,
  // etc.) would otherwise trip the newsletter_recipients (send_id, contact_id)
  // unique constraint and abort the entire send at the insert step. Also keeps
  // total_recipients honest.
  {
    const seenContactIds = new Set()
    audienceContacts = audienceContacts.filter((c) => {
      if (seenContactIds.has(c.id)) return false
      seenContactIds.add(c.id)
      return true
    })
  }

  // ─── 6. Dedup against previous sends with same issue_key ────────
  const { data: matchingSends } = await supabase
    .from('newsletter_sends')
    .select('id')
    .eq('issue_key', issueKey)
    .order('id', { ascending: true })

  const matchingSendIds = (matchingSends || []).map(s => s.id)
  // Legacy treats only 'delivered'-bucket rows as already-sent ('queued' rows
  // from a stuck burst are retryable). Paced additionally excludes contacts
  // already 'queued'/'claimed' in a sibling send of this issue (the drain
  // resumes those from the original send) plus 'complained' — so a re-POST can
  // never cross-batch-duplicate a contact who is already in flight.
  const dedupStatuses = pacedMode
    ? ['queued', 'claimed', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained']
    : DELIVERED_STATUSES
  let alreadySentIds = new Set()
  if (matchingSendIds.length > 0) {
    // Paginated fetch needs a stable, unique ORDER BY (CLAUDE.md gotcha) or a
    // page boundary can skip a contact — which would let an already-sent
    // recipient back into the audience. (send_id, contact_id) is unique.
    const alreadySent = await fetchAllPaginated((from, to) => supabase
      .from('newsletter_recipients')
      .select('contact_id')
      .in('send_id', matchingSendIds)
      .in('status', dedupStatuses)
      .order('send_id', { ascending: true })
      .order('contact_id', { ascending: true })
      .range(from, to)
    )
    alreadySentIds = new Set(alreadySent.map(r => r.contact_id))
  }

  // ─── 7. Filter: not-already-sent, not-blocked, not-excluded-domain ──
  let domainExcludedCount = 0
  const eligible = []
  for (const c of audienceContacts) {
    if (!c.signup_email) continue
    if (alreadySentIds.has(c.id)) continue
    if (BLOCKED_STATUSES.has(c.zb_status)) continue
    if (config?.domain_exclusions_enabled && isExcludedDomain(c.signup_email)) {
      domainExcludedCount++
      continue
    }
    eligible.push(c)
  }

  if (eligible.length === 0) {
    return NextResponse.json({
      error: 'All contacts in this audience have already received this issue (or are otherwise excluded).',
      audienceSize: audienceContacts.length,
      alreadySent: alreadySentIds.size,
      domainExcluded: domainExcludedCount,
    }, { status: 400 })
  }

  // ─── 7b. Stale-verification gate ─────────────────────────────────
  // The daily ZB cron is the source of truth for zb_status. If more than 10%
  // of the audience is stale or unverified, refuse the send. We deliberately
  // do not fall back to inline ZeroBounce here — that's the path that caused
  // the Drift-v1 function timeout. Operator should trigger the cron first.
  const staleThresholdMs = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000
  let staleCount = 0
  for (const c of eligible) {
    const t = c.zb_verified_at ? new Date(c.zb_verified_at).getTime() : 0
    if (!t || t < staleThresholdMs) staleCount++
  }
  const stalePct = (staleCount / eligible.length) * 100
  if (stalePct > 10) {
    return NextResponse.json({
      error: `${stalePct.toFixed(1)}% of the audience (${staleCount}/${eligible.length}) has stale or missing ZeroBounce verification. Trigger the daily ZB cron before sending.`,
      staleCount,
      eligibleCount: eligible.length,
      stalePct: Number(stalePct.toFixed(1)),
      cronPath: '/api/cron/zerobounce-verify',
    }, { status: 409 })
  }

  // ─── 8. Create the newsletter_sends row + snapshot content ────────
  const sendPayload = {
    subject: resolvedSubject,
    issue_key: issueKey,
    preview_text: resolvedPreview,
    content_json: template === 'editorial' ? editorialContent : promoContent,
    status: pacedMode ? 'draining' : 'sending',
    total_recipients: eligible.length,
    // Editorial sends carry their calendar item so the drain's finalize() can
    // mark it 'published' (the paced path has no in-memory editorialItem like
    // the legacy runSend did). Promo sends have no calendar item → null.
    calendar_item_id: template === 'editorial' ? (editorialItem?.id || null) : null,
  }

  const { data: send, error: sendErr } = await supabase
    .from('newsletter_sends')
    .insert(sendPayload)
    .select('id')
    .single()

  if (sendErr) {
    console.error('Failed to create send row:', sendErr)
    return NextResponse.json({ error: 'Failed to create send record' }, { status: 500 })
  }
  const sendId = send.id

  // ─── PACED: materialise the queue synchronously and return ────────
  // No render, no Resend here — the drain cron claims and sends these rows.
  if (pacedMode) {
    const recipientRows = eligible.map(c => ({
      send_id: sendId,
      contact_id: c.id,
      email: c.signup_email,
      status: 'queued',
    }))
    // Idempotent on (send_id, contact_id) — a replay never duplicates a row.
    // Chunked to keep each round trip bounded for large audiences.
    const CHUNK = 1000
    for (let i = 0; i < recipientRows.length; i += CHUNK) {
      const { error: insErr } = await supabase
        .from('newsletter_recipients')
        .upsert(recipientRows.slice(i, i + CHUNK), {
          onConflict: 'send_id,contact_id',
          ignoreDuplicates: true,
        })
      if (insErr) {
        console.error('create-queue: recipient insert failed:', insErr)
        await supabase
          .from('newsletter_sends')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            failure_reason: `create-queue insert failed: ${insErr.message || insErr}`,
          })
          .eq('id', sendId)
        return NextResponse.json({ error: 'Failed to materialise the send queue' }, { status: 500 })
      }
    }

    // Tiny sends: drain inline so they finish in the request; the cron mops up
    // any remainder. Same claim_newsletter_wave SKIP LOCKED, so a coincident
    // cron tick is the ordinary A2 case.
    if (eligible.length <= INLINE_SEND_THRESHOLD) {
      try {
        await drainOnce(sendId, { supabase, resend, budgetMs: INLINE_DRAIN_BUDGET_MS })
      } catch (e) {
        console.error('create-queue: inline drain failed (cron will continue):', e?.message || e)
      }
    }

    return NextResponse.json({
      sendId,
      status: 'draining',
      total: eligible.length,
      issueKey,
      audienceName: audience.name,
    })
  }

  // ─── LEGACY: kick off the synchronous burst after the response. The
  // status endpoint reads the row and recipient table for live progress.
  after(async () => {
    try {
      await runSend({
        supabase,
        resend,
        sendId,
        template,
        editorialItem,
        editorialContent,
        promoContent,
        resolvedSubject,
        resolvedPreview,
        issueKey,
        eligible,
        matchingSendIds,
        audienceName: audience.name,
        domainExcludedCount,
      })
    } catch (err) {
      console.error('Newsletter send background task failed:', err)
      await supabase
        .from('newsletter_sends')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          failure_reason: `Unhandled exception in runSend: ${err?.message || err}`,
        })
        .eq('id', sendId)
    }
  })

  return NextResponse.json({
    sendId,
    status: 'sending',
    total: eligible.length,
    issueKey,
    audienceName: audience.name,
  })
}

async function runSend({
  supabase,
  resend,
  sendId,
  template,
  editorialItem,
  editorialContent,
  promoContent,
  resolvedSubject,
  resolvedPreview,
  issueKey,
  eligible,
  matchingSendIds,
  audienceName,
  domainExcludedCount,
}) {
  // ─── 9. Trust the pre-verified zb_status from the daily cron ─────
  // The inline ZeroBounce phase used to live here. It timed out on Drift-v1.
  // The /api/cron/zerobounce-verify cron now keeps every active contact's
  // zb_status fresh, and POST's 10%-stale gate refuses sends that would
  // otherwise need inline catch-up. Step 7's BLOCKED_STATUSES filter has
  // already excluded any contact with a known-bad status.
  const verified = eligible
  const zbExcluded = []

  if (verified.length === 0) {
    await supabase
      .from('newsletter_sends')
      .update({
        total_sent: 0,
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sendId)
    await sendSummaryEmail(resend, {
      subject: resolvedSubject,
      audienceName,
      issueKey,
      sent: 0,
      excluded: zbExcluded.length + domainExcludedCount,
      total: eligible.length,
    })
    return
  }

  // ─── 10. Independent dedup-assertion query ──────────────────────
  if (matchingSendIds.length > 0) {
    const verifiedIds = verified.map(c => c.id)
    const { data: overlap } = await supabase
      .from('newsletter_recipients')
      .select('contact_id')
      .in('contact_id', verifiedIds)
      .in('send_id', matchingSendIds)
      .in('status', DELIVERED_STATUSES)
      .range(0, 9999)

    if (overlap && overlap.length > 0) {
      const overlapCount = new Set(overlap.map(r => r.contact_id)).size
      const reason = `Dedup assertion failed: ${overlapCount} selected recipient(s) already received issue '${issueKey}'. Send aborted.`
      console.error(reason)

      await supabase
        .from('newsletter_sends')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          failure_reason: reason,
        })
        .eq('id', sendId)

      await sendAlertEmail(resend, {
        subject: resolvedSubject,
        audienceName,
        issueKey,
        reason,
      })
      return
    }
  }

  // ─── 11. Insert recipient rows + render personalised emails ─────
  const recipientInserts = verified.map(c => ({
    send_id: sendId,
    contact_id: c.id,
    email: c.signup_email,
    status: 'queued',
  }))

  const { data: insertedRecipients, error: insertError } = await supabase
    .from('newsletter_recipients')
    .insert(recipientInserts)
    .select('id, contact_id, email')

  if (insertError) {
    console.error('Failed to insert recipients:', insertError)
    await supabase
      .from('newsletter_sends')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        failure_reason: `newsletter_recipients insert failed: ${insertError.message || insertError}`,
      })
      .eq('id', sendId)
    return
  }

  const recipientMap = new Map()
  for (const r of insertedRecipients) recipientMap.set(r.contact_id, r)

  const viewInBrowserUrl = `https://mutomorro.com/newsletter/${issueKey}`

  const emails = await Promise.all(verified.map(async (contact) => {
    const recipient = recipientMap.get(contact.id)
    const recipientId = recipient?.id || ''
    const unsubscribeUrl = generateUnsubscribeUrl(contact.signup_email)
    const firstName = capitaliseFirstName(contact.first_name)

    const html = template === 'editorial'
      ? await renderEditorial(editorialContent, {
          firstName,
          unsubscribeUrl,
          viewInBrowserUrl,
          recipientId,
        })
      : await renderPromo(promoContent, { firstName, unsubscribeUrl, recipientId })

    return {
      email: contact.signup_email,
      contactId: contact.id,
      recipientId,
      html,
      unsubscribeUrl,
    }
  }))

  // ─── 12. Send via Resend in batches of RESEND_BATCH_SIZE ────────
  let totalSent = 0
  for (let chunk = 0; chunk < emails.length; chunk += RESEND_BATCH_SIZE) {
    const batch = emails.slice(chunk, chunk + RESEND_BATCH_SIZE)

    const { data: resendData, error: resendError } = await resend.batch.send(
      batch.map(e => ({
        from: 'James from Mutomorro <hello@mutomorro.com>',
        to: [e.email],
        subject: resolvedSubject,
        html: e.html,
        headers: {
          'List-Unsubscribe': `<${e.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [
          { name: 'newsletter_send_id', value: sendId },
          { name: 'type', value: 'newsletter' },
          { name: 'template', value: template },
        ],
      }))
    )

    const now = new Date().toISOString()

    if (resendError) {
      console.error(`Newsletter send: Resend batch error (chunk ${chunk / RESEND_BATCH_SIZE + 1}):`, resendError)
    } else {
      const results = resendData?.data || resendData || []
      // Collect recipient/Resend id pairs from this batch; apply them in a
      // single bulk RPC instead of one round trip per recipient.
      const recipientIds = []
      const resendIds = []
      for (let i = 0; i < batch.length; i++) {
        const resendResult = Array.isArray(results) ? results[i] : null
        const resendId = resendResult?.id || null
        if (resendId) {
          totalSent++
          recipientIds.push(batch[i].recipientId)
          resendIds.push(resendId)
        }
      }
      if (recipientIds.length > 0) {
        const { error: rpcErr } = await supabase.rpc('mark_newsletter_recipients_sent', {
          p_recipient_ids: recipientIds,
          p_resend_ids: resendIds,
          p_sent_at: now,
        })
        if (rpcErr) {
          console.error(`Newsletter send: bulk recipient update failed (chunk ${chunk / RESEND_BATCH_SIZE + 1}):`, rpcErr)
        }
      }
    }

    // Update progress on the send row
    await supabase
      .from('newsletter_sends')
      .update({ total_sent: totalSent })
      .eq('id', sendId)

    // Pause between batches (skip after the last one)
    if (chunk + RESEND_BATCH_SIZE < emails.length) {
      await new Promise(r => setTimeout(r, RESEND_BATCH_PAUSE_MS))
    }
  }

  // ─── 13. Mark send complete ─────────────────────────────────────
  const completedAt = new Date().toISOString()
  await supabase
    .from('newsletter_sends')
    .update({ status: 'complete', total_sent: totalSent, completed_at: completedAt })
    .eq('id', sendId)

  // ─── 14. Update calendar item to 'published' (editorial only) ───
  if (template === 'editorial' && editorialItem?.id) {
    await supabase
      .from('calendar_items')
      .update({
        status: 'published',
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', editorialItem.id)
  }

  // ─── 15. Summary email to james@mutomorro.com ───────────────────
  await sendSummaryEmail(resend, {
    subject: resolvedSubject,
    audienceName,
    issueKey,
    sent: totalSent,
    excluded: zbExcluded.length + domainExcludedCount,
    total: eligible.length,
    zbExcluded: zbExcluded.length,
    domainExcluded: domainExcludedCount,
  })
}

async function sendSummaryEmail(resend, params) {
  const { subject, audienceName, issueKey, sent, excluded, total, zbExcluded, domainExcluded } = params
  const fontFamily = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  const adminUrl = 'https://mutomorro.com/admin/newsletter'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Newsletter sent</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;font-family:${fontFamily};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF6F1;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background:#fff;">
        <tr><td style="background:linear-gradient(90deg,#80388F,#FF4279,#FFA200);height:4px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:rgba(0,0,0,0.35);text-transform:uppercase;letter-spacing:0.1em;">Newsletter sent</p>
          <p style="margin:0;font-size:22px;color:#221C2B;letter-spacing:-0.02em;">${escapeHtml(subject)}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${row('Audience', audienceName)}
            ${row('Issue key', issueKey)}
            ${row('Sent', String(sent), '#221C2B')}
            ${row('Total in batch', String(total))}
            ${typeof zbExcluded === 'number' && zbExcluded > 0 ? row('ZeroBounce excluded', String(zbExcluded)) : ''}
            ${typeof domainExcluded === 'number' && domainExcluded > 0 ? row('Domain excluded', String(domainExcluded)) : ''}
            ${typeof excluded === 'number' && excluded > 0 ? row('Total excluded', String(excluded)) : ''}
            ${row('Sent at', formatDate(new Date()))}
          </table>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="margin:0;font-size:13px;color:rgba(0,0,0,0.35);">
            <a href="${adminUrl}" style="color:#9B51E0;text-decoration:none;">Open Command Centre</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Mutomorro System <hello@mutomorro.com>',
      to: [SUMMARY_RECIPIENT],
      subject: `Newsletter: ${sent} sent — ${subject}`,
      html,
    })
  } catch (err) {
    console.error('Failed to send summary email:', err)
  }
}

async function sendAlertEmail(resend, { subject, audienceName, issueKey, reason }) {
  const adminUrl = 'https://mutomorro.com/admin/newsletter'
  const fontFamily = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  const html = `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:0;background:#FAF6F1;font-family:${fontFamily};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background:#fff;">
    <tr><td style="padding:24px 32px;background:rgba(255,66,121,0.08);border-left:3px solid #FF4279;">
      <p style="margin:0 0 8px;font-size:14px;color:#FF4279;font-weight:400;">Newsletter send aborted</p>
      <p style="margin:0;font-size:15px;color:#221C2B;line-height:1.5;">${escapeHtml(reason)}</p>
    </td></tr>
    <tr><td style="padding:20px 32px;">
      <p style="margin:0 0 4px;font-size:13px;color:rgba(0,0,0,0.5);">Subject: ${escapeHtml(subject)}</p>
      <p style="margin:0 0 4px;font-size:13px;color:rgba(0,0,0,0.5);">Audience: ${escapeHtml(audienceName)}</p>
      <p style="margin:0;font-size:13px;color:rgba(0,0,0,0.5);">Issue key: ${escapeHtml(issueKey)}</p>
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
      <a href="${adminUrl}" style="color:#9B51E0;font-size:13px;text-decoration:none;">Open Command Centre</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

  try {
    await resend.emails.send({
      from: 'Mutomorro System <hello@mutomorro.com>',
      to: [SUMMARY_RECIPIENT],
      subject: `ALERT: Newsletter send aborted — ${subject}`,
      html,
    })
  } catch (err) {
    console.error('Failed to send alert email:', err)
  }
}

function row(label, value, highlightColor) {
  const fontFamily = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  return `<tr>
    <td style="padding:6px 0;font-family:${fontFamily};font-size:14px;color:rgba(0,0,0,0.5);">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-family:${fontFamily};font-size:14px;color:${highlightColor || '#221C2B'};text-align:right;font-weight:${highlightColor ? '400' : '300'};">${escapeHtml(value)}</td>
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
