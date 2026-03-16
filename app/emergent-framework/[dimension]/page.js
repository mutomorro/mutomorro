import { getDimension, getDimensionArticles } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'

export default async function DimensionPage({ params }) {
  const { dimension: dimensionSlug } = await params
  const dimension = await getDimension(dimensionSlug)
  const articles = await getDimensionArticles(dimensionSlug)

  const portableTextComponents = {
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
  }

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/emergent-framework" className="breadcrumb__link">EMERGENT</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current" style={{ color: dimension.colour }}>
              {dimension.anchor}
            </span>
          </div>

          <span className="kicker" style={{ marginBottom: '16px', color: dimension.colour }}>
            {dimension.anchor}
          </span>
          <h1 className="heading-h1" style={{
            color: '#ffffff',
            margin: '0 0 24px',
            maxWidth: '800px',
          }}>
            {dimension.tagline}
          </h1>
          {dimension.intro && (
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
              {dimension.intro}
            </p>
          )}
        </div>
      </section>

      {/* Body content */}
      {dimension.body && (
        <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="portable-text scroll-in" style={{ maxWidth: '800px' }}>
              <PortableText
                value={dimension.body}
                components={portableTextComponents}
              />
            </div>
          </div>
        </section>
      )}

      {/* Articles in this dimension */}
      {articles.length > 0 && (
        <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <span className="kicker" style={{ color: dimension.colour, marginBottom: '32px' }}>
              Go deeper
            </span>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {articles.map((article, index) => (
                <Link
                  key={article._id}
                  href={`/emergent-framework/${dimensionSlug}/${article.slug.current}`}
                  className="scroll-in"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    transition: 'padding-left 0.2s',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '400',
                      color: 'var(--black)',
                      margin: '0 0 4px',
                    }}>
                      {article.title}
                    </p>
                    {article.shortSummary && (
                      <p className="body-small" style={{
                        color: 'rgba(0,0,0,0.5)',
                        margin: 0,
                        maxWidth: '600px',
                      }}>
                        {article.shortSummary}
                      </p>
                    )}
                  </div>
                  <span style={{
                    color: dimension.colour,
                    fontSize: '18px',
                    flexShrink: 0,
                    marginLeft: '2rem',
                  }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related dimensions */}
      {dimension.relatedDimensions?.length > 0 && (
        <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '32px' }}>
              Connected dimensions
            </span>
            <div className="grid-3">
              {dimension.relatedDimensions.map((related, index) => (
                <Link
                  key={related._id}
                  href={`/emergent-framework/${related.slug.current}`}
                  className="card-d scroll-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-d__badge" style={{ background: related.colour }}>
                    {related.anchor}
                  </div>
                  <div className="card-d__body" style={{ paddingTop: '48px' }}>
                    <div className="card-d__title">{related.title}</div>
                    <p className="card-d__text">{related.shortSummary}</p>
                  </div>
                  <div className="card-d__footer">
                    <div className="card-d__footer-fill" />
                    <div className="card-d__action">
                      Explore <span className="arrow">→</span>
                    </div>
                  </div>
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
