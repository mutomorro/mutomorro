import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../sanity/image'
import NewsletterSignup from './NewsletterSignup'
import SidebarStickyStack from './SidebarStickyStack'

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
  const hasImage = Boolean(callout.image?.asset) && callout.showImageInSidebar === true
  const imageUrl = hasImage ? urlFor(callout.image).width(720).url() : null
  return (
    <div
      className="sidebar-callout"
      style={{ borderLeftColor: accent }}
    >
      {hasImage && (
        <div className="sidebar-callout__image">
          <Image
            src={imageUrl}
            alt={callout.image.alt || callout.heading || ''}
            width={720}
            height={480}
            sizes="(max-width: 1100px) 92vw, 220px"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}
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

function PrimaryCta({ theme, contentType }) {
  // Every content type's primary CTA points at the related service
  // (theme.anchorUrl). Tools already surface a download CTA via the
  // floating bottom bar; case studies fall through to the service
  // rather than the generic /contact route.
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
  hasFloatingBar = false,
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
  // The first (lowest displayOrder) callout rides in the sticky bottom
  // stack alongside the service CTA so it stays visible while scrolling.
  // Any extras fall back into the scroll flow as before.
  const stickyCallout = callouts[0]
  const scrollCallouts = callouts.slice(1)
  const dimensions = relatedDimensions || []

  const cta = <PrimaryCta theme={theme} contentType={contentType} />


  return (
    <div className="content-sidebar">
      <div className="content-sidebar__top-cta">{cta}</div>

      <div className="content-sidebar__scroll">
        {/* On mobile the sticky stack is hidden, so the priority callout
            rides here in-flow (matching the prior mobile layout). On
            desktop this copy is hidden — the callout lives in the sticky
            stack below. */}
        {stickyCallout && (
          <div className="sidebar-callout-mobile-only">
            <SidebarCallout callout={stickyCallout} />
          </div>
        )}
        {scrollCallouts.map((c) => (
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

      <SidebarStickyStack gap={hasFloatingBar ? 80 : 32}>
        {stickyCallout && <SidebarCallout callout={stickyCallout} />}
        {cta}
      </SidebarStickyStack>
    </div>
  )
}
