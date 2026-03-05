import Link from 'next/link'
import { getAllProjects } from '../sanity/client'
import CTA from '../components/CTA'

export default async function Home() {
  const projects = await getAllProjects()

  return (
    <main style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>

      {/* Hero */}
      <section style={{
        backgroundColor: 'var(--color-warm)',
        padding: '7rem 2rem 6rem',
      }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-coral)',
            marginBottom: '1.5rem',
            margin: '0 0 1.5rem 0',
          }}>
            Organisational Development
          </p>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '2rem',
            margin: '0 0 2rem 0',
            background: 'var(--gradient-heading)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Cultivating thriving organisations
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            lineHeight: '1.7',
            color: '#444',
            fontWeight: '300',
            maxWidth: '640px',
            margin: '0 0 3rem 0',
          }}>
            We partner with leaders to reimagine their organisations for a world of constant complexity - seeing beyond the surface to the systems, patterns, and interconnections beneath.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/how-we-help" style={{
              display: 'inline-block',
              padding: '0.9rem 2rem',
              background: 'var(--gradient-heading)',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '1rem',
            }}>
              How we help
            </Link>
            <Link href="/states-of-vitality" style={{
              display: 'inline-block',
              padding: '0.9rem 2rem',
              border: '2px solid var(--color-purple)',
              color: 'var(--color-purple)',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '1rem',
            }}>
              Take the assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '6rem 2rem',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-purple)',
              margin: '0 0 1rem 0',
            }}>Our approach</p>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              margin: '0 0 1.5rem 0',
              color: '#1a1a1a',
            }}>
              Organisations as living systems
            </h2>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#444',
              fontWeight: '300',
              margin: '0 0 1.5rem 0',
            }}>
              The world of work has fundamentally changed. Complexity isn't occasional - it's constant. The old approaches of control and predictability struggle with today's reality.
            </p>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#444',
              fontWeight: '300',
              margin: '0 0 2rem 0',
            }}>
              We help leaders reimagine their organisations as intentional ecosystems - places where people and purpose thrive together.
            </p>
            <Link href="/about" style={{
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--color-purple)',
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
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--gradient-heading)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <div>
                  <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{item.label}</p>
                  <p style={{ color: '#666', fontWeight: '300', margin: 0, fontSize: '0.9rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section style={{
        backgroundColor: 'var(--color-warm)',
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-purple)',
            margin: '0 0 1rem 0',
          }}>Our work</p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              margin: 0,
              color: '#1a1a1a',
            }}>
              Work that makes a difference
            </h2>
            <Link href="/projects" style={{
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--color-purple)',
              whiteSpace: 'nowrap',
            }}>
              All case studies →
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug.current}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '2rem',
                  height: '100%',
                  transition: 'transform 0.2s',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-coral)',
                    margin: '0 0 0.75rem 0',
                  }}>
                    {project.clientSector}
                  </p>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    color: '#1a1a1a',
                    margin: '0 0 1rem 0',
                  }}>
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.7',
                    color: '#666',
                    fontWeight: '300',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {project.shortSummary || project.challenge}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

<CTA />

    </main>
  )
}