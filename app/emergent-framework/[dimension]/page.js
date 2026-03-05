import { getDimension, getDimensionArticles } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'

export default async function DimensionPage({ params }) {
  const { dimension: dimensionSlug } = await params
  const dimension = await getDimension(dimensionSlug)
  const articles = await getDimensionArticles(dimensionSlug)

  return (
    <main>

      {/* Hero */}
      <section className="section" style={{
        backgroundColor: dimension.colour + '15',
        borderBottom: `3px solid ${dimension.colour}`,
      }}>
        <div className="wrap--narrow">
          <Link href="/emergent-framework" style={{
            fontSize: '0.85rem',
            fontWeight: '400',
            color: dimension.colour,
            display: 'inline-block',
            margin: '0 0 1.5rem',
          }}>← The EMERGENT Framework</Link>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: '400',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: dimension.colour,
            margin: '0 0 1rem',
          }}>
            {dimension.anchor}
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '400',
            lineHeight: '1.15',
            color: 'var(--color-dark)',
            margin: '0 0 1.5rem',
          }}>
            {dimension.tagline}
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            {dimension.intro}
          </p>
        </div>
      </section>

      {/* Body content */}
      {dimension.body && (
        <section className="section section--white">
          <div className="wrap--narrow">
            <div className="portable-text">
              <PortableText
                value={dimension.body}
                components={{
                  types: {
                    image: ({ value }) => (
                      <div style={{ margin: '2rem 0' }}>
                        <img
                          src={urlFor(value).width(900).url()}
                          alt={value.alt || ''}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                      </div>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Articles in this dimension */}
      {articles.length > 0 && (
        <section className="section section--warm">
          <div className="wrap--narrow">
            <p className="label" style={{ margin: '0 0 2rem', color: dimension.colour }}>
              Go deeper
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/emergent-framework/${dimensionSlug}/${article.slug.current}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 0',
                    borderBottom: '1px solid #f0ece6',
                  }}>
                    <div>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '400',
                        color: 'var(--color-dark)',
                        margin: '0 0 0.25rem',
                      }}>
                        {article.title}
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '300',
                        color: '#888',
                        margin: 0,
                      }}>
                        {article.shortSummary}
                      </p>
                    </div>
                    <span style={{ color: dimension.colour, fontSize: '1.2rem', opacity: 0.6 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related dimensions */}
      {dimension.relatedDimensions?.length > 0 && (
        <section className="section section--white">
          <div className="wrap--narrow">
            <p className="label label--accent" style={{ margin: '0 0 2rem' }}>
              Connected dimensions
            </p>
            <div className="card-grid">
              {dimension.relatedDimensions.map((related) => (
                <Link
                  key={related._id}
                  href={`/emergent-framework/${related.slug.current}`}
                  className="card"
                >
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: '400',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: related.colour,
                    margin: '0 0 0.5rem',
                  }}>
                    {related.anchor}
                  </p>
                  <h3 className="card-title">{related.title}</h3>
                  <p className="card-body">{related.shortSummary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA
        label="Explore further"
        heading="Want to understand your organisation's health across all eight dimensions?"
        buttonText="Take the assessment"
        buttonLink="/states-of-vitality"
      />

    </main>
  )
}