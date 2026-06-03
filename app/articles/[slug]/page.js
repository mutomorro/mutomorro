import { notFound } from 'next/navigation'
import { getArticle } from '../../../sanity/client'
import { client } from '../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'
import BackgroundPattern from '../../../components/animations/BackgroundPattern'
import PageCallouts from '../../../components/PageCallouts'
import CalloutTeaser from '../../../components/CalloutTeaser'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import ContentTable from '../../../components/ContentTable'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'
import { getSidebarCallouts } from '../../../sanity/client'

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
      _createdAt, _updatedAt,
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
      url: `https://mutomorro.com/articles/${slug}`,
      type: 'article',
      publishedTime: article._createdAt,
      modifiedTime: article._updatedAt,
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

  const sidebarCallouts = await getSidebarCallouts('articles', article._id)

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
      ...(article.theme?.slug ? [{
        '@type': 'ListItem',
        position: 2,
        name: article.theme.title,
        item: `https://mutomorro.com/topics/${article.theme.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: article.theme?.slug ? 3 : 2,
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
                {article.theme?.title && (
                  <>
                    <span className="breadcrumb__sep">/</span>
                    <Link href={`/topics/${article.theme.slug}`} className="breadcrumb__link">
                      {article.theme.title}
                    </Link>
                  </>
                )}
              </div>

              {article.theme?.title && (
                <Link href={`/topics/${article.theme.slug}`} className="kicker kicker--link" style={{ marginBottom: '16px' }}>
                  {article.theme.title}
                </Link>
              )}
              {article.articleKicker ? (
                <>
                  <h1 className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                    {article.articleKicker}
                  </h1>
                  <h2 className="heading-h1" style={{
                    color: '#ffffff',
                    margin: '0 0 32px',
                  }}>
                    {article.title}
                  </h2>
                </>
              ) : (
                <h1 className="heading-h1" style={{
                  color: '#ffffff',
                  margin: '0 0 32px',
                }}>
                  {article.title}
                </h1>
              )}
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
                    alt={article.heroImage?.alt || article.title || ''}
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

      <CalloutTeaser pageType="articles" pageId={article._id} />

      {/* Body — three-column layout with ToC and contextual sidebar */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <ThreeColumnLayout
          toc={<TableOfContents body={article.body} />}
          sidebar={
            <ContentSidebar
              theme={article.theme}
              contentType="article"
              currentSlug={slug}
              relatedTools={article.relatedToolsViaTheme}
              relatedArticles={article.relatedArticlesViaTheme}
              relatedCaseStudies={article.relatedCaseStudiesViaTheme}
              sidebarCallouts={sidebarCallouts}
              relatedDimensions={article.relatedDimensions}
            />
          }
        >
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
                        sizes="(max-width: 768px) 100vw, 680px"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  ),
                  table: ({ value }) => <ContentTable value={value} />,
                },
                marks: {
                  link: ({ value, children }) => {
                    const isExternal = /^https?:\/\//i.test(value?.href || '')
                    return (
                      <a
                        href={value.href}
                        className="inline-link"
                        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {children}
                      </a>
                    )
                  },
                },
                block: {
                  ...makeHeadingBlocks(buildHeadingIndex(article.body).idByKey),
                  blockquote: ({ children }) => (
                    <blockquote className="pull-quote">{children}</blockquote>
                  ),
                },
              }}
            />
          </div>
        </ThreeColumnLayout>
      </section>

      <PageCallouts pageType="articles" pageId={article._id} />

      <CTA />

    </main>
  )
}
