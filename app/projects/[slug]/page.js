import { getProject } from '../../../sanity/client'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap--narrow">
          <p className="label" style={{ margin: '0 0 1rem' }}>{project.clientSector}</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            {project.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="section section--white">
        <div className="wrap--narrow">

          <div style={{ marginBottom: '3rem' }}>
            <p className="label label--accent" style={{ margin: '0 0 1rem' }}>The challenge</p>
            <div className="portable-text">
              <PortableText value={project.challenge} />
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <p className="label label--accent" style={{ margin: '0 0 1rem' }}>Our approach</p>
            <div className="portable-text">
              <PortableText value={project.approach} />
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <p className="label label--accent" style={{ margin: '0 0 1rem' }}>The outcome</p>
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