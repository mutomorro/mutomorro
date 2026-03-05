import { getProject } from '../../../sanity/client'
import Link from 'next/link'

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)

  return (
    <main style={{ fontFamily: 'var(--font-source-sans), sans-serif', color: '#1a1a1a' }}>

      {/* Hero */}
      <section style={{
        backgroundColor: 'var(--color-warm)',
        padding: '5rem 2rem',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-coral)',
            margin: '0 0 1rem 0',
          }}>
            {project.clientSector}
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: '700',
            lineHeight: '1.15',
            margin: '0 0 1.5rem 0',
            background: 'var(--gradient-heading)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {project.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-purple)',
              marginBottom: '1rem',
            }}>The challenge</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333', fontWeight: '300' }}>
              {project.challenge}
            </p>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-purple)',
              marginBottom: '1rem',
            }}>Our approach</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333', fontWeight: '300' }}>
              {project.approach}
            </p>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-purple)',
              marginBottom: '1rem',
            }}>The outcome</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333', fontWeight: '300' }}>
              {project.outcome}
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundColor: 'var(--color-dark)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-coral)',
            margin: '0 0 1rem 0',
          }}>Work with us</p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: '1.2',
            margin: '0 0 2rem 0',
          }}>
            Ready to think differently about your organisation?
          </h2>
          <Link href="/contact" style={{
            display: 'inline-block',
            padding: '0.9rem 2.5rem',
            background: 'var(--gradient-heading)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '1rem',
          }}>
            Get in touch
          </Link>
        </div>
      </section>

    </main>
  )
}