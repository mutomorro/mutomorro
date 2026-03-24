import { client, getDimension, getDimensionArticles } from '../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { DIMENSION_LETTERS } from '../../../components/emergent/constants'
import { urlFor } from '../../../sanity/image'

export const revalidate = 3600

export async function generateStaticParams() {
  const dimensions = await client.fetch(`*[_type == "dimension"]{ "slug": slug.current }`)
  return dimensions.map(d => ({ dimension: d.slug }))
}

export async function generateMetadata({ params }) {
  const { dimension: slug } = await params
  const dimension = await getDimension(slug)
  if (!dimension) return {}
  const rawTitle = dimension.seoTitle || `${dimension.title} - EMERGENT Framework`
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = dimension.seoDescription || dimension.shortSummary || `Explore the ${dimension.title} dimension of the EMERGENT Framework.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  }
}

export default async function DimensionPage({ params }) {
  const { dimension: dimensionSlug } = await params
  const dimension = await getDimension(dimensionSlug)
  const articles = await getDimensionArticles(dimensionSlug)

  const letter = dimension.letter || DIMENSION_LETTERS[dimensionSlug] || dimension.title.charAt(0)
  const dimColour = dimension.colour || 'var(--accent)'

  const portableTextComponents = {
    types: {
      image: ({ value }) => (
        <div style={{ margin: '2rem 0' }}>
          <Image
            src={urlFor(value).width(700).url()}
            alt={value.alt || ''}
            width={700}
            height={394}
            sizes="(max-width: 768px) 100vw, 700px"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ),
    },
    marks: {
      link: ({ value, children }) => (
        <a href={value.href}>{children}</a>
      ),
    },
    block: {
      blockquote: ({ children }) => (
        <blockquote>{children}</blockquote>
      ),
    },
  }

  return (
    <main style={{ '--active-dim': dimColour }}>

      {/* Hero - light background with coloured left stripe */}
      <div className="ew-dim-hero">
        {/* Breadcrumb */}
        <div className="ew-dim-breadcrumb">
          <Link href="/emergent-framework">EMERGENT Framework</Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'rgba(34,28,43,0.45)' }}>{dimension.title}</span>
        </div>

        {/* Kicker */}
        <div className="ew-dim-kicker">
          Dimension {letter} - {dimension.title}
        </div>

        {/* Title */}
        <h1 className="ew-dim-title">{dimension.title}</h1>

        {/* Tagline */}
        {dimension.tagline && (
          <div className="ew-dim-tagline">{dimension.tagline}</div>
        )}

        {/* Intro text */}
        {dimension.intro && (
          <p className="ew-dim-lead">{dimension.intro}</p>
        )}

        {/* Lens question */}
        {dimension.lensQuestion && (
          <p className="ew-dim-lens">{dimension.lensQuestion}</p>
        )}
      </div>

      {/* Body content from Sanity */}
      {dimension.body && (
        <div className="ew-section-page">
          <div className="portable-text">
            <PortableText
              value={dimension.body}
              components={portableTextComponents}
            />
          </div>
        </div>
      )}

      {/* Articles in this dimension */}
      {articles.length > 0 && (
        <div className="ew-articles-section">
          <div className="ew-articles-label">Go deeper</div>
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/emergent-framework/${dimensionSlug}/${article.slug.current}`}
              className="ew-article-row"
            >
              <div>
                <div className="ew-article-row-title">{article.title}</div>
                {article.shortSummary && (
                  <div className="ew-article-row-summary">{article.shortSummary}</div>
                )}
              </div>
              <span className="ew-article-row-arrow">&rarr;</span>
            </Link>
          ))}
        </div>
      )}

      {/* Related dimensions */}
      {dimension.relatedDimensions?.length > 0 && (
        <div className="ew-related-section">
          <div className="ew-related-label">Connected dimensions</div>
          <div className="ew-related-grid">
            {dimension.relatedDimensions.map((related) => (
              <Link
                key={related._id}
                href={`/emergent-framework/${related.slug.current}`}
                className="ew-related-card"
              >
                <div className="ew-related-dot" style={{ background: related.colour }} />
                <span className="ew-related-name">{related.title}</span>
                <span className="ew-related-summary">{related.shortSummary}</span>
                <span className="ew-related-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  )
}
