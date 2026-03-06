import Link from 'next/link'
import { getAllServices } from '../../sanity/client'

const categories = [
  {
    slug: 'purpose-direction',
    title: 'Purpose & Direction',
    question: 'Who are we and where are we going?',
    description: 'The foundational work of organisational identity - why you exist, where you\'re headed, and how your culture shapes everything.',
  },
  {
    slug: 'structure-operations',
    title: 'Structure & Operations',
    question: 'How are we organised and how does work flow?',
    description: 'Designing the architecture of your organisation - how decisions get made, how teams are structured, and how work actually moves.',
  },
  {
    slug: 'people-capability',
    title: 'People & Capability',
    question: 'How do we develop our collective abilities?',
    description: 'Building the skills, resilience and conditions where people bring their best - and keep growing.',
  },
  {
    slug: 'service-experience',
    title: 'Service & Experience',
    question: 'How do we deliver value to the people we serve?',
    description: 'Designing and improving what your organisation does for customers, service users and communities.',
  },
]

export default async function Services() {
  const allServices = await getAllServices()

  // Group services by category
  const servicesByCategory = categories.reduce((acc, cat) => {
    acc[cat.slug] = allServices.filter(s => s.category === cat.slug)
    return acc
  }, {})

  return (
    <main>

      {/* Hero */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            How we help
          </p>
          <h1 className="heading-display" style={{
            color: '#ffffff',
            margin: '0 0 1.5rem',
            maxWidth: '800px',
          }}>
            Where we work with organisations
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '560px' }}>
            We work across four interconnected areas of organisational life.
            Real change rarely stays in just one.
          </p>
        </div>
      </section>

      {/* Four categories */}
      {categories.map((cat, index) => (
        <section
          key={cat.slug}
          className={`section ${index % 2 === 0 ? 'section--white' : 'section--warm'}`}
        >
          <div className="wrap">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '5rem',
              alignItems: 'start',
            }}>

              {/* Category info */}
              <div>
                <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
                  {cat.title}
                </p>
                <h2 className="heading-large" style={{
                  color: 'var(--color-dark)',
                  margin: '0 0 1rem',
                }}>
                  {cat.question}
                </h2>
                <p className="body-text" style={{ marginBottom: '2rem' }}>
                  {cat.description}
                </p>
                <Link
                  href={`/services/${cat.slug}`}
                  className="btn btn--outline"
                >
                  Explore {cat.title}
                </Link>
              </div>

              {/* Services list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
              }}>
                {servicesByCategory[cat.slug].length > 0 ? (
                  servicesByCategory[cat.slug].map((service) => (
                    <Link
                      key={service._id}
                      href={`/services/${cat.slug}/${service.slug.current}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 0',
                        borderBottom: '1px solid #f0ece6',
                        textDecoration: 'none',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: '1rem',
                          fontWeight: '400',
                          color: 'var(--color-dark)',
                          margin: '0 0 0.25rem',
                        }}>
                          {service.title}
                        </p>
                        {service.shortSummary && (
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: '300',
                            color: '#888',
                            margin: 0,
                          }}>
                            {service.shortSummary}
                          </p>
                        )}
                      </div>
                      <span style={{
                        color: 'var(--color-accent)',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}>
                        →
                      </span>
                    </Link>
                  ))
                ) : (
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '300',
                    color: '#aaa',
                    fontStyle: 'italic',
                    paddingTop: '1rem',
                  }}>
                    Services coming soon
                  </p>
                )}
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section section--dark">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            Not sure where to start?
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: '400',
            color: '#ffffff',
            margin: '0 0 1rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Start with a conversation
          </h2>
          <p style={{
            fontSize: '1rem',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 2rem',
          }}>
            Most organisations we work with span more than one area.
            We'll help you work out where to focus.
          </p>
          <Link href="/contact" className="btn btn--gradient">
            Talk to us
          </Link>
        </div>
      </section>

    </main>
  )
}