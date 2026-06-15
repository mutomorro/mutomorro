'use client'

import { useEffect, useState } from 'react'

export default function HeroReveal({ children, className = '', delay = 0 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), 100 + delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={className}
      style={{
        // This wraps the hero H1 — the mobile LCP element — so it must paint on
        // first render. Keep opacity at 1 and animate translateY only; an
        // opacity-0 fade gates LCP behind hydration + the 0.7s transition.
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {children}
    </div>
  )
}
