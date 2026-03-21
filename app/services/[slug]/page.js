import Link from 'next/link'
import { getService } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../components/CTA'
import EcosystemVisual from '../../../components/EcosystemVisual'
import { JourneyStrip, ProgressBar } from '../../../components/ApproachJourney'
import ServiceHero from '../../../components/heroes/ServiceHero'
import RecognitionRow from '../../../components/RecognitionRow'
import LogoStrip from '../../../components/LogoStrip'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import Lightbox from '../../../components/Lightbox'

// Step colours matching the journey strip
const STEP_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

// Bento box colours for outcomes
const BENTO_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00', '#221C2B']

// Mid-page CTA - lightweight inline prompt + button
function MidPageCta({ text, buttonLabel, serviceTitle }) {
  return (
    <div className="mid-page-cta">
      <p className="mid-page-cta__text">
        {text}
      </p>
      <a
        href={`/contact?service=${encodeURIComponent(serviceTitle)}`}
        className="btn-primary mid-page-cta__btn"
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
  const service = await getService(slug)
  if (!service) return {}

  return {
    title: service.seoTitle || `${service.heroHeading} - Mutomorro`,
    description: service.seoDescription || service.heroTagline,
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ServicePage({ params }) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) notFound()

  return (
    <main className="service-page">

      {/* ==========================================
          SECTION 1: HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', maxWidth: '1350px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: '1 1 55%', maxWidth: '600px' }}>
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/services" className="breadcrumb__link">How we help</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{service.categoryLabel}</span>
            </div>

            <span className="kicker" style={{ marginBottom: '16px' }}>{service.categoryLabel}</span>
            <h1 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '900px' }}>
              {service.heroHeading}
            </h1>
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
          {/* Fade gradient so animation doesn't compete with text */}
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
          ANCHOR NAV
          ========================================== */}
      <nav className="anchor-nav">
        <div className="anchor-nav__inner">
          {(() => {
            const navItems = ['Context', 'Recognition']
            if (service.relatedProjects?.length > 0 || service.testimonialQuote) {
              navItems.push('Examples')
            }
            navItems.push('Approach', 'Perspective', 'Outcomes')
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
      <BackgroundPattern variant="woven" className="section--full" style={{ padding: '80px 48px', background: '#FAF6F1', position: 'relative' }}>
        {/* Shadow gradient from anchor nav dark zone */}
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
          {/* Kicker + heading always full width */}
          <div className="scroll-in">
            <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>Context</span>
            <h2 className="heading-h2" style={{ margin: '0 0 2rem' }}>
              {service.contextHeading}
            </h2>
          </div>

          {/* Body text + fan image split below heading */}
          {(() => {
            const fanImages = (service.stages || []).slice(0, 3).filter(s => s.stageImageUrl);
            const hasFan = fanImages.length > 0;
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: hasFan ? '1fr 1fr' : '1fr',
                gap: '4rem',
                alignItems: 'start',
              }}>
                <div className="scroll-in" style={{
                  maxWidth: hasFan ? 'none' : '800px',
                }}>
                  <div className="portable-text" style={{ color: 'rgba(0,0,0,0.7)' }}>
                    <PortableText value={service.contextBody} />
                  </div>
                </div>

                {/* Fan composition of stage interface screenshots */}
                {hasFan && (
                  <div className="fan-composition scroll-in delay-1">
                    {service.stages[2]?.stageImageUrl && (
                      <div className="fan-card fan-card-back">
                        <img
                          src={service.stages[2].stageImageUrl}
                          alt={`${service.title} - ${service.stages[2].stageHeading || 'Implement'}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                    {service.stages[1]?.stageImageUrl && (
                      <div className="fan-card fan-card-middle">
                        <img
                          src={service.stages[1].stageImageUrl}
                          alt={`${service.title} - ${service.stages[1].stageHeading || 'Co-design'}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                    {service.stages[0]?.stageImageUrl && (
                      <div className="fan-card fan-card-front">
                        <img
                          src={service.stages[0].stageImageUrl}
                          alt={`${service.title} - ${service.stages[0].stageHeading || 'Understand'}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </BackgroundPattern>

      {/* ==========================================
          SECTION 3: LOGO STRIP (single fixed placement)
          ========================================== */}
      {service.showLogoStrip !== false && (
        <LogoStrip />
      )}

      {/* ==========================================
          SECTION 4: RECOGNITION (white)
          ========================================== */}
      <section id="recognition" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
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

          {/* Recognition rows - horizontal stacked boxes, capped at 4 */}
          {service.recognitionItems?.length > 0 && (
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
          )}

        </div>
      </section>

      {/* ==========================================
          BRIDGE TEXT (mid-dark #423B49)
          ========================================== */}
      {service.recognitionBridge && (
        <section className="section--full dark-bg bridge-text" style={{ padding: '80px 48px', background: '#423B49' }}>
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
          SECTION 5: EXAMPLES (white)
          ========================================== */}
      {(service.relatedProjects?.length > 0 || service.testimonialQuote) && (
        <section id="examples" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Proof in practice</span>
              <h2 className="heading-h2" style={{ margin: '0 0 2rem' }}>
                See how this works in real organisations
              </h2>
            </div>

            {/* Related projects */}
            {service.relatedProjects?.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: service.relatedProjects.length > 1 ? '1fr 1fr' : '1fr',
                gap: '24px',
                marginBottom: service.testimonialQuote ? '3rem' : 0,
              }}>
                {service.relatedProjects.map((project, i) => (
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
                        <img
                          src={project.heroImageUrl}
                          alt=""
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
            )}

            {/* Testimonial */}
            {service.testimonialQuote && (
              <div className="scroll-in pull-quote">
                <blockquote style={{ margin: 0, fontStyle: 'italic' }}>
                  "{service.testimonialQuote}"
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
          MID-PAGE CTA: AFTER PROOF
          ========================================== */}
      {(service.relatedProjects?.length > 0 || service.testimonialQuote) && (
        <MidPageCta
          text={service.midCtaAfterProofText || "Want to explore what this could look like for your organisation?"}
          buttonLabel={service.midCtaAfterProofButton || "Let\u2019s talk"}
          serviceTitle={service.title}
        />
      )}

      {/* ==========================================
          SECTION 6: STATS STRIP (full dark #221C2B)
          ========================================== */}
      {service.stats?.length > 0 && (
        <BackgroundPattern variant="constellation" className="section--full dark-bg" style={{ background: '#221C2B', padding: '72px 48px' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
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
          SECTION 8: APPROACH OVERVIEW (white)
          ========================================== */}
      <BackgroundPattern variant="network" className="section--full" style={{ padding: '80px 48px', background: '#FFFFFF' }}>
        <div id="approach" style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Approach</span>
            <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
              Approach
            </h2>
            <div className="portable-text" style={{ maxWidth: '720px' }}>
              <PortableText value={service.approachIntro} />
            </div>
          </div>

          {/* Journey strip - connected nodes replacing the 4 cards */}
          {service.stages?.length > 0 && (
            <JourneyStrip stages={service.stages} />
          )}
        </div>
      </BackgroundPattern>

      {/* Sticky progress bar - rendered at page level so position:sticky works */}
      {service.stages?.length > 0 && (
        <ProgressBar stages={service.stages} />
      )}

      {/* ==========================================
          SECTIONS 9a-9d: INDIVIDUAL STAGES
          ========================================== */}
      {service.stages?.map((stage, i) => (
        <section
          key={stage._key || i}
          data-stage-index={i}
          className="section--full"
          style={{
            padding: '60px 48px 80px',
            background: i % 2 === 0 ? 'var(--warm)' : 'var(--white)',
          }}
        >
          <div className="stage-block" style={{ maxWidth: '1350px', margin: '0 auto' }}>

            {/* TOP ROW: heading+body left, image right */}
            <div className="stage-block__top">
              <div className="stage-block__text scroll-in">
                <p className="stage-number-large" style={{ color: STEP_COLOURS[i] || STEP_COLOURS[0] }}>
                  {stage.stageNumber}
                </p>
                <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                  {stage.stageHeading}
                </h2>
                <div className="portable-text">
                  <PortableText value={stage.stageBody} />
                </div>
                {stage.stageLinkLabel && stage.stageLinkUrl && (
                  <p style={{ marginTop: '20px' }}>
                    <Link href={stage.stageLinkUrl} className="inline-link">
                      {stage.stageLinkLabel} →
                    </Link>
                  </p>
                )}
              </div>

              {stage.stageImageUrl ? (
                <div className="stage-block__image scroll-in delay-1 img-lift">
                  <Lightbox src={stage.stageImageUrl} alt={stage.stageHeading} />
                </div>
              ) : (
                <div className="stage-block__image" style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAF6F1' }}></div>
              )}
            </div>

            {/* BOTTOM ROW: practice bullets left, outcome box right */}
            <div className="stage-block__bottom">
              <div className="stage-block__practices scroll-in">
                {stage.stageInPractice?.length > 0 && (
                  <>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '400',
                      color: 'var(--dark)',
                      margin: '0 0 16px',
                    }}>
                      What this looks like in practice
                    </p>
                    <ul className="practice-list">
                      {stage.stageInPractice.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="stage-block__outcome-wrap scroll-in delay-1">
                {stage.stageOutcome && (
                  <div className="stage-outcome-box">
                    <p className="stage-outcome-box__label">What you get</p>
                    <p className="stage-outcome-box__text">{stage.stageOutcome}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      ))}

      {/* ==========================================
          SECTION 9: PERSPECTIVE (warm)
          ========================================== */}
      <section id="perspective" className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        {service.perspectiveImageUrl ? (
          /* With image: existing two-column layout */
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
                <PortableText value={service.perspectiveBody} />
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
              <img
                src={service.perspectiveImageUrl}
                alt={service.perspectiveHeading}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        ) : (
          /* Without image: H2 full width, then text left + ecosystem right 50/50 */
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            {/* Heading full width */}
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Perspective</span>
              <h2 className="heading-h2" style={{ margin: '0 0 32px' }}>
                {service.perspectiveHeading}
              </h2>
            </div>
            {/* Two columns: text left, animation right - 50/50 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'start',
            }}>
              <div className="scroll-in">
                <div className="portable-text" style={{ maxWidth: '600px' }}>
                  <PortableText value={service.perspectiveBody} />
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

      {/* ==========================================
          SECTION 10: OUTCOMES (warm)
          ========================================== */}
      <section id="outcomes" className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>Outcomes</span>
            <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
              {service.outcomesHeading}
            </h2>
            {service.outcomesIntro && (
              <p className="lead-text" style={{ maxWidth: '700px', marginBottom: '2.5rem' }}>
                {service.outcomesIntro}
              </p>
            )}
          </div>

          {/* Bento grid */}
          {service.outcomes?.length > 0 && (
            <div
              className={`bento-grid ${
                service.outcomes.length === 3 ? 'bento-grid--3' :
                service.outcomes.length === 4 ? 'bento-grid--4' : 'bento-grid--5'
              }`}
              style={{ marginBottom: '2.5rem' }}
            >
              {service.outcomes.map((outcome, i) => (
                <div
                  key={outcome._key || i}
                  className={`bento-box scroll-in ${i === 0 && service.outcomes.length >= 5 ? 'bento-box--featured' : ''}`}
                  style={{
                    background: BENTO_COLOURS[i % BENTO_COLOURS.length],
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  <p className={`bento-box__title ${i === 0 && service.outcomes.length >= 5 ? 'bento-box__title--large' : ''}`}>
                    {outcome.outcomeTitle}
                  </p>
                  {outcome.outcomeDescription && (
                    <p className="bento-box__desc">{outcome.outcomeDescription}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {service.outcomesClosing && (
            <div className="scroll-in" style={{ maxWidth: '700px' }}>
              <p style={{
                fontSize: '18px',
                fontWeight: '300',
                lineHeight: '1.75',
                color: 'rgba(0,0,0,0.55)',
                margin: 0,
              }}>
                {service.outcomesClosing}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          MID-PAGE CTA: AFTER OUTCOMES
          ========================================== */}
      <MidPageCta
        text={service.midCtaAfterOutcomesText || "Ready to make this happen?"}
        buttonLabel={service.midCtaAfterOutcomesButton || "Get in touch"}
        serviceTitle={service.title}
      />

      {/* ==========================================
          RELATED DIMENSIONS
          ========================================== */}
      {service.relatedDimensions?.length > 0 && (
        <section className="section--full warm-bg" style={{ padding: '60px 48px' }}>
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
        <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
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
          SECTION 11: CTA (dark)
          ========================================== */}
      <CTA
        heading={service.ctaHeading || 'Want to explore how this could work for your organisation?'}
        body={service.ctaBody || 'Every organisation is different, so we always start with a conversation. No pitch, no obligation - just an honest discussion about where you are and whether our approach feels right.'}
        buttonText={service.ctaButtonLabel || "Let's have a conversation"}
        buttonLink={service.ctaButtonUrl || '/contact'}
      />

    </main>
  )
}
