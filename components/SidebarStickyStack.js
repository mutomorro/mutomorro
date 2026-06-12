'use client'

import { useRef, useState, useEffect } from 'react'

// Bottom-anchors the sticky stack (optional callout + service CTA) without
// hardcoding its height. The stack sits at the end of the sidebar content and
// scrolls in with it; the top inset is set to (100vh − measured stack height −
// gap) so that once it pins, the whole stack rests just above the viewport
// bottom with its full height visible.
//
// This is deliberately top-anchored rather than `bottom`-anchored: a
// `bottom`-sticky element pins to the viewport bottom from the very top of the
// page and overlaps the related lists. Top-anchoring lets it scroll in with the
// content and only stick once reached. `gap` is larger on tool pages so the
// stack clears the floating download bar.
export default function SidebarStickyStack({ gap = 32, children }) {
  const ref = useRef(null)
  // Sensible pre-measure default (~CTA height + gap); corrected on mount,
  // before the user scrolls the stack into view, so there's no visible jump.
  const [inset, setInset] = useState(gap + 200)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setInset(el.offsetHeight + gap)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [gap])

  return (
    <div
      ref={ref}
      className="content-sidebar__sticky"
      style={{ top: `calc(100vh - ${inset}px)` }}
    >
      {children}
    </div>
  )
}
