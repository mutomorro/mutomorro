/**
 * Shared rendering helpers for the manual newsletter send flow.
 * Used by /api/admin/newsletter/{preview, test-send, send}.
 */

import crypto from 'crypto'
import { render } from '@react-email/components'
import { createElement } from 'react'
import NewsletterTemplate from '../components/emails/newsletter-template.jsx'
import PromoTemplate from '../components/emails/promo-template.jsx'

export function generateUnsubscribeUrl(email) {
  const token = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
    .update(email)
    .digest('hex')
  return `https://mutomorro.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function capitaliseFirstName(rawName) {
  const trimmed = (rawName || '').trim()
  if (!trimmed) return ''
  return trimmed.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
}

/**
 * Resolve editorial content from a calendar_items row.
 */
export async function loadEditorialContentFromCalendar(supabase, calendarItemId) {
  if (!calendarItemId) {
    return { ok: false, reason: 'calendarItemId is required' }
  }
  const { data: item, error } = await supabase
    .from('calendar_items')
    .select('id, title, subject, preview_text, content_json, scheduled_date, tags, status')
    .eq('id', calendarItemId)
    .maybeSingle()

  if (error) return { ok: false, reason: error.message }
  if (!item) return { ok: false, reason: 'Calendar item not found' }

  const cj = item.content_json
  if (!cj || !Array.isArray(cj.sections) || cj.sections.length === 0) {
    return {
      ok: false,
      reason: 'This issue has no structured content. Populate content_json on the calendar item before sending.',
    }
  }

  return {
    ok: true,
    item,
    content: {
      subject: item.subject || cj.subject || item.title || '',
      previewText: item.preview_text || cj.previewText || '',
      title: cj.title || item.title || '',
      date: cj.date || (item.scheduled_date
        ? formatDate(new Date(item.scheduled_date + 'T00:00:00'))
        : formatDate()),
      leadText: cj.leadText || '',
      signoff: cj.signoff || 'Until next month,',
      sections: cj.sections,
    },
  }
}

/**
 * Render an editorial email for a single recipient.
 * Pass `recipientId` for engagement tracking; omit for previews.
 */
export async function renderEditorial(content, { firstName, unsubscribeUrl, viewInBrowserUrl, recipientId } = {}) {
  const { subject, title, previewText, date, leadText, signoff, sections } = content
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  return render(
    createElement(NewsletterTemplate, {
      subject,
      title,
      previewText,
      date,
      leadText,
      greeting,
      sections,
      signoff,
      unsubscribeUrl: unsubscribeUrl || '#unsubscribe',
      viewInBrowserUrl: viewInBrowserUrl || '',
      recipientId: recipientId || '',
    })
  )
}

/**
 * Render a promo email for a single recipient.
 */
export async function renderPromo(content, { unsubscribeUrl, recipientId } = {}) {
  return render(
    createElement(PromoTemplate, {
      subject: content.subject,
      previewText: content.previewText,
      heroImageUrl: content.heroImageUrl || '',
      headline: content.headline,
      body: content.body,
      ctaText: content.ctaText,
      ctaUrl: content.ctaUrl,
      secondaryText: content.secondaryText || '',
      unsubscribeUrl: unsubscribeUrl || '#unsubscribe',
      recipientId: recipientId || '',
    })
  )
}

/**
 * Slugify text for issue keys.
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
