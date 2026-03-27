/**
 * Hot tender alert emails
 *
 * Sends immediate individual emails for tenders scoring 60+.
 * These go out during the pipeline run, not waiting for the daily digest.
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

/**
 * Format a date as "27 Mar 2026"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function formatValue(low, high) {
  if (!low && !high) return 'Not specified'
  const fmt = (n) => '£' + Number(n).toLocaleString('en-GB')
  if (low && high && low !== high) return `${fmt(low)} - ${fmt(high)}`
  return fmt(low || high)
}

function escHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Build the hot alert email HTML.
 */
function buildHotAlertHtml(tender) {
  const days = daysUntil(tender.deadline)
  const deadlineText = tender.deadline
    ? `${formatDate(new Date(tender.deadline))}${days !== null ? ` (${days} days remaining)` : ''}`
    : 'Not specified'

  const aiSection = tender.ai_summary ? `
    <tr><td style="padding:16px 0 8px;font-size:14px;font-weight:bold;color:#111827;">AI Assessment${tender.ai_score ? ` (${tender.ai_score}/10)` : ''}:</td></tr>
    <tr><td style="font-size:14px;color:#374151;padding-bottom:8px;">${escHtml(tender.ai_summary)}</td></tr>` : ''

  const keywordsLine = tender.keywords_matched?.length
    ? `<tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">Keywords: ${escHtml(tender.keywords_matched.join(', '))}</td></tr>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border:1px solid #E5E7EB;max-width:600px;">
        <tr><td style="padding:24px 28px 12px;background-color:#FEF2F2;border-bottom:3px solid #DC2626;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:18px;font-weight:bold;color:#DC2626;">🔴 HOT TENDER ALERT</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 28px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:20px;font-weight:bold;color:#111827;padding-bottom:12px;">${escHtml(tender.title)}</td></tr>
            <tr><td style="font-size:14px;color:#6B7280;padding:3px 0;">Organisation: ${escHtml(tender.organisation || 'Not specified')}</td></tr>
            ${tender.sector ? `<tr><td style="font-size:14px;color:#6B7280;padding:3px 0;">Sector: ${escHtml(tender.sector)}</td></tr>` : ''}
            <tr><td style="font-size:14px;color:#6B7280;padding:3px 0;">Value: ${formatValue(tender.value_low, tender.value_high)}</td></tr>
            <tr><td style="font-size:14px;color:#6B7280;padding:3px 0;">Deadline: ${deadlineText}</td></tr>
            <tr><td style="font-size:14px;color:#6B7280;padding:3px 0;">Source: ${escHtml(tender.source)}</td></tr>
            ${aiSection}
            ${keywordsLine}
            <tr><td style="font-size:13px;color:#9CA3AF;padding:8px 0 0;">
              Keyword: ${tender.keyword_score || 0} · Sector: ${tender.sector_score || 0} · Value: ${tender.value_score || 0}${tender.ai_score ? ` · AI: ${tender.ai_score}/10` : ''} · Total: ${tender.total_score}
            </td></tr>
            ${tender.source_url ? `
            <tr><td style="padding-top:20px;">
              <a href="${escHtml(tender.source_url)}" style="display:inline-block;background-color:#DC2626;color:#FFFFFF;padding:12px 28px;font-size:14px;font-weight:bold;text-decoration:none;">View tender →</a>
            </td></tr>` : ''}
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px;background-color:#F9FAFB;border-top:1px solid #E5E7EB;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:12px;color:#9CA3AF;">
              <a href="https://mutomorro.com/admin/tenders" style="color:#9B51E0;text-decoration:none;">Review in Command Centre</a> · Mutomorro Tender Finder
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Send a hot alert email for a single tender.
 * Updates notified_at in Supabase to prevent re-alerting.
 *
 * @param {Object} tender - The hot tender object (with id)
 */
export async function sendHotAlert(tender) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const subject = `🔴 Hot tender: ${tender.title.slice(0, 80)}`
  const html = buildHotAlertHtml(tender)

  const { error } = await resend.emails.send({
    from: 'Mutomorro Tenders <hello@mutomorro.com>',
    to: 'james@mutomorro.com',
    subject,
    html,
  })

  if (error) {
    console.error(`  Hot alert send failed: ${error.message}`)
    return
  }

  // Mark as notified
  if (tender.id) {
    await supabase
      .from('tenders')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', tender.id)
  }

  console.log(`  🔴 Hot alert sent: ${tender.title.slice(0, 60)}`)
}

/**
 * Send hot alerts for all unnotified hot tenders in a batch.
 *
 * @param {Array} tenders - Scored tenders from the pipeline
 * @returns {number} Number of alerts sent
 */
export async function sendHotAlerts(tenders) {
  const hotUnnotified = tenders.filter(t =>
    t.temperature === 'hot' && !t.notified_at
  )

  if (hotUnnotified.length === 0) return 0

  let sent = 0
  for (const tender of hotUnnotified) {
    await sendHotAlert(tender)
    sent++
  }

  return sent
}

export { buildHotAlertHtml }
