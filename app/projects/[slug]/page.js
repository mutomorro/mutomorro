import { getProject } from '../../../sanity/client'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../../../sanity/image'

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)

  // Section definitions - only render sections that have content
  const sections = [
    { key: 'clientAndContext', label: 'Client & context' },
    { key: 'theObjective', label: 'The objective' },
    { key: 'theApproach', label: 'The approach' },
    { key: 'whatChanged', label: 'What changed' },
    { key: 'keyInsight', label: 'Key insight' },
  ]

  const portableTextComponents = {
    types: {
      image: ({ value }) => (
        <div className="img-mat" style={{ margin: '2.5rem 0' }}>
          <img
            src={urlFor(value).width(900).url()}
            alt={value.alt || ''}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ),
    },
    marks: {
      link: ({ value, children }) => (
        <a href={value.href} className="inline-link">{children}</a>
      ),
    },
    block: {
      blockquote: ({ children }) => (
        <blockquote className="pull-quote">{children}</blockquote>
      ),
    },
  }

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div className="wrap--narrow">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/projects" className="breadcrumb__link">Projects</Link>
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
          <h1 className="heading-h1" style={{
            color: '#ffffff',
            margin: '0 0 32px',
          }}>
            {project.title}
          </h1>
          {project.shortSummary && (
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {project.shortSummary}
            </p>
          )}
        </div>
      </section>

      {/* Content sections */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div className="wrap--narrow">
          {sections.map(({ key, label }) => {
            const content = project[key]
            if (!content) return null

            return (
              <div key={key} className="scroll-in" style={{
                marginBottom: '4rem',
                paddingBottom: '4rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                  {label}
                </span>
                <div className="portable-text">
                  <PortableText value={content} components={portableTextComponents} />
                </div>
              </div>
            )
          })}

          {/* Legacy field fallback - for projects that still use old fields */}
          {!project.clientAndContext && !project.theObjective && !project.theApproach && (
            <>
              {project.challenge && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The challenge</span>
                  <div className="portable-text">
                    <PortableText value={project.challenge} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.approach && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>Our approach</span>
                  <div className="portable-text">
                    <PortableText value={project.approach} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.outcome && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The outcome</span>
                  <div className="portable-text">
                    <PortableText value={project.outcome} components={portableTextComponents} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CTA />

    </main>
  )
}
