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

export function formatMonthYear(d = new Date()) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function capitaliseFirstName(rawName) {
  const trimmed = (rawName || '').trim()
  if (!trimmed) return ''
  return trimmed.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
}

/**
 * Resolve editorial content from a calendar_items row.
 *
 * Supports two content_json shapes:
 *   - Edition format (current): { observationBody, indexItems, contentBlocks, … }
 *   - Legacy format (warm-up): { sections: [...] }
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

  const cj = item.content_json || {}
  const monthYear = cj.monthYear || cj.date || (item.scheduled_date
    ? formatMonthYear(new Date(item.scheduled_date + 'T00:00:00'))
    : formatMonthYear())

  // Edition format — the current newsletter shape.
  if (typeof cj.observationBody === 'string' && cj.observationBody.trim() !== '') {
    return {
      ok: true,
      item,
      content: {
        subject: item.subject || cj.subject || cj.subjectLine || item.title || '',
        previewText: item.preview_text || cj.previewText || '',
        monthYear,
        subjectLine: cj.subjectLine || item.subject || item.title || '',
        heroImageUrl: cj.heroImageUrl || '',
        heroImageAlt: cj.heroImageAlt || '',
        introText: cj.introText || '',
        indexItems: Array.isArray(cj.indexItems) ? cj.indexItems : [],
        observationKicker: cj.observationKicker || 'Observation',
        observationTitle: cj.observationTitle || '',
        observationBody: cj.observationBody,
        signOff: cj.signOff || 'James',
        ps: cj.ps || '',
        contentBlocks: Array.isArray(cj.contentBlocks) ? cj.contentBlocks : [],
      },
    }
  }

  // Legacy format — retained for the warm-up campaign.
  if (Array.isArray(cj.sections) && cj.sections.length > 0) {
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

  return {
    ok: false,
    reason: 'This issue has no structured content. Populate content_json (edition format) on the calendar item before sending.',
  }
}

/**
 * Render an editorial email for a single recipient.
 * Pass `recipientId` for engagement tracking; omit for previews.
 *
 * The template picks the edition or legacy layout from the content shape;
 * `greeting` only applies to the legacy layout.
 */
export async function renderEditorial(content, { firstName, unsubscribeUrl, viewInBrowserUrl, recipientId } = {}) {
  const isEdition = typeof content.observationBody === 'string' && content.observationBody.trim() !== ''
  return render(
    createElement(NewsletterTemplate, {
      ...content,
      greeting: isEdition ? undefined : (firstName ? `Hi ${firstName},` : 'Hi there,'),
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
