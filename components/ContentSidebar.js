import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import NewsletterSignup from './NewsletterSignup'

// Render a Sanity link URL: use Next/Link for relative paths, plain anchor
// (with target=_blank) for absolute http(s) URLs.
function MaybeExternalLink({ href, className, style, children }) {
  if (!href) return null
  const isExternal = /^(https?:|mailto:|tel:)/i.test(href)
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target={/^https?:/i.test(href) ? '_blank' : undefined}
        rel={/^https?:/i.test(href) ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  )
}

function SidebarCallout({ callout }) {
  const accent = callout.accentColor || 'var(--accent)'
  const showLink = Boolean(callout.linkUrl && callout.linkLabel)
  return (
    <div
      className="sidebar-callout"
      style={{ borderLeftColor: accent }}
    >
      {callout.heading && <h3>{callout.heading}</h3>}
      {callout.body && (
        <div className="sidebar-callout__body">
          <PortableText
            value={callout.body}
            components={{
              marks: {
                link: ({ value, children }) => (
                  <a
                    href={value?.href}
                    className="inline-link"
                    {...(value?.href && /^https?:/i.test(value.href)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {children}
                  </a>
                ),
              },
            }}
          />
        </div>
      )}
      {showLink && (
        <MaybeExternalLink
          href={callout.linkUrl}
          className="callout-link inline-link"
          style={{
            color: accent,
            backgroundImage: `linear-gradient(${accent}, ${accent})`,
          }}
        >
          {callout.linkLabel} <span aria-hidden="true">→</span>
        </MaybeExternalLink>
      )}
    </div>
  )
}

function PrimaryCta({ theme, contentType, hasPdf, toolSlug }) {
  // Tools with a PDF: download CTA, anchor to in-page form.
  if (contentType === 'tool' && hasPdf) {
    return (
      <div className="sticky-service-cta">
        <span className="sidebar-card-label">Get this tool</span>
        <h3>Download the template</h3>
        <a
          href="#get-template"
          className="sidebar-btn sidebar-btn--primary"
        >
          Get this template →
        </a>
      </div>
    )
  }

  // Case studies always point at /contact.
  if (contentType === 'project') {
    return (
      <div className="sticky-service-cta">
        <span className="sidebar-card-label">Work with us</span>
        <h3>Want to explore something similar?</h3>
        <Link
          href="/contact"
          className="sidebar-btn sidebar-btn--primary"
        >
          Start a conversation →
        </Link>
      </div>
    )
  }

  // Articles, courses, and tools-without-PDF: link to theme anchor.
  if (!theme?.anchorUrl) return null

  const heading =
    contentType === 'course'
      ? `Interested in ${theme.title}?`
      : `Thinking about shifting your organisation's ${theme.title.toLowerCase()}?`

  return (
    <div className="sticky-service-cta">
      <span className="sidebar-card-label">{theme.title}</span>
      <h3>{heading}</h3>
      <MaybeExternalLink
        href={theme.anchorUrl}
        className="sidebar-btn sidebar-btn--primary"
      >
        Explore this service →
      </MaybeExternalLink>
    </div>
  )
}

export default function ContentSidebar({
  theme,
  contentType,
  currentSlug,
  relatedTools,
  relatedArticles,
  relatedCaseStudies,
  sidebarCallouts,
  relatedDimensions,
  toolSlug,
  hasPdf,
}) {
  // Filter "current" out of related lists and cap counts.
  const tools = (relatedTools || [])
    .filter((t) => {
      const s = t?.slug?.current || t?.slug
      return s && s !== currentSlug
    })
    .slice(0, 3)

  const articles = (relatedArticles || [])
    .filter((a) => {
      const s = a?.slug?.current || a?.slug
      return s && s !== currentSlug
    })
    .slice(0, 2)

  const caseStudies = (relatedCaseStudies || [])
    .filter((c) => {
      const s = c?.slug?.current || c?.slug
      return s && s !== currentSlug
    })
    .slice(0, 2)

  const callouts = sidebarCallouts || []
  const dimensions = relatedDimensions || []

  return (
    <div className="content-sidebar">
      <div className="content-sidebar__scroll">
        {callouts.map((c) => (
          <SidebarCallout key={c._id} callout={c} />
        ))}

        {tools.length > 0 && (
          <div className="sidebar-related">
            <span className="sidebar-related-label">Related tools</span>
            <ul className="sidebar-related-list">
              {tools.map((t) => {
                const slug = t?.slug?.current || t?.slug
                return (
                  <li key={t._id || slug}>
                    <Link href={`/tools/${slug}`}>
                      {t.title}
                      {t.category && (
                        <span className="related-meta">{t.category}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {articles.length > 0 && (
          <div className="sidebar-related">
            <span className="sidebar-related-label">
              {theme?.title ? `More on ${theme.title}` : 'Related reading'}
            </span>
            <ul className="sidebar-related-list">
              {articles.map((a) => {
                const slug = a?.slug?.current || a?.slug
                return (
                  <li key={a._id || slug}>
                    <Link href={`/articles/${slug}`}>{a.title}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {caseStudies.length > 0 && (
          <div className="sidebar-related">
            <span className="sidebar-related-label">Related case studies</span>
            <ul className="sidebar-related-list">
              {caseStudies.map((c) => {
                const slug = c?.slug?.current || c?.slug
                return (
                  <li key={c._id || slug}>
                    <Link href={`/projects/${slug}`}>{c.title}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="sidebar-newsletter">
          <h3>Stay in the conversation</h3>
          <p>Ideas about how organisations work. No spam, no fluff.</p>
          <NewsletterSignup variant="footer-row" />
        </div>

        {dimensions.length > 0 && (
          <div className="sidebar-related">
            <span className="sidebar-related-label">Explore dimensions</span>
            <div className="dimension-pills">
              {dimensions.map((d) => (
                <Link
                  key={d._id}
                  href={`/emergent-framework/${d.slug?.current || d.slug}`}
                  className="dimension-pill"
                  style={{ color: d.colour, borderColor: d.colour }}
                >
                  {d.anchor || d.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="content-sidebar__spacer" aria-hidden="true" />

      <div className="content-sidebar__sticky">
        <PrimaryCta
          theme={theme}
          contentType={contentType}
          hasPdf={hasPdf}
          toolSlug={toolSlug}
        />
      </div>
    </div>
  )
}
