import { getAllArticles } from '../../sanity/client'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import ArticlesGrid from './ArticlesGrid'

export const revalidate = 3600

export const metadata = {
  title: 'Articles - thinking on organisational development',
  description: 'Perspectives on culture change, organisational design, change management, service design, and the systems that shape how organisations work.',
  openGraph: {
    url: 'https://mutomorro.com/articles',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

export default async function Articles() {
  const articles = await getAllArticles()

  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Thinking</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Ideas, perspectives and provocation
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Thinking about organisations, leadership and the patterns that shape how we work.
          </p>
        </div>
      </BackgroundPattern>

      {/* Article cards */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {articles.length === 0 ? (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.4)' }}>
              No articles yet - check back soon.
            </p>
          ) : (
            <ArticlesGrid items={articles} />
          )}
        </div>
      </section>

      <CTA />

    </main>
  )
}
