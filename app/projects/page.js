import Link from 'next/link'
import { getAllProjects } from '../../sanity/client'

export default async function Projects() {
  const projects = await getAllProjects()

  return (
    <main>
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 1rem' }}>Projects and experience</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            Work that makes a difference
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            A selection of projects and experiences that show our approach in action.
          </p>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="card-grid">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug.current}`}
                className="card"
              >
                <p className="card-label">{project.clientSector}</p>
                <h2 className="card-title">{project.title}</h2>
                <p className="card-body">{project.shortSummary || project.challenge}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}