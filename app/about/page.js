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
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            About Mutomorro
          </p>
          <h1 className="heading-display" style={{
            color: '#ffffff',
            margin: '0 0 1.5rem',
            maxWidth: '800px',
          }}>
            Designing thriving organisations for the new world of work
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '560px' }}>
            We partner with leaders who want to build something better.
          </p>
        </div>
      </section>

      {/* The world leaders are navigating */}
      <section className="section section--warm">
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'start',
          }}>

            {/* Pull quote - left */}
            <div>
              <p style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
                fontWeight: '300',
                lineHeight: '1.5',
                color: 'var(--color-dark)',
                margin: 0,
                fontStyle: 'italic',
              }}>
                "The leaders we work with aren't asking how to fix what's broken.
                They're asking how to build something that works better - for their
                people, their customers, and the world they're operating in."
              </p>
              <p style={{
                fontSize: '0.8rem',
                fontWeight: '400',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-coral)',
                marginTop: '1.5rem',
              }}>
                James Freeman-Gray, Founder
              </p>
            </div>

            {/* Body - right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
      <section className="section section--white">
        <div className="wrap--narrow">
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            A different way of thinking
          </p>
          <h2 className="heading-large" style={{
            color: 'var(--color-dark)',
            margin: '0 0 2rem',
          }}>
            Organisations aren't machines.<br />They're living systems.
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

          {/* Pull statement */}
          <div style={{
            borderLeft: '3px solid var(--color-accent)',
            paddingLeft: '1.5rem',
            margin: '2.5rem 0',
          }}>
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: '300',
              lineHeight: '1.6',
              color: 'var(--color-dark)',
              margin: 0,
            }}>
              When you understand the patterns beneath the surface, transformation
              becomes possible in a way it never could be from the outside.
            </p>
          </div>

          <p className="body-text" style={{ color: '#666' }}>
            This isn't a methodology. It's a fundamentally different way of seeing
            - and once you see it, you can't unsee it.
          </p>
        </div>
      </section>

      {/* Logo strip */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--color-warm)' }}>
        <div className="wrap">
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
                backgroundColor: 'rgba(0,0,0,0.06)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'rgba(0,0,0,0.3)',
                  textAlign: 'center',
                  padding: '0 0.5rem',
                }}>
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="section section--white">
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'center',
          }}>

            {/* Text */}
            <div>
              <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
                Who we are
              </p>
              <h2 className="heading-medium" style={{
                color: 'var(--color-dark)',
                margin: '0 0 2rem',
              }}>
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
            <div style={{
              width: '100%',
              aspectRatio: '4/5',
              backgroundColor: '#e8e3dc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{
                fontSize: '0.85rem',
                color: '#999',
                fontWeight: '400',
              }}>
                Photo coming soon
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* What we work on */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 1rem' }}>
            Where we work
          </p>
          <h2 className="heading-large" style={{
            color: 'var(--color-dark)',
            margin: '0 0 3rem',
            maxWidth: '600px',
          }}>
            Four interconnected areas of organisational life
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
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
            ].map((item) => (
              <div key={item.title} style={{
                borderTop: '2px solid var(--color-coral)',
                paddingTop: '1.25rem',
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '400',
                  color: 'var(--color-dark)',
                  margin: '0 0 0.75rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: '300',
                  lineHeight: '1.6',
                  color: '#555',
                  margin: 0,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '300',
            color: '#888',
            fontStyle: 'italic',
          }}>
            We rarely work in just one area. Organisations are systems - and real
            change touches all four.
          </p>
        </div>
      </section>

      {/* How we partner */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            How we work together
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: '400',
            color: '#ffffff',
            margin: '0 0 3rem',
          }}>
            Partners. Not consultants.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3rem',
          }}>
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
            ].map((item) => (
              <div key={item.title} style={{
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '1.5rem',
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '400',
                  color: '#ffffff',
                  margin: '0 0 0.75rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  fontWeight: '300',
                  lineHeight: '1.7',
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore further */}
      <section className="section section--warm">
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
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
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="card"
              >
                <p className="card-label">{card.label}</p>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-body">{card.body}</p>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  color: 'var(--color-accent)',
                  margin: '1rem 0 0',
                }}>
                  {card.cta} →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA
        label="Ready to explore?"
        heading="Start with a conversation"
        buttonText="Talk to us"
        buttonLink="/contact"
      />

    </main>
  )
}