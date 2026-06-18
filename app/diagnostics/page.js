import Link from 'next/link'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export const metadata = {
  title: 'Diagnostics',
  description: 'Free self-assessment tools for leadership teams. Explore where your organisation stands and start meaningful conversations.',
  openGraph: {
    siteName: 'Mutomorro',
    locale: 'en_GB',
    url: 'https://mutomorro.com/diagnostics',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: './',
  },
}

export default function Diagnostics() {
  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Self-assessment</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Diagnostics
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Free self-assessment tools for leadership teams.
          </p>
        </div>
      </BackgroundPattern>

      {/* Diagnostic cards */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="card-grid">
            <Link href="/diagnostics/drift-audit" className="card-a">
              <div className="card-a__corner" />

              <div className="card-a__body">
                <span className="card-a__tag">Diagnostic</span>
                <div className="card-a__title">Organisational Drift Audit</div>
                <p className="card-a__text">
                  A conversation starter for leadership teams. Twelve questions across
                  six dimensions, in about five minutes.
                </p>
              </div>

              <div className="card-a__footer">
                <div className="card-a__footer-bg" />
                <div className="card-a__action">
                  Start the audit <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
