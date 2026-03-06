import Link from 'next/link'
import { getService } from '../../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'

const categoryMeta = {
  'purpose-direction': 'Purpose & Direction',
  'structure-operations': 'Structure & Operations',
  'people-capability': 'People & Capability',
  'service-experience': 'Service & Experience',
}

export default async function ServicePage({ params }) {
  const { category, slug } = await params
  const service = await getService(category, slug)

  if (!service) notFound()

  const categoryTitle = categoryMeta[category] || category

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap">
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
            <span style={{ color: '#ccc', fontSize: '0.875rem' }}>→</span>
            <Link
              href={`/services/${category}`}
              style={{
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              {categoryTitle}
            </Link>
          </div>
          <p className="label label--accent" style={{ margin: '0 0 1rem' }}>
            {categoryTitle}
          </p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            {service.title}
          </h1>
          {service.tagline && (
            <p className="lead" style={{ maxWidth: '600px' }}>
              {service.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Intro */}
      {service.intro && (
        <section className="section section--white">
          <div className="wrap--narrow">
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: '300',
              lineHeight: '1.7',
              color: 'var(--color-dark)',
              margin: 0,
            }}>
              {service.intro}
            </p>
          </div>
        </section>
      )}

      {/* Body */}
      {service.body && (
        <section className="section section--white" style={{ paddingTop: 0 }}>
          <div className="wrap--narrow">
            <div className="portable-text">
              <PortableText value={service.body} />
            </div>
          </div>
        </section>
      )}

      {/* Related dimensions */}
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
                  key={dim.slug.current}
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

      {/* Related services */}
      {service.relatedServices?.length > 0 && (
        <section className="section section--white">
          <div className="wrap">
            <p className="label" style={{ margin: '0 0 2rem' }}>
              Related services
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}>
              {service.relatedServices.map((related) => (
                <Link
                  key={related.slug.current}
                  href={`/services/${related.category}/${related.slug.current}`}
                  className="card"
                >
                  <p className="card-label">{categoryMeta[related.category]}</p>
                  <p className="card-title">{related.title}</p>
                  {related.shortSummary && (
                    <p className="card-body">{related.shortSummary}</p>
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

      {/* CTA */}
      <section className="section section--dark">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: '400',
            color: '#ffffff',
            margin: '0 0 1rem',
          }}>
            Want to explore this with us?
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