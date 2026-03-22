import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import NewsletterBrowserView from './NewsletterBrowserView'

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

  return <NewsletterBrowserView htmlBody={htmlBody} sentDate={sentDate} />
}
