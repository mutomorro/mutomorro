import Link from 'next/link'
import { getAllProjects } from '../sanity/client'
import CTA from '../components/CTA'
import HeroCanvas from '../components/HeroCanvas'

export default async function Home() {
  const projects = await getAllProjects()

  return (
    <main>

      {/* Hero - full viewport with canvas animation */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        background: '#221C2B',
        overflow: 'hidden',
      }}>
        <HeroCanvas />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 48px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 120px)',
              fontWeight: 400,
              lineHeight: 1.05,
              maxWidth: '65%',
              background: 'linear-gradient(135deg, #80388F 0%, #FF4279 50%, #FFA200 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Cultivating thriving organisations
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 1.8vw, 22px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.6)',
              marginTop: '24px',
              maxWidth: '480px',
              lineHeight: 1.6,
            }}>
              Designing living systems for the new world of work
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section section--white">
        <div className="wrap" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }}>
          <div>
            <p className="label label--accent" style={{ marginBottom: '1rem' }}>Our approach</p>
            <h2 className="heading-medium" style={{ margin: '0 0 1.5rem', color: 'var(--color-dark)' }}>
              Organisations as living systems
            </h2>
            <p className="lead" style={{ margin: '0 0 1.5rem' }}>
              The world of work has fundamentally changed. Complexity isn't occasional - it's constant. The old approaches of control and predictability struggle with today's reality.
            </p>
            <p className="lead" style={{ margin: '0 0 2rem' }}>
              We help leaders reimagine their organisations as intentional ecosystems - places where people and purpose thrive together.
            </p>
            <Link href="/about" style={{
              fontSize: '0.95rem',
              fontWeight: '400',
              color: 'var(--color-accent)',
            }}>
              Our story →
            </Link>
          </div>
          <div style={{
            backgroundColor: 'var(--color-warm)',
            borderRadius: '8px',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {[
              { label: 'Unifying Purpose', desc: 'Direction everyone can follow' },
              { label: 'Collective Capacity', desc: 'People growing together' },
              { label: 'Cultural Vitality', desc: 'A culture that energises' },
              { label: 'Change Fluency', desc: 'Adapting with confidence' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--gradient-heading)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <div>
                  <p className="body-text" style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{item.label}</p>
                  <p style={{ color: '#666', fontWeight: '300', margin: 0, fontSize: '0.9rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label label--accent" style={{ marginBottom: '1rem' }}>Our work</p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
          }}>
            <h2 className="heading-medium" style={{ color: 'var(--color-dark)' }}>
              Work that makes a difference
            </h2>
            <Link href="/projects" style={{
              fontSize: '0.9rem',
              fontWeight: '400',
              color: 'var(--color-accent)',
              whiteSpace: 'nowrap',
            }}>
              All projects →
            </Link>
          </div>
          <div className="card-grid">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug.current}`}
                className="card"
              >
                <p className="card-label">{project.clientSector}</p>
                <h3 className="card-title">{project.title}</h3>
                <p className="card-body" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {project.shortSummary || project.challenge}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />

    </main>
  )
}
