'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PortableText } from '@portabletext/react'
import { useIsDesktop } from '../../hooks/useIsDesktop'

// Animation key → component map. Reuses the existing recognition canvases.
// Keys match the canvas component filenames (PascalCase) so content editors
// can copy them directly from the codebase.
const animationMap = {
  CultureChange1: dynamic(() => import('../recognition/CultureChange1')),
  CultureChange2: dynamic(() => import('../recognition/CultureChange2')),
  CultureChange3: dynamic(() => import('../recognition/CultureChange3')),
  CultureChange4: dynamic(() => import('../recognition/CultureChange4')),
  ChangeMgmt1: dynamic(() => import('../recognition/ChangeMgmt1')),
  ChangeMgmt2: dynamic(() => import('../recognition/ChangeMgmt2')),
  ChangeMgmt3: dynamic(() => import('../recognition/ChangeMgmt3')),
  ChangeMgmt4: dynamic(() => import('../recognition/ChangeMgmt4')),
}

// Visual progression: dot → cluster → network
function NodeIcon({ variant }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="5" />
      </svg>
    )
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="3.2" />
        <circle cx="8" cy="9" r="2.4" />
        <circle cx="24" cy="9" r="2.4" />
        <circle cx="8" cy="23" r="2.4" />
        <circle cx="24" cy="23" r="2.4" />
        <line x1="16" y1="16" x2="8" y2="9" strokeWidth="1.1" />
        <line x1="16" y1="16" x2="24" y2="9" strokeWidth="1.1" />
        <line x1="16" y1="16" x2="8" y2="23" strokeWidth="1.1" />
        <line x1="16" y1="16" x2="24" y2="23" strokeWidth="1.1" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="2.4" />
      <circle cx="6" cy="6" r="1.9" />
      <circle cx="26" cy="6" r="1.9" />
      <circle cx="6" cy="26" r="1.9" />
      <circle cx="26" cy="26" r="1.9" />
      <circle cx="16" cy="4" r="1.5" />
      <circle cx="16" cy="28" r="1.5" />
      <circle cx="4" cy="16" r="1.5" />
      <circle cx="28" cy="16" r="1.5" />
      <line x1="16" y1="16" x2="6" y2="6" strokeWidth="0.9" />
      <line x1="16" y1="16" x2="26" y2="6" strokeWidth="0.9" />
      <line x1="16" y1="16" x2="6" y2="26" strokeWidth="0.9" />
      <line x1="16" y1="16" x2="26" y2="26" strokeWidth="0.9" />
      <line x1="6" y1="6" x2="26" y2="6" strokeWidth="0.6" opacity="0.7" />
      <line x1="6" y1="26" x2="26" y2="26" strokeWidth="0.6" opacity="0.7" />
      <line x1="6" y1="6" x2="6" y2="26" strokeWidth="0.6" opacity="0.7" />
      <line x1="26" y1="6" x2="26" y2="26" strokeWidth="0.6" opacity="0.7" />
    </svg>
  )
}

// Renders the canvas animation, crossfading on key change instead of
// hard-mounting/unmounting (we layer the previous and the next briefly).
function AnimationPanel({ animationKey }) {
  const isDesktop = useIsDesktop()
  const [layers, setLayers] = useState(() => [{ key: animationKey, id: 0 }])
  const idRef = useRef(0)

  useEffect(() => {
    if (!animationKey) return
    if (layers[layers.length - 1]?.key === animationKey) return
    idRef.current += 1
    const nextLayers = [...layers, { key: animationKey, id: idRef.current }]
    setLayers(nextLayers)
    // After the new layer's fade-in completes, drop older layers.
    const t = setTimeout(() => {
      setLayers((cur) => cur.slice(-1))
    }, 500)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey])

  if (!isDesktop) return null

  return (
    <>
      {layers.map((layer, i) => {
        const Animation = layer.key && animationMap[layer.key]
        if (!Animation) return null
        const isTop = i === layers.length - 1
        return (
          <div
            key={layer.id}
            className={`proposition-stepper__animation ${isTop ? 'is-active' : 'is-fading-out'}`}
            aria-hidden={!isTop}
          >
            <Animation />
          </div>
        )
      })}
    </>
  )
}

export default function PropositionStepper({
  steps = [],
  philosophyLinkLabel,
  philosophyLinkUrl,
}) {
  const [active, setActive] = useState(0)
  if (!steps?.length) return null

  const current = steps[active] || steps[0]
  const isLastStep = active === steps.length - 1

  return (
    <div className="proposition-stepper">
      {/* Vertical nav rail */}
      <nav className="proposition-stepper__rail" role="tablist" aria-label="Proposition steps">
        {steps.map((step, i) => (
          <div key={step._key || i} className="proposition-stepper__rail-item">
            <button
              type="button"
              role="tab"
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              className={`proposition-stepper__node ${active >= i ? 'is-reached' : ''} ${active === i ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Step ${i + 1}${step.kicker ? `: ${step.kicker}` : ''}`}
            >
              <span className="proposition-stepper__node-icon">
                <NodeIcon variant={i} />
              </span>
            </button>
            {step.kicker && (
              <span
                className={`proposition-stepper__rail-label ${active === i ? 'is-active' : ''}`}
              >
                {step.kicker}
              </span>
            )}
            {i < steps.length - 1 && (
              <span
                className={`proposition-stepper__connector ${active > i ? 'is-lit' : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </nav>

      {/* Body column — fades on step change */}
      <div className="proposition-stepper__body">
        <div className="proposition-stepper__body-inner" key={active} role="tabpanel">
          {current.kicker && (
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '10px' }}>
              {current.kicker}
            </span>
          )}
          {current.headline && (
            <h3 className="proposition-stepper__headline">{current.headline}</h3>
          )}
          {current.body && (
            <div className="portable-text">
              <PortableText value={current.body} />
            </div>
          )}
          {isLastStep && philosophyLinkLabel && philosophyLinkUrl && (
            <p style={{ marginTop: '20px' }}>
              <Link href={philosophyLinkUrl} className="inline-link">
                {philosophyLinkLabel} →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Animation column */}
      <div className="proposition-stepper__canvas">
        <AnimationPanel animationKey={current.animationKey} />
      </div>
    </div>
  )
}
