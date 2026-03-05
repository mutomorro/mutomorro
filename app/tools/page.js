import Link from 'next/link'
import { getAllTools } from '../../sanity/client'

export default async function Tools() {
  const tools = await getAllTools()

  return (
    <main style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>

      <section style={{ backgroundColor: 'var(--color-warm)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-coral)',
            margin: '0 0 1rem 0',
          }}>Tools and frameworks</p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: '700',
            lineHeight: '1.15',
            margin: '0 0 1.5rem 0',
            background: 'var(--gradient-heading)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Models, frameworks and concepts</h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#555', fontWeight: '300', maxWidth: '600px' }}>
            Practical tools to help you think clearly, work better, and lead with confidence.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {tools.map((tool) => (
            <Link
              key={tool._id}
              href={`/tools/${tool.slug.current}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '1.75rem',
                transition: 'box-shadow 0.2s',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-coral)',
                  margin: '0 0 0.75rem 0',
                }}>{tool.category}</p>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--color-dark)',
                  margin: '0 0 0.75rem 0',
                  lineHeight: '1.3',
                }}>{tool.title}</h2>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#666',
                  fontWeight: '300',
                  margin: '0',
                }}>{tool.shortSummary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}