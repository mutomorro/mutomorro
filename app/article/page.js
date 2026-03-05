import Link from 'next/link'
import { getAllArticles } from '../../sanity/client'

export default async function Articles() {
  const articles = await getAllArticles()

  return (
    <main>
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 1rem' }}>Thinking</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            Ideas, perspectives and provocation
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            Thinking about organisations, leadership and the patterns that shape how we work.
          </p>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="card-grid">
            {articles.length === 0 && (
              <p className="lead">No articles yet - check back soon.</p>
            )}
            {articles.map((article) => (
              <Link
                key={article._id}
                href={`/article/${article.slug.current}`}
                className="card"
              >
                <p className="card-label">{article.category}</p>
                <h2 className="card-title">{article.title}</h2>
                <p className="card-body">{article.shortSummary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}