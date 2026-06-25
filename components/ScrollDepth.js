'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

// Fires a `scroll_depth` event (depth = 25/50/75/100) once per threshold per page
// view, so we can measure engagement depth on commercial pages. Mounted once
// globally in LayoutShell; resets on every route change. Autocapture does not
// capture scroll, so this is net-new signal.
const THRESHOLDS = [25, 50, 75, 100]

export default function ScrollDepth() {
  const pathname = usePathname()
  const firedRef = useRef(new Set())

  useEffect(() => {
    firedRef.current = new Set()
    if (!posthog?.__loaded) return

    let ticking = false

    const fire = (depth, extra) => {
      if (firedRef.current.has(depth)) return
      firedRef.current.add(depth)
      posthog.capture('scroll_depth', { depth, source_page: pathname, ...extra })
    }

    const check = () => {
      ticking = false
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      // Page fits in the viewport: nothing to scroll, count it as read-in-full.
      if (scrollable <= 0) {
        fire(100, { full_page: true })
        return
      }
      const pct = Math.min(100, (window.scrollY / scrollable) * 100)
      for (const t of THRESHOLDS) {
        if (pct >= t) fire(t)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(check)
      }
    }

    check() // initial (handles short pages and refresh-mid-page)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return null
}
