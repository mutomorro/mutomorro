import { getArticle } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'
import NewsletterSignup from '../../../components/NewsletterSignup'
import BackgroundPattern from '../../../components/animations/BackgroundPattern'

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = await getArticle(slug)

  return (
    <main className="page-article">

      {/* Hero */}
      <BackgroundPattern variant="constellation" style={{ background: 'var(--dark)' }}>
        <section className="section--full dark-bg" style={{ padding: '100px 48px 120px', background: 'transparent' }}>
          <div className="wrap--narrow">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/article" className="breadcrumb__link">Thinking</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{article.category}</span>
            </div>

            <span className="kicker" style={{ marginBottom: '16px' }}>{article.category}</span>
            <h1 className="heading-h1" style={{
              color: '#ffffff',
              margin: '0 0 32px',
            }}>
              {article.title}
            </h1>
            {article.shortSummary && (
              <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {article.shortSummary}
              </p>
            )}
          </div>
        </section>
      </BackgroundPattern>

      {/* Body */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div className="wrap--narrow">
          <div className="portable-text">
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

          <NewsletterSignup variant="inline" />

          {/* Related dimensions */}
          {article.relatedDimensions?.length > 0 && (
            <div className="scroll-in" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                Related dimensions
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {article.relatedDimensions.map((dimension) => (
                  <Link
                    key={dimension._id}
                    href={`/emergent-framework/${dimension.slug.current}`}
                    style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: dimension.colour,
                      border: `1.5px solid ${dimension.colour}`,
                      padding: '8px 16px',
                      textDecoration: 'none',
                      transition: 'background 0.2s, color 0.2s',
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
