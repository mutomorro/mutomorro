import { getProject } from '../../../sanity/client'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'

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
              <div className="portable-text">
              <PortableText value={project.challenge} />
          </div>
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
            <div className="portable-text">
  <PortableText value={project.approach} />
</div>
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
              <div className="portable-text">
  <PortableText value={project.outcome} />
</div>
          </div>

        </div>
      </section>

<CTA />

    </main>
  )
}