import { getDimensionArticle } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../../components/CTA'
import { urlFor } from '../../../../sanity/image'

export default async function DimensionArticlePage({ params }) {
  const { dimension: dimensionSlug, article: articleSlug } = await params
  const article = await getDimensionArticle(dimensionSlug, articleSlug)

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap--narrow">
          <Link href={`/emergent-framework/${dimensionSlug}`} style={{
            fontSize: '0.85rem',
            fontWeight: '400',
            color: article.dimension.colour,
            display: 'inline-block',
            margin: '0 0 1.5rem',
          }}>← {article.dimension.title}</Link>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: '400',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: article.dimension.colour,
            margin: '0 0 1rem',
          }}>
            {article.dimension.anchor}
          </p>
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
        </div>
      </section>

      <CTA
        label="Continue exploring"
        heading="See how all eight dimensions connect"
        buttonText="The EMERGENT Framework"
        buttonLink="/emergent-framework"
      />

    </main>
  )
}