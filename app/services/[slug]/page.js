import Link from 'next/link'
import Image from 'next/image'
import { client, getService } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../components/CTA'
import ServiceTripleCta, { ServiceTripleCtaDark } from '../../../components/ServiceTripleCta'
import EcosystemVisual from '../../../components/EcosystemVisual'
import ServiceHero from '../../../components/heroes/ServiceHero'
import RecognitionRow from '../../../components/RecognitionRow'
import LogoStrip from '../../../components/LogoStrip'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import PageCallouts from '../../../components/PageCallouts'
import ApproachSlider from '../../../components/services/ApproachSlider'
import PropositionStepper from '../../../components/services/PropositionStepper'
import RecognitionTriggers from '../../../components/services/RecognitionTriggers'
import ServiceFAQ from '../../../components/services/ServiceFAQ'
import { buildFaqJsonLd } from '../../../components/services/faqJsonLd'

export const revalidate = 3600

export async function generateStaticParams() {
  const services = await client.fetch(`*[_type == "service"]{ "slug": slug.current }`)
  return services.map(s => ({ slug: s.slug }))
}

// Wraps a target phrase with the .marker-highlight span when it
// appears inside `text`. Case-insensitive match; preserves the original
// casing. Falls back to plain text if the phrase isn't found, so
// per-service editorial changes don't break the page.
function HighlightedText({ text, phrase }) {
  if (!text) return null
  if (!phrase) return text
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="marker-highlight">{text.slice(idx, idx + phrase.length)}</span>
      {text.slice(idx + phrase.length)}
    </>
  )
}

// Walks a portable-text array and, wherever a span contains `phrase`,
// splits that span into three (before, linked, after) and adds a `link`
// markDef so the standard PortableText renderer outputs an <a>. Lets
// editors write prose normally in Sanity while specific phrases get
// auto-linked at render time. Idempotent: skips spans already linked.
function linkifyPhrase(blocks, phrase, href) {
  if (!Array.isArray(blocks) || !phrase || !href) return blocks
  const lowerPhrase = phrase.toLowerCase()
  let linkCounter = 0
  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return block
    const newChildren = []
    const newMarkDefs = [...(block.markDefs || [])]
    let changed = false
    for (const span of block.children) {
      if (span._type !== 'span' || !span.text || !span.text.toLowerCase().includes(lowerPhrase)) {
        newChildren.push(span)
        continue
      }
      if (span.marks?.some((m) => newMarkDefs.find((d) => d._key === m && d._type === 'link'))) {
        newChildren.push(span)
        continue
      }
      const idx = span.text.toLowerCase().indexOf(lowerPhrase)
      const before = span.text.slice(0, idx)
      const match = span.text.slice(idx, idx + phrase.length)
      const after = span.text.slice(idx + phrase.length)
      const markKey = `auto-link-${block._key}-${linkCounter++}`
      newMarkDefs.push({ _key: markKey, _type: 'link', href })
      if (before) newChildren.push({ ...span, _key: `${span._key}-pre`, text: before })
      newChildren.push({
        ...span,
        _key: `${span._key}-link`,
        text: match,
        marks: [...(span.marks || []), markKey],
      })
      if (after) newChildren.push({ ...span, _key: `${span._key}-post`, text: after })
      changed = true
    }
    return changed ? { ...block, children: newChildren, markDefs: newMarkDefs } : block
  })
}

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug } = await params
  const service = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]{
      title, heroHeading, heroKicker, seoTitle, seoDescription, heroTagline,
      "ogImageUrl": propositionImage.asset->url
    }`,
    { slug }
  )
  if (!service) return {}

  const rawTitle = service.seoTitle || service.heroHeading
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = service.seoDescription || service.heroTagline || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mutomorro.com/services/${slug}`,
      type: 'article',
      images: [{
        url: service.ogImageUrl || '/og-default.png',
        width: 1200,
        height: 630,
      }],
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ServicePage({ params }) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) notFound()

  const heroKicker = service.heroKicker || service.title

  const hasPropositionSteps = service.propositionSteps?.length > 0
  const hasTriggers = service.triggerCards?.length > 0
  const hasFaqs = service.faqItems?.length > 0

  // Auto-link "Our philosophy page" → /our-philosophy in the perspective
  // body. Editors keep the phrase as plain prose in Sanity; the link is
  // applied at render time so per-service copy edits don't need to know
  // about portable-text markDefs.
  const perspectiveBody = linkifyPhrase(
    service.perspectiveBody,
    'Our philosophy page',
    '/our-philosophy',
  )
  const hasRelatedProjects = service.relatedProjects?.length > 0
  const hasMoreProjects = (service.relatedProjects?.length || 0) > 3

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.heroHeading,
    description: service.seoDescription || service.heroTagline,
    provider: {
      '@type': 'ProfessionalService',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/services/${service.slug.current}`,
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
        name: service.heroHeading || service.title,
        item: `https://mutomorro.com/services/${service.slug.current}`,
      },
    ],
  }

  const faqJsonLd = hasFaqs ? buildFaqJsonLd(service.faqItems) : null

  return (
    <main className="service-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ==========================================
          SECTION 1: HERO (dark)
          H1 = small heroKicker label, H2 = large statement
          ========================================== */}
      <section className="section--full dark-bg section-padding-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', maxWidth: '1350px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: '1 1 55%', maxWidth: '600px' }}>
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/services" className="breadcrumb__link">How we help</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{service.categoryLabel}</span>
            </div>

            {/* H1 - small kicker carries the SEO keyword */}
            <h1 className="kicker service-hero__h1" style={{ marginBottom: '16px' }}>
              {heroKicker}
            </h1>

            {/* H2 - large visual hero statement */}
            <h2 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '900px' }}>
              {service.heroHeading}
            </h2>
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
              {service.heroTagline}
            </p>
          </div>
        </div>

        {/* Hero animation - right side, left edge at content midpoint, capped width */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 'min(50%, 750px)',
          height: '100%',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '120px',
            height: '100%',
            background: 'linear-gradient(to right, var(--dark), transparent)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          <ServiceHero slug={slug} />
        </div>
      </section>

      {/* ==========================================
          ANCHOR NAV (updated labels for new section order)
          ========================================== */}
      <nav className="anchor-nav">
        <div className="anchor-nav__inner">
          {(() => {
            const navItems = ['Context']
            if (hasPropositionSteps || service.recognitionItems?.length > 0) {
              navItems.push('Proposition')
            }
            if (hasRelatedProjects) navItems.push('Proof')
            navItems.push('Approach', 'Perspective')
            if (hasFaqs) navItems.push('FAQ')
            return navItems
          })().map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="anchor-nav__link"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ==========================================
          SECTION 2: CONTEXT (warm)
          ========================================== */}
      <BackgroundPattern variant="woven" className="section--full section-padding" style={{ background: '#FAF6F1', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '16px',
          background: 'linear-gradient(to bottom, rgba(66, 59, 73, 0.15), transparent)',
          pointerEvents: 'none',
        }} />

        <div id="context" style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>Context</span>
            <h2 className="heading-h2" style={{ margin: '0 0 2rem' }}>
              <HighlightedText text={service.contextHeading} phrase="create the conditions" />
            </h2>
          </div>

          {(() => {
            const fanImages = (service.stages || []).slice(0, 3).filter(s => s.stageImageUrl)
            const hasFan = fanImages.length > 0
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: hasFan ? '1fr 1fr' : '1fr',
                gap: '4rem',
                alignItems: 'start',
              }}>
                <div className="scroll-in" style={{ maxWidth: hasFan ? 'none' : '800px' }}>
                  <div className="portable-text" style={{ color: 'rgba(0,0,0,0.7)' }}>
                    <PortableText value={service.contextBody} />
                  </div>
                  <ServiceTripleCta
                    serviceTitle={service.title}
                    heroHeading={service.heroHeading}
                    slug={slug}
                    position="after-context"
                  />
                </div>

                {hasFan && (
                  <div className="fan-composition scroll-in delay-1">
                    {service.stages[2]?.stageImageUrl && (
                      <div className="fan-card fan-card-back">
                        <Image
                          src={service.stages[2].stageImageUrl}
                          alt={`${service.title} - ${service.stages[2].stageHeading || 'Implement'}`}
                          width={400}
                          height={300}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    {service.stages[1]?.stageImageUrl && (
                      <div className="fan-card fan-card-middle">
                        <Image
                          src={service.stages[1].stageImageUrl}
                          alt={`${service.title} - ${service.stages[1].stageHeading || 'Co-design'}`}
                          width={400}
                          height={300}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    {service.stages[0]?.stageImageUrl && (
                      <div className="fan-card fan-card-front">
                        <Image
                          src={service.stages[0].stageImageUrl}
                          alt={`${service.title} - ${service.stages[0].stageHeading || 'Understand'}`}
                          width={400}
                          height={300}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </BackgroundPattern>

      {/* ==========================================
          LOGO STRIP
          ========================================== */}
      {service.showLogoStrip !== false && (
        <LogoStrip />
      )}

      {/* ==========================================
          SECTION 3: PROPOSITION
          New PropositionStepper if propositionSteps exists.
          Otherwise falls back to the legacy Recognition section.
          ========================================== */}
      {hasPropositionSteps ? (
        <section id="proposition" className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            {/* Full-width section heading, sized like other section H2s */}
            <div className="scroll-in" style={{ marginBottom: '2.5rem' }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                {service.propositionKicker || 'Our proposition'}
              </span>
              <h2 className="heading-h2" style={{ margin: 0 }}>
                <HighlightedText
                  text={service.propositionHeadline || service.recognitionHeading}
                  phrase="conditions that create it"
                />
              </h2>
            </div>

            <PropositionStepper
              steps={service.propositionSteps}
              philosophyLinkLabel={service.propositionPhilosophyLinkLabel}
              philosophyLinkUrl={service.propositionPhilosophyLinkUrl}
            />
          </div>
        </section>
      ) : (
        service.recognitionItems?.length > 0 && (
          <section id="proposition" className="section--full section-padding" style={{ background: 'var(--white)' }}>
            <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
              <div className="scroll-in">
                <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>Recognition</span>
                <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
                  {service.recognitionHeading}
                </h2>
                {service.recognitionIntro && (
                  <p className="lead-text" style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
                    {service.recognitionIntro}
                  </p>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '2.5rem',
              }}>
                {service.recognitionItems.slice(0, 4).map((item, i) => (
                  <RecognitionRow
                    key={item._key || i}
                    item={item}
                    index={i}
                    slug={slug}
                    delay={i * 0.1}
                  />
                ))}
              </div>

              <ServiceTripleCta
                serviceTitle={service.title}
                heroHeading={service.heroHeading}
                slug={slug}
                position="after-recognition"
              />
            </div>
          </section>
        )
      )}

      {/* Bridge text only renders in the legacy recognition path */}
      {!hasPropositionSteps && service.recognitionBridge && (
        <section className="section--full dark-bg bridge-text section-padding" style={{ background: '#423B49' }}>
          <div className="scroll-in" style={{
            maxWidth: '860px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div className="portable-text">
              <PortableText value={service.recognitionBridge} components={{
                marks: {
                  em: ({ children }) => (
                    <em style={{ color: '#9B51E0', fontStyle: 'italic' }}>{children}</em>
                  ),
                },
              }} />
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 4: RECOGNITION TRIGGERS (dark, scattered chips)
          ========================================== */}
      {hasTriggers && (
        <RecognitionTriggers
          cards={service.triggerCards}
          heading={service.triggerSectionHeading || 'Leaders come to us at moments like these'}
          kicker={service.triggerSectionKicker || 'Common catalysts'}
        />
      )}

      {/* ==========================================
          SECTION 5: PROOF (case studies, 3 in a row)
          ========================================== */}
      {(hasRelatedProjects || service.testimonialQuote) && (
        <section id="proof" className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                {service.proofSectionKicker || 'Proof in practice'}
              </span>
              <h2 className="heading-h2" style={{ margin: '0 0 1.25rem' }}>
                {service.proofSectionHeading || 'See how this works in real organisations'}
              </h2>
              {service.proofSectionIntro && (
                <p className="lead-text" style={{ maxWidth: '760px', marginBottom: '2.5rem' }}>
                  {service.proofSectionIntro}
                </p>
              )}
            </div>

            {hasRelatedProjects && (
              <>
                <div
                  className={`proof-cards-grid proof-cards-grid--${
                    service.relatedProjects.length === 1
                      ? 'one'
                      : service.relatedProjects.length === 2
                        ? 'two'
                        : 'three'
                  }`}
                  style={{
                    marginBottom: hasMoreProjects ? '1.5rem' : (service.testimonialQuote ? '3rem' : 0),
                  }}
                >
                  {service.relatedProjects.slice(0, 3).map((project, i) => (
                    <Link
                      key={project._id}
                      href={`/projects/${project.slug.current}`}
                      className="card-a scroll-in"
                      style={{ transitionDelay: `${i * 0.1}s`, overflow: 'hidden' }}
                    >
                      {project.heroImageUrl && (
                        <div className="img-lift" style={{
                          width: '100%',
                          height: '200px',
                          overflow: 'hidden',
                        }}>
                          <Image
                            src={project.heroImageUrl}
                            alt={project.title || ''}
                            width={600}
                            height={200}
                            sizes="(max-width: 768px) 100vw, 600px"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                      <div className="card-a__corner"></div>
                      <div className="card-a__body">
                        {project.clientSector && (
                          <span className="card-a__tag">{project.clientSector}</span>
                        )}
                        <p className="card-a__title">{project.title}</p>
                        {project.shortSummary && (
                          <p className="card-a__text">{project.shortSummary}</p>
                        )}
                      </div>
                      <div className="card-a__footer">
                        <div className="card-a__footer-bg"></div>
                        <div className="card-a__action">
                          Read the full story <span className="arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMoreProjects && (
                  <p style={{ margin: '0 0 2.5rem' }}>
                    <Link
                      href={`/projects?service=${encodeURIComponent(service.title)}`}
                      className="inline-link"
                    >
                      See more case studies →
                    </Link>
                  </p>
                )}
              </>
            )}

            {service.testimonialQuote && (
              <div className="scroll-in pull-quote">
                <blockquote style={{ margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{service.testimonialQuote}&rdquo;
                </blockquote>
                {service.testimonialAttribution && (
                  <cite style={{
                    display: 'block',
                    marginTop: '12px',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    color: 'rgba(0,0,0,0.45)',
                  }}>
                    — {service.testimonialAttribution}
                  </cite>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 6: STATS (dark)
          ========================================== */}
      {service.stats?.length > 0 && (
        <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding" style={{ background: '#221C2B' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            {(service.statsSectionKicker || service.statsSectionHeading) && (
              <div className="scroll-in stats-section__header">
                {service.statsSectionKicker && (
                  <span className="kicker stats-section__kicker">
                    {service.statsSectionKicker}
                  </span>
                )}
                {service.statsSectionHeading && (
                  <h2 className="stats-section__heading">
                    {service.statsSectionHeading}
                  </h2>
                )}
              </div>
            )}
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${service.stats.length}, 1fr)`,
              gap: '2rem',
            }}>
              {service.stats.map((stat, i) => (
                <div key={stat._key || i} className="scroll-in" style={{
                  textAlign: 'center',
                  transitionDelay: `${i * 0.1}s`,
                }}>
                  <p className="stat-number heading-gradient" style={{ margin: '0 0 8px' }}>
                    {stat.statValue}
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    color: '#fff',
                    margin: '0 0 4px',
                  }}>
                    {stat.statLabel}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.35)',
                    margin: 0,
                  }}>
                    {stat.statSource}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </BackgroundPattern>
      )}

      {/* ==========================================
          SECTION 7: APPROACH (slider)
          ========================================== */}
      <BackgroundPattern variant="network" className="section--full section-padding" style={{ background: '#FFFFFF' }}>
        <div id="approach" style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {service.stages?.length > 0 && (
            <ApproachSlider
              approachIntro={service.approachIntro}
              stages={service.stages}
              approachKicker="Our approach"
              approachIntroHeadline={service.approachIntroHeading || 'How we work'}
              principles={service.approachPrinciples}
            />
          )}
        </div>
      </BackgroundPattern>

      {/* ==========================================
          SECTION 8: CTA (triple, dark)
          ========================================== */}
      <ServiceTripleCtaDark
        serviceTitle={service.title}
        heroHeading={service.heroHeading}
        slug={slug}
        position="after-approach"
      />

      {/* ==========================================
          SECTION 9: PERSPECTIVE (warm)
          ========================================== */}
      <section id="perspective" className="section--full warm-bg section-padding">
        {service.perspectiveImageUrl ? (
          <div style={{
            maxWidth: '1350px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '4rem',
            alignItems: 'start',
          }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Perspective</span>
              <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
                {service.perspectiveHeading}
              </h2>
              <div className="portable-text">
                <PortableText value={perspectiveBody} />
              </div>
              {service.perspectiveLinkLabel && service.perspectiveLinkUrl && (
                <Link
                  href={service.perspectiveLinkUrl}
                  className="inline-link"
                  style={{
                    display: 'inline-block',
                    marginTop: '24px',
                    fontSize: '15px',
                    fontWeight: '400',
                  }}
                >
                  {service.perspectiveLinkLabel} →
                </Link>
              )}
            </div>
            <div className="scroll-in delay-1 img-offset img-lift">
              <Image
                src={service.perspectiveImageUrl}
                alt={service.perspectiveHeading}
                width={600}
                height={400}
                sizes="(max-width: 768px) 100vw, 600px"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Perspective</span>
              <h2 className="heading-h2" style={{ margin: '0 0 32px' }}>
                {service.perspectiveHeading}
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'start',
            }}>
              <div className="scroll-in">
                <div className="portable-text" style={{ maxWidth: '600px' }}>
                  <PortableText value={perspectiveBody} />
                </div>
                {service.perspectiveLinkLabel && service.perspectiveLinkUrl && (
                  <Link
                    href={service.perspectiveLinkUrl}
                    className="inline-link"
                    style={{
                      display: 'inline-block',
                      marginTop: '24px',
                      fontSize: '15px',
                      fontWeight: '400',
                    }}
                  >
                    {service.perspectiveLinkLabel} →
                  </Link>
                )}
              </div>
              <div className="scroll-in delay-1">
                <EcosystemVisual />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* The standalone Outcomes section was removed (12 May 2026 brief):
          outcomes are now expressed per-stage inside the Approach slider's
          "What you get" boxes. Sanity content for outcomes/outcomesHeading/
          outcomesIntro/outcomesClosing is intentionally retained for
          possible future reuse. */}

      {/* ==========================================
          SECTION 10: FAQ
          ========================================== */}
      {hasFaqs && (
        <section
          id="faq"
          className="section--full service-faq-section"
          style={{ background: 'var(--white)' }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <ServiceFAQ
              items={service.faqItems}
              heading={service.faqSectionHeading || 'Common questions'}
              kicker={service.faqSectionKicker}
            />
          </div>
        </section>
      )}

      {/* ==========================================
          PAGE CALLOUTS
          ========================================== */}
      <PageCallouts pageType="services" pageId={service._id} />

      {/* ==========================================
          RELATED DIMENSIONS
          ========================================== */}
      {service.relatedDimensions?.length > 0 && (
        <section className="section--full warm-bg section-padding">
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <span className="kicker" style={{ marginBottom: '24px' }}>
              EMERGENT dimensions this connects to
            </span>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {service.relatedDimensions.map((dim) => (
                <Link
                  key={dim._id}
                  href={`/emergent-framework/${dim.slug.current}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: `1.5px solid ${dim.colour}`,
                    color: dim.colour,
                    fontSize: '14px',
                    fontWeight: '400',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <span style={{
                    fontWeight: '400',
                    fontSize: '13px',
                    opacity: 0.7,
                  }}>
                    {dim.anchor}
                  </span>
                  {dim.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          RELATED SERVICES
          ========================================== */}
      {service.relatedServices?.length > 0 && (
        <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <span className="kicker" style={{ marginBottom: '2rem' }}>
              You might also be interested in
            </span>
            <div className="related-services-grid" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(service.relatedServices.length, 3)}, 1fr)`,
              gap: '24px',
            }}>
              {service.relatedServices.map((related, i) => (
                <Link
                  key={related._id}
                  href={`/services/${related.slug.current}`}
                  className="card-a scroll-in"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="card-a__corner"></div>
                  <div className="card-a__body">
                    <span className="card-a__tag">{related.categoryLabel}</span>
                    <p className="card-a__title">{related.title}</p>
                    {related.heroTagline && (
                      <p className="card-a__text">{related.heroTagline}</p>
                    )}
                  </div>
                  <div className="card-a__footer">
                    <div className="card-a__footer-bg"></div>
                    <div className="card-a__action">
                      Learn more <span className="arrow">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          BOTTOM CTA (dark, triple)
          ========================================== */}
      <ServiceTripleCtaDark
        serviceTitle={service.title}
        heroHeading={service.heroHeading}
        slug={slug}
        position="bottom"
      />
    </main>
  )
}
