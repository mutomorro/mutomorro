import Link from 'next/link'
import Image from 'next/image'
import { getAllProjects, getAllTools } from '../sanity/client'
import HeroCanvas from '../components/HeroCanvas'

export const metadata = {
  title: {
    absolute: 'Mutomorro - Organisational development consultancy',
  },
  description: 'We help leaders redesign how their organisations work. Systems-led organisational development across purpose, structure, people, and service.',
  openGraph: {
    title: 'Mutomorro - Organisational development consultancy',
    description: 'We help leaders redesign how their organisations work. Systems-led organisational development across purpose, structure, people, and service.',
    type: 'website',
  },
}
import LogoStrip from '../components/LogoStrip'
import NewsletterSignup from '../components/NewsletterSignup'
import BackgroundPattern from '../components/animations/BackgroundPattern'

// Route cards for section 2
const routeCards = [
  {
    label: 'About Mutomorro',
    description: 'The story, the approach, the person behind it.',
    href: '/about',
  },
  {
    label: 'Our philosophy',
    description: 'A different way of seeing organisations - and why it matters.',
    href: '/philosophy',
  },
  {
    label: 'The EMERGENT Framework',
    description: 'Eight dimensions of organisational health - a practical lens for understanding how organisations really work.',
    href: '/emergent-framework',
  },
]

// Featured case studies (by slug - matched from Sanity)
const featuredProjectSlugs = [
  'housing-association-merger-integration',
  'public-sector-service-design-case-study',
  'charity-organisational-design',
]
const featuredProjectDescriptions = {
  'housing-association-merger-integration': 'Bringing two cultures together after a major merger.',
  'public-sector-service-design-case-study': 'Redesigning how regulatory guidance reaches the people who need it.',
  'charity-organisational-design': 'Restructuring an international organisation to match its growing ambition.',
}

// Featured tools (by slug)
const featuredToolSlugs = [
  'kotters-8-step-change-model',
  'adkar-model',
  'belbins-team-roles',
  'theory-of-change',
  'pestle-analysis',
  'edgar-scheins-culture-model',
]

export default async function Home() {
  const [allProjects, allTools] = await Promise.all([
    getAllProjects(),
    getAllTools(),
  ])

  // Match featured projects by slug
  const featuredProjects = featuredProjectSlugs
    .map(slug => allProjects.find(p => p.slug?.current === slug))
    .filter(Boolean)

  // Match featured tools by slug
  const featuredTools = featuredToolSlugs
    .map(slug => allTools.find(t => t.slug?.current === slug))
    .filter(Boolean)

  return (
    <main className="homepage">

      {/* ─── Section 1: Hero ─── */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        background: '#221C2B',
        overflow: 'hidden',
      }}>
        <HeroCanvas />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 48px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
            <h1 className="heading-display heading-gradient" style={{
              maxWidth: '900px',
              fontSize: 'clamp(66px, 9vw, 108px)',
            }}>
              Designing thriving organisations for the new world of work
            </h1>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Who we are + route cards ─── */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Positioning block */}
          <div className="scroll-fade-up" style={{ maxWidth: '800px', marginBottom: '64px' }}>
            <h2 className="heading-h2" style={{ marginBottom: '24px' }}>
              Systems-led organisational design, development and strategic change
            </h2>
            <p className="body-text" style={{ maxWidth: '720px', color: 'rgba(0,0,0,0.7)' }}>
              Mutomorro helps organisations understand themselves as living systems - and design from there. We work across purpose, strategy, structure, culture, and capability to help organisations thrive, not just function.
            </p>
            <p className="body-text" style={{ maxWidth: '720px', marginTop: '16px', color: 'rgba(0,0,0,0.7)' }}>
              Whether you're navigating a merger, rethinking how you're structured, or trying to shift a culture that isn't working - we start from where you are.
            </p>
          </div>

          {/* Route cards */}
          <div className="grid-3 scroll-fade-up" style={{ animationDelay: '0.1s' }}>
            {routeCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="card-a"
              >
                <div className="card-a__corner" />
                <div className="card-a__body">
                  <h3 className="card-a__title">{card.label}</h3>
                  <p className="card-a__text">{card.description}</p>
                </div>
                <div className="card-a__footer">
                  <div className="card-a__footer-bg" />
                  <span className="card-a__action">
                    Explore <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Logo strip ─── */}
      <LogoStrip />

      {/* ─── Section 3: What we work on ─── */}
      <BackgroundPattern variant="constellation" className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <div className="scroll-fade-up" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)' }}>What we work on</span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '700px' }}>
              We work in four areas of organisational life
            </h2>
          </div>

          <div className="grid-4 scroll-fade-up">
            {[
              {
                title: 'Purpose & Direction',
                body: 'Getting clear on why you exist, where you\'re going, and how strategy becomes something people actually live - not just a document on a shelf.',
                href: '/services/purpose-direction',
              },
              {
                title: 'Structure & Operations',
                body: 'Designing how work flows, how decisions get made, and how operations function. The architecture that lets your organisation move with clarity and confidence.',
                href: '/services/structure-operations',
              },
              {
                title: 'People & Capability',
                body: 'Building the skills, culture, and conditions where people do their best work. Growing the capacity for continuous learning and adaptation.',
                href: '/services/people-capability',
              },
              {
                title: 'Service & Experience',
                body: 'Improving how value is created and delivered - for customers, service users, and communities. Making what you do match what people actually need.',
                href: '/services/service-experience',
              },
            ].map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="card-a"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-a__corner" />
                <div className="card-a__body">
                  <p className="card-a__title">{item.title}</p>
                  <p className="card-a__text">{item.body}</p>
                </div>
                <div className="card-a__footer">
                  <div className="card-a__footer-bg" />
                  <div className="card-a__action">
                    Explore <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </BackgroundPattern>

      {/* ─── Section 4: Proof (case studies) ─── */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px', background: '#221C2B' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-fade-up" style={{ marginBottom: '40px' }}>
            <span className="kicker" style={{ color: '#FFA200' }}>Projects and experience</span>
            <h2 className="heading-h2" style={{ color: '#fff', margin: '0' }}>
              Recent experience and projects
            </h2>
          </div>
          <div className="grid-3 scroll-fade-up">
            {featuredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug.current}`}
                className="card-c"
              >
                <div className="card-c__fill" />
                {project.heroImageUrl && (
                  <div className="card-c__image">
                    <Image
                      src={`${project.heroImageUrl}?w=600&h=340&fit=crop`}
                      alt={project.title || ''}
                      className="card-c__image-inner"
                      width={600}
                      height={340}
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                )}
                <div className="card-c__body">
                  <span className="card-c__tag">{project.clientSector}</span>
                  <h3 className="card-c__title">{project.title}</h3>
                  <p className="card-c__text">
                    {featuredProjectDescriptions[project.slug.current] || project.shortSummary || project.challenge}
                  </p>
                  <span className="card-c__action">
                    Read more <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="scroll-fade-up" style={{ marginTop: '32px' }}>
            <Link href="/projects" className="inline-link" style={{ fontSize: '16px', fontWeight: 400, color: '#C9A4F0' }}>
              See all projects and experience →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Tools ─── */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="homepage-tools-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr',
            gap: '64px',
            alignItems: 'start',
          }}>
            {/* Intro (left) */}
            <div className="scroll-fade-up">
              <span className="kicker">Explore</span>
              <h2 className="heading-h2" style={{ marginBottom: '20px' }}>
                Practical tools for real challenges
              </h2>
              <p className="body-text" style={{ color: 'rgba(0,0,0,0.7)' }}>
                Frameworks, models, and templates used by thousands of practitioners. Free, plainly explained, and designed to be useful right now.
              </p>
              <div style={{ marginTop: '32px' }}>
                <Link href="/tools" className="inline-link" style={{ fontSize: '16px', fontWeight: 400 }}>
                  Browse all {allTools.length} tools →
                </Link>
              </div>
            </div>

            {/* Tool cards (right) */}
            <div className="scroll-fade-up" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {featuredTools.map((tool) => (
                <Link
                  key={tool._id}
                  href={`/tools/${tool.slug.current}`}
                  className="card-a"
                >
                  <div className="card-a__corner" />
                  <div className="card-a__body" style={{ padding: '20px 24px' }}>
                    <h3 className="card-a__title" style={{ fontSize: '18px', marginBottom: '6px' }}>{tool.title}</h3>
                    <p className="card-a__text" style={{ fontSize: '14px' }}>
                      {tool.shortSummary ? (tool.shortSummary.length > 80 ? tool.shortSummary.slice(0, 80) + '...' : tool.shortSummary) : tool.category}
                    </p>
                  </div>
                  <div className="card-a__footer">
                    <div className="card-a__footer-bg" />
                    <span className="card-a__action" style={{ padding: '10px 24px', fontSize: '13px' }}>
                      View tool <span className="arrow">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 6: Newsletter + CTA ─── */}
      <BackgroundPattern variant="network" className="section--full dark-bg" style={{
        padding: '80px 48px',
        background: '#221C2B',
      }}>
        <div className="homepage-newsletter-grid" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'start',
        }}>
          {/* Newsletter (left) */}
          <div className="scroll-fade-up">
            <h3 className="heading-h3" style={{ color: '#fff', marginBottom: '16px' }}>
              Stay in the conversation
            </h3>
            <p style={{
              fontSize: '18px',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '28px',
              maxWidth: '420px',
            }}>
              Occasional emails with practical tools and ideas about how organisations work. No spam.
            </p>
            <NewsletterSignup variant="homepage" />
          </div>

          {/* CTA (right) */}
          <div className="scroll-fade-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="heading-h3" style={{ color: '#fff', marginBottom: '16px' }}>
              Let's talk
            </h3>
            <p style={{
              fontSize: '18px',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '28px',
              maxWidth: '420px',
            }}>
              Every organisation is different. If you'd like to explore whether we can help, the best place to start is a conversation.
            </p>
            <Link href="/contact" className="btn-primary btn-primary--dark btn-primary--lg">
              Talk to us
            </Link>
          </div>
        </div>
      </BackgroundPattern>

    </main>
  )
}
