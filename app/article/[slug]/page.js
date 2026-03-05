import { getArticle } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = await getArticle(slug)

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap--narrow">
          <Link href="/article" style={{
            fontSize: '0.85rem',
            fontWeight: '400',
            color: 'var(--color-accent)',
            display: 'inline-block',
            margin: '0 0 1.5rem',
          }}>← All articles</Link>
          <p className="label" style={{ margin: '0 0 1rem' }}>{article.category}</p>
          <h1 className="heading-large" style={{
            color: 'var(--color-dark)',
            margin: '0 0 1.5rem',
          }}>
            {article.title}
          </h1>
          <p className="lead">{article.shortSummary}</p>
        </div>
      </section>

      {/* Body */}
      <section className="section section--white">
        <div className="wrap--narrow">
          <div className="portable-text">
            <PortableText
              value={article.body}
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

          {/* Related dimensions */}
          {article.relatedDimensions?.length > 0 && (
            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid #f0ece6' }}>
              <p className="label label--accent" style={{ margin: '0 0 1.5rem' }}>
                Related dimensions
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {article.relatedDimensions.map((dimension) => (
                  <Link
                    key={dimension._id}
                    href={`/emergent-framework/${dimension.slug.current}`}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: dimension.colour,
                      border: `1px solid ${dimension.colour}`,
                      borderRadius: '4px',
                      padding: '0.4rem 0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    {dimension.anchor}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTA />

    </main>
  )
}