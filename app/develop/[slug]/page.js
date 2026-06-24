import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Image from 'next/image'
import { client, getCapabilityService, getSidebarCallouts } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../components/CTA'
import PageCallouts from '../../../components/PageCallouts'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import ContentTable from '../../../components/ContentTable'
import ContentAccordion from '../../../components/ContentAccordion'
import ContentTabs from '../../../components/ContentTabs'
import { urlFor } from '../../../sanity/image'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'

export const revalidate = 3600

export async function generateStaticParams() {
  const capabilities = await client.fetch(`*[_type == "capabilityService"]{ "slug": slug.current }`)
  return capabilities.map(c => ({ slug: c.slug }))
}

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug } = await params
  const service = await getCapabilityService(slug)
  if (!service) return {}

  return buildMetadata({
    title: service.seoTitle || service.heroHeading || service.title,
    description: service.seoDescription || service.heroTagline || '',
    path: `/develop/${slug}`,
    image: service.heroImage ? urlFor(service.heroImage).url() : undefined,
    type: 'article',
  })
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function CapabilityServicePage({ params }) {
  const { slug } = await params
  const service = await getCapabilityService(slug)

  if (!service) notFound()

  const sidebarCallouts = await getSidebarCallouts('develop', service._id)

  // Heading anchors for the rich body — shared by the left ToC and the heading
  // renderers, so the nav ids match the in-page anchors (the /training pattern).
  const { idByKey } = buildHeadingIndex(service.body)

  const pageTitle = service.heroHeading || service.title
  const pageDescription = service.seoDescription || service.heroTagline

  const heroImageUrl = service.heroImage ? urlFor(service.heroImage).width(900).url() : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pageTitle,
    description: pageDescription,
    provider: {
      '@type': 'ProfessionalService',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/develop/${slug}`,
    ...(heroImageUrl && { image: heroImageUrl }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'How we help',
        item: 'https://mutomorro.com/services',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Building Capability',
        item: 'https://mutomorro.com/develop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageTitle,
        item: `https://mutomorro.com/develop/${slug}`,
      },
    ],
  }

  return (
    <main className="page-develop">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ==========================================
          HERO (dark)
          Two-column grid when a hero image is set (image on the right),
          single-column fallback when it isn't. Matches the /training template.
          ========================================== */}
      <section className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`}>
          {/* Left: text content */}
          <div>
            {/* Breadcrumb */}
            <div className="breadcrumb" style={{ marginBottom: '24px' }}>
              <Link href="/services" className="breadcrumb__link">How we help</Link>
              <span className="breadcrumb__sep">/</span>
              <Link href="/develop" className="breadcrumb__link">Building Capability</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{service.audienceLabel}</span>
            </div>

            <span className="kicker" style={{ marginBottom: '16px' }}>{service.audienceLabel}</span>
            <h1 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '700px' }}>
              {service.heroHeading || service.title}
            </h1>
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '640px' }}>
              {service.heroTagline}
            </p>
          </div>

          {/* Right: hero image */}
          {heroImageUrl && (
            <div className="content-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <Image
                  src={heroImageUrl}
                  alt={service.heroImage?.alt || service.heroHeading || service.title || ''}
                  width={900}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          BODY — recognition layer (situations / signpost)
          Three-column: left ToC · rich body · right /enquiry sidebar.
          Sits between the hero and the structured sections below
          (recognition before process). Matches the /training template.
          ========================================== */}
      {service.body?.length > 0 && (
        <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <ThreeColumnLayout
            toc={<TableOfContents body={service.body} />}
            sidebar={
              <ContentSidebar
                theme={service.theme}
                contentType="develop"
                currentSlug={slug}
                relatedTools={service.relatedToolsViaTheme}
                relatedCaseStudies={service.relatedCaseStudiesViaTheme}
                sidebarCallouts={sidebarCallouts}
              />
            }
          >
            <div className="portable-text">
              <PortableText
                value={service.body}
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
                    link: ({ value, children }) => {
                      const href = value?.href || ''
                      const external = /^https?:/i.test(href)
                      return (
                        <a
                          href={href}
                          className="inline-link"
                          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {children}
                        </a>
                      )
                    },
                  },
                  block: {
                    ...makeHeadingBlocks(idByKey),
                    blockquote: ({ children }) => (
                      <blockquote className="pull-quote">{children}</blockquote>
                    ),
                  },
                }}
              />
            </div>
          </ThreeColumnLayout>
        </section>
      )}

      {/* ==========================================
          PAGE CALLOUTS (content-managed)
          ========================================== */}
      <PageCallouts pageType="develop" pageId={service._id} />

      {/* ==========================================
          CTA (dark)
          ========================================== */}
      <CTA
        label="Get in touch"
        heading={service.ctaHeading || `Interested in ${service.title?.toLowerCase() || 'this'}?`}
        body={service.ctaBody || 'Every organisation is different, so we always start with a conversation. No pitch, no obligation - just an honest discussion about what you need and whether our approach feels right.'}
        buttonText={service.ctaButtonLabel || 'Talk to us'}
        buttonLink={service.ctaButtonUrl || `/enquiry?service=${slug}`}
      />

    </main>
  )
}