import { getDimensionArticle, getDimensionArticles } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../../components/CTA'
import SectionNavFooter from '../../../../components/emergent/SectionNavFooter'
import { urlFor } from '../../../../sanity/image'

export default async function DimensionArticlePage({ params }) {
  const { dimension: dimensionSlug, article: articleSlug } = await params
  const article = await getDimensionArticle(dimensionSlug, articleSlug)
  const allArticles = await getDimensionArticles(dimensionSlug)

  // Find prev/next articles for navigation
  const currentIndex = allArticles.findIndex(a => a.slug.current === articleSlug)
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/emergent-framework" className="breadcrumb__link">EMERGENT</Link>
            <span className="breadcrumb__sep">/</span>
            <Link
              href={`/emergent-framework/${dimensionSlug}`}
              className="breadcrumb__link"
            >
              {article.dimension.anchor}
            </Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">{article.title}</span>
          </div>

          <span className="kicker" style={{ marginBottom: '16px', color: article.dimension.colour }}>
            {article.dimension.anchor}
          </span>
          <h1 className="heading-h1" style={{
            color: '#ffffff',
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            {article.title}
          </h1>
          {article.shortSummary && (
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
              {article.shortSummary}
            </p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="portable-text scroll-in" style={{ maxWidth: '800px' }}>
            <PortableText
              value={article.body}
              components={{
                types: {
                  image: ({ value }) => (
                    <div className="img-mat" style={{ margin: '2.5rem 0' }}>
                      <img
                        src={urlFor(value).width(900).url()}
                        alt={value.alt || ''}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  ),
                },
                marks: {
                  link: ({ value, children }) => (
                    <a href={value.href} className="inline-link">{children}</a>
                  ),
                },
                block: {
                  blockquote: ({ children }) => (
                    <blockquote className="pull-quote">{children}</blockquote>
                  ),
                },
              }}
            />
          </div>

          {/* Prev/next navigation */}
          {(prevArticle || nextArticle) && (
            <div style={{ maxWidth: '800px' }}>
              <SectionNavFooter
                prevArticle={prevArticle}
                nextArticle={nextArticle}
                dimensionSlug={dimensionSlug}
                dimensionColour={article.dimension.colour}
              />
            </div>
          )}
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
