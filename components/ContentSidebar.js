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

// Inline-link rendering for Portable Text bodies inside sidebar cards.
const inlinePtComponents = {
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
}

// Tiny square thumbnail for related-list items. Renders nothing when the
// item has no image, so lists on pages whose query doesn't fetch one are
// unaffected.
function RelatedThumb({ image }) {
  if (!image?.asset) return null
  return (
    <span className="sidebar-related-thumb">
      <Image
        src={urlFor(image).width(96).height(96).url()}
        alt=""
        width={44}
        height={44}
        sizes="44px"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </span>
  )
}

// A promotional sidebar card — a Page Callout rendered in the sidebar. These
// sit above the primary CTA: one pins, the rest scroll (see the orchestrator).
function SidebarCallout({ callout }) {
  const accent = callout.accentColor || 'var(--accent)'
  const showLink = Boolean(callout.linkUrl && callout.linkLabel)
  const hasImage = Boolean(callout.image?.asset) && callout.showImageInSidebar === true
  const imageUrl = hasImage ? urlFor(callout.image).width(720).url() : null
  return (
    <div className="sidebar-callout" style={{ borderLeftColor: accent }}>
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
          <PortableText value={callout.body} components={inlinePtComponents} />
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

// The page's one page-owned primary CTA, pinned at the bottom of the sidebar.
// `kind` selects styling: 'service' uses the dark service card; everything else
// (enquiry / per-page override) uses the prominent feature-callout card.
function PrimaryCard({ primary }) {
  if (!primary?.url) return null

  if (primary.kind === 'service') {
    return (
      <div className="sticky-service-cta">
        {primary.eyebrow && <span className="sidebar-card-label">{primary.eyebrow}</span>}
        {primary.heading && <h3>{primary.heading}</h3>}
        <MaybeExternalLink href={primary.url} className="sidebar-btn sidebar-btn--primary">
          {primary.label} <span aria-hidden="true">→</span>
        </MaybeExternalLink>
      </div>
    )
  }

  return (
    <div
      className="sidebar-callout sidebar-callout--feature"
      style={{ borderLeftColor: primary.accentColor || 'var(--accent)' }}
    >
      {primary.heading && <h3>{primary.heading}</h3>}
      {primary.body && (
        <div className="sidebar-callout__body">
          {Array.isArray(primary.body) ? (
            <PortableText value={primary.body} components={inlinePtComponents} />
          ) : (
            <p>{primary.body}</p>
          )}
        </div>
      )}
      <MaybeExternalLink href={primary.url} className="sidebar-btn sidebar-btn--primary">
        {primary.label} <span aria-hidden="true">→</span>
      </MaybeExternalLink>
    </div>
  )
}

// Page types whose primary action is "make an enquiry" rather than the related
// service. Everything else falls back to the related service (theme.anchorUrl).
const ENQUIRY_TYPES = new Set(['develop', 'training', 'course', 'project', 'services', 'serviceSubPage'])

// Work out the single page-owned primary CTA, returning the remaining callouts
// (with any callout consumed as the primary removed). Resolution order:
//   1. an explicit per-page override (heading/label/url),
//   2. on enquiry-led pages, the page's enquiry callout if one exists (so its
//      tailored copy carries through) — otherwise a generic enquiry CTA,
//   3. otherwise the related service (theme.anchorUrl).
function resolvePrimary({ contentType, theme, callouts, primaryOverride, enquiryService }) {
  if (primaryOverride?.url) {
    return {
      primary: {
        kind: 'override',
        heading: primaryOverride.heading || null,
        body: primaryOverride.body || null,
        label: primaryOverride.label || 'Find out more',
        url: primaryOverride.url,
      },
      remaining: callouts,
    }
  }

  if (ENQUIRY_TYPES.has(contentType)) {
    const idx = callouts.findIndex(
      (c) => typeof c.linkUrl === 'string' && c.linkUrl.startsWith('/enquiry')
    )
    if (idx !== -1) {
      const c = callouts[idx]
      return {
        primary: {
          kind: 'enquiry',
          heading: c.heading || 'Ready to talk?',
          body: c.body || null,
          label: c.linkLabel || 'Make an enquiry',
          url: c.linkUrl,
          accentColor: c.accentColor,
        },
        remaining: callouts.filter((_, i) => i !== idx),
      }
    }
    const url = enquiryService ? `/enquiry?service=${enquiryService}` : '/enquiry'
    return {
      primary: { kind: 'enquiry', heading: 'Ready to talk?', label: 'Make an enquiry', url },
      remaining: callouts,
    }
  }

  if (theme?.anchorUrl) {
    const t = theme.title || ''
    return {
      primary: {
        kind: 'service',
        eyebrow: theme.title || null,
        heading: t
          ? `Thinking about shifting your organisation's ${t.toLowerCase()}?`
          : 'Explore the related service',
        label: 'Explore this service',
        url: theme.anchorUrl,
      },
      remaining: callouts,
    }
  }

  return { primary: null, remaining: callouts }
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
  // The page's primary CTA can be overridden per page (heading/body/label/url);
  // left undefined, it is derived by convention from contentType + theme.
  primaryOverride,
  // Fallback enquiry target (slug) for enquiry-led pages with no enquiry callout.
  enquiryService,
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

  const dimensions = relatedDimensions || []

  // The single page-owned primary CTA (pinned at the bottom), plus the callouts
  // left over to act as promos above it.
  const { primary, remaining } = resolvePrimary({
    theme,
    contentType,
    callouts: sidebarCallouts || [],
    primaryOverride,
    enquiryService,
  })

  // Drop any promo that duplicates the primary's destination — on enquiry-led
  // pages that means any other /enquiry link, so we never show two ways to the
  // same place.
  const promos = (remaining || []).filter((c) => {
    if (!primary?.url) return true
    if (c.linkUrl === primary.url) return false
    if (
      typeof primary.url === 'string' &&
      primary.url.startsWith('/enquiry') &&
      typeof c.linkUrl === 'string' &&
      c.linkUrl.startsWith('/enquiry')
    ) {
      return false
    }
    return true
  })

  // The callouts arrive ordered by displayOrder asc. One "Secondary" promo pins
  // just above the primary; any further promos (and all "In-flow" ones) scroll.
  const pinnableIdx = promos.findIndex((c) => (c.role || 'secondary') !== 'inFlow')
  const pinnedPromo = pinnableIdx !== -1 ? promos[pinnableIdx] : null
  const scrollPromos = promos.filter((_, i) => i !== pinnableIdx)

  return (
    <div className="content-sidebar">
      <div className="content-sidebar__scroll">
        {/* On mobile the sticky stack is hidden, so the pinned cards ride here
            in-flow. Hidden on desktop, where they live in the sticky stack. */}
        {(pinnedPromo || primary) && (
          <div className="sidebar-callout-mobile-only">
            {pinnedPromo && <SidebarCallout callout={pinnedPromo} />}
            {primary && <PrimaryCard primary={primary} />}
          </div>
        )}

        {scrollPromos.map((c) => (
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
                      <RelatedThumb image={t.heroImage} />
                      <span className="sidebar-related-item__text">
                        {t.title}
                        {t.category && (
                          <span className="related-meta">{t.category}</span>
                        )}
                      </span>
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
                    <Link href={`/articles/${slug}`}>
                      <RelatedThumb image={a.heroImage} />
                      <span className="sidebar-related-item__text">{a.title}</span>
                    </Link>
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

      {/* Pinned to the bottom: one promo (if any) above the page's primary CTA. */}
      <SidebarStickyStack gap={hasFloatingBar ? 80 : 32}>
        {pinnedPromo && <SidebarCallout callout={pinnedPromo} />}
        {primary && <PrimaryCard primary={primary} />}
      </SidebarStickyStack>
    </div>
  )
}
