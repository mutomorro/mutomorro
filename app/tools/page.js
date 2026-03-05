import Link from 'next/link'
import { getAllTools } from '../../sanity/client'

export default async function Tools() {
  const tools = await getAllTools()

  return (
    <main>
      <section className="section section--warm">
        <div className="wrap">
          <p className="label">Tools and frameworks</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '1rem 0 1.5rem' }}>
            Models, frameworks and concepts
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            Practical tools to help you think clearly, work better, and lead with confidence.
          </p>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="card-grid">
            {tools.map((tool) => (
              <Link
                key={tool._id}
                href={`/tools/${tool.slug.current}`}
                className="card"
              >
                <p className="card-label">{tool.category}</p>
                <h2 className="card-title">{tool.title}</h2>
                <p className="card-body">{tool.shortSummary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}