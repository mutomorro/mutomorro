import { notFound } from 'next/navigation'
import { getArticle } from '../../../sanity/client'
import { client } from '../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'
import NewsletterSignup from '../../../components/NewsletterSignup'
import BackgroundPattern from '../../../components/animations/BackgroundPattern'

export const revalidate = 3600

export async function generateStaticParams() {
  const articles = await client.fetch(`*[_type == "article"]{ "slug": slug.current }`)
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      title, subtitle, seoTitle, seoDescription, shortSummary,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!article) return {}

  const rawTitle = article.seoTitle || article.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = article.seoDescription || article.shortSummary || article.subtitle || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(article.heroImageUrl && {
        images: [{ url: article.heroImageUrl, width: 1200, height: 630 }],
      }),
    },
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const heroImageUrl = article.heroImage ? urlFor(article.heroImage).width(900).url() : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription || article.shortSummary || article.subtitle,
    author: {
      '@type': 'Person',
      name: 'James Freeman-Gray',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/articles/${article.slug.current}`,
    ...(article._createdAt && { datePublished: article._createdAt }),
    ...(article._updatedAt && { dateModified: article._updatedAt }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Thinking',
        item: 'https://mutomorro.com/articles',
      },
      ...(article.category ? [{
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: 'https://mutomorro.com/articles',
      }] : []),
      {
        '@type': 'ListItem',
        position: article.category ? 3 : 2,
        name: article.title,
        item: `https://mutomorro.com/articles/${article.slug.current}`,
      },
    ],
  }

  return (
    <main className="page-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <BackgroundPattern variant="constellation" style={{ background: 'var(--dark)' }}>
        <section className="section--full dark-bg section-padding-hero" style={{ background: 'transparent' }}>
          <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`}>
            <div>
              {/* Breadcrumb */}
              <div className="breadcrumb">
                <Link href="/articles" className="breadcrumb__link">Thinking</Link>
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

            {heroImageUrl && (
              <div className="content-hero-image-wrap">
                <div className="img-perspective" style={{ maxWidth: '100%' }}>
                  <Image
                    src={heroImageUrl}
                    alt={article.title || ''}
                    width={900}
                    height={600}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </BackgroundPattern>

      {/* Body */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div className="wrap--narrow">
          <div className="portable-text">
            <PortableText
              value={article.body}
              components={{
                types: {
                  image: ({ value }) => (
                    <div className="img-mat" style={{ margin: '2.5rem 0' }}>
                      <Image
                        src={urlFor(value).width(900).url()}
                        alt={value.alt || ''}
                        width={900}
                        height={506}
                        sizes="(max-width: 768px) 100vw, 800px"
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
