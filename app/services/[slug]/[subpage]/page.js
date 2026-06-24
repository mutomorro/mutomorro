import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Image from 'next/image'
import { client, getServiceSubPage } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../../components/CTA'
import ThreeColumnLayout from '../../../../components/ThreeColumnLayout'
import TableOfContents from '../../../../components/TableOfContents'
import ContentSidebar from '../../../../components/ContentSidebar'
import ContentTable from '../../../../components/ContentTable'
import ContentAccordion from '../../../../components/ContentAccordion'
import ContentTabs from '../../../../components/ContentTabs'
import { urlFor } from '../../../../sanity/image'
import { makeHeadingBlocks } from '../../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../../lib/slugify'

export const revalidate = 3600

export async function generateStaticParams() {
  const subpages = await client.fetch(`*[_type == "serviceSubPage"]{ "slug": slug.current, "parentSlug": parentService->slug.current }`)
  return subpages.map(s => ({ slug: s.parentSlug, subpage: s.slug }))
}

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug, subpage } = await params
  const page = await getServiceSubPage(slug, subpage)
  if (!page) return {}

  return buildMetadata({
    title: page.seoTitle || page.heroHeading,
    description: page.seoDescription || page.heroTagline || '',
    path: `/services/${slug}/${subpage}`,
    type: 'article',
  })
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ServiceSubPage({ params }) {
  const { slug, subpage } = await params
  const page = await getServiceSubPage(slug, subpage)

  if (!page) notFound()

  const parentSlug = page.parentService?.slug?.current
  const parentTitle = page.parentService?.title
  const parentCategory = page.parentService?.categoryLabel

  // Heading anchors for the rich body - shared by the left ToC and the heading
  // renderers, so the nav ids match the in-page anchors (the /develop pattern).
  const { idByKey } = buildHeadingIndex(page.body)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.heroHeading,
    description: page.seoDescription || page.heroTagline,
    provider: {
      '@type': 'ProfessionalService',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/services/${slug}/${subpage}`,
    ...(parentTitle && {
      isPartOf: {
        '@type': 'Service',
        name: parentTitle,
        url: `https://mutomorro.com/services/${slug}`,
      },
    }),
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
      ...(parentSlug ? [{
        '@type': 'ListItem',
        position: 2,
        name: parentTitle,
        item: `https://mutomorro.com/services/${parentSlug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: parentSlug ? 3 : 2,
        name: page.heroHeading,
        item: `https://mutomorro.com/services/${slug}/${subpage}`,
      },
    ],
  }

  return (
    <main className="service-subpage">
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
          ========================================== */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/services" className="breadcrumb__link">How we help</Link>
            <span className="breadcrumb__sep">/</span>
            {parentSlug && (
              <>
                <Link href={`/services/${parentSlug}`} className="breadcrumb__link">
                  {parentTitle}
                </Link>
                <span className="breadcrumb__sep">/</span>
              </>
            )}
            <span className="breadcrumb__current">{page.heroHeading}</span>
          </div>

          {parentCategory && (
            <span className="kicker" style={{ marginBottom: '16px' }}>{parentCategory}</span>
          )}
          <h1 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '900px' }}>
            {page.heroHeading}
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            {page.heroTagline}
          </p>
        </div>
      </section>

      {/* ==========================================
          BODY - recognition layer (three-column)
          Left ToC · rich body · right enquiry sidebar.
          Matches the /develop and /training templates. Renders only when the
          new rich `body` is populated; the legacy page (sections only) skips it.
          ========================================== */}
      {page.body?.length > 0 && (
        <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <ThreeColumnLayout
            toc={<TableOfContents body={page.body} />}
            sidebar={
              <ContentSidebar
                contentType="services"
                currentSlug={`${slug}/${subpage}`}
                primaryOverride={{
                  heading: page.ctaHeading,
                  body: page.ctaBody,
                  label: page.ctaButtonLabel,
                  url: page.ctaButtonUrl || (parentSlug ? `/enquiry?service=${parentSlug}` : '/enquiry'),
                }}
              />
            }
          >
            <div className="portable-text">
              <PortableText
                value={page.body}
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
          CONTENT SECTIONS (legacy)
          ========================================== */}
      {page.sections?.map((section, index) => {
        const isWarm = section.backgroundStyle === 'warm'
        return (
          <section
            key={index}
            className={isWarm ? 'section--full warm-bg section-padding' : 'section-padding'}
            style={{
              backgroundColor: isWarm ? 'var(--warm)' : undefined,
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2
                className="heading-h2 scroll-fade-up"
                style={{ margin: '0 0 2rem' }}
              >
                {section.heading}
              </h2>
              {section.body && (
                <div className="body-text scroll-fade-up">
                  <PortableText value={section.body} />
                </div>
              )}
            </div>
          </section>
        )
      })}

      {/* ==========================================
          PROOF / CASE STUDIES
          ========================================== */}
      {(page.proofHeading || page.relatedProjects?.length > 0) && (
        <section className="section-padding" style={{ backgroundColor: 'var(--warm)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            {page.proofHeading && (
              <h2
                className="heading-h2 scroll-fade-up"
                style={{ margin: '0 0 1.5rem' }}
              >
                {page.proofHeading}
              </h2>
            )}
            {page.proofBody && (
              <p
                className="scroll-fade-up"
                style={{
                  fontSize: '18px',
                  lineHeight: '1.75',
                  fontWeight: '300',
                  color: 'rgba(0,0,0,0.7)',
                  margin: '0 0 3rem',
                  maxWidth: '680px',
                }}
              >
                {page.proofBody}
              </p>
            )}

            {page.relatedProjects?.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(page.relatedProjects.length, 3)}, 1fr)`,
                  gap: '2rem',
                }}
              >
                {page.relatedProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project.slug?.current || project.slug}`}
                    className="card-c scroll-card-stagger"
                  >
                    {project.heroImageUrl && (
                      <div className="card-c__image-wrap">
                        <Image
                          src={project.heroImageUrl}
                          alt={project.title}
                          className="card-c__image"
                          width={600}
                          height={338}
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    )}
                    <div className="card-c__body">
                      {project.clientSector && (
                        <span className="kicker">{project.clientSector}</span>
                      )}
                      <h3 className="card-c__title heading-h4">{project.title}</h3>
                      {project.shortSummary && (
                        <p className="card-c__desc">{project.shortSummary}</p>
                      )}
                    </div>
                    <div className="card-c__footer">
                      <span>Read case study</span>
                      <span className="card-c__arrow">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==========================================
          LINK BACK TO PARENT
          ========================================== */}
      {page.parentLinkText && parentSlug && (
        <section className="section-padding">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.75',
              fontWeight: '300',
            }}>
              {page.parentLinkText}{' '}
              <Link href={`/services/${parentSlug}`} className="inline-link">
                {parentTitle} page
              </Link>.
            </p>
          </div>
        </section>
      )}

      {/* ==========================================
          CTA (dark)
          ========================================== */}
      <CTA
        heading={page.ctaHeading || 'Ready to talk?'}
        body={page.ctaBody || 'Get in touch and let\'s have an honest conversation about where you are and what might help.'}
        buttonText={page.ctaButtonLabel || 'Start a conversation'}
        buttonLink={page.ctaButtonUrl || '/enquiry'}
      />

    </main>
  )
}
