'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ToolFloatingBar({ toolTitle, templateHref }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroBtn = document.getElementById('tool-hero-cta')
    const ctaSection = document.getElementById('template-cta')
    if (!heroBtn) return

    let heroBtnOut = false
    let ctaIn = false

    function update() {
      setVisible(heroBtnOut && !ctaIn)
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroBtnOut = !entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )
    heroObserver.observe(heroBtn)

    let ctaObserver
    if (ctaSection) {
      ctaObserver = new IntersectionObserver(
        ([entry]) => {
          ctaIn = entry.isIntersecting
          update()
        },
        { threshold: 0 }
      )
      ctaObserver.observe(ctaSection)
    }

    return () => {
      heroObserver.disconnect()
      if (ctaObserver) ctaObserver.disconnect()
    }
  }, [])

  return (
    <div
      className="tool-floating-bar"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="tool-floating-bar__inner">
        <span className="tool-floating-bar__title">{toolTitle}</span>
        <Link
          href={templateHref}
          className="btn-primary btn-primary--dark tool-floating-bar__btn"
        >
          Get the free template
        </Link>
      </div>
    </div>
  )
}
