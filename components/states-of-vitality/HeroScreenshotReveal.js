'use client'

import { useEffect, useState } from 'react'

export default function HeroScreenshotReveal({ children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        // The hero screenshot is the LCP element, so it must paint on first
        // render. Keep opacity at 1 and animate translateY only: a fade from
        // opacity 0 — or a scale that grows the element to full size at the end
        // of the transition — gates LCP behind hydration + the 0.8s animation,
        // which is what pushed mobile LCP to ~4s.
        transform: visible ? 'none' : 'translateY(30px)',
        transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {children}
    </div>
  )
}
