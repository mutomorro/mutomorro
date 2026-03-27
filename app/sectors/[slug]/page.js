import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import { getSectorLandingPage, getAllSectorLandingPages } from '../../../sanity/client'
import CTA from '../../../components/CTA'

export const revalidate = 3600

// ============================================
// STATIC PARAMS
// ============================================

export async function generateStaticParams() {
  const pages = await getAllSectorLandingPages()
  return pages.map(p => ({ slug: p.slug }))
}

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug } = await params
  const page = await getSectorLandingPage(slug)
  if (!page) return {}

  const title = page.seoTitle || `${page.heroHeading} | Mutomorro`
  const description = page.seoDescription || page.heroSubheading || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function SectorLandingPage({ params }) {
  const { slug } = await params
  const page = await getSectorLandingPage(slug)

  if (!page) notFound()

  return (
    <>
      {/* ==========================================
          SECTION 1 - HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{
        paddingTop: 'clamp(80px, 12vh, 140px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
        paddingLeft: '48px',
        paddingRight: '48px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span className="kicker" style={{ color: '#FFA200' }}>{page.sectorLabel}</span>
          <h1 className="heading-display heading-gradient">
            {page.heroHeading}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(18px, 2vw, 20px)',
            fontWeight: '300',
            lineHeight: '1.7',
            maxWidth: '720px',
            margin: '24px auto 0',
          }}>
            {page.heroSubheading}
          </p>
        </div>
      </section>

      {/* ==========================================
          SECTION 2 - SECTOR CONTEXT (warm)
          ========================================== */}
      <section className="section--full" style={{ padding: '80px 48px', background: '#FAF6F1' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <h2 className="heading-h2 scroll-in" style={{ marginBottom: '2rem' }}>
            {page.contextHeading}
          </h2>
          <div className="scroll-in" style={{ maxWidth: '720px' }}>
            <div className="portable-text">
              <PortableText value={page.contextBody} />
            </div>
          </div>

          {page.contextHighlights?.length > 0 && (
            <div className="sector-highlights scroll-in">
              {page.contextHighlights.map((item, i) => (
                <div key={i} className="sector-highlight-card">
                  <p style={{ margin: 0 }}>
                    {item.highlightText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 3 - LOGO STRIP (white)
          ========================================== */}
      {page.sectorLogos?.length > 0 && (
        <section className="logo-strip" style={{ padding: '32px 0' }} aria-label="Sector organisations">
          <div className="logo-strip__track">
            {[...page.sectorLogos, ...page.sectorLogos].map((logo, i) => (
              <div key={i} className="logo-strip__item">
                <Image
                  src={logo.url}
                  alt={logo.alt || 'Organisation logo'}
                  width={132}
                  height={104}
                  style={{ width: 'auto', height: 'auto', maxWidth: '132px', maxHeight: '104px', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 4 - RELEVANT SERVICES (white)
          ========================================== */}
      {page.featuredServices?.length > 0 && (
        <section className="section--full" style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <h2 className="heading-h2 scroll-in" style={{ marginBottom: page.servicesIntro ? '1rem' : '2.5rem' }}>
              {page.servicesHeading}
            </h2>
            {page.servicesIntro && (
              <p className="scroll-in" style={{
                fontSize: 'clamp(16px, 1.5vw, 17px)',
                fontWeight: '300',
                lineHeight: '1.75',
                maxWidth: '720px',
                marginBottom: '2.5rem',
              }}>
                {page.servicesIntro}
              </p>
            )}
            <div className={`sector-services-grid scroll-in ${page.featuredServices.length <= 3 ? 'sector-services-grid--2col' : ''}`}>
              {page.featuredServices.map((item, i) => {
                const service = item.serviceRef
                if (!service) return null
                const href = service._type === 'capabilityService'
                  ? `/develop/${service.slug}`
                  : `/services/${service.slug}`
                return (
                  <Link key={i} href={href} className="sector-service-card">
                    <h3 className="sector-service-card__title">{service.title}</h3>
                    <p className="sector-service-card__angle">{item.sectorAngle}</p>
                    <span className="sector-service-card__link">Learn more &rarr;</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 5 - CASE STUDIES (warm)
          ========================================== */}
      {page.featuredProjects?.length > 0 && (
        <section className="section--full" style={{ padding: '80px 48px', background: '#FAF6F1' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <h2 className="heading-h2 scroll-in" style={{ marginBottom: page.caseStudiesIntro ? '1rem' : '2.5rem' }}>
              {page.caseStudiesHeading}
            </h2>
            {page.caseStudiesIntro && (
              <p className="scroll-in" style={{
                fontSize: 'clamp(16px, 1.5vw, 17px)',
                fontWeight: '300',
                lineHeight: '1.75',
                maxWidth: '720px',
                marginBottom: '2.5rem',
              }}>
                {page.caseStudiesIntro}
              </p>
            )}
            <div className="scroll-in" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {page.featuredProjects.map((project, i) => (
                <Link key={i} href={`/projects/${project.slug}`} className="card-a" style={{ textDecoration: 'none' }}>
                  {project.heroImageUrl && (
                    <div className="card-a__image">
                      <Image
                        src={project.heroImageUrl}
                        alt={project.title}
                        width={600}
                        height={338}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', aspectRatio: '16/9' }}
                      />
                    </div>
                  )}
                  <div className="card-a__body">
                    {project.clientSector && (
                      <span className="card-a__kicker">{project.clientSector}</span>
                    )}
                    <h3 className="card-a__title">{project.title}</h3>
                    <p className="card-a__text">{project.shortSummary || project.summary}</p>
                  </div>
                  <div className="card-a__footer">
                    <span>Read case study</span>
                    <span className="card-a__arrow">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 6 - USEFUL RESOURCES (white)
          ========================================== */}
      {(page.featuredTools?.length > 0 || page.featuredArticles?.length > 0) && (
        <section className="section--full" style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <h2 className="heading-h2 scroll-in" style={{ marginBottom: '2.5rem' }}>
              {page.resourcesHeading}
            </h2>
            <div className="sector-resources scroll-in">
              {page.featuredTools?.length > 0 && (
                <div>
                  <span className="kicker" style={{ display: 'block', marginBottom: '1.25rem' }}>Tools</span>
                  <ul className="sector-resource-list">
                    {page.featuredTools.map((tool, i) => (
                      <li key={i} className="sector-resource-list__item">
                        <Link href={`/tools/${tool.slug}`} className="inline-link">
                          {tool.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {page.featuredArticles?.length > 0 && (
                <div>
                  <span className="kicker" style={{ display: 'block', marginBottom: '1.25rem' }}>Thinking</span>
                  <ul className="sector-resource-list">
                    {page.featuredArticles.map((article, i) => (
                      <li key={i} className="sector-resource-list__item">
                        <Link href={`/article/${article.slug}`} className="inline-link">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 7 - BRIDGE TEXT + CTA
          ========================================== */}
      {page.bridgeText && (
        <section className="section--full dark-bg bridge-text" style={{ padding: '48px 48px', background: '#423B49' }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              fontWeight: '300',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}>
              {page.bridgeText}
            </p>
          </div>
        </section>
      )}

      <CTA
        {...(page.ctaHeading && { heading: page.ctaHeading })}
        {...(page.ctaBody && { body: page.ctaBody })}
        {...(page.ctaButtonLabel && { buttonText: page.ctaButtonLabel })}
        {...(page.ctaButtonUrl && { buttonLink: page.ctaButtonUrl })}
      />
    </>
  )
}
