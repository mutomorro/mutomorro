'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { buildHeadingIndex } from '../lib/slugify'

const HEADER_OFFSET = 96

export default function TableOfContents({ body }) {
  // Shares buildHeadingIndex with the heading renderer, so the ids here are the
  // same unique, de-duplicated anchors the headings actually carry in the DOM.
  const headings = useMemo(() => buildHeadingIndex(body).headings, [body])

  // Group each H2 with the H3s that follow it, so the nav can keep a section's
  // sub-headings collapsed until the reader reaches that section. H3s that
  // appear before any H2 (rare) fall into a leading group with no header.
  const groups = useMemo(() => {
    const out = []
    let current = null
    for (const h of headings) {
      if (h.level === 2) {
        current = { heading: h, children: [] }
        out.push(current)
      } else if (current) {
        current.children.push(h)
      } else {
        current = { heading: null, children: [h] }
        out.push(current)
      }
    }
    return out
  }, [headings])

  // Document-order index per id, used for "active"/"passed" styling.
  const orderById = useMemo(
    () => new Map(headings.map((h, i) => [h.id, i])),
    [headings],
  )

  const [activeId, setActiveId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const observerRef = useRef(null)

  // Scroll-spy via IntersectionObserver. We track the topmost heading whose
  // top has crossed the header line. Falls back to scroll math if no heading
  // is currently intersecting (e.g. between two long sections).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (headings.length === 0) return

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean)

    if (elements.length === 0) return

    const visibility = new Map()

    const recompute = () => {
      let bestId = null
      let bestTop = -Infinity
      for (const el of elements) {
        const top = el.getBoundingClientRect().top - HEADER_OFFSET - 20
        if (top <= 0 && top > bestTop) {
          bestTop = top
          bestId = el.id
        }
      }
      // Before the first heading is reached, no item is active.
      setActiveId(bestId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting)
        }
        recompute()
      },
      { rootMargin: `-${HEADER_OFFSET + 20}px 0px -60% 0px`, threshold: 0 },
    )
    observerRef.current = observer
    elements.forEach((el) => observer.observe(el))

    // Initial pass + a scroll listener for the "no intersecting heading" case.
    recompute()
    const onScroll = () => recompute()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [headings])

  // Reading-progress bar - percentage of the content column scrolled past.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const contentEl = document.querySelector('.three-col-layout__content')
    if (!contentEl) return

    let ticking = false
    const update = () => {
      const rect = contentEl.getBoundingClientRect()
      const total = contentEl.offsetHeight
      const scrolledIntoContent = Math.max(0, -rect.top + window.innerHeight * 0.5)
      const pct = Math.min(100, Math.max(0, (scrolledIntoContent / Math.max(1, total)) * 100))
      setProgress(pct)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function handleClick(e, id) {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    if (typeof history !== 'undefined' && history.pushState) {
      history.pushState(null, '', `#${id}`)
    }
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET + 4
    window.scrollTo({ top, behavior: 'smooth' })
    setMobileOpen(false)
  }

  if (headings.length === 0) return null

  // "passed" = above the current active item. openGroupIndex = the group the
  // reader is currently in (its H2 or one of its H3s is active); only that
  // group's sub-headings are expanded.
  const activeIndex = activeId ? (orderById.get(activeId) ?? -1) : -1
  const openGroupIndex = activeId
    ? groups.findIndex(
        (g) => g.heading?.id === activeId || g.children.some((c) => c.id === activeId),
      )
    : -1

  return (
    <div className="toc-sidebar">
      <span className="toc-label">In this article</span>

      <button
        type="button"
        className={`toc-mobile-toggle${mobileOpen ? ' open' : ''}`}
        aria-expanded={mobileOpen}
        aria-controls="toc-list"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span>In this article</span>
        <span className="chevron" aria-hidden="true" />
      </button>

      <nav aria-label="Table of contents">
        <ul id="toc-list" className={`toc-list${mobileOpen ? ' expanded' : ''}`}>
          {groups.map((group, gi) => {
            const head = group.heading
            const headActive = head?.id === activeId
            const headOrder = head ? orderById.get(head.id) : -1
            const headPassed =
              head && !headActive && activeIndex >= 0 && headOrder < activeIndex
            const open = gi === openGroupIndex
            const hasChildren = group.children.length > 0

            return (
              <Fragment key={head ? head.id : `group-${gi}`}>
                {head && (
                  <li
                    className={`toc-item${headActive ? ' active' : ''}${
                      headPassed ? ' passed' : ''
                    }`}
                  >
                    <a
                      href={`#${head.id}`}
                      className="toc-link"
                      onClick={(e) => handleClick(e, head.id)}
                    >
                      {head.text}
                    </a>
                  </li>
                )}

                {hasChildren && (
                  <li className="toc-subwrap">
                    <ul
                      className={`toc-sublist${open ? ' expanded' : ''}`}
                      aria-hidden={!open}
                    >
                      {group.children.map((c) => {
                        const cActive = c.id === activeId
                        const cPassed =
                          !cActive && activeIndex >= 0 && orderById.get(c.id) < activeIndex
                        return (
                          <li
                            key={c.id}
                            className={`toc-item toc-subitem${cActive ? ' active' : ''}${
                              cPassed ? ' passed' : ''
                            }`}
                          >
                            <a
                              href={`#${c.id}`}
                              className="toc-link toc-sub"
                              tabIndex={open ? undefined : -1}
                              onClick={(e) => handleClick(e, c.id)}
                            >
                              {c.text}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
      </nav>

      <div className="toc-progress" aria-hidden="true">
        <div className="toc-progress-bar-track">
          <div className="toc-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="toc-progress-text">{Math.round(progress)}% read</span>
      </div>
    </div>
  )
}
