import Link from 'next/link'
import { getAllProjects } from '../../sanity/client'

export default async function CaseStudies() {
  const projects = await getAllProjects()

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Case Studies</h1>
      <ul>
        {projects.map((project) => (
          <li key={project._id} style={{ marginBottom: '1rem' }}>
            <Link href={`/case-studies/${project.slug.current}`}>
              <h2>{project.title}</h2>
            </Link>
            <p>{project.clientSector}</p>
            <p>{project.challenge}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}