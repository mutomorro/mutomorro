import { getAllArticles } from '../../sanity/client'
import CTA from '../../components/CTA'
import ArticlesGrid from './ArticlesGrid'

export default async function Articles() {
  const articles = await getAllArticles()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
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
      </section>

      {/* Article cards */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
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
