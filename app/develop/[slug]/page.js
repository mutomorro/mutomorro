import Link from 'next/link'
import { getCapabilityService, getAllCapabilityServices } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../components/CTA'

// Accent colours for numbered items
const ACCENT_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00', '#221C2B', '#80388F', '#9B51E0', '#FF4279']

// Bento colours for takeaway cards
const BENTO_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00', '#221C2B']

// Mid-page CTA
function MidPageCta({ text, buttonLabel, serviceTitle }) {
  return (
    <div style={{
      padding: '12px 48px 68px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '18px',
        fontWeight: '300',
        fontStyle: 'italic',
        color: 'rgba(0,0,0,0.55)',
        margin: '0 0 20px',
        lineHeight: '1.5',
      }}>
        {text}
      </p>
      <a
        href={`/contact?service=${encodeURIComponent(serviceTitle)}`}
        className="btn-primary"
      >
        {buttonLabel}
      </a>
    </div>
  )
}

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug } = await params
  const service = await getCapabilityService(slug)
  if (!service) return {}

  return {
    title: service.seoTitle || `${service.heroHeading || service.title} | Mutomorro`,
    description: service.seoDescription || service.heroTagline,
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function CapabilityServicePage({ params }) {
  const { slug } = await params
  const service = await getCapabilityService(slug)

  if (!service) notFound()

  // Build anchor nav items from available sections
  const navItems = []
  if (service.audienceBody?.length > 0) navItems.push('Who it\'s for')
  if (service.structureItems?.length > 0) navItems.push('How it works')
  if (service.differenceItems?.length > 0) navItems.push('What\'s different')
  if (service.takeawayItems?.length > 0) navItems.push('What you take away')

  return (
    <main>

      {/* ==========================================
          HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
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
      </section>

      {/* ==========================================
          ANCHOR NAV (mid-dark)
          ========================================== */}
      {navItems.length > 0 && (
        <nav className="anchor-nav">
          <div className="anchor-nav__inner">
            {navItems.map((label) => {
              const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              return (
                <a
                  key={label}
                  href={`#${id}`}
                  className="anchor-nav__link"
                >
                  {label}
                </a>
              )
            })}
          </div>
        </nav>
      )}

      {/* ==========================================
          WHO IT'S FOR (warm)
          ========================================== */}
      {service.audienceBody?.length > 0 && (
        <section id="who-its-for" className="section--full" style={{ padding: '80px 48px', background: 'var(--warm)', position: 'relative' }}>
          {/* Shadow gradient from anchor nav */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to bottom, rgba(66, 59, 73, 0.15), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                Who it's for
              </span>
              <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                {service.audienceHeading || 'Who this is for'}
              </h2>
              <div style={{ maxWidth: '750px' }}>
                <div className="portable-text">
                  <PortableText value={service.audienceBody} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          HOW IT WORKS / STRUCTURE (white)
          ========================================== */}
      {service.structureItems?.length > 0 && (
        <section id="how-it-works" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                How it works
              </span>
              <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                {service.structureHeading || 'How the programme works'}
              </h2>
              {service.structureIntro && (
                <p className="lead-text" style={{ maxWidth: '700px', marginBottom: '3rem' }}>
                  {service.structureIntro}
                </p>
              )}
            </div>

            {/* Numbered items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {service.structureItems.map((item, i) => (
                <div
                  key={item._key || i}
                  className="scroll-in"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr',
                    gap: '24px',
                    padding: '32px 0',
                    borderBottom: i < service.structureItems.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  {/* Number */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: ACCENT_COLOURS[i % ACCENT_COLOURS.length],
                    paddingTop: '4px',
                    letterSpacing: '0.05em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
                      {item.itemTitle}
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '300',
                      lineHeight: '1.75',
                      color: 'var(--dark)',
                      margin: 0,
                      maxWidth: '640px',
                    }}>
                      {item.itemDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          BRIDGE TEXT (mid-dark)
          ========================================== */}
      {service.differenceItems?.length > 0 && (
        <section style={{
          background: '#423B49',
          padding: '60px 48px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <p style={{
              fontSize: '22px',
              fontWeight: '300',
              lineHeight: '1.7',
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}>
              There is a lot of {service.title?.toLowerCase() || 'development'} out there.{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Here is what makes this different.</em>
            </p>
          </div>
        </section>
      )}

      {/* ==========================================
          WHAT'S DIFFERENT (warm)
          ========================================== */}
      {service.differenceItems?.length > 0 && (
        <section id="whats-different" className="section--full" style={{ padding: '80px 48px', background: 'var(--warm)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>
                What's different
              </span>
              <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                {service.differenceHeading || 'What makes this different'}
              </h2>
              {service.differenceIntro && (
                <p className="lead-text" style={{ maxWidth: '700px', marginBottom: '3rem' }}>
                  {service.differenceIntro}
                </p>
              )}
            </div>

            {/* Difference items - card layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: service.differenceItems.length <= 3
                ? `repeat(${service.differenceItems.length}, 1fr)`
                : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {service.differenceItems.map((item, i) => (
                <div
                  key={item._key || i}
                  className="scroll-in"
                  style={{
                    background: 'var(--white)',
                    padding: '32px',
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
                    {item.itemTitle}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '300',
                    lineHeight: '1.75',
                    color: 'rgba(0,0,0,0.75)',
                    margin: 0,
                  }}>
                    {item.itemDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          WHAT YOU TAKE AWAY (white) - bento grid
          ========================================== */}
      {service.takeawayItems?.length > 0 && (
        <section id="what-you-take-away" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>
                What you take away
              </span>
              <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                {service.takeawayHeading || 'What you take away'}
              </h2>
              {service.takeawayIntro && (
                <p className="lead-text" style={{ maxWidth: '700px', marginBottom: '3rem' }}>
                  {service.takeawayIntro}
                </p>
              )}
            </div>

            {/* Bento grid for takeaways */}
            <div
              className={`bento-grid ${
                service.takeawayItems.length <= 3 ? 'bento-grid--3' :
                service.takeawayItems.length <= 4 ? 'bento-grid--4' :
                service.takeawayItems.length <= 5 ? 'bento-grid--5' : 'bento-grid--large'
              }`}
            >
              {service.takeawayItems.map((item, i) => (
                <div
                  key={item._key || i}
                  className={`bento-box scroll-in ${i === 0 && service.takeawayItems.length >= 5 ? 'bento-box--featured' : ''}`}
                  style={{
                    background: BENTO_COLOURS[i % BENTO_COLOURS.length],
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  <p className={`bento-box__title ${i === 0 && service.takeawayItems.length >= 5 ? 'bento-box__title--large' : ''}`}>
                    {item.itemTitle}
                  </p>
                  {item.itemDescription && (
                    <p className="bento-box__desc">{item.itemDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          MID-PAGE CTA
          ========================================== */}
      <MidPageCta
        text="Want to explore what this could look like for your organisation?"
        buttonLabel="Let's talk"
        serviceTitle={service.title}
      />

      {/* ==========================================
          CTA (dark)
          ========================================== */}
      <CTA
        label="Get in touch"
        heading={service.ctaHeading || `Interested in ${service.title?.toLowerCase() || 'this'}?`}
        body={service.ctaBody || 'Every organisation is different, so we always start with a conversation. No pitch, no obligation - just an honest discussion about what you need and whether our approach feels right.'}
        buttonText={service.ctaButtonLabel || 'Talk to us'}
        buttonLink={service.ctaButtonUrl || '/contact'}
      />

    </main>
  )
}