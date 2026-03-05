import { getTool } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import CTA from '../../../components/CTA'
import Link from 'next/link'
import { urlFor } from '../../../sanity/image'

export default async function ToolPage({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap--narrow">
          <Link href="/tools" style={{
            fontSize: '0.85rem',
            fontWeight: '400',
            color: 'var(--color-accent)',
            display: 'inline-block',
            margin: '0 0 1.5rem',
          }}>← All tools</Link>
          <p className="label" style={{ margin: '0 0 1rem' }}>{tool.category}</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            {tool.title}
          </h1>
          {tool.shortSummary && (
            <p className="lead">{tool.shortSummary}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="section section--white">
        <div className="wrap--narrow">
          {tool.body && (
            <div className="portable-text">
              <PortableText
                value={tool.body}
                components={{
                  types: {
                    image: ({ value }) => (
                      <div style={{ margin: '2rem 0' }}>
                        <img
                          src={urlFor(value).width(900).url()}
                          alt={value.alt || ''}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                      </div>
                    ),
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}