import { createClient } from '@supabase/supabase-js'
import { notFound, permanentRedirect } from 'next/navigation'
import { renderEditorial } from '../../../lib/newsletter-render.js'
import NewsletterBrowserView from './NewsletterBrowserView'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DEFAULT_OG_IMAGE = 'https://mutomorro.com/og-default.png'
const SITE_ORIGIN = 'https://mutomorro.com'

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Look up by id (legacy "view in browser" UUID) or by issue_key (canonical).
// UUID path returns the row regardless of is_public so existing email links
// keep working — including warm-up recipients whose row is is_public=false.
async function lookupSend(slug) {
  const supabase = client()
  if (UUID_RE.test(slug)) {
    const { data } = await supabase
      .from('newsletter_sends')
      .select('id, issue_key, subject, preview_text, html_body, content_json, completed_at, created_at, is_public, status')
      .eq('id', slug)
      .neq('status', 'draft')
      .maybeSingle()
    return { row: data, viaUuid: true }
  }
  const { data } = await supabase
    .from('newsletter_sends')
    .select('id, issue_key, subject, preview_text, html_body, content_json, completed_at, created_at, is_public, status')
    .eq('issue_key', slug)
    .eq('is_public', true)
    .eq('status', 'complete')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return { row: data, viaUuid: false }
}

export async function generateMetadata({ params }) {
  const { issueKey } = await params
  const { row } = await lookupSend(issueKey)
  if (!row) return { title: 'Newsletter' }

  if (!row.is_public) {
    return {
      title: row.subject || 'Newsletter',
      robots: 'noindex, nofollow',
    }
  }

  const heroImageUrl = row.content_json?.heroImageUrl
  const ogImage = heroImageUrl || DEFAULT_OG_IMAGE
  const canonical = `${SITE_ORIGIN}/newsletter/${row.issue_key}`

  return {
    title: row.subject || 'Newsletter',
    description: row.preview_text || undefined,
    alternates: { canonical },
    openGraph: {
      title: row.subject || 'Newsletter',
      description: row.preview_text || undefined,
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: {
      title: row.subject || 'Newsletter',
      description: row.preview_text || undefined,
      images: [{ url: ogImage }],
    },
  }
}

export default async function NewsletterIssuePage({ params }) {
  const { issueKey } = await params
  const { row, viaUuid } = await lookupSend(issueKey)

  if (!row) notFound()

  // Public + UUID hit → redirect to canonical issue-key URL (SEO + cleanliness).
  // Private UUID rows (warm-up "view in browser" links) render in place.
  if (viaUuid && row.is_public && row.status === 'complete') {
    permanentRedirect(`/newsletter/${row.issue_key}`)
  }

  // Admin sends don't persist html_body — render on the fly from content_json.
  // Warm-up rows already have html_body so this fallback only fires for
  // editorial/admin sends and any future row with the same shape.
  let rawHtml = row.html_body || ''
  if (!rawHtml && row.content_json) {
    try {
      rawHtml = await renderEditorial(row.content_json, {})
    } catch (err) {
      console.error(`Failed to render archive view for ${row.issue_key}:`, err)
    }
  }

  const htmlBody = rawHtml
    .replace(/href="[^"]*\/api\/unsubscribe[^"]*"/g, 'href="https://mutomorro.com"')
    .replace(/>Unsubscribe</g, '>Subscribe<')

  const sentDateRaw = row.completed_at || row.created_at
  const sentDate = sentDateRaw
    ? new Date(sentDateRaw).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return <NewsletterBrowserView htmlBody={htmlBody} sentDate={sentDate} />
}
