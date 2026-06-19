'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import Lightbox from '../Lightbox'

// Per-stage colours, carried over from the original journey strip so the
// four stages keep their distinct visual identity. INTRO has no colour;
// it inherits the muted-white default.
const STEP_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

// Slide indices: 0 = INTRO, 1..n = stages
export default function ApproachSlider({ approachIntro, stages = [], approachKicker = 'Our approach', approachIntroHeadline = 'How we work', principles = [] }) {
  const [active, setActive] = useState(0)

  const navItems = [
    { key: 'intro', number: '—', label: 'Intro', colour: null },
    ...stages.map((s, i) => ({
      key: s._key || `stage-${i}`,
      number: s.stageNumber || String(i + 1).padStart(2, '0'),
      label: s.stageTitle || s.stageSummary?.split(' ').slice(0, 1).join(' ') || `Stage ${i + 1}`,
      colour: STEP_COLOURS[i] || STEP_COLOURS[STEP_COLOURS.length - 1],
    })),
  ]

  return (
    <div className="approach-slider">
      {/* Nav rail */}
      <nav className="approach-slider__rail" aria-label="Approach stages">
        {navItems.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`approach-slider__rail-item ${active === i ? 'is-active' : ''}`}
            style={item.colour ? { '--step-colour': item.colour } : undefined}
            onClick={() => setActive(i)}
            aria-current={active === i ? 'true' : 'false'}
          >
            <span className="approach-slider__rail-number">{item.number}</span>
            <span className="approach-slider__rail-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content panel — every slide is rendered into the server HTML and the
          inactive ones are hidden with the `hidden` attribute (never
          conditionally rendered, never unmounted). This mirrors the tabs /
          accordion SEO contract: crawlers and AI answer engines see all four
          stages' copy and their `stageLinkUrl` connector links in view-source,
          while a reader still sees one slide at a time. Never switch back to
          `{active === 0 ? … : …}` — that drops the other slides (and their
          links) from the SSR HTML and the ranking value with them. */}
      <div className="approach-slider__panel">
        {/* Intro — slide 0 */}
        <div className="approach-slider__slide" hidden={active !== 0}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
            {approachKicker}
          </span>
          {approachIntroHeadline && (
            <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
              {approachIntroHeadline}
            </h2>
          )}
          <div className="portable-text">
            <PortableText value={approachIntro} />
          </div>
          {principles?.length > 0 && (
            <div className="approach-slider__principles">
              {principles.map((p, i) => (
                <div key={p._key || i} className="approach-principle">
                  <p className="approach-principle__title">{p.title}</p>
                  <p className="approach-principle__desc">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Stages — slides 1..n */}
        {stages.map((stage, i) => (
          <StageSlide
            key={stage._key || `stage-${i}`}
            stage={stage}
            index={i}
            hidden={active !== i + 1}
          />
        ))}
      </div>
    </div>
  )
}

function StageSlide({ stage, index, hidden }) {
  if (!stage) return null
  return (
    <div className="approach-slider__slide" hidden={hidden}>
      <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
        Stage {stage.stageNumber || String(index + 1).padStart(2, '0')}
      </span>

      <div className="approach-slider__slide-top">
        <div className="approach-slider__slide-text">
          <h3 className="heading-h3" style={{ margin: '0 0 20px' }}>
            {stage.stageHeading}
          </h3>
          <div className="portable-text">
            <PortableText value={stage.stageBody} />
          </div>
        </div>
        {stage.stageImageUrl && (
          <div className="approach-slider__slide-image img-lift">
            <Lightbox src={stage.stageImageUrl} alt={stage.stageHeading} />
          </div>
        )}
      </div>

      {(stage.stageInPractice?.length > 0 || stage.stageOutcome) && (
        <>
          <div className="approach-slider__divider" />
          <div className="approach-slider__slide-bottom">
            <div>
              {stage.stageInPractice?.length > 0 && (
                <>
                  <span className="kicker approach-slider__practice-label">
                    What this looks like in practice
                  </span>
                  <ul className="practice-list">
                    {stage.stageInPractice.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div>
              {stage.stageOutcome && (
                <div className="stage-outcome-box">
                  <p className="stage-outcome-box__label">What you get</p>
                  <p className="stage-outcome-box__text">{stage.stageOutcome}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {stage.stageLinkLabel && stage.stageLinkUrl && (
        <a href={stage.stageLinkUrl} className="approach-slider__stage-link">
          {stage.stageLinkLabel}
          <span aria-hidden="true" className="approach-slider__stage-link-arrow"> -&gt;</span>
        </a>
      )}
    </div>
  )
}
