import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export const revalidate = 3600

export const metadata = {
  title: 'Newsletter archive — Mutomorro',
  description:
    'Past editions of the Mutomorro newsletter on the invisible architecture of organisations.',
  alternates: { canonical: 'https://mutomorro.com/newsletter' },
  openGraph: {
    title: 'Newsletter archive — Mutomorro',
    description:
      'Past editions of the Mutomorro newsletter on the invisible architecture of organisations.',
    url: 'https://mutomorro.com/newsletter',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NewsletterArchivePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Volume is tiny (one or two per month at most) — explicit .range covers it
  // for years without tripping the Supabase 1,000-row default.
  const { data: sends } = await supabase
    .from('newsletter_sends')
    .select('issue_key, subject, preview_text, completed_at')
    .eq('is_public', true)
    .eq('status', 'complete')
    .order('completed_at', { ascending: false })
    .range(0, 999)

  const editions = sends || []

  return (
    <main>
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Newsletter</span>
          <h1 className="heading-h1 heading-gradient" style={{ margin: '0 0 32px', maxWidth: '800px' }}>
            Past editions
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            A periodic letter on the invisible architecture of organisations — the patterns,
            connections and quiet shifts we notice across the leaders we work with.
          </p>
        </div>
      </BackgroundPattern>

      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {editions.length === 0 ? (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.4)' }}>
              No editions yet — check back soon.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '32px',
              }}
            >
              {editions.map((ed) => (
                <Link key={ed.issue_key} href={`/newsletter/${ed.issue_key}`} className="card-d">
                  <div className="card-d__body" style={{ paddingTop: '40px' }}>
                    <div className="card-d__title">{ed.subject}</div>
                    {ed.preview_text && <p className="card-d__text">{ed.preview_text}</p>}
                    {ed.completed_at && (
                      <p className="card-d__meta">{formatDate(ed.completed_at)}</p>
                    )}
                  </div>
                  <div className="card-d__footer">
                    <div className="card-d__footer-fill" />
                    <div className="card-d__action">
                      Read edition <span className="arrow">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTA />
    </main>
  )
}
