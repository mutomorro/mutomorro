import Link from 'next/link'
import { getServicesByCategory } from '../../../sanity/client'
import { notFound } from 'next/navigation'

const categoryMeta = {
  'purpose-direction': {
    title: 'Purpose & Direction',
    question: 'Who are we and where are we going?',
    description: 'The foundational work of organisational identity - why you exist, where you\'re headed, and how your culture shapes everything. This is the work that makes everything else make sense.',
  },
  'structure-operations': {
    title: 'Structure & Operations',
    question: 'How are we organised and how does work flow?',
    description: 'Designing the architecture of your organisation - how decisions get made, how teams are structured, and how work actually moves. Getting this right unlocks everything else.',
  },
  'people-capability': {
    title: 'People & Capability',
    question: 'How do we develop our collective abilities?',
    description: 'Building the skills, resilience and conditions where people bring their best - and keep growing. The capacity you build here compounds over time.',
  },
  'service-experience': {
    title: 'Service & Experience',
    question: 'How do we deliver value to the people we serve?',
    description: 'Designing and improving what your organisation does for customers, service users and communities. Where internal health becomes external impact.',
  },
}

export default async function ServiceCategory({ params }) {
  const { category } = await params
  const meta = categoryMeta[category]

  if (!meta) notFound()

  const services = await getServicesByCategory(category)

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap">
          <Link
            href="/services"
            style={{
              fontSize: '0.875rem',
              fontWeight: '400',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '2rem',
            }}
          >
            ← How we help
          </Link>
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            {meta.title}
          </p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            {meta.question}
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            {meta.description}
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="section section--white">
        <div className="wrap">
          {services.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}>
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${category}/${service.slug.current}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    padding: '2rem 0',
                    borderBottom: '1px solid #f0ece6',
                    textDecoration: 'none',
                    gap: '2rem',
                  }}
                >
                  <div>
                    <h2 style={{
                      fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                      fontWeight: '400',
                      color: 'var(--color-dark)',
                      margin: '0 0 0.5rem',
                    }}>
                      {service.title}
                    </h2>
                    {service.shortSummary && (
                      <p style={{
                        fontSize: '0.95rem',
                        fontWeight: '300',
                        color: '#777',
                        margin: 0,
                        maxWidth: '600px',
                      }}>
                        {service.shortSummary}
                      </p>
                    )}
                  </div>
                  <span style={{
                    color: 'var(--color-accent)',
                    fontSize: '1.25rem',
                  }}>
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{
              fontSize: '0.95rem',
              fontWeight: '300',
              color: '#aaa',
              fontStyle: 'italic',
            }}>
              Services coming soon.
            </p>
          )}
        </div>
      </section>

      {/* Related categories */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 2rem' }}>
            Other areas we work in
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {Object.entries(categoryMeta)
              .filter(([slug]) => slug !== category)
              .map(([slug, cat]) => (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  className="card"
                >
                  <p className="card-label">{cat.title}</p>
                  <p className="card-title">{cat.question}</p>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    color: 'var(--color-accent)',
                    margin: '1rem 0 0',
                  }}>
                    Explore →
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--dark">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: '400',
            color: '#ffffff',
            margin: '0 0 1rem',
          }}>
            Want to explore this further?
          </h2>
          <p style={{
            fontSize: '1rem',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 2rem',
          }}>
            Start with a conversation - no pitch, no obligation.
          </p>
          <Link href="/contact" className="btn btn--gradient">
            Talk to us
          </Link>
        </div>
      </section>

    </main>
  )
}