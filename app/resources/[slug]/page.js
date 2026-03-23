import { getResource } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ResourceDownloadForm from '../../../components/ResourceDownloadForm'
import CTA from '../../../components/CTA'

const TYPE_LABELS = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) return {}

  const rawTitle = resource.seoTitle || resource.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = resource.seoDescription || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(resource.previewImageUrl && { images: [{ url: resource.previewImageUrl }] }),
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ResourcePage({ params }) {
  const { slug } = await params
  const resource = await getResource(slug)

  if (!resource) notFound()

  const typeLabel = resource.resourceTypeLabel || TYPE_LABELS[resource.resourceType] || 'Resource'
  const hasRelated = resource.relatedServices?.length || resource.relatedTools?.length || resource.relatedArticles?.length

  return (
    <main>
      {/* Dark header strip */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px 72px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="kicker" style={{ marginBottom: '16px' }}>{typeLabel.toUpperCase()}</span>
            <h1 className="heading-h1" style={{
              color: '#fff',
              margin: '0 0 20px',
              maxWidth: '900px',
            }}>
              {resource.title}
            </h1>
            {resource.subtitle && (
              <p style={{
                fontSize: '20px',
                fontWeight: '300',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.55)',
                maxWidth: '680px',
                margin: 0,
              }}>
                {resource.subtitle}
              </p>
            )}
          </div>
          {resource.previewImageUrl && (
            <div className="resource-header-preview" style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%) perspective(800px) rotateY(-12deg) rotateX(3deg)',
              width: '300px',
              opacity: 0.18,
              pointerEvents: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <img
                src={resource.previewImageUrl}
                alt=""
                aria-hidden="true"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Warm content area - two column grid */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div className="resource-grid" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '64px',
          alignItems: 'start',
        }}>
          {/* Left column - content */}
          <div>
            {/* Introduction */}
            {resource.introduction && (
              <div className="portable-text" style={{ marginBottom: '3rem' }}>
                <PortableText
                  value={resource.introduction}
                  components={{
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

            {/* Highlights checklist */}
            {resource.highlights?.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 className="heading-h3" style={{ margin: '0 0 1.5rem' }}>What you'll learn</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {resource.highlights.map((item, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      fontSize: '17px',
                      fontWeight: '300',
                      lineHeight: '1.6',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}>
                        <path d="M4 10.5L8 14.5L16 6.5" stroke="#9B51E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related content */}
            {hasRelated && (
              <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <h3 className="kicker" style={{ marginBottom: '1rem' }}>Related</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {resource.relatedServices?.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        padding: '6px 16px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        background: '#fff',
                        color: 'var(--dark)',
                        textDecoration: 'none',
                      }}
                    >
                      {s.title}
                    </Link>
                  ))}
                  {resource.relatedTools?.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        padding: '6px 16px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        background: '#fff',
                        color: 'var(--dark)',
                        textDecoration: 'none',
                      }}
                    >
                      {t.title}
                    </Link>
                  ))}
                  {resource.relatedArticles?.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/article/${a.slug}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        padding: '6px 16px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        background: '#fff',
                        color: 'var(--dark)',
                        textDecoration: 'none',
                      }}
                    >
                      {a.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - sticky sidebar */}
          <div style={{ position: 'sticky', top: '100px' }}>
            {/* Download section */}
            <div style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)',
              padding: '2rem',
            }}>
              {resource.gated ? (
                <ResourceDownloadForm
                  resourceTitle={resource.title}
                  resourceSlug={slug}
                  resourceType={resource.resourceType}
                  downloadUrl={resource.downloadUrl}
                  downloadButtonLabel={resource.downloadButtonLabel}
                />
              ) : (
                <FreeDownload
                  downloadUrl={resource.downloadUrl}
                  downloadButtonLabel={resource.downloadButtonLabel}
                  resourceType={resource.resourceType}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .resource-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .resource-grid > div:last-child {
            position: static !important;
          }
          .resource-header-preview {
            display: none !important;
          }
        }
      `}</style>

      <CTA label="Work with us" heading="Want to explore these ideas together?" />
    </main>
  )
}

// ── Free (ungated) download block ──
function FreeDownload({ downloadUrl, downloadButtonLabel, resourceType }) {
  const typeLabels = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }
  const typeLabel = typeLabels[resourceType] || 'Resource'
  const buttonText = downloadButtonLabel || `Download ${typeLabel}`

  return (
    <div>
      <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
        Free download
      </h3>
      <p style={{
        fontSize: '15px',
        fontWeight: '300',
        lineHeight: '1.5',
        color: 'rgba(0,0,0,0.55)',
        margin: '0 0 1.5rem',
      }}>
        No form needed - it's yours.
      </p>
      <a
        href={downloadUrl + '?dl='}
        download
        className="btn-primary"
        style={{ display: 'inline-flex' }}
      >
        {buttonText}
      </a>
    </div>
  )
}
