'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { slugifyHeading } from '../lib/slugify'

const HEADER_OFFSET = 96

// Convert PortableText children spans to a plain string.
function blockToText(block) {
  if (!block?.children) return ''
  return block.children
    .filter((c) => c?._type === 'span' || typeof c?.text === 'string')
    .map((c) => c.text || '')
    .join('')
}

function extractHeadings(body) {
  if (!Array.isArray(body)) return []
  const out = []
  for (const block of body) {
    if (block?._type !== 'block') continue
    const style = block.style
    if (style !== 'h2' && style !== 'h3') continue
    const text = blockToText(block).trim()
    if (!text) continue
    const id = slugifyHeading(text)
    if (!id) continue
    out.push({ id, text, level: style === 'h2' ? 2 : 3 })
  }
  return out
}

export default function TableOfContents({ body }) {
  const headings = useMemo(() => extractHeadings(body), [body])
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

  // Determine which items are "passed" (above the current active item).
  const activeIndex = activeId ? headings.findIndex((h) => h.id === activeId) : -1

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
          {headings.map((h, i) => {
            const isActive = h.id === activeId
            const isPassed = !isActive && activeIndex >= 0 && i < activeIndex
            return (
              <li
                key={h.id}
                className={`toc-item${isActive ? ' active' : ''}${isPassed ? ' passed' : ''}`}
              >
                <a
                  href={`#${h.id}`}
                  className={`toc-link${h.level === 3 ? ' toc-sub' : ''}`}
                  onClick={(e) => handleClick(e, h.id)}
                >
                  {h.text}
                </a>
              </li>
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
