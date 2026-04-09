import { client, getTool } from '../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import CTA from '../../../components/CTA'
import ToolDownloadForm from '../../../components/ToolDownloadForm'
import ToolFloatingBar from '../../../components/ToolFloatingBar'
import Link from 'next/link'
import { urlFor } from '../../../sanity/image'

export const revalidate = 3600

export async function generateStaticParams() {
  const tools = await client.fetch(`*[_type == "tool"]{ "slug": slug.current }`)
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)
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
      type: 'article',
    },
  }
}

export default async function ToolPage({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)

  const pdfUrl = tool.toolkitFileUrl || null
  const heroImageUrl = tool.heroImage ? urlFor(tool.heroImage).width(600).url() : null

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
      <section className="section--full dark-bg section-padding-hero">
        <div className={`section__inner tool-hero-grid${heroImageUrl ? '' : ' tool-hero-grid--single'}`}>
          {/* Left: text content */}
          <div>
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/tools" className="breadcrumb__link">Tools</Link>
              {tool.category && (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <span className="breadcrumb__current">{tool.category}</span>
                </>
              )}
            </div>

            {tool.category && (
              <span className="kicker" style={{ marginBottom: '16px' }}>{tool.category}</span>
            )}
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

            {/* Quick download button - scrolls to form */}
            {pdfUrl && (
              <a
                id="tool-hero-cta"
                href="#get-template"
                className="btn-primary btn-primary--dark"
                style={{ marginTop: '2rem', display: 'inline-flex' }}
              >
                Get this template
              </a>
            )}
          </div>

          {/* Right: hero image with perspective shift */}
          {heroImageUrl && (
            <div className="tool-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <Image
                  src={heroImageUrl}
                  alt={tool.title || ''}
                  width={600}
                  height={400}
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
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

      {/* Body */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div className="wrap--narrow">
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
        </div>
      </section>

      {/* Download form */}
      {pdfUrl && (
        <section
          id="get-template"
          className="section--full warm-bg scroll-in section-padding"
        >
          <div className="wrap--narrow">
            <ToolDownloadForm
              toolTitle={tool.title}
              toolSlug={slug}
              pdfUrl={pdfUrl}
              heroImageUrl={heroImageUrl}
            />
          </div>
        </section>
      )}

      {pdfUrl && <ToolFloatingBar toolTitle={tool.title} />}

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}
