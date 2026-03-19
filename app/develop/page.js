import Link from 'next/link'
import { getAllCapabilityServices } from '../../sanity/client'

export const metadata = {
  title: 'Building Capability - Developing Leaders and Teams | Mutomorro',
  description: 'Developing the leaders and teams who make organisations work. Leadership programmes, coaching, facilitation, training, and team development - all grounded in how organisations actually work.',
}

export default async function DevelopLandingPage() {
  const services = await getAllCapabilityServices()

  const forLeaders = services.filter((s) => s.audience === 'for-leaders')
  const forTeams = services.filter((s) => s.audience === 'for-teams')

  return (
    <main>
      {/* ==========================================
          HERO (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: '24px' }}>
            <Link href="/services" className="breadcrumb__link">How we help</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Building Capability</span>
          </div>

          <span className="kicker" style={{ marginBottom: '16px' }}>Building Capability</span>
          <h1 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '700px' }}>
            Developing leaders and teams
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '640px' }}>
            Where our services address organisational challenges, capability building develops the people who lead and do the work. Leadership programmes, coaching, facilitation, training, and team development - all grounded in how organisations actually work as living systems.
          </p>
        </div>
      </section>

      {/* ==========================================
          FOR LEADERS (white)
          ========================================== */}
      <section style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '16px' }}>For Leaders</span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 48px',
            maxWidth: '600px',
          }}>
            Developing the people who set direction
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {forLeaders.map((service) => (
              <Link
                key={service.slug?.current || service.slug}
                href={`/develop/${service.slug?.current || service.slug}`}
                style={{
                  display: 'block',
                  padding: '32px',
                  background: 'var(--warm)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)',
                }}
                className="develop-card"
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--dark)',
                  lineHeight: 1.3,
                }}>
                  {service.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'rgba(0,0,0,0.55)',
                  fontWeight: 300,
                  margin: 0,
                }}>
                  {service.heroTagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FOR TEAMS (warm)
          ========================================== */}
      <section style={{ padding: '80px 48px', background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '16px' }}>For Teams</span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 48px',
            maxWidth: '600px',
          }}>
            Building capability where the work happens
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {forTeams.map((service) => (
              <Link
                key={service.slug?.current || service.slug}
                href={`/develop/${service.slug?.current || service.slug}`}
                style={{
                  display: 'block',
                  padding: '32px',
                  background: 'var(--white)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)',
                }}
                className="develop-card"
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--dark)',
                  lineHeight: 1.3,
                }}>
                  {service.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'rgba(0,0,0,0.55)',
                  fontWeight: 300,
                  margin: 0,
                }}>
                  {service.heroTagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          CTA (dark)
          ========================================== */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '16px',
          }}>
            Not sure what you need?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 300,
            marginBottom: '32px',
          }}>
            Every organisation is different. Tell us what you are working on and we will help you figure out the right approach.
          </p>
          <Link href="/contact" className="btn-primary btn-primary--dark">
            Talk to us
          </Link>
        </div>
      </section>
    </main>
  )
}