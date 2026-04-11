import Link from 'next/link'
import { getAllServices } from '../../sanity/client'
import CTA from '../../components/CTA'

export const revalidate = 3600

export const metadata = {
  title: 'Services - organisational development consultancy',
  description: 'Fourteen services across purpose and direction, structure and operations, people and capability, and service and experience. Each one designed to help your organisation work better.',
}

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

  const servicesByCategory = categories.reduce((acc, cat) => {
    acc[cat.slug] = allServices.filter(s => s.category === cat.slug)
    return acc
  }, {})

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>How we help</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Where we work with organisations
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '560px' }}>
            We work across four interconnected areas of organisational life.
            Real change rarely stays in just one.
          </p>
        </div>
      </section>

      {/* Category groups */}
      {categories.map((cat, catIndex) => (
        <section
          key={cat.slug}
          id={cat.slug}
          className="section--full section-padding"
          style={{
            background: catIndex % 2 === 0 ? 'var(--white)' : 'var(--warm)',
          }}
        >
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>

            {/* Category heading */}
            <div className="scroll-in" style={{ marginBottom: '3rem' }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                {cat.title}
              </span>
              <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
                {cat.question}
              </h2>
              <p className="body-text" style={{ margin: 0, maxWidth: '560px' }}>
                {cat.description}
              </p>
            </div>

            {/* Service cards */}
            {servicesByCategory[cat.slug].length > 0 ? (
              <div className="grid-3">
                {servicesByCategory[cat.slug].map((service, index) => (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug.current}`}
                    className="card-a scroll-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-a__corner" />
                    <div className="card-a__body">
                      <div className="card-a__title">{service.title}</div>
                      {service.heroTagline && (
                        <p className="card-a__text">{service.heroTagline}</p>
                      )}
                    </div>
                    <div className="card-a__footer">
                      <div className="card-a__footer-bg" />
                      <div className="card-a__action">
                        Learn more <span className="arrow">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="body-small" style={{ color: 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                Services coming soon
              </p>
            )}
          </div>
        </section>
      ))}

      <CTA
        label="Not sure where to start?"
        heading="Start with a conversation"
        secondaryText="Most organisations we work with span more than one area. We'll help you work out where to focus."
      />

    </main>
  )
}
