import { getAllProjects } from '../../sanity/client'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import ProjectsGrid from './ProjectsGrid'

export const revalidate = 3600

export const metadata = {
  title: 'Case studies - organisational development projects',
  description: 'Real examples of culture change, post-merger integration, service design, and organisational restructuring across housing, charity, public sector, and financial services.',
}

export default async function Projects() {
  const projects = await getAllProjects()

  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="network" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Projects and experience</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Work that makes a difference
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            A selection of projects and experiences that show our approach in action.
          </p>
        </div>
      </BackgroundPattern>

      {/* All projects */}
      {projects.length > 0 && (
        <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <ProjectsGrid items={projects} />
          </div>
        </section>
      )}

      <CTA />

    </main>
  )
}
