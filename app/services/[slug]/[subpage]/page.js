import Link from 'next/link'
import { client, getServiceSubPage } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../../components/CTA'

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

  const rawTitle = page.seoTitle || page.heroHeading
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = page.seoDescription || page.heroTagline || ''

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

  return (
    <main className="service-subpage">

      {/* ==========================================
          HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
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
          CONTENT SECTIONS
          ========================================== */}
      {page.sections?.map((section, index) => {
        const isWarm = section.backgroundStyle === 'warm'
        return (
          <section
            key={index}
            className={isWarm ? 'section--full warm-bg' : ''}
            style={{
              padding: '5rem 48px',
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
        <section style={{ padding: '5rem 48px', backgroundColor: 'var(--warm)' }}>
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
                        <img
                          src={project.heroImageUrl}
                          alt={project.title}
                          className="card-c__image"
                          loading="lazy"
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
        <section style={{ padding: '3rem 48px 0' }}>
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
        buttonLink={page.ctaButtonUrl || '/contact'}
      />

    </main>
  )
}
