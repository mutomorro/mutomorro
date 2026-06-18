import Link from 'next/link'
import LogoStrip from '../../components/LogoStrip'
import UseCaseCards from '../../components/states-of-vitality/UseCaseCards'
import HeroReveal from '../../components/states-of-vitality/HeroReveal'
import HeroScreenshotReveal from '../../components/states-of-vitality/HeroScreenshotReveal'
import SovExploreCta from '../../components/states-of-vitality/SovExploreCta'

// ============================================
// SEO METADATA
// ============================================

export const metadata = {
  title: 'States of Vitality - organisational health diagnostic',
  description: 'States of Vitality is a managed organisational health diagnostic across eight dimensions. See the whole picture, the story beneath the scores, and where to focus.',
  openGraph: {
    siteName: 'Mutomorro',
    locale: 'en_GB',
    title: 'States of Vitality - organisational health diagnostic',
    description: 'States of Vitality is a managed organisational health diagnostic across eight dimensions. See the whole picture, the story beneath the scores, and where to focus.',
    url: 'https://mutomorro.com/states-of-vitality',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

// ============================================
// DATA
// ============================================

const DIMENSIONS = [
  { name: 'Strategy', colour: '#FF707C', description: 'How clear your direction is' },
  { name: 'Flow', colour: '#FFAC51', description: 'How easily you get work done' },
  { name: 'Service', colour: '#FFC23B', description: 'How you create and deliver value' },
  { name: 'Purpose', colour: '#A7D957', description: 'What drives you and guides your work' },
  { name: 'Development', colour: '#3AD377', description: 'How you grow people and build capability' },
  { name: 'Culture', colour: '#00C3D8', description: 'How it feels to work here' },
  { name: 'Connection', colour: '#5A70C2', description: 'How stories and meaning flow' },
  { name: 'Change', colour: '#755E7F', description: 'How you adapt and evolve' },
]

const STAGES = [
  { number: '01', title: 'Setup and launch', description: 'We configure the survey for your structure and ensure questions fit different levels.', timeline: 'Week 1' },
  { number: '02', title: 'Organisation-wide survey', description: 'Everyone completes the assessment - it takes around 10-15 minutes, and is designed to be finished in one sitting.', timeline: 'Weeks 2-3' },
  { number: '03', title: 'Analysis and reporting', description: 'Results land in your interactive dashboard - patterns, perception gaps and freeform responses ready to explore.', timeline: 'Week 4' },
  { number: '04', title: 'Session and planning', description: 'Walk through findings together and agree where to focus next. Optional consultancy support.', timeline: 'Week 5' },
]

const STEP_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

const INCLUDED_DELIVERABLES = [
  { title: 'Configured survey', description: 'Tailored to your organisation structure - role levels, departments, locations and length of service.' },
  { title: 'Interactive results dashboard', description: 'Secure access for your team. Explore results by dimension, demographic group, or single question. A tool your leadership will actually use.' },
  { title: 'Freeform response capture', description: 'Hear what people say in their own words, alongside the numbers. Shown as written, not scored or sorted into themes.' },
  { title: 'Demographic analysis', description: 'See how experience differs across role level, department, length of service and location - patterns aggregate scores hide.' },
]

const OPTIONAL_DELIVERABLES = [
  { title: 'In-depth written report', description: 'A detailed analysis across all eight dimensions with plain-language interpretation and prioritised recommendations.' },
  { title: 'Facilitated leadership session', description: 'A working session to explore findings, build shared understanding, and agree priorities.' },
  { title: 'Development and action plan', description: 'Where effort will create the greatest impact - sequenced, sized and ready to commission.' },
]

const PRODUCT_SITE_URL = 'https://statesofvitality.com'

// ============================================
// SCREENSHOT COMPONENTS
// ============================================

function ScreenshotDark({ src, alt, width, height, srcSet, sizes, priority = false }) {
  return (
    <div className="sov-screenshot-perspective">
      <div className="sov-screenshot-perspective__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
      </div>
    </div>
  )
}

function ScreenshotLight({ src, alt, width, height, style = {} }) {
  return (
    <div className="screenshot-flat" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

function ProductBadge({ variant = 'dark' }) {
  return (
    <span className={`sov-product-badge ${variant === 'light' ? 'sov-product-badge--light' : ''}`}>
      <span className="sov-product-badge__dot" />
      A product by Mutomorro
    </span>
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function StatesOfVitalityPage() {
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
            <div style={{ marginBottom: '20px' }}>
              <ProductBadge variant="dark" />
            </div>
            <span className="kicker" style={{ marginBottom: '16px' }}>States of Vitality Assessment</span>
            <h1 className="heading-display heading-gradient" style={{ margin: '0 0 32px', maxWidth: '900px' }}>
              See your whole organisation clearly
            </h1>
            <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
              States of Vitality is our managed organisational health diagnostic. It reads the key dimensions of how your organisation works - the whole picture, the story beneath the scores, and where to focus - so you can see clearly, and shape what comes next.
            </p>
            <div style={{ marginTop: '40px' }}>
              <SovExploreCta align="left" />
            </div>
          </HeroReveal>

          {/* Dashboard screenshot - mount animation with 200ms delay */}
          <HeroScreenshotReveal>
            <ScreenshotDark
              src="/images/dashboard/sov-real/sov-landscape.webp"
              srcSet="/images/dashboard/sov-real/sov-landscape-700.webp 700w, /images/dashboard/sov-real/sov-landscape.webp 1400w"
              sizes="(max-width: 900px) 90vw, 600px"
              width={1400}
              height={875}
              priority
              alt="States of Vitality landscape chart - a streamgraph showing all eight dimensions of organisational health side by side"
            />
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
              From isolated scores to the stories underneath
            </h2>
            <div style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.75', color: 'rgba(0,0,0,0.7)', maxWidth: '600px' }}>
              <p style={{ margin: '0 0 20px' }}>
                Organisations we work with are often already collecting data from their people.
              </p>
              <p style={{ margin: '0 0 20px' }}>
                What these numbers rarely tell you is how they connect - or the picture they add up to. A score gives you a snapshot. It rarely tells you the whole story: the shape of how your organisation is doing, and where to put your attention.
              </p>
              <p style={{ margin: 0 }}>
                That&apos;s where States of Vitality begins.
              </p>
            </div>
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
                src="/images/dashboard/sov-real/sov-eight-areas.webp"
                width={1400}
                height={875}
                alt="Scores across all eight areas - each dimension grouped by frequency language from Rarely true through to Almost always true"
              />
            </div>
          </div>

          <p className="scroll-in" style={{
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '300',
            lineHeight: '1.7',
            color: 'rgba(0,0,0,0.55)',
            maxWidth: '720px',
            margin: '0 auto',
          }}>
            Every question uses the same simple scale: how true is this statement in your experience? Responses run from <strong style={{ color: 'rgba(0,0,0,0.75)', fontWeight: 500 }}>Rarely true (1)</strong> to <strong style={{ color: 'rgba(0,0,0,0.75)', fontWeight: 500 }}>Almost always true (5)</strong>.
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
                body: 'Organisations are ecosystems where everything connects - a strain in one area often shows up in another. The assessment reads all eight dimensions together, so you see the whole picture rather than eight disconnected scores.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M16 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                ),
                title: 'Know where to focus',
                body: 'Data alone doesn\'t drive change - clarity does. The assessment surfaces your strengths and the areas that need attention - so you can see clearly where to put your focus.',
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
              Reveal what leadership can&apos;t see
            </h2>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 16px',
            }}>
              The same dimension. Different experiences depending on where you sit.
            </p>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 28px',
            }}>
              When we measure across role levels, departments, locations and length of service, patterns emerge that aggregate scores hide. Leadership might see confidence in a given area. The front line might experience uncertainty. The gap between them tells you something important.
            </p>
            <div style={{
              borderLeft: '3px solid var(--accent)',
              paddingLeft: '20px',
              margin: '0 0 32px',
            }}>
              <p style={{
                fontSize: '17px',
                fontWeight: '400',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 6px',
              }}>
                <strong style={{ color: '#fff', fontWeight: 600 }}>82%</strong> of executives rate their culture good or excellent, against <strong style={{ color: '#fff', fontWeight: 600 }}>47%</strong> of individual contributors.
              </p>
              <p style={{
                fontSize: '13px',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}>
                SHRM, <em>The State of Global Workplace Culture in 2024</em>
              </p>
            </div>
            <SovExploreCta align="left" />
          </div>

          {/* Dashboard screenshot - perspective float-in */}
          <div className="scroll-screenshot delay-2">
            <ScreenshotDark
              src="/images/dashboard/sov-real/sov-by-level.webp"
              width={1400}
              height={875}
              alt="By Role Level view comparing how senior, middle and front-line groups experience each dimension side by side"
            />
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
              Approximately 4-5 weeks
            </p>
            <p style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
              From launch to results in your dashboard
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
          <div className="scroll-in" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 16px' }}>
              What you receive
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 300, lineHeight: 1.7, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
              Every assessment includes a configured survey, an interactive dashboard for your team, freeform response capture and demographic analysis. Consultancy support is available as an optional add-on.
            </p>
          </div>

          {/* Included deliverables */}
          <h3 className="scroll-in" style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.5)',
            margin: '0 0 20px',
            textAlign: 'center',
          }}>
            What every assessment includes
          </h3>
          <div className="sov-deliverables" style={{ marginBottom: '56px' }}>
            {INCLUDED_DELIVERABLES.map((del, i) => (
              <div key={i} className="scroll-in" style={{
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '28px 24px',
                transitionDelay: `${i * 100}ms`,
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 10px', color: 'var(--dark)' }}>
                  {del.title}
                </h4>
                <p style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.7', color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                  {del.description}
                </p>
              </div>
            ))}
          </div>

          {/* Real dashboard screenshots: dimension detail + question detail */}
          <div className="scroll-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
            alignItems: 'start',
          }}>
            <ScreenshotLight
              src="/images/dashboard/sov-real/sov-dimension-detail.webp"
              width={1400}
              height={837}
              alt="A single dimension page showing the dimension score, response distribution and the questions inside it"
            />
            <ScreenshotLight
              src="/images/dashboard/sov-real/sov-question-detail.webp"
              width={1400}
              height={875}
              alt="Drill down into a single question - see how different demographic groups responded"
              style={{ boxShadow: '0 12px 50px rgba(0,0,0,0.10)' }}
            />
          </div>

          <div className="scroll-in" style={{
            textAlign: 'center',
            margin: '0 0 48px',
          }}>
            <p style={{ fontSize: '15px', fontWeight: 300, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
              See the full product at{' '}
              <a
                href={PRODUCT_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sov-product-link"
              >
                statesofvitality.com →
              </a>
            </p>
          </div>

          {/* Optional consultancy add-ons */}
          <h3 className="scroll-in" style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.5)',
            margin: '0 0 20px',
            textAlign: 'center',
          }}>
            Optional consultancy add-ons
          </h3>
          <div className="sov-deliverables">
            {OPTIONAL_DELIVERABLES.map((del, i) => (
              <div key={i} className="scroll-in" style={{
                background: 'transparent',
                border: '1px dashed rgba(0,0,0,0.18)',
                padding: '28px 24px',
                transitionDelay: `${i * 100}ms`,
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 10px', color: 'var(--dark)' }}>
                  {del.title}
                </h4>
                <p style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.7', color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                  {del.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 10: READY TO TALK (dark)
          ========================================== */}
      <section className="section--full dark-bg sov-section" style={{
        background: 'radial-gradient(ellipse at 50% 120%, rgba(60,30,70,0.9) 0%, #221C2B 70%)',
        textAlign: 'center',
      }}>
        <div className="scroll-in" style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <ProductBadge variant="dark" />
          </div>
          <span className="kicker" style={{ marginBottom: '20px' }}>Let&apos;s talk</span>
          <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 1.5rem' }}>
            Ready to see your organisation clearly?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: '300',
            margin: '0 0 2.5rem',
          }}>
            The full product - the one-minute film, the interactive dashboard, and an indicative quote - lives at statesofvitality.com.
          </p>
          <SovExploreCta align="center" />
          <p style={{ margin: '24px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
            More on the product at{' '}
            <a
              href={PRODUCT_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sov-product-link sov-product-link--dark"
              style={{ fontSize: '14px' }}
            >
              statesofvitality.com →
            </a>
          </p>
        </div>
      </section>

    </main>
  )
}
