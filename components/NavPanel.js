'use client'

import { useState, useEffect, useRef } from 'react'

export default function NavPanel({ isOpen, onClose, onMouseEnter, onMouseLeave, instantClose, children }) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const panelRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Open: mount then animate in
      setVisible(true)
      setAnimating(true)
      // Force reflow before adding open class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (panelRef.current) panelRef.current.classList.add('nav-panel--open')
          // Stagger child items
          if (innerRef.current) {
            const items = innerRef.current.querySelectorAll('.nav-panel-stagger')
            items.forEach((el, i) => {
              el.style.transitionDelay = `${i * 80 + 150}ms`
              el.classList.add('nav-panel-stagger--in')
            })
          }
          setTimeout(() => setAnimating(false), 700)
        })
      })
    } else if (visible) {
      if (instantClose) {
        // Instant close (switching panels) — no animation
        if (panelRef.current) panelRef.current.classList.remove('nav-panel--open')
        if (innerRef.current) {
          const items = innerRef.current.querySelectorAll('.nav-panel-stagger')
          items.forEach((el) => {
            el.style.transitionDelay = '0ms'
            el.classList.remove('nav-panel-stagger--in')
          })
        }
        setVisible(false)
        setAnimating(false)
      } else {
        // Animated close
        setAnimating(true)
        if (panelRef.current) panelRef.current.classList.remove('nav-panel--open')
        if (innerRef.current) {
          const items = innerRef.current.querySelectorAll('.nav-panel-stagger')
          items.forEach((el) => {
            el.style.transitionDelay = '0ms'
            el.classList.remove('nav-panel-stagger--in')
          })
        }
        const timer = setTimeout(() => {
          setVisible(false)
          setAnimating(false)
        }, 250)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, instantClose])

  if (!visible && !isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`nav-panel-backdrop${isOpen ? ' nav-panel-backdrop--open' : ''}`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="nav-panel"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--dark)',
            opacity: 0.35,
            lineHeight: 1,
            padding: '0.25rem',
          }}
        >
          ✕
        </button>

        <div ref={innerRef} className="nav-panel__inner" style={{ maxWidth: '1350px', margin: '0 auto', padding: '4rem 0 5rem' }}>
          {children}
        </div>
      </div>
    </>
  )
}
