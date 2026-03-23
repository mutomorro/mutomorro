'use client'

import { useState, useEffect } from 'react'

export default function ToolFloatingBar({ toolTitle }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroBtn = document.getElementById('tool-hero-cta')
    const formSection = document.getElementById('get-template')
    if (!heroBtn || !formSection) return

    let heroBtnOut = false
    let formIn = false

    function update() {
      setVisible(heroBtnOut && !formIn)
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroBtnOut = !entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )

    const formObserver = new IntersectionObserver(
      ([entry]) => {
        formIn = entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )

    heroObserver.observe(heroBtn)
    formObserver.observe(formSection)

    return () => {
      heroObserver.disconnect()
      formObserver.disconnect()
    }
  }, [])

  function handleClick(e) {
    e.preventDefault()
    const el = document.getElementById('get-template')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

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
        <button
          onClick={handleClick}
          className="btn-primary btn-primary--dark tool-floating-bar__btn"
        >
          Download this template
        </button>
      </div>
    </div>
  )
}
