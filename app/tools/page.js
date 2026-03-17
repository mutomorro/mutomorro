import Link from 'next/link'
import { getAllTools } from '../../sanity/client'
import { urlFor } from '../../sanity/image'
import CTA from '../../components/CTA'

export default async function Tools() {
  const tools = await getAllTools()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Tools and frameworks</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Models, frameworks and concepts
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Practical tools to help you think clearly, work better, and lead with confidence.
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="grid-3">
            {tools.map((tool, index) => (
              <Link
                key={tool._id}
                href={`/tools/${tool.slug.current}`}
                className="card-a scroll-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-a__corner" />

                {/* Image */}
                {tool.heroImage && (
                  <div className="card-a__image">
                    <img
                      className="card-a__image-inner"
                      src={urlFor(tool.heroImage).width(600).height(338).url()}
                      alt={tool.heroImage.alt || tool.title}
                    />
                  </div>
                )}

                <div className="card-a__body">
                  {tool.category && (
                    <span className="card-a__tag">{tool.category}</span>
                  )}
                  <div className="card-a__title">{tool.title}</div>
                  {tool.shortSummary && (
                    <p className="card-a__text">{tool.shortSummary}</p>
                  )}
                </div>

                <div className="card-a__footer">
                  <div className="card-a__footer-bg" />
                  <div className="card-a__action">
                    Explore tool <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA
        label="Work with us"
        heading="Want to put these ideas into practice?"
      />

    </main>
  )
}
