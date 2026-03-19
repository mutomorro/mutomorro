import Link from 'next/link'
import { getAllProjects } from '../../sanity/client'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export default async function Projects() {
  const projects = await getAllProjects()

  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="network" className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
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
        <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="grid-3">
              {projects.map((project, index) => (
                <Link
                  key={project._id}
                  href={`/projects/${project.slug.current}`}
                  className="card-a scroll-in"
                  style={{ animationDelay: `${index * 0.1}s`, overflow: 'hidden' }}
                >
                  {project.heroImageUrl && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={`${project.heroImageUrl}?w=600&h=400&fit=crop`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  <div className="card-a__corner" />
                  <div className="card-a__body">
                    {project.clientSector && (
                      <span className="card-a__tag">{project.clientSector}</span>
                    )}
                    <div className="card-a__title">{project.title}</div>
                    <p className="card-a__text">
                      {project.shortSummary || project.challenge}
                    </p>
                  </div>
                  <div className="card-a__footer">
                    <div className="card-a__footer-bg" />
                    <div className="card-a__action">
                      Read case study <span className="arrow">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />

    </main>
  )
}
