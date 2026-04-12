'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const SLIDE_COUNT = 6
const TRANSITION_MS = 450
const SWIPE_THRESHOLD = 50

const backgrounds = [
  'var(--warm)',   // slide 1
  'var(--white)',  // slide 2
  'var(--warm)',   // slide 3
  'var(--dark)',   // slide 4
  'var(--dark)',   // slide 5
  'var(--dark)',   // slide 6
]

const pairings = [
  { label: 'Strategy that isn\u2019t landing', text: '\u2026is connected to how decisions actually get made day to day.' },
  { label: 'Culture that feels off', text: '\u2026is connected to what the structure around it rewards.' },
  { label: 'Change that\u2019s stalling', text: '\u2026is connected to the conditions people are operating in.' },
]

const questions = [
  'What are we actually trying to build here?',
  'What conditions would make the right things happen naturally?',
  'What would need to be true for this change to last?',
]

export default function IntentionalEcosystemsStory() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0) // -1 = back, 1 = forward
  const [animating, setAnimating] = useState(false)
  const containerRef = useRef(null)
  const touchStartRef = useRef(null)

  const goTo = useCallback((next, dir) => {
    if (animating || next < 0 || next >= SLIDE_COUNT || next === current) return
    setDirection(dir)
    setAnimating(true)
    // Small delay to allow the exit/enter classes to apply
    requestAnimationFrame(() => {
      setCurrent(next)
      setTimeout(() => setAnimating(false), TRANSITION_MS)
    })
  }, [animating, current])

  const goNext = useCallback(() => goTo(current + 1, 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1, -1), [current, goTo])

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    }
    el.addEventListener('keydown', handleKey)
    return () => el.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  // Touch/swipe support
  const onTouchStart = (e) => { touchStartRef.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartRef.current === null) return
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goNext() : goPrev()
    }
    touchStartRef.current = null
  }

  // Manually trigger scroll-in animations for the active slide
  // (global ScrollObserver can't see elements inside overflow:hidden carousel)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Remove visible from all scroll-in elements
    el.querySelectorAll('.scroll-in.visible').forEach((item) => item.classList.remove('visible'))
    // Add visible to scroll-in elements in the active slide after transition
    const timer = setTimeout(() => {
      const activeSlide = el.querySelector('.ie-slide-active')
      if (!activeSlide) return
      activeSlide.querySelectorAll('.scroll-in').forEach((item) => item.classList.add('visible'))
    }, 50)
    return () => clearTimeout(timer)
  }, [current])

  const isDark = current >= 3

  return (
    <section
      ref={containerRef}
      className="ie-carousel"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Intentional Ecosystems story"
    >
      {/* Background layer */}
      <div className="ie-carousel-bg" style={{ background: backgrounds[current] }} />

      {/* Slides */}
      <div className="ie-carousel-viewport">
        {/* Slide 1 */}
        <div className={slideClass(0, current, direction)} aria-hidden={current !== 0}>
          <div className="ie-slide-center">
            <div className="scroll-in">
              <span className="kicker" style={{ marginBottom: '20px' }}>Our philosophy</span>
              <h2 className="ie-s1-heading">
                It&rsquo;s amazing what you find when you look at how things connect
              </h2>
            </div>
            <div className="scroll-in delay-1 ie-s1-body">
              <p className="ie-body-p">
                We believe the conditions you create inside an organisation determine the outcomes you get. Not the strategy alone, not the structure alone, not the culture alone &ndash; but the environment they create together. The connections between them. <em className="ie-em">The space between the lines.</em>
              </p>
              <p className="ie-body-p">
                Those conditions explain why some changes succeed beyond all expectation and others struggle no matter how much energy goes into them. Why the same challenges keep surfacing in different forms. Why a solution designed to fix one thing can quietly create problems somewhere else.
              </p>
              <p style={{ margin: 0 }}>
                It&rsquo;s this idea &ndash; that the connections between things create outcomes nobody planned for &ndash; that sits at the heart of everything we do.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className={slideClass(1, current, direction)} aria-hidden={current !== 1}>
          <div className="ie-slide-left ie-s2-grid">
            <div className="scroll-in">
              <h2 className="ie-s2-heading">Here&rsquo;s what that looks like in practice</h2>
              <p className="ie-s2-intro">
                When leaders bring us a challenge, we see these connections everywhere. The challenge itself is real. But so is the web of things connected to it &ndash; and that web is usually where the real opportunity lives.
              </p>
            </div>
            <div className="scroll-in delay-1">
              {pairings.map((p) => (
                <div key={p.label} className="ie-pairing">
                  <span className="ie-pairing-label">{p.label}</span>
                  <p className="ie-pairing-text">{p.text}</p>
                </div>
              ))}
              <p className="ie-s2-closing">
                You can work hard on any of these in isolation and make progress. But when you see the connections, you can put your energy where it creates the greatest shift &ndash; and the change is more likely to last.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 3 */}
        <div className={slideClass(2, current, direction)} aria-hidden={current !== 2}>
          <div className="ie-slide-left ie-s3-grid">
            <div className="scroll-in" style={{ gridColumn: '1 / -1' }}>
              <h2 className="ie-s3-heading">
                Once you see the connections, new possibilities open up
              </h2>
            </div>
            <div className="scroll-in delay-1 ie-s3-body">
              <p className="ie-body-p">
                This is where things get interesting. A team that&rsquo;s struggling starts to make more sense when you see the signals around it. An initiative that keeps stalling reveals what the system around it needs in order to support it. Problems that seemed stubborn become workable &ndash; because you can see where focused effort will actually make a difference.
              </p>
              <p style={{ margin: 0 }}>
                The leaders we work with are already noticing this &ndash; already sensing that the real story is in how things connect, not just in the individual parts. Often what&rsquo;s missing isn&rsquo;t the insight. It&rsquo;s the language and the room to act on what they already know.
              </p>
            </div>
            <div className="scroll-in delay-2 ie-s3-pullout">
              <p className="ie-pullout-large">That&rsquo;s what we&rsquo;re here for.</p>
              <p className="ie-pullout-small">
                Not to give you a new framework to learn. To help you see what&rsquo;s already there &ndash; and act on it.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 4 */}
        <div className={slideClass(3, current, direction)} aria-hidden={current !== 3}>
          <div className="ie-slide-left ie-s4-grid">
            <div className="scroll-in">
              <span className="kicker" style={{ marginBottom: '20px' }}>The first idea</span>
              <h2 className="ie-dark-heading">
                Designing how your organisation works &ndash; on purpose
              </h2>
              <p className="ie-s4-opening">
                If these connections matter this much, you can&rsquo;t afford to leave them to chance.
              </p>
              <p className="ie-dark-body" style={{ margin: 0 }}>
                Being intentional means stepping back far enough to see what you&rsquo;re actually building. Not leaving culture to chance, structure to history, or strategy to a document nobody reads. It means asking bigger questions before jumping to solutions.
              </p>
            </div>
            <div className="scroll-in delay-1">
              {questions.map((q, i) => (
                <div key={i} className={`ie-question${i === questions.length - 1 ? ' ie-question-last' : ''}`}>
                  {q}
                </div>
              ))}
              <div className="ie-s4-closing">
                <p style={{ margin: '0 0 20px' }}>
                  In a world that moves fast and changes constantly, the organisations that thrive are the ones that are deliberate about how they&rsquo;re designed &ndash; not just what they deliver.
                </p>
                <p className="ie-s4-closing-strong" style={{ margin: 0 }}>
                  That&rsquo;s what intentional means to us. Not slow. Not cautious. Purposeful.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 5 */}
        <div className={slideClass(4, current, direction)} aria-hidden={current !== 4}>
          <div className="ie-slide-left ie-s5-grid">
            <div className="scroll-in" style={{ gridColumn: '1 / -1' }}>
              <h2 className="ie-dark-heading">And seeing the whole system, not just the parts</h2>
            </div>
            <div className="scroll-in delay-1">
              <div className="ie-staccato">
                <strong className="ie-staccato-bold">Culture</strong> isn&rsquo;t separate from <strong className="ie-staccato-bold">structure</strong>.
              </div>
              <div className="ie-staccato">
                <strong className="ie-staccato-bold">Strategy</strong> isn&rsquo;t separate from <strong className="ie-staccato-bold">operations</strong>.
              </div>
              <div className="ie-staccato">
                The way people <strong className="ie-staccato-bold">experience change</strong> isn&rsquo;t separate from how <strong className="ie-staccato-bold">decisions get made</strong>.
              </div>
              <div className="ie-staccato">
                Pull one thread and the whole fabric moves.
              </div>
            </div>
            <div className="scroll-in delay-2">
              <p className="ie-dark-body" style={{ margin: 0 }}>
                When you see your organisation as an ecosystem &ndash; a living, connected, adaptive system &ndash; you stop trying to fix things in isolation. You start looking for patterns. Where reinforcing loops are amplifying what&rsquo;s working. Where structures are quietly shaping behaviour. Where a small shift would ripple through everything.
              </p>
              <p className="ie-s5-closing">
                That&rsquo;s what ecosystem means to us. Not a buzzword. A way of seeing that reveals things you can&rsquo;t see from inside any single team, function, or initiative.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 6 */}
        <div className={slideClass(5, current, direction)} aria-hidden={current !== 5}>
          <div className="ie-slide-center" style={{ maxWidth: '680px' }}>
            <div className="scroll-in">
              <p className="ie-s6-intro">We call this thinking</p>
              <h2 className="ie-s6-title">
                <span className="ie-s6-highlight">Intentional Ecosystems</span>
              </h2>
            </div>
            <div className="scroll-in delay-1">
              <p className="ie-s6-body">
                Designing how your organisation works with the whole picture in view. Being deliberate about the conditions you create &ndash; and understanding that everything you change connects to everything else.
              </p>
              <p className="ie-s6-closing">
                It&rsquo;s the thread that runs through every project we work on. And once you see it, it changes how you approach everything.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {current > 0 && (
        <button
          className={`ie-arrow ie-arrow-left${isDark ? ' ie-arrow-dark' : ''}`}
          onClick={goPrev}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {current < SLIDE_COUNT - 1 && (
        <button
          className={`ie-arrow ie-arrow-right${isDark ? ' ie-arrow-dark' : ''}`}
          onClick={goNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Slide indicator */}
      <div className={`ie-indicator${isDark ? ' ie-indicator-dark' : ''}`}>
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            className={`ie-dot${i === current ? ' ie-dot-active' : ''}`}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        /* ── Container ── */
        .ie-carousel {
          position: relative;
          height: 85vh;
          min-height: 600px;
          overflow: hidden;
          outline: none;
        }

        .ie-carousel-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          transition: background ${TRANSITION_MS}ms ease-out;
        }

        .ie-carousel-viewport {
          position: relative;
          z-index: 1;
          height: 100%;
          width: 100%;
        }

        /* ── Slides ── */
        .ie-slide {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          padding: clamp(36px, 4.5vw, 56px) clamp(64px, 8vw, 120px);
          opacity: 0;
          pointer-events: none;
          will-change: transform, opacity;
        }
        .ie-slide-active {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
          transition: transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out;
        }
        .ie-slide-exit-left {
          opacity: 0;
          transform: translateX(-60px);
          transition: transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS * 0.6}ms ease-out;
        }
        .ie-slide-exit-right {
          opacity: 0;
          transform: translateX(60px);
          transition: transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS * 0.6}ms ease-out;
        }
        .ie-slide-enter-left {
          transform: translateX(-60px);
        }
        .ie-slide-enter-right {
          transform: translateX(60px);
        }

        /* ── Slide layouts ── */
        .ie-slide-center {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }
        .ie-slide-left {
          max-width: 980px;
          width: 100%;
          margin: 0 auto;
        }

        /* ── Slide 1 ── */
        .ie-s1-heading {
          font-size: clamp(30px, 4.5vw, 46px);
          font-weight: 400;
          letter-spacing: -0.025em;
          line-height: 1.2;
          color: var(--text-primary);
          margin: 0 0 32px;
        }
        .ie-s1-body {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.75;
          color: rgba(34, 28, 43, 0.6);
        }
        .ie-body-p { margin: 0 0 1.25rem 0; }
        .ie-em {
          color: var(--text-primary);
          font-weight: 400;
          font-style: italic;
        }

        /* ── Slide 2 ── */
        .ie-s2-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
          max-width: 980px;
        }
        .ie-s2-heading {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.25;
          color: var(--text-primary);
          margin: 0 0 20px;
        }
        .ie-s2-intro {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.7;
          color: rgba(34, 28, 43, 0.6);
          margin: 0;
        }
        .ie-pairing {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          padding: 20px 0;
          border-top: 1px solid rgba(0,0,0,0.06);
          align-items: baseline;
        }
        .ie-pairing-label {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: rgba(34, 28, 43, 0.38);
          line-height: 1.4;
        }
        .ie-pairing-text {
          font-size: 18px;
          font-weight: 350;
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }
        .ie-s2-closing {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.7;
          color: rgba(34, 28, 43, 0.6);
          margin: 32px 0 0;
        }

        /* ── Slide 3 ── */
        .ie-s3-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
          max-width: 980px;
        }
        .ie-s3-heading {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.25;
          color: var(--text-primary);
          margin: 0 0 24px;
        }
        .ie-s3-body {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.75;
          color: rgba(34, 28, 43, 0.6);
        }
        .ie-s3-pullout {
          border-left: 3px solid var(--accent);
          padding-left: 32px;
        }
        .ie-pullout-large {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.35;
          margin: 0 0 16px;
        }
        .ie-pullout-small {
          font-size: 16px;
          font-weight: 350;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* ── Slide 4 ── */
        .ie-s4-grid {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
          max-width: 980px;
        }
        .ie-dark-heading {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.25;
          color: #ffffff;
          margin: 0 0 24px;
        }
        .ie-s4-opening {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 400;
          line-height: 1.7;
          color: rgba(255,255,255,0.88);
          margin: 0 0 20px;
        }
        .ie-dark-body {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.75;
          color: rgba(255,255,255,0.55);
          margin: 0 0 40px;
        }
        .ie-question {
          padding: 16px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          font-size: clamp(18px, 2.2vw, 22px);
          font-weight: 400;
          font-style: italic;
          color: #ffffff;
          line-height: 1.5;
        }
        .ie-question-last {
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ie-s4-closing {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 350;
          line-height: 1.75;
          color: rgba(255,255,255,0.55);
          margin-top: 40px;
        }
        .ie-s4-closing-strong {
          font-weight: 400;
          color: #ffffff;
        }

        /* ── Slide 5 ── */
        .ie-s5-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
          max-width: 980px;
        }
        .ie-staccato {
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          font-size: clamp(16px, 1.8vw, 19px);
          font-weight: 350;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }
        .ie-staccato-bold {
          font-weight: 400;
          color: rgba(255,255,255,0.88);
        }
        .ie-s5-closing {
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 400;
          line-height: 1.75;
          color: #ffffff;
          margin: 24px 0 0;
          max-width: 720px;
        }

        /* ── Slide 6 ── */
        .ie-s6-intro {
          font-size: 16px;
          font-weight: 350;
          color: rgba(255,255,255,0.55);
          margin: 0 0 16px;
        }
        .ie-s6-title {
          font-size: clamp(36px, 5.5vw, 58px);
          font-weight: 400;
          letter-spacing: -0.03em;
          color: #ffffff;
          line-height: 1.15;
          margin: 0 0 32px;
        }
        .ie-s6-highlight {
          background: linear-gradient(to right, rgba(155,81,224,0.14), rgba(155,81,224,0.14));
          background-size: 100% 40%;
          background-position: 0 88%;
          background-repeat: no-repeat;
        }
        .ie-s6-body {
          font-size: 18px;
          font-weight: 350;
          line-height: 1.75;
          color: rgba(255,255,255,0.55);
          margin: 0 0 24px;
        }
        .ie-s6-closing {
          font-size: 17px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255,255,255,0.88);
          margin: 0;
        }

        /* ── Navigation arrows ── */
        .ie-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: rgba(34, 28, 43, 0.06);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.2s ease;
        }
        .ie-arrow:hover { background: rgba(34, 28, 43, 0.12); }
        .ie-arrow-dark {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
        }
        .ie-arrow-dark:hover { background: rgba(255,255,255,0.15); }
        .ie-arrow-left {
          left: clamp(12px, 2vw, 28px);
          animation: ie-breathe-left 2.4s ease-in-out infinite;
        }
        .ie-arrow-right {
          right: clamp(12px, 2vw, 28px);
          animation: ie-breathe-right 2.4s ease-in-out infinite;
        }
        @keyframes ie-breathe-left {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-4px); }
        }
        @keyframes ie-breathe-right {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(4px); }
        }

        /* ── Dots indicator ── */
        .ie-indicator {
          position: absolute;
          bottom: clamp(20px, 3vw, 36px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 10px;
        }
        .ie-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          background: rgba(34, 28, 43, 0.18);
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .ie-dot:hover { background: rgba(34, 28, 43, 0.35); }
        .ie-dot-active {
          background: rgba(34, 28, 43, 0.5);
          transform: scale(1.25);
        }
        .ie-indicator-dark .ie-dot {
          background: rgba(255,255,255,0.2);
        }
        .ie-indicator-dark .ie-dot:hover {
          background: rgba(255,255,255,0.4);
        }
        .ie-indicator-dark .ie-dot-active {
          background: rgba(255,255,255,0.6);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ie-carousel {
            height: 90vh;
            min-height: 550px;
          }
          .ie-slide {
            padding: clamp(48px, 8vw, 80px) clamp(24px, 5vw, 48px);
            padding-bottom: 80px;
            overflow-y: auto;
          }
          .ie-pairing {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .ie-s2-grid,
          .ie-s3-grid,
          .ie-s4-grid,
          .ie-s5-grid {
            grid-template-columns: 1fr;
          }
          .ie-s3-pullout {
            margin-top: 8px;
          }
          .ie-arrow {
            width: 40px;
            height: 40px;
          }
        }
        @media (max-width: 480px) {
          .ie-carousel {
            height: 100vh;
            min-height: 500px;
          }
          .ie-slide {
            padding: 48px 20px 80px;
            align-items: flex-start;
            padding-top: clamp(48px, 10vw, 80px);
          }
        }
      `}</style>
    </section>
  )
}

function slideClass(index, current, direction) {
  if (index === current) return 'ie-slide ie-slide-active'
  // Recently exited
  if (direction === 1 && index === current - 1) return 'ie-slide ie-slide-exit-left'
  if (direction === -1 && index === current + 1) return 'ie-slide ie-slide-exit-right'
  // Hidden - position off-screen based on where they'd enter from
  if (index > current) return 'ie-slide ie-slide-enter-right'
  return 'ie-slide ie-slide-enter-left'
}
