import { client, getProject } from '../../../sanity/client'
import Link from 'next/link'
import Image from 'next/image'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../../../sanity/image'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await client.fetch(`*[_type == "project"]{ "slug": slug.current }`)
  return projects.map(p => ({ slug: p.slug }))
}

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)

  const heroImageUrl = project.heroImage ? urlFor(project.heroImage).width(900).url() : null

  return (
    <main style={{ fontFamily: 'var(--font-source-sans), sans-serif', color: '#1a1a1a' }}>

      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`}>
          <div>
            <div className="breadcrumb">
              <Link href="/case-studies" className="breadcrumb__link">Case Studies</Link>
              {project.clientSector && (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <span className="breadcrumb__current">{project.clientSector}</span>
                </>
              )}
            </div>

            {project.clientSector && (
              <span className="kicker" style={{ marginBottom: '16px' }}>{project.clientSector}</span>
            )}
            <h1 className="heading-h1 heading-gradient" style={{
              margin: '0 0 32px',
            }}>
              {project.title}
            </h1>
          </div>

          {heroImageUrl && (
            <div className="content-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <Image
                  src={heroImageUrl}
                  alt={project.title || ''}
                  width={900}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          )}
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
              <div className="portable-text">
              <PortableText value={project.challenge} />
          </div>
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
            <div className="portable-text">
  <PortableText value={project.approach} />
</div>
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
              <div className="portable-text">
  <PortableText value={project.outcome} />
</div>
            </p>
          </div>

        </div>
      </section>

<CTA />

    </main>
  )
}