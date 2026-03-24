import { client, getResource } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ResourceDownloadForm from '../../../components/ResourceDownloadForm'
import CTA from '../../../components/CTA'

export const revalidate = 3600

export async function generateStaticParams() {
  const resources = await client.fetch(`*[_type == "resource"]{ "slug": slug.current }`)
  return resources.map(r => ({ slug: r.slug }))
}

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
      {/* Dark header with title, preview image, and form */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px 72px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Title block */}
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
              margin: '0 0 48px',
            }}>
              {resource.subtitle}
            </p>
          )}

          {/* Preview image + form row */}
          <div className="resource-header-row" style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'center',
            marginTop: resource.subtitle ? '0' : '48px',
          }}>
            {/* Preview image */}
            {resource.previewImageUrl && (
              <div style={{
                flex: '0 0 40%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="img-perspective resource-preview-image" style={{
                  maxHeight: '572px',
                  maxWidth: '352px',
                  overflow: 'hidden',
                }}>
                  <img
                    src={resource.previewImageUrl}
                    alt={resource.previewImageAlt || `Preview of ${resource.title}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* Form card */}
            <div className="dark-form-wrapper" style={{
              flex: '1 1 60%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
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
                  dark
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Warm content area - 50/50 two column */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div className="resource-content-grid" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'start',
        }}>
          {/* Left column - introduction */}
          <div>
            {resource.introduction && (
              <div className="portable-text">
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
          </div>

          {/* Right column - highlights + related */}
          <div>
            {/* Highlights checklist */}
            {resource.highlights?.length > 0 && (
              <div style={{ marginBottom: hasRelated ? '3rem' : 0 }}>
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
                      href={`/articles/${a.slug}`}
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
        </div>
      </section>

      {/* Dark form wrapper styles */}
      <style>{`
        .resource-preview-image.img-perspective {
          transform: perspective(1200px) rotateY(12deg) rotateX(8deg) rotateZ(-1deg);
        }
        .resource-preview-image.img-perspective:hover {
          transform: perspective(1200px) rotateY(6deg) rotateX(4deg) rotateZ(-0.5deg);
        }
        .dark-form-wrapper .heading-h4 {
          color: rgba(255,255,255,0.9) !important;
        }
        .dark-form-wrapper p {
          color: rgba(255,255,255,0.5) !important;
        }
        .dark-form-wrapper .form-label {
          color: rgba(255,255,255,0.6) !important;
        }
        .dark-form-wrapper .form-input {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #fff !important;
        }
        .dark-form-wrapper .form-input::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .dark-form-wrapper .form-input:focus {
          border-color: rgba(255,255,255,0.25) !important;
        }
        .dark-form-wrapper span {
          color: rgba(255,255,255,0.5) !important;
        }
        .dark-form-wrapper .btn-primary {
          background: #9B51E0 !important;
          color: #fff !important;
        }
        .dark-form-wrapper .btn-primary:hover {
          background: #8a3fd0 !important;
        }
        .dark-form-wrapper .feedback-success {
          border-left-color: #9B51E0 !important;
        }
        .dark-form-wrapper .feedback-success p {
          color: rgba(255,255,255,0.85) !important;
        }
        .dark-form-wrapper .feedback-success p:last-child {
          color: rgba(255,255,255,0.5) !important;
        }
        .dark-form-wrapper .feedback-success a {
          color: #C9A4F0 !important;
        }
        .dark-form-wrapper .feedback-error {
          color: #FF4279 !important;
          border-left-color: #FF4279 !important;
        }

        @media (max-width: 768px) {
          .resource-header-row {
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .resource-header-row > .resource-preview-image {
            flex: 0 0 180px !important;
          }
          .resource-content-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>

      <CTA label="Work with us" heading="Want to explore these ideas together?" />
    </main>
  )
}

// ── Free (ungated) download block ──
function FreeDownload({ downloadUrl, downloadButtonLabel, resourceType, dark }) {
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
