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

  const pdfUrl = tool.toolkitFileUrl || null
  const heroImageUrl = tool.heroImage ? urlFor(tool.heroImage).width(600).url() : null

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div className="wrap--narrow">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/tools" className="breadcrumb__link">Tools</Link>
            {tool.category && (
              <>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">{tool.category}</span>
              </>
            )}
          </div>

          {tool.category && (
            <span className="kicker" style={{ marginBottom: '16px' }}>{tool.category}</span>
          )}
          <h1 className="heading-h1" style={{
            color: '#ffffff',
            margin: '0 0 32px',
          }}>
            {tool.title}
          </h1>
          {tool.shortSummary && (
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {tool.shortSummary}
            </p>
          )}

          {/* Quick download button - scrolls to form */}
          {pdfUrl && (
            <a
              href="#get-template"
              className="btn-primary btn-primary--dark"
              style={{ marginTop: '2rem', display: 'inline-flex' }}
            >
              Get the template
            </a>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div className="wrap--narrow">
          {tool.body && (
            <div className="portable-text">
              <PortableText
                value={tool.body}
                components={{
                  types: {
                    image: ({ value }) => (
                      <div className="img-mat" style={{ margin: '2.5rem 0' }}>
                        <img
                          src={urlFor(value).width(900).url()}
                          alt={value.alt || ''}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    ),
                  },
                  marks: {
                    link: ({ value, children }) => (
                      <a href={value.href} className="inline-link">{children}</a>
                    ),
                  },
                  block: {
                    blockquote: ({ children }) => (
                      <blockquote className="pull-quote">{children}</blockquote>
                    ),
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Download form */}
      {pdfUrl && (
        <section
          id="get-template"
          className="section--full warm-bg scroll-in"
          style={{ padding: '80px 48px' }}
        >
          <div className="wrap--narrow">
            <ToolDownloadForm
              toolTitle={tool.title}
              toolSlug={slug}
              pdfUrl={pdfUrl}
              heroImageUrl={heroImageUrl}
            />
          </div>
        </section>
      )}

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />

    </main>
  )
}
