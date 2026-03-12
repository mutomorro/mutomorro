import { getTool } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import CTA from '../../../components/CTA'
import ToolDownloadForm from '../../../components/ToolDownloadForm'
import Link from 'next/link'
import { urlFor } from '../../../sanity/image'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)
  if (!tool) return {}

  return {
    title: tool.seoTitle || `${tool.title} - Mutomorro`,
    description: tool.seoDescription || tool.shortSummary,
  }
}

export default async function ToolPage({ params }) {
  const { slug } = await params
  const tool = await getTool(slug)

  // Get the PDF URL from Sanity file asset if it exists
  const pdfUrl = tool.toolkitFileUrl || null

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap--narrow">
          <Link href="/tools" style={{
            fontSize: '0.85rem',
            fontWeight: '400',
            color: 'var(--color-accent)',
            textDecoration: 'none',
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

          {/* Quick download button - scrolls to form */}
          {pdfUrl && (
            <a
              href="#get-template"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                fontWeight: '400',
                fontSize: '0.9375rem',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                padding: '1rem 2.25rem',
                borderRadius: '0',
                color: '#fff',
                background: '#000',
                marginTop: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              Get the template
            </a>
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

      {/* Download form - only if there's a toolkit PDF */}
      {pdfUrl && (
        <section id="get-template" className="section section--warm">
          <div className="wrap--narrow">
            <ToolDownloadForm
              toolTitle={tool.title}
              toolSlug={slug}
              pdfUrl={pdfUrl}
            />
          </div>
        </section>
      )}

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}