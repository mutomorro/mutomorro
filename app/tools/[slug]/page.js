import { client, getTool } from '../../../sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import CTA from '../../../components/CTA'
import ToolFloatingBar from '../../../components/ToolFloatingBar'
import Link from 'next/link'
import { urlFor } from '../../../sanity/image'
import RelatedContent from '../../../components/RelatedContent'
import ContentTable from '../../../components/ContentTable'
import ContentAccordion from '../../../components/ContentAccordion'
import ContentTabs from '../../../components/ContentTabs'
import PageCallouts from '../../../components/PageCallouts'
import CalloutTeaser from '../../../components/CalloutTeaser'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'
import { getSidebarCallouts } from '../../../sanity/client'

export const revalidate = 3600

export async function generateStaticParams() {
  const tools = await client.fetch(`*[_type == "tool"]{ "slug": slug.current }`)
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tool = await client.fetch(
    `*[_type == "tool" && slug.current == $slug][0]{
      title, seoTitle, seoDescription, shortSummary,
      _createdAt, _updatedAt,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!tool) return {}

  const rawTitle = tool.seoTitle || tool.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = tool.seoDescription || tool.shortSummary || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mutomorro.com/tools/${slug}`,
      type: 'article',
      publishedTime: tool._createdAt,
      modifiedTime: tool._updatedAt,
      images: [{
        url: tool.heroImageUrl || '/og-default.png',
        width: 1200,
        height: 630,
      }],
    },
  }
}

export default async function ToolPage({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)

  if (!tool) notFound()

  const sidebarCallouts = await getSidebarCallouts('tools', tool._id)

  const heroImageUrl = tool.heroImage ? urlFor(tool.heroImage).width(900).url() : null
  const templateHref = `/tools/${slug}/template`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: tool.seoTitle || tool.title,
    description: tool.seoDescription || tool.shortSummary,
    author: {
      '@type': 'Person',
      name: 'James Freeman-Gray',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/tools/${tool.slug.current}`,
    ...(heroImageUrl && { image: heroImageUrl }),
    ...(tool._createdAt && { datePublished: tool._createdAt }),
    ...(tool._updatedAt && { dateModified: tool._updatedAt }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Tools',
        item: 'https://mutomorro.com/tools',
      },
      ...(tool.category ? [{
        '@type': 'ListItem',
        position: 2,
        name: tool.category,
        item: 'https://mutomorro.com/tools',
      }] : []),
      {
        '@type': 'ListItem',
        position: tool.category ? 3 : 2,
        name: tool.title,
        item: `https://mutomorro.com/tools/${tool.slug.current}`,
      },
    ],
  }

  return (
    <main className="page-tool">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`} style={{ position: 'relative' }}>
          {/* Left: text content */}
          <div>
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/tools" className="breadcrumb__link">Tools</Link>
              {tool.theme?.title ? (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <Link href={`/topics/${tool.theme.slug}`} className="breadcrumb__link">
                    {tool.theme.title}
                  </Link>
                </>
              ) : tool.category ? (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <span className="breadcrumb__current">{tool.category}</span>
                </>
              ) : null}
            </div>

            {tool.theme?.title ? (
              <Link href={`/topics/${tool.theme.slug}`} className="kicker kicker--link" style={{ marginBottom: '16px' }}>
                {tool.theme.title}
              </Link>
            ) : tool.category ? (
              <span className="kicker" style={{ marginBottom: '16px' }}>{tool.category}</span>
            ) : null}
            <h1 className="heading-h1 heading-gradient" style={{
              margin: '0 0 32px',
            }}>
              {tool.title}
            </h1>
            {tool.shortSummary && (
              <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {tool.shortSummary}
              </p>
            )}

            {/* Quick download link - goes to the dedicated template page */}
            {tool.hasToolkit && (
              <Link
                id="tool-hero-cta"
                href={templateHref}
                className="btn-primary btn-primary--dark"
                style={{ marginTop: '2rem', display: 'inline-flex' }}
              >
                Get the free template <span aria-hidden="true" style={{ marginLeft: '0.4em' }}>→</span>
              </Link>
            )}
          </div>

          {/* Right: hero image with perspective shift */}
          {heroImageUrl && (
            <div className="content-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <Image
                  src={heroImageUrl}
                  alt={tool.heroImage?.alt || tool.title || ''}
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
      </BackgroundPattern>

      <CalloutTeaser pageType="tools" pageId={tool._id} />

      {/* Body — three-column layout with ToC and contextual sidebar */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <ThreeColumnLayout
          toc={<TableOfContents body={tool.body} />}
          sidebar={
            <ContentSidebar
              theme={tool.theme}
              contentType="tool"
              currentSlug={slug}
              relatedTools={tool.relatedToolsViaTheme}
              relatedArticles={tool.relatedArticlesViaTheme}
              relatedCaseStudies={tool.relatedCaseStudiesViaTheme}
              sidebarCallouts={sidebarCallouts}
              hasFloatingBar={tool.hasToolkit}
            />
          }
        >
          {tool.body && (
            <div className="portable-text">
              <PortableText
                value={tool.body}
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
                    accordion: ({ value }) => <ContentAccordion value={value} />,
                    tabs: ({ value }) => <ContentTabs value={value} />,
                  },
                  marks: {
                    link: ({ value, children }) => (
                      <a href={value.href} className="inline-link">{children}</a>
                    ),
                  },
                  block: {
                    ...makeHeadingBlocks(buildHeadingIndex(tool.body).idByKey),
                    blockquote: ({ children }) => (
                      <blockquote className="pull-quote">{children}</blockquote>
                    ),
                  },
                }}
              />
            </div>
          )}

          <p className="body-text" style={{ marginTop: '32px' }}>
            We regularly share thinking on organisational change and development on{' '}
            <a
              href="https://www.linkedin.com/company/mutomorro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              LinkedIn
            </a>
            {' '}- ideas, practical approaches, and useful tools for people working on making their organisations better.
          </p>

          <RelatedContent
            relatedTools={tool.relatedTools}
            relatedArticles={tool.relatedArticles}
          />
        </ThreeColumnLayout>
      </section>

      <PageCallouts pageType="tools" pageId={tool._id} />

      {/* Practitioner Insight */}
      {tool.practitionerInsight && (
        <section className="section--full section-padding" style={{ background: '#FFFFFF' }}>
          <div className="section__inner" style={{ maxWidth: '800px' }}>
            <div style={{
              borderLeft: '3px solid #9B51E0',
              paddingLeft: '24px',
            }}>
              <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>From the practitioner</span>
              <p style={{ fontSize: '14px', fontWeight: 400, color: '#221C2B', marginBottom: '16px', lineHeight: '1.6' }}>
                <strong>James Freeman-Gray</strong> is the founder of Mutomorro. He&apos;s an organisational development practitioner who has spent over a decade working with leaders across public, private, and nonprofit sectors - helping organisations navigate change, strengthen culture, and design better ways of working.
              </p>
              <p className="body-text" style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                {tool.practitionerInsight}
              </p>
              {tool.insightServiceSlug && (
                <p style={{ fontSize: '14px', marginTop: '8px', marginBottom: '0' }}>
                  <a href={`/services/${tool.insightServiceSlug}`} className="inline-link">
                    See how we work with this →
                  </a>
                </p>
              )}
              {tool.lastReviewed && (
                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', marginTop: '16px', marginBottom: '0' }}>
                  Last reviewed: {new Date(tool.lastReviewed).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Template download CTA */}
      {tool.hasToolkit && (
        <section
          id="template-cta"
          className="section--full warm-bg scroll-in section-padding"
        >
          <div className="wrap--narrow" style={{ textAlign: 'center' }}>
            <h2 className="heading-h2" style={{ margin: '0 0 16px' }}>
              Ready to use {tool.title}?
            </h2>
            <p className="lead-text" style={{ margin: '0 auto 28px', maxWidth: '520px' }}>
              Download the free template - includes practical guidance for workshops and team sessions.
            </p>
            <Link href={templateHref} className="btn-primary">
              Get the free template <span aria-hidden="true" style={{ marginLeft: '0.4em' }}>→</span>
            </Link>
          </div>
        </section>
      )}

      {tool.hasToolkit && (
        <ToolFloatingBar toolTitle={tool.title} templateHref={templateHref} />
      )}

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}
