import Link from 'next/link'
import { getAllDimensions } from '../../sanity/client'

export default async function EmergentFramework() {
  const dimensions = await getAllDimensions()

  return (
    <main>

      {/* Hero */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            The EMERGENT Framework
          </p>
          <h1 className="heading-display" style={{
            color: '#ffffff',
            margin: '0 0 2rem',
            maxWidth: '800px',
          }}>
            Eight dimensions of organisational health
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '600px', margin: '0 0 3rem' }}>
            Healthy organisations aren't built from a single initiative or a strategy document. They emerge from eight interconnected dimensions - each one distinct, all of them interdependent.
          </p>
          <Link href="/states-of-vitality" className="btn btn--gradient">
            Take the assessment
          </Link>
        </div>
      </section>

      {/* EMERGENT acronym + dimension cards */}
      <section className="section section--white">
        <div className="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {dimensions.map((dimension, index) => (
              <Link
                key={dimension._id}
                href={`/emergent-framework/${dimension.slug.current}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  alignItems: 'center',
                  gap: '2rem',
                  padding: '2rem 0',
                  borderBottom: '1px solid #f0ece6',
                  transition: 'background 0.15s',
                }}>

                  {/* Letter */}
                  <div style={{
                    fontSize: 'clamp(3rem, 5vw, 4rem)',
                    fontWeight: '300',
                    color: dimension.colour,
                    lineHeight: 1,
                    fontFamily: 'var(--font-source-sans), sans-serif',
                  }}>
                    {dimension.letter}
                  </div>

                  {/* Content */}
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: dimension.colour,
                      margin: '0 0 0.35rem',
                    }}>
                      {dimension.anchor}
                    </p>
                    <h2 style={{
                      fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                      fontWeight: '400',
                      color: 'var(--color-dark)',
                      margin: '0 0 0.5rem',
                      lineHeight: '1.2',
                    }}>
                      {dimension.title}
                    </h2>
                    <p style={{
                      fontSize: '0.95rem',
                      fontWeight: '300',
                      color: '#666',
                      margin: 0,
                      maxWidth: '600px',
                    }}>
                      {dimension.shortSummary}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    fontSize: '1.25rem',
                    color: dimension.colour,
                    opacity: 0.5,
                  }}>
                    →
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}