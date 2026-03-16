import Link from 'next/link'
import CTA from '../../components/CTA'

const logos = [
  'Singapore University', 'Royal College of Anaesthetists', 'FCDO',
  'Disney', 'HM Courts Service', 'Elrha', 'Capella', 'Virgin Atlantic',
  'Value Retail', 'Unite Students', 'Warburtons', 'PayPal', 'Nandos',
  'Aston Martin', 'London City Airport', 'Environment Agency',
  'Simply Business', 'Nominet', 'Next', 'Electoral Commission',
]

export default function About() {
  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>About Mutomorro</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>
            Designing thriving organisations for the new world of work
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            We partner with leaders who want to build something better.
          </p>
        </div>
      </section>

      {/* The world leaders are navigating */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'start',
          }}>

            {/* Pull quote - left */}
            <div className="scroll-in">
              <blockquote className="pull-quote" style={{ margin: 0 }}>
                The leaders we work with aren't asking how to fix what's broken.
                They're asking how to build something that works better - for their
                people, their customers, and the world they're operating in.
              </blockquote>
              <p style={{
                fontSize: '13px',
                fontWeight: '400',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--coral)',
                marginTop: '1.5rem',
              }}>
                James Freeman-Gray, Founder
              </p>
            </div>

            {/* Body - right */}
            <div className="scroll-in delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p className="body-text">
                The world of work has fundamentally changed. Complexity isn't occasional
                - it's constant. Expectations from people and customers are higher.
                The pace of change keeps accelerating.
              </p>
              <p className="body-text">
                Leaders are asking bigger questions than ever before. How do we build
                organisations that adapt without burning people out? How do we create
                environments where people bring their best? How do we move from
                reacting to designing?
              </p>
              <p className="body-text">
                These aren't questions with easy answers. They're questions worth
                taking seriously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A different way of thinking */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ maxWidth: '720px' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              A different way of thinking
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
              Organisations aren't machines. They're living systems.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <p className="body-text">
                Most approaches to organisational development were designed for a different
                era - one where organisations were predictable, change was episodic, and
                the right answer could be found by the right expert.
              </p>
              <p className="body-text" style={{ fontWeight: '400', fontSize: '1.05rem' }}>
                That world no longer exists.
              </p>
              <p className="body-text">
                We work with organisations as living ecosystems. Complex, adaptive,
                interconnected. Health comes from relationships and patterns, not just
                individual components. Change happens through cultivating the right
                conditions - not forcing the right outcomes.
              </p>
            </div>

            <blockquote className="pull-quote">
              When you understand the patterns beneath the surface, transformation
              becomes possible in a way it never could be from the outside.
            </blockquote>

            <p className="body-text" style={{ color: 'rgba(0,0,0,0.5)', marginTop: '2rem' }}>
              This isn't a methodology. It's a fundamentally different way of seeing
              - and once you see it, you can't unsee it.
            </p>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="section--full warm-bg" style={{ padding: '4rem 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {logos.map((logo) => (
              <div key={logo} style={{
                width: '120px',
                height: '60px',
                backgroundColor: 'rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="caption-text" style={{ textAlign: 'center', padding: '0 8px' }}>
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'center',
          }}>
            <div className="scroll-in">
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                Who we are
              </span>
              <h2 className="heading-h2" style={{ margin: '0 0 24px' }}>
                Founded on a belief that organisations can be better
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p className="body-text">
                  Mutomorro was founded by James Freeman-Gray. With over 20 years of
                  experience working with organisations across the private, public and
                  third sectors, James brings a systems-informed perspective to every
                  engagement - one shaped by real work with real organisations,
                  not theory alone.
                </p>
                <p className="body-text">
                  We work with a collective of specialist collaborators - experienced
                  practitioners in their fields - who join projects where their expertise
                  adds most value. You get the right people for your situation, working
                  with a consistent approach and a shared set of values.
                </p>
              </div>
            </div>

            {/* Photo placeholder */}
            <div className="scroll-in delay-1">
              <div className="img-offset" style={{
                width: '100%',
                aspectRatio: '4/5',
                backgroundColor: '#e8e3dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <p className="caption-text">Photo coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we work on - four areas */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              Where we work
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
              Four interconnected areas of organisational life
            </h2>
          </div>

          <div className="grid-4">
            {[
              {
                title: 'Purpose & Direction',
                body: 'Helping organisations get clear on why they exist, where they\'re going, and how strategy becomes something people actually live - not just a document on a shelf.',
              },
              {
                title: 'Structure & Operations',
                body: 'Designing how work flows, decisions get made, and operations function. The architecture that lets your organisation move with clarity and confidence.',
              },
              {
                title: 'People & Capability',
                body: 'Building the skills, cultures, and conditions where people bring their best. Growing the capacity for continuous learning and adaptation.',
              },
              {
                title: 'Service & Experience',
                body: 'How value is created and delivered - for customers, service users, and communities. Improving what organisations do for the people they exist to serve.',
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="scroll-in"
                style={{
                  borderTop: '2px solid var(--coral)',
                  paddingTop: '1.25rem',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <h3 className="heading-h4" style={{ margin: '0 0 10px' }}>{item.title}</h3>
                <p className="body-small" style={{ margin: 0, color: 'rgba(0,0,0,0.55)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="body-small" style={{
            color: 'rgba(0,0,0,0.4)',
            fontStyle: 'italic',
            marginTop: '2rem',
          }}>
            We rarely work in just one area. Organisations are systems - and real
            change touches all four.
          </p>
        </div>
      </section>

      {/* How we partner */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>How we work together</span>
            <h2 className="heading-h2" style={{ color: '#ffffff', margin: 0 }}>
              Partners. Not consultants.
            </h2>
          </div>

          <div className="grid-2">
            {[
              {
                title: "We'll help you see the full picture",
                body: "Together, we'll look beyond the immediate problem to the patterns creating it. Small changes in the right places create big shifts across the whole system.",
              },
              {
                title: "We'll build capability that lasts",
                body: "We won't just solve today's challenge. We'll work with you to develop the skills your team needs to keep designing and adapting long after we're gone.",
              },
              {
                title: "Your people will own the change",
                body: "We create conditions where your team helps design the solutions - so they make them work. Change sticks because people genuinely want it to succeed.",
              },
              {
                title: "We'll work ourselves out of a job",
                body: "Success looks like you not needing us. When your people are facilitating their own conversations and designing their own interventions - that's the outcome we're working towards.",
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

      {/* Explore further */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
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

      <CTA
        label="Ready to explore?"
        heading="Start with a conversation"
      />

    </main>
  )
}
