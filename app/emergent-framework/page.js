import Link from 'next/link'
import { getAllDimensions } from '../../sanity/client'

export default async function EmergentFramework() {
  const dimensions = await getAllDimensions()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>
            The EMERGENT Framework
          </span>
          <h1 className="heading-display heading-gradient" style={{
            margin: '0 0 2rem',
            maxWidth: '800px',
          }}>
            Eight dimensions of organisational health
          </h1>
          <p className="lead-text" style={{
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '600px',
            margin: '0 0 3rem',
          }}>
            Healthy organisations aren't built from a single initiative or a strategy document. They emerge from eight interconnected dimensions - each one distinct, all of them interdependent.
          </p>
          <Link href="/states-of-vitality" className="btn-primary btn-primary--dark btn-primary--lg">
            Take the assessment
          </Link>
        </div>
      </section>

      {/* Dimension cards grid */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>

          {/* Intro two-column */}
          <div className="scroll-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            marginBottom: '5rem',
          }}>
            <div>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                The model
              </span>
              <h2 className="heading-h2" style={{ margin: 0 }}>
                What makes an organisation healthy?
              </h2>
            </div>
            <div>
              <p className="body-text" style={{ margin: 0 }}>
                Each letter in EMERGENT stands for a dimension of organisational life. Together, they form a diagnostic lens - a way of seeing the whole system, not just its parts. Click any dimension to explore its articles and insights.
              </p>
            </div>
          </div>

          {/* Dimension card grid */}
          <div className="grid-2">
            {dimensions.map((dimension, index) => (
              <Link
                key={dimension._id}
                href={`/emergent-framework/${dimension.slug.current}`}
                className="card-d scroll-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Badge with dimension colour */}
                <div className="card-d__badge" style={{ background: dimension.colour }}>
                  {dimension.letter}
                </div>

                <div className="card-d__body" style={{ paddingTop: '48px' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: dimension.colour,
                    margin: '0 0 8px',
                  }}>
                    {dimension.anchor}
                  </p>
                  <div className="card-d__title">{dimension.tagline || dimension.title}</div>
                  <p className="card-d__text">{dimension.shortSummary}</p>
                </div>

                <div className="card-d__footer">
                  <div className="card-d__footer-fill" />
                  <div className="card-d__action">
                    Explore dimension <span className="arrow">→</span>
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
