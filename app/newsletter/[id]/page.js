import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: send } = await supabase
    .from('newsletter_sends')
    .select('subject')
    .eq('id', id)
    .single()

  return {
    title: send?.subject || 'Newsletter',
    robots: 'noindex, nofollow',
  }
}

export default async function NewsletterViewPage({ params }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: send, error } = await supabase
    .from('newsletter_sends')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !send || send.status === 'draft') {
    notFound()
  }

  // Replace personalised unsubscribe links with a subscribe link
  const htmlBody = (send.html_body || '')
    .replace(
      /href="[^"]*\/api\/unsubscribe[^"]*"/g,
      'href="https://mutomorro.com"'
    )
    .replace(
      />Unsubscribe</g,
      '>Subscribe<'
    )

  const sentDate = send.created_at
    ? new Date(send.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#f0f0f0',
      overflowY: 'auto',
    }}>
      {/* Banner */}
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '12px 44px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
        }}>
          This is a web version of an email sent on {sentDate}.{' '}
          <Link
            href="https://mutomorro.com"
            style={{ color: '#9B51E0', textDecoration: 'underline' }}
          >
            Subscribe to receive future emails
          </Link>
        </p>
      </div>

      {/* Email content */}
      <div
        style={{
          maxWidth: '580px',
          margin: '0 auto 40px',
          backgroundColor: '#FFFFFF',
        }}
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    </div>
  )
}
