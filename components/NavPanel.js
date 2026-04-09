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
          const panel = panelRef.current
          if (panel) {
            panel.classList.add('nav-panel--open')
            // Enable scrolling only after max-height transition ends
            const handleTransitionEnd = (e) => {
              if (e.propertyName === 'max-height' && panel) {
                panel.style.overflowY = 'auto'
              }
            }
            panel.addEventListener('transitionend', handleTransitionEnd, { once: true })
          }
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
        if (panelRef.current) {
          panelRef.current.style.overflowY = ''
          panelRef.current.classList.remove('nav-panel--open')
        }
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
        if (panelRef.current) {
          panelRef.current.style.overflowY = ''
          panelRef.current.classList.remove('nav-panel--open')
        }
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
            right: '48px',
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

        <div ref={innerRef} className="nav-panel__inner section-padding-nav-panel" style={{ maxWidth: 'calc(1350px + 96px)', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </>
  )
}
