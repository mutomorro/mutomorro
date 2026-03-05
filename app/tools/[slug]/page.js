import { getTool } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import CTA from '../../../components/CTA'
import Link from 'next/link'

export default async function ToolPage({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)

  return (
    <main style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>

      {/* Hero */}
      <section style={{ backgroundColor: 'var(--color-warm)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Link href="/tools" style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--color-purple)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '1.5rem',
          }}>← All tools</Link>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-coral)',
            margin: '0 0 1rem 0',
          }}>{tool.category}</p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: '700',
            lineHeight: '1.15',
            margin: '0 0 1.5rem 0',
            background: 'var(--gradient-heading)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{tool.title}</h1>
          {tool.shortSummary && (
            <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#555', fontWeight: '300' }}>
              {tool.shortSummary}
            </p>
          )}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {tool.body && (
            <div className="portable-text">
              <PortableText value={tool.body} />
            </div>
          )}
        </div>
      </section>

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}