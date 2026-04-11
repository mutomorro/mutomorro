import Link from 'next/link'
import Image from 'next/image'
import CTA from '../../components/CTA'
import LogoStrip from '../../components/LogoStrip'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export const metadata = {
  title: 'About Mutomorro',
  description: 'Over 20 years helping organisations across every sector redesign how they work. From teams of 12 to workforces of 80,000.',
}

export default function About() {
  return (
    <main className="about-page">

      {/* Section 1: Hero */}
      <BackgroundPattern variant="network" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>About Mutomorro</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px', margin: '0 0 32px' }}>
            Over 20 years helping organisations become better places to work
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Helping organisations become better at what they do - and better for the people inside them.
          </p>
        </div>
      </BackgroundPattern>

      {/* Section 2: The short version */}
      <section className="section--full warm-bg section-padding">
        <div style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 460px',
          gap: '4rem',
          alignItems: 'center',
        }}>
          <div className="scroll-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p className="body-text" style={{ fontWeight: '400' }}>
              Mutomorro is an organisational design, development and strategic change consultancy. We work with leaders to improve how their organisations are designed, how they develop, and how they handle change.
            </p>
            <p className="body-text">
              We take a whole-system view - looking at how purpose, structure, culture, operations and service all connect - rather than treating problems in isolation. And we build capability inside your organisation rather than creating dependency on ours.
            </p>
            <p className="body-text">
              We've worked across the private, public and third sectors - from startups to government departments, charities to global brands. Every engagement is different, but the approach is consistent: understand the system, design with your people, build something that lasts.
            </p>
          </div>
          <div className="scroll-in delay-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-175px' }}>
            <Image
              src="/about-network.svg"
              alt=""
              width={552}
              height={552}
              style={{ width: '100%', maxWidth: '552px', height: 'auto', opacity: 0.85 }}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Logo strip */}
      <LogoStrip />

      {/* Section 4: Who we are */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '4rem',
            alignItems: 'start',
          }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                Who we are
              </span>
              <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
                Built for organisations that care about getting it right
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p className="body-text">
                  We've worked with organisations of 12 people and organisations of 80,000. Global brands and local charities. Government departments and startups finding their feet. The challenges are remarkably similar - and the approach works the same way.
                </p>
                <p className="body-text">
                  Every project gets senior-level thinking from day one. When specialist expertise is needed, we bring in experienced collaborators who share our approach and values. You get the right people for your situation - and a partner who's genuinely invested in getting it right.
                </p>
              </div>
            </div>

            {/* Photo + bio card */}
            <div className="scroll-in delay-1">
              <Image
                src="https://cdn.sanity.io/images/c6pg4t4h/production/ff6e02cb52c63ce401da07f4d81eb74fe0e1f1eb-1944x1944.jpg?w=600&h=750&fit=crop"
                alt="James Freeman-Gray"
                width={600}
                height={750}
                style={{ width: '100%', maxWidth: '300px', height: 'auto', display: 'block' }}
              />
              <div style={{ marginTop: '12px', maxWidth: '300px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '400',
                  color: 'var(--dark)',
                  margin: '0 0 2px',
                }}>
                  James Freeman-Gray
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '300',
                  color: 'rgba(0,0,0,0.5)',
                  margin: '0 0 8px',
                }}>
                  Founder. Over 20 years working with organisations across every sector.
                </p>
                <a
                  href="https://www.linkedin.com/in/jamesbfg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', opacity: 0.4, transition: 'opacity 0.2s' }}
                  onMouseEnter={undefined}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--dark)' }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: What we work on */}
      <section className="section--full section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              What we work on
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
              Four areas of organisational life
            </h2>
          </div>

          <div className="grid-4">
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
                className="card-a scroll-in"
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

          <p className="body-text" style={{
            color: 'rgba(0,0,0,0.5)',
            fontStyle: 'italic',
            marginTop: '2rem',
            fontSize: '16px',
          }}>
            We rarely work in just one area. Organisations are systems - real change usually touches all four.
          </p>
        </div>
      </section>

      {/* Section 6: How we work */}
      <section className="section--full dark-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem', maxWidth: '720px' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>How we work</span>
            <h2 className="heading-h2" style={{ color: '#ffffff', margin: '0 0 24px' }}>
              Partners, not consultants
            </h2>
            <p className="body-text" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Most organisational challenges get treated as isolated problems - fix the culture, restructure the team, improve the process. But organisations don't work in parts. Everything connects. We work differently.
            </p>
          </div>

          <div className="grid-2">
            {[
              {
                title: 'We work across the whole system',
                body: 'Not just the part that seems broken. We look at how purpose, structure, culture, operations and service interact - and find where small changes in the right place create the biggest shift.',
              },
              {
                title: 'We design with you, not for you',
                body: 'Your people understand your organisation better than any outside consultant. We bring the frameworks and facilitation. You bring the knowledge. Together, that\'s how lasting solutions get built.',
              },
              {
                title: 'Your people will own the change',
                body: 'We create conditions where your team helps design the solutions - so they make them work. Change sticks because people genuinely want it to succeed.',
              },
              {
                title: 'We\'ll work ourselves out of a job',
                body: 'Success looks like you not needing us. When your people are facilitating their own conversations and designing their own interventions - that\'s the outcome we\'re working towards.',
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="scroll-in"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  paddingTop: '1.5rem',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#ffffff',
                  margin: '0 0 10px',
                }}>
                  {item.title}
                </h3>
                <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Explore further */}
      <section className="section--full warm-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="grid-3">
            {[
              {
                label: 'Our thinking',
                title: 'Intentional Ecosystems',
                body: 'How we think about organisations - the philosophy behind everything we do.',
                href: '/philosophy',
                cta: 'Explore our philosophy',
              },
              {
                label: 'Our framework',
                title: 'The EMERGENT Framework',
                body: 'Eight dimensions of organisational health - and how they connect.',
                href: '/emergent-framework',
                cta: 'Explore the framework',
              },
              {
                label: 'In practice',
                title: 'How we work',
                body: "What working with us actually looks like - from first conversation to lasting change.",
                href: '/how-we-work',
                cta: 'See how we work',
              },
            ].map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className="card-a scroll-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-a__corner" />
                <div className="card-a__body">
                  <span className="card-a__tag">{card.label}</span>
                  <div className="card-a__title">{card.title}</div>
                  <p className="card-a__text">{card.body}</p>
                </div>
                <div className="card-a__footer">
                  <div className="card-a__footer-bg" />
                  <div className="card-a__action">
                    {card.cta} <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: CTA */}
      <CTA
        label="Ready to explore?"
        heading="Start with a conversation"
      />

    </main>
  )
}
