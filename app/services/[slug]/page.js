import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Image from 'next/image'
import { client, getService } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import ServiceTripleCta, { ServiceTripleCtaDark } from '../../../components/ServiceTripleCta'
import EcosystemVisual from '../../../components/EcosystemVisual'
import ServiceHero from '../../../components/heroes/ServiceHero'
import LogoStrip from '../../../components/LogoStrip'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import PageCallouts from '../../../components/PageCallouts'
import ApproachSlider from '../../../components/services/ApproachSlider'
import PropositionArgument from '../../../components/services/PropositionArgument'
import RecognitionTriggers from '../../../components/services/RecognitionTriggers'
import WhereToStart from '../../../components/services/WhereToStart'
import ApproachPdfOffer from '../../../components/services/ApproachPdfOffer'
import ServiceFAQ from '../../../components/services/ServiceFAQ'
import { buildFaqJsonLd } from '../../../components/services/faqJsonLd'
import HighlightedText from '../../../components/HighlightedText'

export const revalidate = 3600

export async function generateStaticParams() {
  const services = await client.fetch(`*[_type == "service"]{ "slug": slug.current }`)
  return services.map(s => ({ slug: s.slug }))
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

  return buildMetadata({
    title: service.seoTitle || service.heroHeading,
    description: service.seoDescription || service.heroTagline || '',
    path: `/services/${slug}`,
    image: service.ogImageUrl,
    type: 'article',
  })
}

// ============================================
// PAGE COMPONENT
// ============================================
//
// Section order is Layout A (buyer-first, Wave 2): situation + proof lead,
// the "conditions / Intentional Ecosystems" concept becomes earned
// differentiation in a late "why us" zone (Context -> Proposition ->
// Perspective). See docs/seo/service-page-layout-spec-2026-06-20.md.

export default async function ServicePage({ params }) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) notFound()

  const heroKicker = service.heroKicker || service.title

  const hasPropositionSteps = service.propositionSteps?.length > 0
  const hasTriggers = service.triggerCards?.length > 0
  const hasFaqs = service.faqItems?.length > 0

  // Auto-link "Our philosophy page" → /philosophy in the perspective
  // body. Editors keep the phrase as plain prose in Sanity; the link is
  // applied at render time so per-service copy edits don't need to know
  // about portable-text markDefs.
  const perspectiveBody = linkifyPhrase(
    service.perspectiveBody,
    'Our philosophy page',
    '/philosophy',
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
          HERO (dark)
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

            {/* Credibility strip - schema-driven; each half independently
                optional, renders only when populated. Ships OFF (heroStats +
                heroSectors empty on all 14) until curated per service. */}
            {(service.heroStats?.length > 0 || service.heroSectors?.length > 0) && (
              <div className="hero-cred">
                {service.heroStats?.length > 0 && (
                  <div className="hero-cred__stats">
                    {service.heroStats.map((stat, i) => (
                      <div key={i} className="hero-cred__stat">
                        <span className="hero-cred__value heading-gradient">{stat.value}</span>
                        <span className="hero-cred__label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {service.heroStats?.length > 0 && service.heroSectors?.length > 0 && (
                  <span className="hero-cred__divider" aria-hidden="true" />
                )}
                {service.heroSectors?.length > 0 && (
                  <div className="hero-cred__sectors">
                    <span className="hero-cred__sectors-label">Sectors we work in</span>
                    <div className="hero-cred__pills">
                      {service.heroSectors.map((sector, i) => (
                        <span key={i} className="hero-cred__pill">{sector}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          ANCHOR NAV (Layout A order)
          ========================================== */}
      <nav className="anchor-nav">
        <div className="anchor-nav__inner">
          {(() => {
            const navItems = []
            if (hasRelatedProjects) navItems.push('Proof')
            navItems.push('Approach')
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
          {service.subPages?.map((sp) => (
            <a
              key={sp.slug}
              href={`/services/${slug}/${sp.slug}`}
              className="anchor-nav__link anchor-nav__link--sub"
            >
              {sp.title}
            </a>
          ))}
          <Link href="/enquiry" className="anchor-nav__cta">Enquire</Link>
        </div>
      </nav>

      {/* ==========================================
          TRIGGERS - your situation (pulled up)
          ========================================== */}
      {hasTriggers && (
        <RecognitionTriggers
          cards={service.triggerCards}
          heading={service.triggerSectionHeading || 'Leaders come to us at moments like these'}
          kicker={service.triggerSectionKicker || 'Common catalysts'}
        />
      )}

      {/* ==========================================
          PROOF (case studies, 3 in a row)
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
          AFTER-PROOF CTA (light) - catch the buyer right after proof
          ========================================== */}
      <section className="section--full section-padding" style={{ background: 'var(--white)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p className="cta-band__prompt">
            Recognise your situation? Let&rsquo;s talk about what this could look like for you.
          </p>
          <ServiceTripleCta serviceTitle={service.title} position="after-proof" />
        </div>
      </section>

      {/* ==========================================
          WHERE TO START (sub-page on-ramp; self-hides when no sub-pages)
          ========================================== */}
      <WhereToStart
        heading={service.whereToStartHeading}
        intro={service.whereToStartIntro}
        subPages={service.subPages}
        serviceSlug={slug}
      />

      {/* ==========================================
          LOGO STRIP (client credibility, after proof)
          ========================================== */}
      {service.showLogoStrip !== false && (
        <LogoStrip />
      )}

      {/* ==========================================
          APPROACH (vertical flow, warm)
          ========================================== */}
      <section id="approach" className="section--full section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {service.stages?.length > 0 && (
            <ApproachSlider
              approachIntro={service.approachIntro}
              stages={service.stages}
              approachKicker="Our approach"
              approachIntroHeadline={service.approachIntroHeading || 'How we work'}
              principles={service.approachPrinciples}
            />
          )}
          <ApproachPdfOffer serviceTitle={service.title} />
        </div>
      </section>

      {/* ==========================================
          WHY US (late) - merged concept zone (Batch 4)
          Proposition argument (white): leads with the keyword lead line
          (propositionLead, folded up from the old standalone Context
          section, which no longer renders - its fields are retained in
          Sanity for the PDF), then the 3 beats as a static, all-visible
          3-up. The argument is the point, so nothing sits behind a click.
          The Perspective / Intentional Ecosystems close follows. Spec §5.6.
          ========================================== */}
      <section id="proposition" className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '2.5rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
              {service.propositionKicker || 'How we see it'}
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 1.25rem' }}>
              <HighlightedText
                text={service.propositionHeadline || service.recognitionHeading}
                highlight="conditions that create it"
              />
            </h2>
            {service.propositionLead && (
              <p className="lead-text why-us__lead">{service.propositionLead}</p>
            )}
          </div>

          {hasPropositionSteps && (
            <PropositionArgument steps={service.propositionSteps} />
          )}
        </div>
      </section>

      {/* ==========================================
          WHY US (late) - Perspective (ecosystem)
          ========================================== */}
      <section id="perspective" className="section--full warm-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Perspective</span>
            <h2 className="heading-h2" style={{ margin: '0 0 32px' }}>
              {service.perspectiveHeading}
            </h2>
          </div>
          <div className="why-us__perspective-grid">
            <div className="scroll-in">
              <div className="portable-text" style={{ maxWidth: '600px' }}>
                <PortableText value={perspectiveBody} />
              </div>
            </div>
            <div className="scroll-in delay-1">
              <EcosystemVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          STATS (dark) - the investment case
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
          FAQ
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
          GO DEEPER (related articles + tools)
          ========================================== */}
      {(service.relatedArticles?.length > 0 || service.relatedTools?.length > 0) && (() => {
        const articles = service.relatedArticles || []
        const tools = service.relatedTools || []
        const articleCap = 4
        const toolCap = 6
        const hasMoreArticles = articles.length > articleCap
        const hasMoreTools = tools.length > toolCap
        // Topic-hub slug for "See all" links - prefer the service's own
        // theme; fall back to the first item's theme if needed.
        const topicSlug =
          service.themeSlug ||
          articles[0]?.themeSlug ||
          tools[0]?.themeSlug ||
          null
        const titleLower = (service.title || '').toLowerCase()
        return (
          <section
            className="section--full section-padding"
            style={{ background: '#FAF6F1' }}
          >
            <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
              <div className="scroll-in" style={{ marginBottom: '2.5rem' }}>
                <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                  Go deeper
                </span>
                <h2 className="heading-h2" style={{ margin: 0 }}>
                  Explore {titleLower}
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    articles.length > 0 && tools.length > 0
                      ? 'repeat(auto-fit, minmax(320px, 1fr))'
                      : '1fr',
                  gap: '3rem',
                  alignItems: 'start',
                }}
              >
                {articles.length > 0 && (
                  <div>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 400,
                        margin: '0 0 1.25rem',
                        color: 'var(--dark)',
                      }}
                    >
                      Articles
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {articles.slice(0, articleCap).map((article) => (
                        <li key={article._id}>
                          <Link
                            href={`/articles/${article.slug.current}`}
                            className="explore-card"
                          >
                            <div className="explore-card__thumb">
                              {article.heroImageUrl ? (
                                <Image
                                  src={article.heroImageUrl}
                                  alt=""
                                  width={160}
                                  height={120}
                                  sizes="120px"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span className="explore-card__glyph" aria-hidden="true">✦</span>
                              )}
                            </div>
                            <div className="explore-card__body">
                              <div className="explore-card__title">{article.title}</div>
                              <span className="explore-card__action">
                                Read article <span className="arrow">→</span>
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {hasMoreArticles && topicSlug && (
                      <p style={{ margin: '1.25rem 0 0' }}>
                        <Link
                          href={`/topics/${topicSlug}`}
                          className="inline-link"
                        >
                          See all articles →
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                {tools.length > 0 && (
                  <div>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 400,
                        margin: '0 0 1.25rem',
                        color: 'var(--dark)',
                      }}
                    >
                      Related tools
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tools.slice(0, toolCap).map((tool) => (
                        <li key={tool._id}>
                          <Link
                            href={`/tools/${tool.slug.current}`}
                            className="explore-card"
                          >
                            <div className="explore-card__thumb">
                              {tool.heroImageUrl ? (
                                <Image
                                  src={tool.heroImageUrl}
                                  alt=""
                                  width={160}
                                  height={120}
                                  sizes="120px"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span className="explore-card__glyph" aria-hidden="true">◇</span>
                              )}
                            </div>
                            <div className="explore-card__body">
                              <div className="explore-card__title">{tool.title}</div>
                              <span className="explore-card__action">
                                Explore tool <span className="arrow">→</span>
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {hasMoreTools && topicSlug && (
                      <p style={{ margin: '1.25rem 0 0' }}>
                        <Link
                          href={`/topics/${topicSlug}`}
                          className="inline-link"
                        >
                          See all tools →
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ==========================================
          PAGE CALLOUTS
          ========================================== */}
      <PageCallouts pageType="services" pageId={service._id} />

      {/* ==========================================
          FINAL CTA (dark, Talk to us + Download the overview)
          ========================================== */}
      <ServiceTripleCtaDark
        serviceTitle={service.title}
        position="bottom"
      />
    </main>
  )
}
