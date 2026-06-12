'use client'

import { useId, useRef, useState } from 'react'
import { PortableText } from '@portabletext/react'

/**
 * Renders a `tabs` Portable Text block as an ARIA tablist.
 *
 * This is the one body block that needs JavaScript (tab switching, arrow-key
 * navigation), so unlike ContentTable / ContentAccordion it is a client
 * component. The SEO contract still holds: EVERY panel is rendered into the
 * markup and the inactive ones are hidden with the `hidden` attribute — never
 * conditionally rendered, never unmounted, never fetched on click. React renders
 * client components on the server too, so the first HTML payload (view-source)
 * contains all panels' text. Crawlers and AI answer engines see the full content
 * of every tab; only sighted readers see one at a time. Never switch to
 * `{active && <Panel/>}` — that drops the other panels from the SSR HTML and the
 * ranking value with them.
 *
 * Accessibility follows the WAI-ARIA tabs pattern: a single tab in the page tab
 * sequence (roving tabindex), Left/Right/Home/End to move between tabs, and
 * role/aria wiring between each tab and its panel. IDs are namespaced with
 * useId() so several tabs blocks can share one page without colliding.
 *
 * The panel body renders *through* PortableText with the same link mark as the
 * accordion and the main body, and sits inside .portable-text, so its
 * paragraphs, lists and links style identically to surrounding prose. The body
 * is constrained at the schema level (sanity/schemas/tabs.js) to paragraphs,
 * bullet lists, bold/italic and the link annotation — no nested tables or tabs.
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

export default function ContentTabs({ value }) {
  const uid = useId()
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  const tabs = (value?.tabs || []).filter(
    (t) => t?.label && (t?.body || []).length
  )

  if (!tabs.length) return null

  // A half-authored block (one usable tab) still shows its content as plain
  // prose rather than a pointless single-tab control.
  if (tabs.length === 1) {
    return (
      <div className="content-tabs content-tabs--single">
        <PortableText value={tabs[0].body} components={bodyComponents} />
      </div>
    )
  }

  const groupLabel = value?.label || 'Tabs'

  function onKeyDown(e) {
    const last = tabs.length - 1
    let next = null
    if (e.key === 'ArrowRight') next = active === last ? 0 : active + 1
    else if (e.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="content-tabs">
      <div className="content-tabs__list" role="tablist" aria-label={groupLabel}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={(el) => (tabRefs.current[i] = el)}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-controls={`${uid}-panel-${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className="content-tabs__tab"
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${uid}-panel-${i}`}
          aria-labelledby={`${uid}-tab-${i}`}
          hidden={i !== active}
          tabIndex={0}
          className="content-tabs__panel"
        >
          <PortableText value={tab.body} components={bodyComponents} />
        </div>
      ))}
    </div>
  )
}
