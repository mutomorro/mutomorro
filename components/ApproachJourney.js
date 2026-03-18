'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Step colours per the brief
const STEP_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

/* ---- Journey Strip (renders inside the approach section) ---- */
export function JourneyStrip({ stages }) {
  const scrollToStage = useCallback((index) => {
    const section = document.querySelector(`[data-stage-index="${index}"]`)
    if (!section) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = section.getBoundingClientRect().top + window.scrollY - 180
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
  }, [])

  return (
    <div className="journey-strip" id="journey-strip">
      <div className="journey-strip__line" />
      {stages?.map((stage, i) => (
        <button
          key={stage._key || i}
          className="journey-strip__node"
          onClick={() => scrollToStage(i)}
          style={{ '--step-colour': STEP_COLOURS[i] || STEP_COLOURS[0] }}
        >
          <div className="journey-strip__diamond">
            <span className="journey-strip__number">
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
          <p className="journey-strip__title">{stage.stageTitle}</p>
          <p className="journey-strip__desc">{stage.stageSummary}</p>
        </button>
      ))}
    </div>
  )
}

/* ---- Sticky Progress Bar (renders at page level, outside sections) ---- */
export function ProgressBar({ stages }) {
  const [activeStep, setActiveStep] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false

        const strip = document.getElementById('journey-strip')
        const sections = document.querySelectorAll('[data-stage-index]')
        if (!strip || !sections.length) return

        // Show when strip is above viewport AND stages still visible
        const stripRect = strip.getBoundingClientRect()
        const lastSection = sections[sections.length - 1]
        const lastRect = lastSection.getBoundingClientRect()
        const stripGone = stripRect.bottom < 0
        const stagesVisible = lastRect.bottom > 200

        setShowProgress(stripGone && stagesVisible)

        // Active step: stage is active when its top is above 200px from viewport top
        let current = 0
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top < 200) {
            current = i
          }
        }
        setActiveStep(current)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [stages])

  const scrollToStage = useCallback((index) => {
    const section = document.querySelector(`[data-stage-index="${index}"]`)
    if (!section) return
    const top = section.getBoundingClientRect().top + window.scrollY - 180
    window.scrollTo({ top, behavior: prefersReduced.current ? 'auto' : 'smooth' })
  }, [])

  return (
    <div
      className={`progress-bar ${showProgress ? 'progress-bar--visible' : ''}`}
      style={prefersReduced.current ? { transition: 'none' } : undefined}
    >
      <div className="progress-bar__inner">
        {stages?.map((stage, i) => {
          const isActive = i === activeStep
          const isCompleted = i < activeStep
          const isUpcoming = i > activeStep
          return (
            <button
              key={stage._key || i}
              className={`progress-bar__step ${isActive ? 'progress-bar__step--active' : ''} ${isCompleted ? 'progress-bar__step--completed' : ''} ${isUpcoming ? 'progress-bar__step--upcoming' : ''}`}
              onClick={() => scrollToStage(i)}
              style={{ '--step-colour': STEP_COLOURS[i] || STEP_COLOURS[0] }}
            >
              <div className="progress-bar__dot" />
              <span className="progress-bar__step-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="progress-bar__step-title">{stage.stageTitle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Default export for backwards compatibility
export default function ApproachJourney({ stages }) {
  return <JourneyStrip stages={stages} />
}
