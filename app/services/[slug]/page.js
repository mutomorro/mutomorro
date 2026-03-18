import Link from 'next/link'
import { getService } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../components/CTA'

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
    <main>

      {/* ==========================================
          SECTION 1: HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
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
      </section>

      {/* ==========================================
          ANCHOR NAV
          ========================================== */}
      <nav className="anchor-nav">
        <div className="anchor-nav__inner">
          {['Context', 'Perspective', 'Approach', 'Outcomes', 'Examples'].map((label) => (
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
      <section id="context" className="section--full" style={{ padding: '80px 48px', background: 'var(--warm)', position: 'relative' }}>
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

        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Kicker + heading always full width */}
          <div className="scroll-in">
            <span className="kicker" style={{ color: '#FF4279', marginBottom: '16px' }}>Context</span>
            <h2 className="heading-h2" style={{ margin: '0 0 2rem' }}>
              {service.contextHeading}
            </h2>
          </div>

          {/* Body text + image split below heading */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: service.propositionImageUrl ? '55% 1fr' : '1fr',
            gap: '4rem',
            alignItems: 'start',
          }}>
            <div className="scroll-in" style={{
              maxWidth: service.propositionImageUrl ? 'none' : '800px',
            }}>
              <div className="portable-text" style={{ color: 'rgba(0,0,0,0.7)' }}>
                <PortableText value={service.contextBody} />
              </div>
            </div>

            {/* Proposition diagram */}
            {service.propositionImageUrl && (
              <div className="scroll-in delay-1">
                <img
                  src={service.propositionImageUrl}
                  alt={service.propositionCaption || 'Proposition diagram'}
                  style={{ width: '100%', height: 'auto' }}
                />
                {service.propositionCaption && (
                  <p className="caption-text" style={{
                    marginTop: '12px',
                    textAlign: 'center',
                  }}>
                    {service.propositionCaption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 3: RECOGNITION (white)
          ========================================== */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
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

          {/* Recognition cards - 2x2 grid, capped at 4 */}
          {service.recognitionItems?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '28px',
              marginBottom: '2.5rem',
            }}>
              {service.recognitionItems.slice(0, 4).map((item, i) => (
                <div
                  key={item._key || i}
                  className="scroll-in"
                  style={{
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  {/* Image placeholder */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    background: 'var(--warm)',
                  }} />
                  {/* Card text */}
                  <div style={{ padding: '24px 16px' }}>
                    <p style={{
                      fontSize: 'clamp(20px, 2vw, 24px)',
                      fontWeight: '600',
                      lineHeight: '1.3',
                      color: 'var(--dark)',
                      textAlign: 'center',
                      margin: 0,
                    }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ==========================================
          BRIDGE TEXT (mid-dark #423B49)
          ========================================== */}
      {service.recognitionBridge && (
        <section className="section--full dark-bg" style={{ padding: '80px 48px', background: '#423B49' }}>
          <div className="scroll-in" style={{
            maxWidth: '860px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div className="portable-text" style={{
              fontSize: 'clamp(20px, 2vw, 23px)',
              fontWeight: '300',
              lineHeight: '1.65',
              color: 'rgba(255,255,255,0.85)',
            }}>
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
          STATS STRIP (full dark #221C2B)
          ========================================== */}
      {service.stats?.length > 0 && (
        <section className="section--full dark-bg" style={{ padding: '72px 48px' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div style={{
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
        </section>
      )}

      {/* ==========================================
          SECTION 4: PERSPECTIVE (warm)
          ========================================== */}
      <section id="perspective" className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: service.perspectiveImageUrl ? '1fr 380px' : '1fr',
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

          {service.perspectiveImageUrl && (
            <div className="scroll-in delay-1 img-offset">
              <img
                src={service.perspectiveImageUrl}
                alt={service.perspectiveHeading}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 5: APPROACH OVERVIEW (white)
          ========================================== */}
      <section id="approach" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Approach</span>
            <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
              Approach
            </h2>
            <div className="portable-text" style={{ maxWidth: '720px', marginBottom: '3rem' }}>
              <PortableText value={service.approachIntro} />
            </div>
          </div>

          {/* Journey cards - overview of the four stages */}
          {service.stages?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${service.stages.length}, 1fr)`,
              gap: '20px',
              marginBottom: '1rem',
            }}>
              {service.stages.map((stage, i) => (
                <div
                  key={stage._key || i}
                  className="card-a scroll-in"
                  style={{
                    textAlign: 'center',
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="card-a__corner"></div>
                  <div className="card-a__body">
                    <p className="caption-text" style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}>
                      {stage.stageNumber}
                    </p>
                    <p className="card-a__title" style={{ fontSize: '18px' }}>
                      {stage.stageTitle}
                    </p>
                    <p className="card-a__text">
                      {stage.stageSummary}
                    </p>
                  </div>
                  <div className="card-a__footer">
                    <div className="card-a__footer-bg"></div>
                    <div className="card-a__action">
                      Details <span className="arrow">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTIONS 5a-5d: INDIVIDUAL STAGES
          ========================================== */}
      {service.stages?.map((stage, i) => (
        <section
          key={stage._key || i}
          className="section--full"
          style={{
            padding: '60px 48px 80px',
            background: 'var(--white)',
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div style={{
            maxWidth: '1350px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: stage.stageImageUrl ? (i % 2 === 0 ? '380px 1fr' : '1fr 380px') : '1fr',
            gap: '4rem',
            alignItems: 'start',
          }}>
            {/* Image - left on even stages, right on odd */}
            {stage.stageImageUrl && i % 2 === 0 && (
              <div className="scroll-in img-offset" style={{
                position: 'sticky',
                top: '140px',
              }}>
                <img
                  src={stage.stageImageUrl}
                  alt={stage.stageHeading}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            {/* Content */}
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                {stage.stageNumber}
              </span>
              <h2 className="heading-h3" style={{ margin: '0 0 24px' }}>
                {stage.stageHeading}
              </h2>
              <div className="portable-text">
                <PortableText value={stage.stageBody} />
              </div>

              {/* What this looks like in practice */}
              {stage.stageInPractice?.length > 0 && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                }}>
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
                </div>
              )}

              {/* What you get */}
              {stage.stageOutcome && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    color: 'var(--dark)',
                    margin: '0 0 12px',
                  }}>
                    What you get
                  </p>
                  <div style={{
                    background: 'var(--warm)',
                    padding: '20px 24px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontWeight: '300',
                    color: 'var(--dark)',
                  }}>
                    {stage.stageOutcome}
                  </div>
                </div>
              )}
            </div>

            {/* Image - right on odd stages */}
            {stage.stageImageUrl && i % 2 !== 0 && (
              <div className="scroll-in delay-1 img-offset" style={{
                position: 'sticky',
                top: '140px',
              }}>
                <img
                  src={stage.stageImageUrl}
                  alt={stage.stageHeading}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ==========================================
          SECTION 6: OUTCOMES (warm)
          ========================================== */}
      <section id="outcomes" className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Outcomes</span>
            <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
              {service.outcomesHeading}
            </h2>
            {service.outcomesIntro && (
              <p className="lead-text" style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
                {service.outcomesIntro}
              </p>
            )}
          </div>

          {service.outcomes?.length > 0 && (
            <div style={{ margin: '0 0 2.5rem' }}>
              {service.outcomes.map((outcome, i) => (
                <div
                  key={outcome._key || i}
                  className="scroll-in"
                  style={{
                    padding: '20px 0',
                    borderBottom: i < service.outcomes.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    transitionDelay: `${Math.min(i, 4) * 0.1}s`,
                  }}
                >
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '400',
                    color: 'var(--dark)',
                    margin: '0 0 4px',
                  }}>
                    {outcome.outcomeTitle}
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '300',
                    color: 'rgba(0,0,0,0.55)',
                    margin: 0,
                    lineHeight: '1.6',
                  }}>
                    {outcome.outcomeDescription}
                  </p>
                </div>
              ))}
            </div>
          )}

          {service.outcomesClosing && (
            <div className="scroll-in portable-text" style={{ maxWidth: '720px' }}>
              <p>{service.outcomesClosing}</p>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 7: EXAMPLES (white)
          ========================================== */}
      {(service.relatedProjects?.length > 0 || service.testimonialQuote) && (
        <section id="examples" className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Examples</span>
              <h2 className="heading-h2" style={{ margin: '0 0 2rem' }}>
                Examples
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
                    className={`${i === 0 && service.relatedProjects.length > 1 ? 'card-c' : 'card-a'} scroll-in`}
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                    {i === 0 && service.relatedProjects.length > 1 ? (
                      <>
                        <div className="card-c__fill"></div>
                        <div className="card-c__body">
                          {project.clientSector && (
                            <span className="card-c__tag">{project.clientSector}</span>
                          )}
                          <p className="card-c__title">{project.title}</p>
                          {project.shortSummary && (
                            <p className="card-c__text">{project.shortSummary}</p>
                          )}
                          <p className="card-c__action">
                            Read the full story <span className="arrow">→</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
            <div style={{
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
          SECTION 8: CTA (dark)
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
