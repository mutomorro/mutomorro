/**
 * Automated daily newsletter send cron job.
 *
 * Schedule: 08:30 UTC = 09:30 BST (UK summer time).
 * Note: when clocks change to GMT in October, this fires at 08:30 UK time.
 *
 * Reads configuration from newsletter_config table.
 * Sends the current newsletter issue to the next batch of eligible contacts.
 * Includes circuit breaker, domain exclusions, and daily summary email.
 */

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createElement } from 'react'
import NewsletterTemplate from '../../../../components/emails/newsletter-template.jsx'
import { verifyEmail } from '../../../../components/email-verification.js'
import { buildSummaryEmail } from '../../../../components/emails/newsletter-summary.js'

export const maxDuration = 300

// TODO: Future - read current issue from newsletter_config or newsletter_sends table.
// For now, hardcoded to Issue 1: "The space between the lines"
const ISSUE_1_CONTENT = {
  subject: 'The space between the lines',
  title: 'Exploring the space between the lines',
  previewText: "We've been fascinated by a single idea for years, because we see it everywhere",
  date: 'March 2026',
  leadText: '',
  signoff: '',
  sections: [
    { type: 'paragraph', text: 'We\'ve been fascinated by a single idea for years, because we see it everywhere. So much so, we\'ve chosen to <a href="https://mutomorro.com">build everything we do at Mutomorro around it</a> - it\'s that the things that matter most in an organisation are happening in the space between what you can see.' },
    { type: 'paragraph', text: 'That sounds like a philosophy. But it keeps playing out in practice.' },
    { type: 'paragraph', text: 'Leaders come to us with a problem in one place - a strategy that won\'t land, a team that\'s stuck, a culture that doesn\'t match the intent. And almost every time, the most useful answer turns out to be somewhere else entirely. Not in what looks broken, but in the connections around it.' },
    { type: 'paragraph', text: 'When a strategy doesn\'t land, the answer is rarely in the strategy. It\'s in the relationship between the strategy and how decisions actually get made. When culture feels off, it\'s not usually the values - it\'s what the structure rewards. When a change programme stalls, it\'s often the conditions people are operating in, not the people.' },
    { type: 'paragraph', text: 'Once you start seeing these connections, you can\'t unsee them. A team that looks like it has a performance problem starts to look like a team surrounded by contradictory signals. An initiative that keeps stalling stops looking like poor execution and starts looking like a system resisting something it wasn\'t designed for.' },
    { type: 'paragraph', text: 'The leaders we work with are seeing this too - already noticing the patterns, already sensing that the real story is somewhere between the things they can measure. Often what\'s missing isn\'t the insight. It\'s the language and the room to act on what they already know.' },
    { type: 'paragraph', text: 'That shared fascination is what <a href="https://mutomorro.com">mutomorro.com</a> is now built around. Have a look - we\'d love to know what you think.' },
  ],
}

const BLOCKED_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail'])
const STALE_DAYS = 30

const EXCLUDED_DOMAIN_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2,3}$/i,
  /\.ac\.uk$/i,
  /\.ac\.[a-z]{2,3}$/i,
  /\.gov$/i,
  /\.gov\.[a-z]{2,3}$/i,
  /\.mil$/i,
]

function generateUnsubscribeUrl(email) {
  const token = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
    .update(email)
    .digest('hex')
  return `https://mutomorro.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

function isExcludedDomain(email) {
  return EXCLUDED_DOMAIN_PATTERNS.some(pattern => pattern.test(email))
}

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function estimateCompletion(remaining, batchSize, skipWeekends) {
  if (!remaining || remaining <= 0) return null
  const daysNeeded = Math.ceil(remaining / batchSize)
  const d = new Date()
  let added = 0
  while (added < daysNeeded) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (skipWeekends && (day === 0 || day === 6)) continue
    added++
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

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

  const today = new Date().toISOString().split('T')[0]

  try {
    // 1. Read config
    const { data: config, error: configError } = await supabase
      .from('newsletter_config')
      .select('*')
      .limit(1)
      .single()

    if (configError || !config) {
      console.error('Newsletter cron: failed to read config', configError)
      return Response.json({ error: 'Config not found' }, { status: 500 })
    }

    // 2. Pre-flight checks
    if (!config.enabled) {
      const reason = config.paused_reason || 'Disabled'
      console.log(`Newsletter cron: skipped - ${reason}`)
      await sendSummary(resend, config, { type: 'skipped', skipReason: reason, date: formatDate(new Date()) })
      return Response.json({ skipped: true, reason })
    }

    if (config.paused_reason) {
      console.log(`Newsletter cron: paused - ${config.paused_reason}`)
      await sendSummary(resend, config, { type: 'skipped', skipReason: config.paused_reason, date: formatDate(new Date()) })
      return Response.json({ skipped: true, reason: config.paused_reason })
    }

    const dayOfWeek = new Date().getDay()
    if (config.skip_weekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      console.log('Newsletter cron: skipped - weekend')
      await sendSummary(resend, config, { type: 'skipped', skipReason: 'Weekend', date: formatDate(new Date()) })
      return Response.json({ skipped: true, reason: 'Weekend' })
    }

    if (config.last_send_date === today) {
      console.log('Newsletter cron: skipped - already sent today')
      await sendSummary(resend, config, { type: 'skipped', skipReason: 'Already sent today', date: formatDate(new Date()) })
      return Response.json({ skipped: true, reason: 'Already sent today' })
    }

    // 3. Circuit breaker - check aggregate bounce rate across the most recent send date
    // Uses all batches from the last day that had sends, not just the single most recent batch.
    // With small batch sizes (e.g. 30), a single batch can have a misleadingly high bounce rate.
    const { data: recentSends } = await supabase
      .from('newsletter_sends')
      .select('id, total_sent, total_delivered, total_bounced, total_opened, total_clicked, created_at')
      .eq('status', 'complete')
      .gte('total_sent', 1)
      .order('created_at', { ascending: false })
      .limit(50)

    let yesterdayStats = {}

    if (recentSends && recentSends.length > 0) {
      // Find the most recent send date and aggregate all batches from that date
      const lastDate = recentSends[0].created_at.split('T')[0]
      const sameDaySends = recentSends.filter(s => s.created_at.split('T')[0] === lastDate)

      const aggSent = sameDaySends.reduce((sum, s) => sum + (s.total_sent || 0), 0)
      const aggBounced = sameDaySends.reduce((sum, s) => sum + (s.total_bounced || 0), 0)
      const aggDelivered = sameDaySends.reduce((sum, s) => sum + (s.total_delivered || s.total_sent || 0), 0)
      const aggOpened = sameDaySends.reduce((sum, s) => sum + (s.total_opened || 0), 0)
      const aggClicked = sameDaySends.reduce((sum, s) => sum + (s.total_clicked || 0), 0)

      const bounceRate = aggSent > 0 ? (aggBounced / aggSent) * 100 : 0

      // Collect engagement stats for summary email
      if (aggSent > 0) {
        yesterdayStats = {
          yesterdayOpened: aggOpened,
          yesterdayOpenRate: aggDelivered > 0 ? (aggOpened / aggDelivered * 100).toFixed(1) + '%' : '-',
          yesterdayClicked: aggClicked,
          yesterdayClickRate: aggDelivered > 0 ? (aggClicked / aggDelivered * 100).toFixed(1) + '%' : '-',
          yesterdayBounced: aggBounced,
          yesterdayBounceRate: (aggBounced / aggSent * 100).toFixed(1) + '%',
        }
      }

      if (bounceRate > parseFloat(config.bounce_rate_threshold)) {
        const reason = `Circuit breaker: last send date bounce rate was ${bounceRate.toFixed(1)}% across ${aggSent} emails (threshold: ${config.bounce_rate_threshold}%)`
        console.error(`Newsletter cron: ${reason}`)

        await supabase
          .from('newsletter_config')
          .update({
            enabled: false,
            paused_reason: reason,
            paused_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id)

        await sendSummary(resend, config, {
          type: 'alert',
          alertBounceRate: bounceRate.toFixed(1),
          alertThreshold: config.bounce_rate_threshold,
          date: formatDate(new Date()),
        })

        return Response.json({ paused: true, reason })
      }
    }

    // 4. Select recipients
    const batchLimit = Math.min(config.batch_size, config.daily_cap)

    const { data: allContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, signup_email, first_name, zb_status, zb_verified_at')
      .in('newsletter_status', ['active', 'confirmed'])
      .order('tier', { ascending: true })
      .order('created_at', { ascending: true })

    if (contactsError) {
      console.error('Newsletter cron: failed to query contacts', contactsError)
      return Response.json({ error: 'Failed to query contacts' }, { status: 500 })
    }

    // Get all contact IDs that have already received this newsletter (any send with the same subject)
    const { data: matchingSends } = await supabase
      .from('newsletter_sends')
      .select('id')
      .eq('subject', ISSUE_1_CONTENT.subject)

    const matchingSendIds = (matchingSends || []).map(s => s.id)

    let alreadySentIds = new Set()
    if (matchingSendIds.length > 0) {
      const { data: alreadySentRecipients } = await supabase
        .from('newsletter_recipients')
        .select('contact_id')
        .in('send_id', matchingSendIds)

      alreadySentIds = new Set((alreadySentRecipients || []).map(r => r.contact_id))
    }

    // Filter: not already sent, not excluded domain, not blocked ZB status
    let domainExcludedCount = 0
    const eligible = []

    for (const contact of allContacts) {
      if (alreadySentIds.has(contact.id)) continue
      if (BLOCKED_STATUSES.has(contact.zb_status)) continue

      if (config.domain_exclusions_enabled && isExcludedDomain(contact.signup_email || '')) {
        domainExcludedCount++
        continue
      }

      eligible.push(contact)
      if (eligible.length >= batchLimit) break
    }

    if (domainExcludedCount > 0) {
      console.log(`Newsletter cron: excluded ${domainExcludedCount} contacts from risky domains`)
    }

    // Pool exhausted
    if (eligible.length === 0) {
      const reason = 'Pool exhausted - no eligible contacts remaining'
      console.log(`Newsletter cron: ${reason}`)

      await supabase
        .from('newsletter_config')
        .update({
          paused_reason: reason,
          paused_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id)

      // Count total unique recipients
      const { count: totalUniqueRecipients } = await supabase
        .from('newsletter_recipients')
        .select('*', { count: 'exact', head: true })

      await sendSummary(resend, config, {
        type: 'exhausted',
        totalSent: totalUniqueRecipients || 0,
        date: formatDate(new Date()),
      })

      return Response.json({ paused: true, reason })
    }

    // 5. Pre-send verification
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - STALE_DAYS)

    const verified = []
    const zbExcluded = []
    let reVerified = 0

    for (const contact of eligible) {
      const isStale = !contact.zb_verified_at || new Date(contact.zb_verified_at) < thirtyDaysAgo
      const needsVerification = !contact.zb_status || contact.zb_status === 'unknown' || isStale

      let status = contact.zb_status

      if (needsVerification) {
        if (reVerified > 0) await new Promise(r => setTimeout(r, 200))
        const result = await verifyEmail(contact.signup_email)
        status = result.status
        reVerified++

        await supabase
          .from('contacts')
          .update({ zb_status: status, zb_verified_at: new Date().toISOString() })
          .eq('id', contact.id)
      }

      if (BLOCKED_STATUSES.has(status)) {
        zbExcluded.push({ id: contact.id, email: contact.signup_email, reason: status })
        await supabase
          .from('contacts')
          .update({ newsletter_status: 'bounced' })
          .eq('id', contact.id)
      } else {
        verified.push(contact)
      }
    }

    if (verified.length === 0) {
      console.log('Newsletter cron: all contacts in batch excluded by verification')
      await supabase
        .from('newsletter_config')
        .update({ last_send_date: today, last_send_count: 0, updated_at: new Date().toISOString() })
        .eq('id', config.id)

      return Response.json({ sent: 0, zbExcluded: zbExcluded.length })
    }

    // 6. Send
    const { subject, title, previewText, date, leadText, sections, signoff } = ISSUE_1_CONTENT

    // Render view-in-browser HTML
    const viewInBrowserHtml = await render(
      createElement(NewsletterTemplate, {
        subject, title, previewText, date, leadText, sections, signoff,
        unsubscribeUrl: 'https://mutomorro.com',
        viewInBrowserUrl: '',
      })
    )

    // Create send record
    const { data: send, error: sendError } = await supabase
      .from('newsletter_sends')
      .insert({
        subject,
        preview_text: previewText,
        content_json: ISSUE_1_CONTENT,
        html_body: viewInBrowserHtml,
        status: 'sending',
        total_recipients: verified.length,
      })
      .select('id')
      .single()

    if (sendError) {
      console.error('Newsletter cron: failed to create send record', sendError)
      return Response.json({ error: 'Failed to create send record' }, { status: 500 })
    }

    const sendId = send.id
    const viewInBrowserUrl = `https://mutomorro.com/newsletter/${sendId}`
    const now = new Date().toISOString()

    // Create recipient records
    const recipientInserts = verified.map(contact => ({
      send_id: sendId,
      contact_id: contact.id,
      email: contact.signup_email,
      status: 'queued',
    }))

    const { data: insertedRecipients, error: insertError } = await supabase
      .from('newsletter_recipients')
      .insert(recipientInserts)
      .select('id, contact_id, email')

    if (insertError) {
      console.error('Newsletter cron: failed to insert recipients', insertError)
      return Response.json({ error: 'Failed to insert recipients' }, { status: 500 })
    }

    const recipientMap = new Map()
    for (const r of insertedRecipients) {
      recipientMap.set(r.contact_id, r)
    }

    // Render personalised emails
    const emails = await Promise.all(
      verified.map(async (contact) => {
        const recipient = recipientMap.get(contact.id)
        const recipientId = recipient?.id || ''
        const unsubscribeUrl = generateUnsubscribeUrl(contact.signup_email)
        const rawName = contact.first_name?.trim()
        const firstName = rawName
          ? rawName.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
          : ''
        const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
        const html = await render(
          createElement(NewsletterTemplate, {
            subject, title, previewText, date, leadText, greeting, sections, signoff,
            unsubscribeUrl, viewInBrowserUrl, recipientId,
          })
        )
        return { email: contact.signup_email, contactId: contact.id, recipientId, html, unsubscribeUrl }
      })
    )

    // Send via Resend
    const { data: resendData, error: resendError } = await resend.batch.send(
      emails.map(e => ({
        from: 'James from Mutomorro <hello@mutomorro.com>',
        to: [e.email],
        subject,
        html: e.html,
        headers: {
          'List-Unsubscribe': `<${e.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [
          { name: 'newsletter_send_id', value: sendId },
          { name: 'type', value: 'newsletter' },
        ],
      }))
    )

    if (resendError) {
      console.error('Newsletter cron: Resend batch error', resendError)
    }

    // Update recipient records with Resend IDs
    let batchSent = 0
    const results = resendData?.data || resendData || []

    for (let i = 0; i < emails.length; i++) {
      const resendResult = Array.isArray(results) ? results[i] : null
      const resendId = resendResult?.id || null

      if (resendId) {
        batchSent++
        await supabase
          .from('newsletter_recipients')
          .update({ resend_id: resendId, status: 'sent', sent_at: now })
          .eq('id', emails[i].recipientId)
      }
    }

    // Update send record
    await supabase
      .from('newsletter_sends')
      .update({ total_sent: batchSent, status: 'complete', completed_at: now })
      .eq('id', sendId)

    // Update config
    await supabase
      .from('newsletter_config')
      .update({ last_send_date: today, last_send_count: batchSent, updated_at: new Date().toISOString() })
      .eq('id', config.id)

    // Calculate remaining
    const totalEligible = allContacts.filter(c => !alreadySentIds.has(c.id) && !BLOCKED_STATUSES.has(c.zb_status)).length
    const remainingAfterSend = totalEligible - batchSent - zbExcluded.length - domainExcludedCount

    // Count total unique recipients across all sends
    const { count: totalUniqueRecipients } = await supabase
      .from('newsletter_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')

    // 7. Send summary
    await sendSummary(resend, config, {
      type: 'normal',
      date: formatDate(new Date()),
      batchSize: eligible.length,
      verified: verified.length,
      zbExcluded: zbExcluded.length,
      sent: batchSent,
      domainExcluded: domainExcludedCount,
      ...yesterdayStats,
      totalSent: totalUniqueRecipients || 0,
      remaining: remainingAfterSend,
      estimatedCompletion: estimateCompletion(remainingAfterSend, config.batch_size, config.skip_weekends),
    })

    console.log(`Newsletter cron: sent ${batchSent}, ${remainingAfterSend} remaining`)

    return Response.json({
      sent: batchSent,
      sendId,
      zbExcluded: zbExcluded.length,
      domainExcluded: domainExcludedCount,
      remaining: remainingAfterSend,
    })

  } catch (error) {
    console.error('Newsletter cron error:', error)
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

async function sendSummary(resend, config, params) {
  try {
    const html = buildSummaryEmail({ ...params, config })

    let subjectLine
    switch (params.type) {
      case 'alert':
        subjectLine = `ALERT: Newsletter paused - bounce rate ${params.alertBounceRate}% exceeded ${params.alertThreshold}% threshold`
        break
      case 'exhausted':
        subjectLine = 'Newsletter: warm-up complete - all contacts sent'
        break
      case 'skipped':
        subjectLine = `Newsletter: skipped (${params.skipReason.toLowerCase()})`
        break
      default:
        subjectLine = `Newsletter: ${params.sent} sent, ${(params.remaining || 0).toLocaleString()} remaining`
    }

    await resend.emails.send({
      from: 'Mutomorro System <hello@mutomorro.com>',
      to: [config.summary_email],
      subject: subjectLine,
      html,
    })
  } catch (err) {
    console.error('Failed to send summary email:', err)
  }
}
