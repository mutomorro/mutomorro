import Link from 'next/link'
import { getService } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import CTA from '../../../../components/CTA'

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { category, slug } = await params
  const service = await getService(category, slug)
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
  const { category, slug } = await params
  const service = await getService(category, slug)

  if (!service) notFound()

  return (
    <main>

      {/* ==========================================
          SECTION 1: HERO (dark)
          ========================================== */}
      <section className="section section--dark">
        <div className="wrap">
          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/services"
              style={{
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              How we help
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>→</span>
            <Link
              href={`/services/${category}`}
              style={{
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              {service.categoryLabel}
            </Link>
          </div>

          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            {service.categoryLabel}
          </p>
          <h1 className="heading-gradient heading-display" style={{ margin: '0 0 1.5rem' }}>
            {service.heroHeading}
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '680px' }}>
            {service.heroTagline}
          </p>
        </div>
      </section>

      {/* ==========================================
          ANCHOR NAV
          ========================================== */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #eee',
      }}>
        <div className="wrap" style={{
          display: 'flex',
          gap: '2rem',
          padding: '0.875rem 0',
          overflowX: 'auto',
        }}>
          {['Context', 'Perspective', 'Approach', 'Outcomes', 'Examples'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'var(--color-dark)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ==========================================
          SECTION 2: CONTEXT (dark)
          ========================================== */}
      <section id="context" className="section section--dark">
        <div className="wrap" style={{
          display: 'grid',
          gridTemplateColumns: service.propositionImageUrl ? '1fr 1fr' : '1fr',
          gap: '4rem',
          alignItems: 'start',
        }}>
          {/* Left: heading + body */}
          <div>
            <p className="label label--light" style={{ margin: '0 0 1rem' }}>
              Context
            </p>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: '300',
              lineHeight: '1.2',
              color: '#ffffff',
              margin: '0 0 2rem',
            }}>
              {service.contextHeading}
            </h2>
            <div className="body-text" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <PortableText value={service.contextBody} />
            </div>
          </div>

          {/* Right: proposition diagram */}
          {service.propositionImageUrl && (
            <div>
              <img
                src={service.propositionImageUrl}
                alt={service.propositionCaption || 'Proposition diagram'}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
              {service.propositionCaption && (
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '0.75rem',
                  textAlign: 'center',
                }}>
                  {service.propositionCaption}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 3: RECOGNITION (white)
          ========================================== */}
      <section className="section section--white">
        <div className="wrap">
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            Recognition
          </p>
          <h2 className="heading-large" style={{ margin: '0 0 1.5rem' }}>
            {service.recognitionHeading}
          </h2>
          <p className="lead" style={{ maxWidth: '720px', marginBottom: '2rem' }}>
            {service.recognitionIntro}
          </p>

          {/* Recognition items as cards */}
          {service.recognitionItems?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}>
              {service.recognitionItems.map((item, i) => (
                <div
                  key={item._key || i}
                  className="card"
                  style={{ padding: '1.5rem' }}
                >
                  <p style={{
                    fontSize: '1.05rem',
                    fontWeight: '400',
                    lineHeight: '1.55',
                    color: 'var(--color-dark)',
                    margin: 0,
                  }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bridge text */}
          {service.recognitionBridge && (
            <div style={{
              maxWidth: '720px',
              paddingTop: '1.5rem',
              borderTop: '1px solid #eee',
              color: 'var(--color-dark)',
              opacity: 0.7,
            }}>
              <PortableText value={service.recognitionBridge} />
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          STATS STRIP
          ========================================== */}
      {service.stats?.length > 0 && (
        <section className="section section--white" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${service.stats.length}, 1fr)`,
              gap: '2rem',
              padding: '2rem 0',
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
            }}>
              {service.stats.map((stat, i) => (
                <div key={stat._key || i} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                    fontWeight: '300',
                    color: 'var(--color-accent)',
                    margin: '0 0 0.25rem',
                    lineHeight: 1,
                  }}>
                    {stat.statValue}
                  </p>
                  <p style={{
                    fontSize: '0.9375rem',
                    fontWeight: '400',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.25rem',
                  }}>
                    {stat.statLabel}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-dark)',
                    opacity: 0.4,
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
      <section id="perspective" className="section section--warm">
        <div className="wrap" style={{
          display: 'grid',
          gridTemplateColumns: service.perspectiveImageUrl ? '1fr 380px' : '1fr',
          gap: '4rem',
          alignItems: 'start',
        }}>
          <div>
            <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
              Perspective
            </p>
            <h2 className="heading-large" style={{ margin: '0 0 1.5rem' }}>
              {service.perspectiveHeading}
            </h2>
            <div className="body-text">
              <PortableText value={service.perspectiveBody} />
            </div>
            {service.perspectiveLinkLabel && service.perspectiveLinkUrl && (
              <Link
                href={service.perspectiveLinkUrl}
                style={{
                  display: 'inline-block',
                  marginTop: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '400',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-accent)',
                  paddingBottom: '2px',
                }}
              >
                {service.perspectiveLinkLabel} →
              </Link>
            )}
          </div>

          {service.perspectiveImageUrl && (
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <img
                src={service.perspectiveImageUrl}
                alt={service.perspectiveHeading}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 5: APPROACH OVERVIEW (white)
          ========================================== */}
      <section id="approach" className="section section--white">
        <div className="wrap">
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            Approach
          </p>
          <h2 className="heading-large" style={{ margin: '0 0 1.5rem' }}>
            Approach
          </h2>
          <div className="body-text" style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
            <PortableText value={service.approachIntro} />
          </div>

          {/* Journey cards - overview of the four stages */}
          {service.stages?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${service.stages.length}, 1fr)`,
              gap: '1.25rem',
              marginBottom: '1rem',
            }}>
              {service.stages.map((stage, i) => (
                <div
                  key={stage._key || i}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: '400',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    opacity: 0.4,
                    margin: '0 0 0.5rem',
                  }}>
                    {stage.stageNumber}
                  </p>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '400',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.5rem',
                  }}>
                    {stage.stageTitle}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-dark)',
                    opacity: 0.6,
                    margin: 0,
                    lineHeight: 1.45,
                  }}>
                    {stage.stageSummary}
                  </p>
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
          className="section section--white"
          style={{
            paddingTop: '3rem',
            borderTop: '1px solid #eee',
          }}
        >
          <div className="wrap" style={{
            display: 'grid',
            gridTemplateColumns: stage.stageImageUrl ? (i % 2 === 0 ? '380px 1fr' : '1fr 380px') : '1fr',
            gap: '4rem',
            alignItems: 'start',
          }}>
            {/* Image - left on even stages, right on odd */}
            {stage.stageImageUrl && i % 2 === 0 && (
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'sticky',
                top: '80px',
              }}>
                <img
                  src={stage.stageImageUrl}
                  alt={stage.stageHeading}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            )}

            {/* Content */}
            <div>
              <p className="label label--accent" style={{ margin: '0 0 0.75rem' }}>
                {stage.stageNumber}
              </p>
              <h2 className="heading-medium" style={{ margin: '0 0 1.5rem' }}>
                {stage.stageHeading}
              </h2>
              <div className="body-text">
                <PortableText value={stage.stageBody} />
              </div>

              {/* What this looks like in practice */}
              {stage.stageInPractice?.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #eee',
                }}>
                  <p style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--color-dark)',
                    margin: '0 0 1rem',
                  }}>
                    What this looks like in practice
                  </p>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}>
                    {stage.stageInPractice.map((item, j) => (
                      <li
                        key={j}
                        style={{
                          position: 'relative',
                          paddingLeft: '1.25rem',
                          marginBottom: '0.75rem',
                          fontSize: '0.9375rem',
                          lineHeight: '1.55',
                          color: 'var(--color-dark)',
                          opacity: 0.7,
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '0.5rem',
                          width: '6px',
                          height: '6px',
                          background: 'var(--color-accent)',
                          borderRadius: '50%',
                        }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What you get */}
              {stage.stageOutcome && (
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #eee',
                }}>
                  <p style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.75rem',
                  }}>
                    What you get
                  </p>
                  <div style={{
                    background: 'var(--color-warm)',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    lineHeight: '1.55',
                    color: 'var(--color-dark)',
                  }}>
                    {stage.stageOutcome}
                  </div>
                </div>
              )}
            </div>

            {/* Image - right on odd stages */}
            {stage.stageImageUrl && i % 2 !== 0 && (
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'sticky',
                top: '80px',
              }}>
                <img
                  src={stage.stageImageUrl}
                  alt={stage.stageHeading}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ==========================================
          SECTION 6: OUTCOMES (warm)
          ========================================== */}
      <section id="outcomes" className="section section--warm">
        <div className="wrap">
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            Outcomes
          </p>
          <h2 className="heading-large" style={{ margin: '0 0 1.5rem' }}>
            {service.outcomesHeading}
          </h2>
          {service.outcomesIntro && (
            <p className="body-text" style={{ maxWidth: '720px', marginBottom: '2rem' }}>
              {service.outcomesIntro}
            </p>
          )}

          {service.outcomes?.length > 0 && (
            <div style={{ margin: '0 0 2rem' }}>
              {service.outcomes.map((outcome, i) => (
                <div
                  key={outcome._key || i}
                  style={{
                    padding: '1.25rem 0',
                    borderBottom: i < service.outcomes.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '400',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.25rem',
                  }}>
                    {outcome.outcomeTitle}
                  </p>
                  <p style={{
                    fontSize: '0.9375rem',
                    color: 'var(--color-dark)',
                    opacity: 0.6,
                    margin: 0,
                  }}>
                    {outcome.outcomeDescription}
                  </p>
                </div>
              ))}
            </div>
          )}

          {service.outcomesClosing && (
            <p className="body-text" style={{ maxWidth: '720px' }}>
              {service.outcomesClosing}
            </p>
          )}
        </div>
      </section>

      {/* ==========================================
          SECTION 7: EXAMPLES (white)
          ========================================== */}
      {(service.relatedProjects?.length > 0 || service.testimonialQuote) && (
        <section id="examples" className="section section--white">
          <div className="wrap">
            <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
              Examples
            </p>
            <h2 className="heading-large" style={{ margin: '0 0 2rem' }}>
              Examples
            </h2>

            {/* Related projects */}
            {service.relatedProjects?.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: service.relatedProjects.length > 1 ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
                marginBottom: service.testimonialQuote ? '2.5rem' : 0,
              }}>
                {service.relatedProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project.slug.current}`}
                    className="card"
                  >
                    {project.clientSector && (
                      <p className="card-label">{project.clientSector}</p>
                    )}
                    <p className="card-title">{project.title}</p>
                    {project.shortSummary && (
                      <p className="card-body">{project.shortSummary}</p>
                    )}
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: 'var(--color-accent)',
                      margin: '1rem 0 0',
                    }}>
                      Read the full story →
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Testimonial */}
            {service.testimonialQuote && (
              <div style={{
                borderLeft: '3px solid var(--color-accent)',
                padding: '1.5rem 2rem',
                background: 'var(--color-warm)',
                borderRadius: '0 8px 8px 0',
              }}>
                <blockquote style={{
                  fontSize: '1.1875rem',
                  fontWeight: '300',
                  lineHeight: '1.6',
                  color: 'var(--color-dark)',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  "{service.testimonialQuote}"
                </blockquote>
                {service.testimonialAttribution && (
                  <cite style={{
                    display: 'block',
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    fontStyle: 'normal',
                    color: 'var(--color-dark)',
                    opacity: 0.6,
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
        <section className="section section--warm">
          <div className="wrap">
            <p className="label" style={{ margin: '0 0 1.5rem' }}>
              EMERGENT dimensions this connects to
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              {service.relatedDimensions.map((dim) => (
                <Link
                  key={dim._id}
                  href={`/emergent-framework/${dim.slug.current}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    border: `1.5px solid ${dim.colour}`,
                    color: dim.colour,
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    fontWeight: '400',
                    fontSize: '0.8rem',
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
        <section className="section section--white">
          <div className="wrap">
            <p className="label" style={{ margin: '0 0 2rem' }}>
              You might also be interested in
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(service.relatedServices.length, 3)}, 1fr)`,
              gap: '1.5rem',
            }}>
              {service.relatedServices.map((related) => (
                <Link
                  key={related._id}
                  href={`/services/${related.category}/${related.slug.current}`}
                  className="card"
                >
                  <p className="card-label">{related.categoryLabel}</p>
                  <p className="card-title">{related.title}</p>
                  {related.heroTagline && (
                    <p className="card-body">{related.heroTagline}</p>
                  )}
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    color: 'var(--color-accent)',
                    margin: '1rem 0 0',
                  }}>
                    Learn more →
                  </p>
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
        primaryLabel={service.ctaButtonLabel || "Let's have a conversation"}
        primaryHref={service.ctaButtonUrl || '/contact'}
      />

    </main>
  )
}