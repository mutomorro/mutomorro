import Link from 'next/link'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import { getAllResources } from '../../sanity/client'

export const revalidate = 3600

const TYPE_LABELS = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }

export const metadata = {
  title: 'Resources',
  description: 'Free guides, primers and whitepapers for leaders working on culture, change and organisational development. Download as PDF.',
  openGraph: {
    siteName: 'Mutomorro',
    locale: 'en_GB',
    url: 'https://mutomorro.com/resources',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: './',
  },
}

export default async function Resources() {
  const resources = await getAllResources()

  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Resources</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Guides and primers
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            In-depth guides for leaders working on culture, change and organisational development. Download and keep.
          </p>
        </div>
      </BackgroundPattern>

      {/* Resource cards */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {resources?.length > 0 ? (
            <div className="card-grid">
              {resources.map((r) => {
                const typeLabel = r.resourceTypeLabel || TYPE_LABELS[r.resourceType] || 'Resource'
                return (
                  <Link key={r.slug} href={`/resources/${r.slug}`} className="card-a">
                    <div className="card-a__corner" />

                    <div className="card-a__body">
                      <span className="card-a__tag">{typeLabel}</span>
                      <div className="card-a__title">{r.title}</div>
                      {r.subtitle && (
                        <p className="card-a__text">{r.subtitle}</p>
                      )}
                    </div>

                    <div className="card-a__footer">
                      <div className="card-a__footer-bg" />
                      <div className="card-a__action">
                        View {typeLabel.toLowerCase()} <span className="arrow">→</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="lead-text" style={{ textAlign: 'center', color: 'rgba(0,0,0,0.55)' }}>
              New resources are on the way.
            </p>
          )}
        </div>
      </section>

      <CTA
        label="Work with us"
        heading="Want to put these ideas into practice?"
      />

    </main>
  )
}
