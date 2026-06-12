import { PortableText } from '@portabletext/react'

/**
 * Renders an `accordion` Portable Text block as a native HTML <details>/<summary>.
 *
 * The body is server-rendered into the page HTML whether the accordion is open
 * or closed — the collapse is purely presentational (native <details>, no JS).
 * That is the whole point: crawlers and AI answer engines see the full detail
 * even while a human reader sees it collapsed, so long guides can carry depth
 * without a wall of prose. Never swap this for a JS show/hide that injects the
 * body on click — the content would vanish from the SSR HTML and the ranking
 * value with it. Acceptance is checked against view-source, not the live DOM.
 *
 * Like ContentTable, this is a server component (no 'use client'). The nested
 * body renders *through* PortableText with the same link mark as the main body,
 * and sits inside .portable-text, so its paragraphs, lists and links style
 * identically to surrounding prose. The body is constrained at the schema level
 * (sanity/schemas/accordion.js) to paragraphs, bullet lists, bold/italic and the
 * link annotation — no nested tables or accordions.
 */

const bodyComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          className="inline-link"
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {children}
        </a>
      )
    },
  },
}

export default function ContentAccordion({ value }) {
  const body = value?.body || []
  const title = value?.title
  if (!title || !body.length) return null

  return (
    <details className="toc-accordion" {...(value?.defaultOpen ? { open: true } : {})}>
      <summary className="toc-accordion__summary">{title}</summary>
      <div className="toc-accordion__body">
        <PortableText value={body} components={bodyComponents} />
      </div>
    </details>
  )
}
