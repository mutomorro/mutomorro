import Link from 'next/link'
import { getAllArticles } from '../../sanity/client'
import { urlFor } from '../../sanity/image'
import CTA from '../../components/CTA'

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
            <div className="grid-3">
              {articles.map((article, index) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug.current}`}
                  className="card-d scroll-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Category badge */}
                  {article.category && (
                    <div className="card-d__badge">{article.category}</div>
                  )}

                  {/* Image */}
                  {article.heroImage && (
                    <div className="card-d__image">
                      <img
                        className="card-d__image-inner"
                        src={urlFor(article.heroImage).width(600).height(338).url()}
                        alt={article.heroImage.alt || article.title}
                      />
                    </div>
                  )}

                  <div className="card-d__body" style={article.category && !article.heroImage ? { paddingTop: '40px' } : undefined}>
                    <div className="card-d__title">{article.title}</div>
                    {article.shortSummary && (
                      <p className="card-d__text">{article.shortSummary}</p>
                    )}
                    {article.publishedAt && (
                      <p className="card-d__meta">
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="card-d__footer">
                    <div className="card-d__footer-fill" />
                    <div className="card-d__action">
                      Read article <span className="arrow">→</span>
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
