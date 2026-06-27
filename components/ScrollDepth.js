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

    let ticking = false
    let readyTimer = null

    // Readiness is checked inside fire(), NOT as an early return on mount.
    // On a fresh page load the PostHog provider's init() effect (an ancestor)
    // runs AFTER this effect, so `__loaded` is still false here. The old early
    // return meant scroll tracking silently never armed on any directly-loaded
    // page (i.e. every Google landing on a commercial page) and only worked
    // after an in-site navigation. Now: listeners attach immediately, capture
    // is gated on readiness, and a threshold isn't marked fired until it
    // actually sends - so the first real scroll after init still counts.
    const fire = (depth, extra) => {
      if (!posthog?.__loaded) return
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

    // The initial check (short pages / refresh-mid-page) must run once PostHog
    // is ready, so poll briefly until `__loaded` flips, then check once. Capped
    // so it can't spin forever when init is intentionally skipped (owner
    // opt-out) - in that case fire() is a no-op anyway.
    if (posthog?.__loaded) {
      check()
    } else {
      let attempts = 0
      readyTimer = setInterval(() => {
        attempts += 1
        if (posthog?.__loaded) {
          clearInterval(readyTimer)
          readyTimer = null
          check()
        } else if (attempts > 40) {
          clearInterval(readyTimer)
          readyTimer = null
        }
      }, 150)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (readyTimer) clearInterval(readyTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return null
}
