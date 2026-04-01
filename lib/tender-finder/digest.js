/**
 * Tender digest email builder and sender
 *
 * Builds a clean HTML email summarising hot tenders
 * from the current pipeline run. Sends via Resend.
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

/**
 * Format a date as "27 Mar 2026"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Calculate days until a deadline.
 */
function daysUntil(deadline) {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return days
}

/**
 * Format a value range for display.
 */
function formatValue(low, high) {
  if (!low && !high) return 'Not specified'
  const fmt = (n) => '£' + Number(n).toLocaleString('en-GB')
  if (low && high && low !== high) return `${fmt(low)} - ${fmt(high)}`
  return fmt(low || high)
}

/**
 * Build a single tender row for the digest email.
 */
function tenderRow(tender, showAi = true) {
  const days = daysUntil(tender.deadline)
  const deadlineText = tender.deadline
    ? `${formatDate(new Date(tender.deadline))}${days !== null ? ` (${days} days)` : ''}`
    : 'Not specified'

  const aiLine = showAi && tender.ai_summary
    ? `<tr><td style="padding:2px 0;color:#6B7280;font-size:13px;">AI: ${escHtml(tender.ai_summary)}${tender.ai_score ? ` (${tender.ai_score}/10)` : ''}</td></tr>`
    : ''

  const keywordsLine = tender.keywords_matched?.length
    ? `<tr><td style="padding:2px 0;color:#9CA3AF;font-size:12px;">Keywords: ${escHtml(tender.keywords_matched.join(', '))}</td></tr>`
    : ''

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-bottom:1px solid #F3F4F6;padding-bottom:16px;">
      <tr><td style="font-size:16px;font-weight:bold;color:#111827;padding-bottom:4px;">${escHtml(tender.title)}</td></tr>
      <tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">
        ${escHtml(tender.organisation || 'Organisation not specified')}${tender.sector ? ` · ${escHtml(tender.sector)}` : ''}
      </td></tr>
      <tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">
        Value: ${formatValue(tender.value_low, tender.value_high)} · Deadline: ${deadlineText}
      </td></tr>
      <tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">Source: ${escHtml(tender.source)}</td></tr>
      ${aiLine}
      ${keywordsLine}
      ${tender.source_url ? `<tr><td style="padding-top:6px;"><a href="${escHtml(tender.source_url)}" style="color:#9B51E0;font-size:13px;text-decoration:none;">→ View tender</a></td></tr>` : ''}
    </table>`
}

/**
 * Build a trigger event row (different format - focuses on the signal).
 */
function triggerRow(tender) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-bottom:1px solid #F3F4F6;padding-bottom:12px;">
      <tr><td style="font-size:15px;font-weight:bold;color:#111827;padding-bottom:4px;">${escHtml(tender.title)}</td></tr>
      ${tender.organisation ? `<tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">${escHtml(tender.organisation)}</td></tr>` : ''}
      ${tender.ai_summary ? `<tr><td style="font-size:13px;color:#6B7280;padding:2px 0;">${escHtml(tender.ai_summary)}</td></tr>` : ''}
      ${tender.source_url ? `<tr><td style="padding-top:4px;"><a href="${escHtml(tender.source_url)}" style="color:#9B51E0;font-size:13px;text-decoration:none;">→ Source</a></td></tr>` : ''}
    </table>`
}

/**
 * Escape HTML entities.
 */
function escHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Build the full digest email HTML.
 */
function buildDigestHtml(content, pipelineSummary) {
  const { hot, triggers } = content
  const stats = content.stats

  let sections = ''

  // Hot section
  if (hot.length > 0) {
    sections += `
      <tr><td style="padding:24px 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:18px;font-weight:bold;color:#DC2626;padding-bottom:4px;">🔴 HOT OPPORTUNITIES (${hot.length})</td></tr>
          <tr><td style="border-bottom:2px solid #DC2626;"></td></tr>
        </table>
      </td></tr>
      <tr><td style="padding-top:16px;">
        ${hot.map(t => tenderRow(t, true)).join('')}
      </td></tr>`
  }

  // Trigger events section
  if (triggers.length > 0) {
    sections += `
      <tr><td style="padding:24px 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:18px;font-weight:bold;color:#2563EB;padding-bottom:4px;">🔵 EARLY SIGNALS (${triggers.length})</td></tr>
          <tr><td style="border-bottom:2px solid #2563EB;"></td></tr>
        </table>
      </td></tr>
      <tr><td style="padding-top:16px;">
        ${triggers.map(t => triggerRow(t)).join('')}
      </td></tr>`
  }

  // No hot tenders
  if (hot.length === 0 && triggers.length === 0) {
    sections += `
      <tr><td style="padding:24px 0;color:#6B7280;font-size:15px;">
        No hot tenders found today. ${stats.warm + stats.cool + stats.archived} lower-scoring results stored for reference.
      </td></tr>`
  }

  // Stats section
  const statsBlock = pipelineSummary ? `
    <tr><td style="padding:24px 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:16px;font-weight:bold;color:#6B7280;padding-bottom:4px;">📊 TODAY'S RUN</td></tr>
        <tr><td style="border-bottom:2px solid #E5E7EB;"></td></tr>
      </table>
    </td></tr>
    <tr><td style="padding-top:12px;font-size:13px;color:#6B7280;line-height:1.8;">
      Sources: Contracts Finder (${pipelineSummary.contractsFinder?.fetched || 0}), Find a Tender (${pipelineSummary.findATender?.fetched || 0}), Google Alerts (${pipelineSummary.googleAlerts?.feedsChecked || 0} feeds), Watchlist (${pipelineSummary.watchlist?.checked || 0} URLs)<br>
      New tenders: ${stats.total}<br>
      AI assessments: ${pipelineSummary.aiScoring?.calls || 0}<br>
      Hot: ${stats.hot} · Warm: ${stats.warm} · Cool: ${stats.cool} · Archived: ${stats.archived} · Triggers: ${stats.triggers}
    </td></tr>` : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border:1px solid #E5E7EB;max-width:600px;">
        <tr><td style="padding:32px 28px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:22px;font-weight:bold;color:#111827;">Mutomorro Tender Digest</td></tr>
            <tr><td style="font-size:14px;color:#9CA3AF;padding-top:4px;">${formatDate(new Date())}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${sections}
            ${statsBlock}
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
 * Build digest content from today's tenders in Supabase.
 *
 * @param {string} [sinceDate] - ISO date string. Defaults to start of today.
 * @returns {Object} { hot, warm, triggers, cool, archived, stats }
 */
export async function buildDigest(sinceDate) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (!sinceDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    sinceDate = today.toISOString()
  }

  const { data: tenders, error } = await supabase
    .from('tenders')
    .select('*')
    .gte('found_at', sinceDate)
    .order('total_score', { ascending: false })

  if (error) throw new Error(`Failed to load tenders for digest: ${error.message}`)

  const all = tenders || []
  const hot = all.filter(t => t.temperature === 'hot')
  const warm = all.filter(t => t.temperature === 'warm')
  const triggers = all.filter(t => t.notice_type === 'trigger_event')
  const cool = all.filter(t => t.temperature === 'cool')
  const archived = all.filter(t => t.temperature === 'archived')

  return {
    hot,
    warm,
    triggers,
    cool,
    archived,
    stats: {
      total: all.length,
      hot: hot.length,
      warm: warm.length,
      cool: cool.length,
      archived: archived.length,
      triggers: triggers.length,
    },
  }
}

/**
 * Send the daily digest email via Resend.
 *
 * @param {Object} digestContent - Output from buildDigest()
 * @param {Object} [pipelineSummary] - Pipeline run summary for stats section
 */
export async function sendDigest(digestContent, pipelineSummary) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { stats } = digestContent

  const subject = `Mutomorro Tender Digest - ${formatDate(new Date())} - ${stats.hot} hot`
  const html = buildDigestHtml(digestContent, pipelineSummary)

  const { error } = await resend.emails.send({
    from: 'Mutomorro Tenders <hello@mutomorro.com>',
    to: 'james@mutomorro.com',
    subject,
    html,
  })

  if (error) throw new Error(`Resend digest error: ${error.message}`)

  console.log(`📧 Digest sent: ${subject}`)
}

export { buildDigestHtml, formatDate, formatValue }
