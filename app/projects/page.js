import Link from 'next/link'
import { getAllProjects } from '../../sanity/client'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export default async function Projects() {
  const projects = await getAllProjects()

  // First project is featured, rest are standard cards
  const featured = projects[0]
  const remaining = projects.slice(1)

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

      {/* Featured project */}
      {featured && (
        <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <Link
              href={`/projects/${featured.slug.current}`}
              className="card-c scroll-in"
              style={{ maxWidth: '800px' }}
            >
              <div className="card-c__fill" />
              <div className="card-c__body">
                {featured.clientSector && (
                  <span className="card-c__tag">{featured.clientSector}</span>
                )}
                <div className="card-c__title" style={{ fontSize: '28px' }}>
                  {featured.title}
                </div>
                <p className="card-c__text">
                  {featured.shortSummary || featured.challenge}
                </p>
                <div className="card-c__action">
                  Read case study <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Remaining projects */}
      {remaining.length > 0 && (
        <section className="section--full" style={{
          padding: featured ? '0 48px 80px' : '80px 48px',
          background: 'var(--white)',
        }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="grid-3">
              {remaining.map((project, index) => (
                <Link
                  key={project._id}
                  href={`/projects/${project.slug.current}`}
                  className="card-a scroll-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
