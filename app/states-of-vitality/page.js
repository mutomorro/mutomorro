import Link from 'next/link'
import CTA from '../../components/CTA'
import LogoStrip from '../../components/LogoStrip'
import UseCaseCards from '../../components/states-of-vitality/UseCaseCards'
import HeroReveal from '../../components/states-of-vitality/HeroReveal'
import HeroScreenshotReveal from '../../components/states-of-vitality/HeroScreenshotReveal'

// ============================================
// SEO METADATA
// ============================================

export const metadata = {
  title: 'States of Vitality - organisational health diagnostic',
  description: 'A diagnostic tool that measures organisational health across eight dimensions. See where your organisation thrives and where it needs attention.',
  openGraph: {
    title: 'States of Vitality - organisational health diagnostic',
    description: 'A diagnostic tool that measures organisational health across eight dimensions. See where your organisation thrives and where it needs attention.',
    type: 'website',
  },
}

// ============================================
// DATA
// ============================================

const DIMENSIONS = [
  { name: 'Embedded Strategy', colour: '#FF707C', description: 'How deeply strategy is embedded in daily work' },
  { name: 'Momentum through Work', colour: '#FFAC51', description: 'How smoothly work moves and decisions get made' },
  { name: 'Evolving Service', colour: '#FFC23B', description: 'How naturally improvement and evolution happen' },
  { name: 'Resonant Purpose', colour: '#A7D957', description: 'How effectively purpose aligns your organisation' },
  { name: 'Generative Capacity', colour: '#3AD377', description: 'How effectively capability is built and shared' },
  { name: 'Enacted Culture', colour: '#00C3D8', description: 'How well your environment enables great work' },
  { name: 'Narrative Connections', colour: '#5A70C2', description: 'How well knowledge flows to where it\'s needed' },
  { name: 'Tuned to Change', colour: '#755E7F', description: 'How confidently you navigate transitions' },
]


const STAGES = [
  { number: '01', title: 'Setup and launch', description: 'We configure the survey for your structure and ensure questions fit different levels.', timeline: 'Week 1' },
  { number: '02', title: 'Organisation-wide survey', description: 'Everyone completes the assessment - designed to be finished in one sitting.', timeline: 'Weeks 2-4' },
  { number: '03', title: 'Analysis and reporting', description: 'We analyse responses across all dimensions - identifying patterns and opportunities.', timeline: 'Week 5' },
  { number: '04', title: 'Workshop and planning', description: 'Walk through findings together and agree where to focus next.', timeline: 'Week 6' },
]

const STEP_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

const DELIVERABLES = [
  { title: 'Comprehensive report', description: 'A detailed analysis across all eight dimensions - scores, patterns, perception gaps and plain-language interpretation.' },
  { title: 'Interactive dashboard', description: 'Explore results by dimension, department, or level. Filter, compare, and export. A tool your leadership team will actually use.' },
  { title: 'Facilitated workshop', description: 'A working session to explore findings, build shared understanding, and agree priorities.' },
  { title: 'Development plan', description: 'Prioritised recommendations - where effort will create the greatest impact.' },
]

// ============================================
// SCREENSHOT COMPONENTS
// ============================================

function ScreenshotDark({ src, alt }) {
  return (
    <div className="sov-screenshot-perspective">
      <div className="sov-screenshot-perspective__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading="eager"
        />
      </div>
    </div>
  )
}

function ScreenshotLight({ src, alt, style = {} }) {
  return (
    <div className="screenshot-flat" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        loading="lazy"
      />
    </div>
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function StatesOfVitalityPage() {
  const contactHref = '/contact?service=States%20of%20Vitality%20Assessment'

  return (
    <main className="sov-page">

      {/* ==========================================
          SECTION 1: HERO (dark, two-column)
          ========================================== */}
      <section className="section--full dark-bg sov-hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="sov-hero__grid" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Text - mount animation, no scroll trigger */}
          <HeroReveal>
            <span className="kicker" style={{ marginBottom: '16px' }}>States of Vitality Assessment</span>
            <h1 className="heading-display heading-gradient" style={{ margin: '0 0 32px', maxWidth: '900px' }}>
              See your whole organisation clearly
            </h1>
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
              A comprehensive diagnostic that reveals how your organisation actually works - not just individual parts, but how everything connects. Understand where you're thriving, where energy is getting stuck, and where focused attention will create the greatest impact.
            </p>
            <div style={{ marginTop: '40px' }}>
              <Link href={contactHref} className="btn-primary btn-primary--dark btn-primary--lg sov-cta-btn">
                Enquire about an assessment
              </Link>
            </div>
          </HeroReveal>

          {/* Dashboard screenshot - mount animation with 200ms delay */}
          <HeroScreenshotReveal>
            <ScreenshotDark src="/images/dashboard/dashboard-overview.png" alt="States of Vitality dashboard overview showing radar chart, overall vitality score, dimension rankings and word cloud" />
          </HeroScreenshotReveal>
        </div>
      </section>

      {/* ==========================================
          ANCHOR NAVIGATION (mid-dark)
          ========================================== */}
      <nav className="anchor-nav" style={{ background: '#423B49' }}>
        <div className="anchor-nav__inner">
          {[
            { label: 'Dimensions', id: 'dimensions' },
            { label: 'What\'s Different', id: 'whats-different' },
            { label: 'Perception Gap', id: 'perception-gap' },
            { label: 'Use Cases', id: 'use-cases' },
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'What You Receive', id: 'what-you-receive' },
          ].map(({ label, id }) => (
            <a key={id} href={`#${id}`} className="anchor-nav__link">
              {label}
            </a>
          ))}
        </div>
        <div className="anchor-nav__fade" />
      </nav>

      {/* ==========================================
          SECTION 2: THE PROBLEM (white, two-column)
          ========================================== */}
      <section className="section--full sov-section" style={{ background: 'var(--white)' }}>
        <div className="sov-two-col" style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Text - fade up */}
          <div className="scroll-in">
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 24px' }}>
              From isolated data to meaningful clarity
            </h2>
            <div style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.7)', maxWidth: '600px' }}>
              <p style={{ margin: '0 0 20px' }}>
                Most assessments measure isolated topics - engagement, satisfaction, culture. You get numbers, but not understanding.
              </p>
              <p style={{ margin: '0 0 32px' }}>
                The real insight isn't in individual scores. It's in how things connect: how purpose shapes culture, how strategy enables operations, how change flows (or doesn't) through your organisation.
              </p>
            </div>
            <Link href={contactHref} className="btn-primary sov-cta-btn">
              Enquire about an assessment
            </Link>
          </div>

          {/* Before/after contrast visual - fade up with slight delay */}
          <div className="sov-contrast scroll-in delay-2">
            <div className="sov-contrast__inner">
              {/* Before: scattered dots */}
              <div style={{
                padding: '24px 20px',
                background: '#f0f0f0',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '8px',
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.3)',
                  margin: '0 0 16px',
                }}>
                  Typical surveys
                </p>
                <svg width="100%" viewBox="0 0 120 100" fill="none" style={{ display: 'block', marginBottom: '16px' }}>
                  <rect x="12" y="14" width="14" height="14" rx="2" fill="#c8c8c8" />
                  <rect x="58" y="8" width="14" height="14" rx="2" fill="#b8b8b8" />
                  <rect x="92" y="22" width="14" height="14" rx="2" fill="#d0d0d0" />
                  <rect x="32" y="52" width="14" height="14" rx="2" fill="#bbb" />
                  <rect x="72" y="60" width="14" height="14" rx="2" fill="#c4c4c4" />
                  <rect x="8" y="78" width="14" height="14" rx="2" fill="#d4d4d4" />
                  <rect x="52" y="82" width="14" height="14" rx="2" fill="#aaa" />
                  <rect x="96" y="72" width="14" height="14" rx="2" fill="#c0c0c0" />
                </svg>
                <p style={{ fontSize: '12px', fontWeight: '400', color: 'rgba(0,0,0,0.25)', margin: 0, fontStyle: 'italic' }}>
                  Data without context
                </p>
              </div>

              {/* Gradient arrow */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <defs>
                    <linearGradient id="arrowGrad" x1="0" y1="0" x2="28" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#80388F" />
                      <stop offset="50%" stopColor="#FF4279" />
                      <stop offset="100%" stopColor="#FFA200" />
                    </linearGradient>
                  </defs>
                  <path d="M4 14h18M16 8l6 6-6 6" stroke="url(#arrowGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* After: connected dots with dimension colours */}
              <div style={{
                padding: '24px 20px',
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 16px' }}>
                  States of Vitality
                </p>
                <svg width="100%" viewBox="0 0 120 100" fill="none" style={{ display: 'block', marginBottom: '16px' }}>
                  <line x1="19" y1="21" x2="65" y2="15" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="65" y1="15" x2="99" y2="29" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="19" y1="21" x2="39" y2="59" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="65" y1="15" x2="79" y2="67" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="99" y1="29" x2="79" y2="67" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="39" y1="59" x2="79" y2="67" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="39" y1="59" x2="15" y2="85" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="79" y1="67" x2="59" y2="89" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="79" y1="67" x2="103" y2="79" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="15" y1="85" x2="59" y2="89" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <circle cx="19" cy="21" r="7" fill="#FF707C" />
                  <circle cx="65" cy="15" r="7" fill="#FFAC51" />
                  <circle cx="99" cy="29" r="7" fill="#FFC23B" />
                  <circle cx="39" cy="59" r="7" fill="#A7D957" />
                  <circle cx="79" cy="67" r="7" fill="#3AD377" />
                  <circle cx="15" cy="85" r="7" fill="#00C3D8" />
                  <circle cx="59" cy="89" r="7" fill="#5A70C2" />
                  <circle cx="103" cy="79" r="7" fill="#755E7F" />
                </svg>
                <p style={{ fontSize: '12px', fontWeight: '400', color: 'var(--accent)', margin: 0, fontStyle: 'italic' }}>
                  See how everything relates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          LOGO STRIP - fade in
          ========================================== */}
      <div className="scroll-fade">
        <LogoStrip />
      </div>

      {/* ==========================================
          SECTION 3: EIGHT DIMENSIONS (warm, two-column)
          ========================================== */}
      <section id="dimensions" className="section--full sov-section" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* H2 + intro - fade up */}
          <div className="scroll-in" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 20px' }}>
              Eight dimensions, one connected view
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.55)' }}>
              Built on the EMERGENT Framework, the assessment examines eight dimensions that shape organisational health - from strategy and purpose through to culture and how you navigate change. Each dimension tells part of the story. Together, they reveal the whole picture.
            </p>
          </div>

          {/* Two-column: dimension list left, screenshot right */}
          <div className="sov-two-col--50-50" style={{ marginBottom: '40px' }}>
            {/* Dimension list - staggered fade up */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {DIMENSIONS.map((dim, i) => (
                <div key={dim.name} className="scroll-in" style={{
                  padding: '16px 0 16px 20px',
                  borderLeft: `4px solid ${dim.colour}`,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  transitionDelay: `${i * 50}ms`,
                }}>
                  <p style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: 'var(--dark)',
                    margin: '0 0 2px',
                    lineHeight: '1.3',
                  }}>
                    {dim.name}
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    color: 'rgba(0,0,0,0.45)',
                    margin: 0,
                  }}>
                    {dim.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Dashboard screenshot - flat float-in */}
            <div className="scroll-screenshot-flat delay-2">
              <ScreenshotLight
                src="/images/dashboard/dashboard-profile.png"
                alt="Vitality Profile showing all eight dimensions scored and ranked as horizontal bars"
              />
            </div>
          </div>

          <p className="scroll-in" style={{
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '300',
            lineHeight: '1.7',
            color: 'rgba(0,0,0,0.5)',
            maxWidth: '680px',
            margin: '0 auto',
            fontStyle: 'italic',
          }}>
            Each dimension is assessed across five states of vitality - from Emerging through to Pioneering. This shows you not just where you are, but the natural pathway toward where you want to be.
          </p>
        </div>
      </section>

      {/* ==========================================
          SECTION 4: WHAT MAKES IT DIFFERENT (white)
          ========================================== */}
      <section id="whats-different" className="section--full sov-section" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* H2 + intro - fade up */}
          <div className="scroll-in" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 20px' }}>
              A different kind of assessment
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.55)' }}>
              Three things set this assessment apart from typical organisational surveys:
            </p>
          </div>

          {/* Three cards - staggered fade up */}
          <div className="sov-three-cards">
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="8" cy="22" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="24" cy="22" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M16 14v4M12.5 19.5L14 17M19.5 19.5L18 17" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                title: 'Everyone participates',
                body: 'This assessment brings together perspectives from across your entire organisation - every level, every function - into one coherent picture of how things actually work.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M16 6v6M16 20v6M6 16h6M20 16h6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                title: 'Built on systems thinking',
                body: 'Organisations are ecosystems where everything connects. A problem in one area often has roots in another. We examine how dimensions influence each other - revealing patterns that siloed surveys simply can\'t see.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M16 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                ),
                title: 'Know where to focus',
                body: 'Data alone doesn\'t drive change - clarity does. The assessment identifies your strengths, highlights growth areas, and pinpoints the leverage points where focused effort will create the greatest ripple effect across your organisation.',
              },
            ].map((card, i) => (
              <div key={i} className="scroll-in" style={{
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '36px 32px',
                transitionDelay: `${i * 100}ms`,
              }}>
                <div style={{
                  color: 'var(--accent)',
                  marginBottom: '20px',
                }}>
                  {card.icon}
                </div>
                <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '300',
                  lineHeight: '1.75',
                  color: 'rgba(0,0,0,0.6)',
                  margin: 0,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          BRIDGE TEXT BAND (mid-dark) - fade in, no movement
          ========================================== */}
      <section className="section--full dark-bg bridge-text sov-section" style={{ background: '#423B49' }}>
        <div className="scroll-fade" style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '24px',
            fontWeight: '300',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.85)',
            margin: 0,
          }}>
            What would change if you could see your whole organisation - not just the parts leadership <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>is close to</em>?
          </p>
        </div>
      </section>

      {/* ==========================================
          SECTION 5: PERCEPTION GAP (dark, two-column)
          ========================================== */}
      <section id="perception-gap" className="section--full dark-bg sov-section" style={{ background: 'var(--dark)' }}>
        <div className="sov-two-col--40-60" style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* Text - fade up */}
          <div className="scroll-in">
            <span className="kicker" style={{ marginBottom: '16px' }}>The aha moment</span>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 20px' }}>
              Reveal what leadership can't see
            </h2>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 16px',
            }}>
              The same dimension. Three different experiences.
            </p>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
            }}>
              When we measure across levels, patterns emerge that aggregate scores hide. Leadership might see confidence in navigating change. The front line might experience uncertainty. The gap between them tells you something important.
            </p>
          </div>

          {/* Dashboard screenshot - perspective float-in */}
          <div className="scroll-screenshot delay-2">
            <ScreenshotDark
              src="/images/dashboard/dashboard-by-level.png"
              alt="By Level view comparing senior, middle and front-line perception gaps across all eight dimensions"
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 6: RECOGNITION (warm) - fade up
          ========================================== */}
      <section className="section--full sov-section" style={{ background: 'var(--warm)' }}>
        <div className="scroll-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 24px' }}>
            You might recognise this
          </h2>
          <div style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.6)' }}>
            <p style={{ margin: '0 0 20px' }}>
              You sense something isn't quite working, but you can't pinpoint exactly what. Individual teams perform well, yet somehow the whole feels less than the sum of its parts. Changes you've made haven't stuck the way you hoped. Or perhaps you're preparing for something significant - a transformation, a growth phase, a new strategy - and you want to truly understand what you're working with before you begin.
            </p>
            <p style={{ margin: 0 }}>
              The States of Vitality assessment is for leaders who want to see beneath the surface. Who suspect that the real story of how their organisation works isn't captured in engagement scores or performance dashboards. Who want insight that connects the dots rather than adding more dots to connect.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 7: USE CASES (white)
          ========================================== */}
      <section id="use-cases" className="section--full sov-section" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* H2 + intro - fade up */}
          <div className="scroll-in" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 20px' }}>
              One assessment, many applications
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.55)' }}>
              Because it looks at your whole organisation as a connected system, the assessment provides valuable insight across a wide range of contexts.
            </p>
          </div>

          <UseCaseCards />
        </div>
      </section>

      {/* ==========================================
          SECTION 8: HOW IT WORKS (white)
          ========================================== */}
      <section id="how-it-works" className="section--full sov-section" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* H2 + intro - fade up */}
          <div className="scroll-in" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 20px' }}>
              How it works
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.55)' }}>
              The assessment follows four straightforward stages:
            </p>
          </div>

          {/* HORIZONTAL timeline - staggered nodes */}
          <div className="sov-timeline">
            <div className="sov-timeline__line" />
            {STAGES.map((stage, i) => (
              <div key={i} className="scroll-in" style={{ textAlign: 'center', position: 'relative', zIndex: 1, transitionDelay: `${i * 150}ms` }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--white)',
                  border: `3px solid ${STEP_COLOURS[i]}`,
                  transform: 'rotate(45deg)',
                  margin: '0 auto 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    transform: 'rotate(-45deg)',
                    fontSize: '14px',
                    fontWeight: '400',
                    color: STEP_COLOURS[i],
                    letterSpacing: '-0.02em',
                  }}>
                    {stage.number}
                  </span>
                </div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.45)',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}>
                  {stage.timeline}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 8px', color: 'var(--dark)' }}>
                  {stage.title}
                </h3>
                <p style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.65', color: 'rgba(0,0,0,0.55)', margin: '0 auto', maxWidth: '260px' }}>
                  {stage.description}
                </p>
              </div>
            ))}
          </div>

          {/* VERTICAL timeline (mobile) - staggered nodes */}
          <div className="sov-timeline--vertical">
            {STAGES.map((stage, i) => (
              <div key={i} className="sov-timeline__v-step scroll-in" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="sov-timeline__v-node" style={{ border: `3px solid ${STEP_COLOURS[i]}` }}>
                  <span style={{ color: STEP_COLOURS[i] }}>{stage.number}</span>
                </div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.45)',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                }}>
                  {stage.timeline}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 6px', color: 'var(--dark)' }}>
                  {stage.title}
                </h3>
                <p style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.65', color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                  {stage.description}
                </p>
              </div>
            ))}
          </div>

          <div className="scroll-in" style={{ textAlign: 'center', marginTop: '48px' }}>
            <p style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(0,0,0,0.4)', margin: '0 0 4px' }}>
              Total process time
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--dark)', margin: '0 0 4px' }}>
              Approximately 6 weeks
            </p>
            <p style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
              From launch to actionable development plan
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 9: WHAT YOU RECEIVE (warm)
          ========================================== */}
      <section id="what-you-receive" className="section--full sov-section" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {/* H2 - fade up */}
          <h2 className="heading-h2 heading-gradient scroll-in" style={{ margin: '0 0 48px', textAlign: 'center' }}>
            What you receive
          </h2>

          {/* Deliverable cards - staggered */}
          <div className="sov-deliverables" style={{ marginBottom: '60px' }}>
            {DELIVERABLES.map((del, i) => (
              <div key={i} className="scroll-in" style={{
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '28px 24px',
                transitionDelay: `${i * 100}ms`,
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 10px', color: 'var(--dark)' }}>
                  {del.title}
                </h3>
                <p style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.7', color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                  {del.description}
                </p>
              </div>
            ))}
          </div>

          {/* Dashboard showcase - staggered screenshot float-in */}
          <div className="sov-composed">
            <div className="sov-composed__centre scroll-screenshot-flat">
              <ScreenshotLight
                src="/images/dashboard/dashboard-strengths.png"
                alt="Strengths and Growth Areas showing top three strengths and top three areas for development"
              />
            </div>
            <div className="sov-composed__left scroll-screenshot-flat" style={{ transitionDelay: '150ms' }}>
              <ScreenshotLight
                src="/images/dashboard/dashboard-deep-dive.png"
                alt="Dimension deep dive showing score circle, response breakdown, insight summary and recommended actions"
                style={{ boxShadow: '0 12px 50px rgba(0,0,0,0.12)' }}
              />
            </div>
            <div className="sov-composed__right scroll-screenshot-flat" style={{ transitionDelay: '300ms' }}>
              <ScreenshotLight
                src="/images/dashboard/dashboard-trends.png"
                alt="Trends over time showing before and after comparison with progress indicators"
                style={{ boxShadow: '0 12px 50px rgba(0,0,0,0.12)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 10: READY TO TALK (dark) - fade up
          ========================================== */}
      <div className="scroll-in">
        <CTA
          label="Let's talk"
          heading="Ready to see your organisation clearly?"
          body="Get in touch to discuss whether the States of Vitality assessment is right for your organisation. We'll talk through your situation, answer any questions, and explain how it would work for you."
          buttonText="Start a conversation"
          buttonLink={contactHref}
        />
      </div>

    </main>
  )
}
