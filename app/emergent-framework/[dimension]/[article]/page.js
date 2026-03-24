import { client, getDimensionArticle, getDimensionArticles } from '../../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import SectionNavFooter from '../../../../components/emergent/SectionNavFooter'
import { DIMENSION_LETTERS } from '../../../../components/emergent/constants'
import { urlFor } from '../../../../sanity/image'

export const revalidate = 3600

export async function generateStaticParams() {
  const articles = await client.fetch(`*[_type == "dimensionArticle"]{ "slug": slug.current, "dimension": dimension->slug.current }`)
  return articles.map(a => ({ dimension: a.dimension, article: a.slug }))
}

export async function generateMetadata({ params }) {
  const { dimension: dimensionSlug, article: articleSlug } = await params
  const article = await getDimensionArticle(dimensionSlug, articleSlug)
  if (!article) return {}
  const dimTitle = article.dimension?.title || dimensionSlug
  const rawTitle = article.seoTitle || `${dimTitle}: ${article.title} - EMERGENT Framework`
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = article.seoDescription || article.shortSummary || `${article.title} - part of the ${dimTitle} dimension.`

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

export default async function DimensionArticlePage({ params }) {
  const { dimension: dimensionSlug, article: articleSlug } = await params
  const article = await getDimensionArticle(dimensionSlug, articleSlug)
  const allArticles = await getDimensionArticles(dimensionSlug)

  const dimColour = article.dimension?.colour || 'var(--accent)'
  const dimTitle = article.dimension?.title || dimensionSlug
  const letter = article.dimension?.letter || DIMENSION_LETTERS[dimensionSlug] || dimTitle.charAt(0)

  // Find prev/next articles for navigation
  const currentIndex = allArticles.findIndex(a => a.slug.current === articleSlug)
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null

  return (
    <main style={{ '--active-dim': dimColour }}>

      {/* Hero - light background with coloured left stripe */}
      <div className="ew-dim-hero">
        {/* Breadcrumb */}
        <div className="ew-dim-breadcrumb">
          <Link href="/emergent-framework">EMERGENT Framework</Link>
          <span>&rsaquo;</span>
          <Link href={`/emergent-framework/${dimensionSlug}`}>
            {dimTitle}
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'rgba(34,28,43,0.45)' }}>{article.title}</span>
        </div>

        {/* Kicker */}
        <div className="ew-dim-kicker">
          Dimension {letter} - {dimTitle}
        </div>

        {/* Title */}
        <h1 className="ew-dim-title">{article.title}</h1>

        {/* Lead text */}
        {article.shortSummary && (
          <p className="ew-dim-lead">{article.shortSummary}</p>
        )}
      </div>

      {/* Body content */}
      <div className="ew-section-page">
        <div className="portable-text">
          <PortableText
            value={article.body}
            components={{
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
            }}
          />
        </div>
      </div>

      {/* Prev/next navigation */}
      {(prevArticle || nextArticle) && (
        <SectionNavFooter
          prevArticle={prevArticle}
          nextArticle={nextArticle}
          dimensionSlug={dimensionSlug}
        />
      )}

    </main>
  )
}
