'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import NavPanel from './NavPanel'
import SearchPanel from './SearchPanel'
import { trackCtaClick } from '@/lib/analytics'

// Inline service glyph — a light, static mark at rest that animates in place on hover.
// Each is a massively-simplified echo of that service's hero animation. Only the hovered
// glyph mounts its animation, so the resting menu stays calm and performant.
// Palette: purple #9B51E0, deep #80388F, pink #FF4279, amber #FFA200.
function ServiceGlyph({ href, active }) {
  const P = '#9B51E0', D = '#80388F', K = '#FF4279', A = '#FFA200'
  const inf = 'indefinite'
  const wrap = (rest, children) => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true"
      style={{ flexShrink: 0, opacity: active ? 1 : rest, transition: 'opacity 0.25s var(--ease)' }}>
      {children}
    </svg>
  )
  switch (href) {
    // — Purpose & Direction —
    case '/services/culture-change-consultancy': // orbiting culture elements around a core
      return wrap(0.6, <>
        <circle cx="20" cy="20" r="5.5" fill={P} />
        <g>{active && <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="7s" repeatCount={inf} />}
          <circle cx="33" cy="20" r="2.4" fill={K} />
          <circle cx="20" cy="7" r="2" fill={A} />
          <circle cx="7" cy="20" r="2" fill={D} />
        </g>
      </>)
    case '/services/organisational-purpose-consultancy': // radiant core + rays (heartbeat)
      return wrap(0.55, <>
        <g stroke={P} strokeWidth="1.2" opacity="0.6">
          <line x1="20" y1="20" x2="20" y2="4" /><line x1="20" y1="20" x2="20" y2="36" />
          <line x1="20" y1="20" x2="4" y2="20" /><line x1="20" y1="20" x2="36" y2="20" />
          <line x1="20" y1="20" x2="31" y2="9" /><line x1="20" y1="20" x2="9" y2="31" />
          <line x1="20" y1="20" x2="31" y2="31" /><line x1="20" y1="20" x2="9" y2="9" />
        </g>
        <circle cx="20" cy="20" r="5" fill={D}>{active && <animate attributeName="r" values="5;7.5;5" dur="1.5s" repeatCount={inf} />}</circle>
      </>)
    case '/services/strategic-alignment-consultancy': // scattered shapes that align
      return wrap(0.55, <>
        {[{ x: 11, y: 12, r: 42, c: K }, { x: 28, y: 11, r: -28, c: A }, { x: 13, y: 29, r: 18, c: P }, { x: 29, y: 28, r: -52, c: D }].map((t, idx) => (
          <g key={idx} transform={`translate(${t.x} ${t.y})`}>
            <polygon points="-3.6,-2.6 4,0 -3.6,2.6" fill={t.c} transform={`rotate(${t.r})`}>
              {active && <animateTransform attributeName="transform" type="rotate" values={`${t.r} 0 0;0 0 0;${t.r} 0 0`} dur="2.6s" repeatCount={inf} />}
            </polygon>
          </g>
        ))}
      </>)
    // — Structure & Operations —
    case '/services/post-merger-integration-consultancy': // two clusters draw together
      return wrap(0.55, <>
        <g>{active && <animateTransform attributeName="transform" type="translate" values="0 0;5 0;0 0" dur="2.6s" repeatCount={inf} />}<circle cx="9" cy="20" r="5" fill={D} /></g>
        <g>{active && <animateTransform attributeName="transform" type="translate" values="0 0;-5 0;0 0" dur="2.6s" repeatCount={inf} />}<circle cx="31" cy="20" r="5" fill={A} /></g>
        <circle cx="20" cy="20" r="3" fill={K}>{active && <animate attributeName="opacity" values="0.35;1;0.35" dur="2.6s" repeatCount={inf} />}</circle>
      </>)
    case '/services/organisational-restructuring-consultancy': // nodes reshuffle
      return wrap(0.55, <>
        <circle cx="20" cy="11" r="2.7" fill={D}>{active && <animate attributeName="cx" values="20;10;20" dur="2.6s" repeatCount={inf} />}</circle>
        <circle cx="20" cy="20" r="2.7" fill={P} />
        <circle cx="20" cy="29" r="2.7" fill={K}>{active && <animate attributeName="cx" values="20;30;20" dur="2.6s" begin="0.3s" repeatCount={inf} />}</circle>
      </>)
    case '/services/operational-effectiveness-consultancy': // parallel streams flowing
      return wrap(0.5, <>
        <g stroke={P} strokeWidth="1.4" opacity="0.45"><line x1="5" y1="13" x2="35" y2="13" /><line x1="5" y1="20" x2="35" y2="20" /><line x1="5" y1="27" x2="35" y2="27" /></g>
        <circle cx="8" cy="13" r="1.9" fill={A}>{active && <animate attributeName="cx" values="5;35;5" dur="2.2s" repeatCount={inf} />}</circle>
        <circle cx="8" cy="20" r="1.9" fill={K}>{active && <animate attributeName="cx" values="5;35;5" dur="2.6s" begin="0.5s" repeatCount={inf} />}</circle>
        <circle cx="8" cy="27" r="1.9" fill={P}>{active && <animate attributeName="cx" values="5;35;5" dur="3s" begin="1s" repeatCount={inf} />}</circle>
      </>)
    case '/services/organisational-design-consultancy': // breathing room grid
      return wrap(0.5, <>
        <g stroke={P} strokeWidth="1" opacity="0.3"><line x1="20" y1="8" x2="20" y2="32" /><line x1="8" y1="20" x2="32" y2="20" /></g>
        <rect x="9" y="9" width="8" height="8" rx="1.6" fill={D}>{active && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount={inf} />}</rect>
        <rect x="23" y="9" width="8" height="8" rx="1.6" fill={P}>{active && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" begin="0.45s" repeatCount={inf} />}</rect>
        <rect x="9" y="23" width="8" height="8" rx="1.6" fill={A}>{active && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" begin="0.9s" repeatCount={inf} />}</rect>
        <rect x="23" y="23" width="8" height="8" rx="1.6" fill={K}>{active && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" begin="1.35s" repeatCount={inf} />}</rect>
      </>)
    // — Change & Development —
    case '/services/change-management-consultancy': // movement along a path
      return wrap(0.55, <>
        <line x1="6" y1="20" x2="34" y2="20" stroke={P} strokeWidth="1" opacity="0.3" />
        <g>{active && <animateTransform attributeName="transform" type="translate" values="-7 0;7 0;-7 0" dur="3s" repeatCount={inf} />}
          <circle cx="14" cy="20" r="2.6" fill={K} /><circle cx="22" cy="20" r="2.1" fill={A} /><circle cx="29" cy="20" r="1.7" fill={P} />
        </g>
      </>)
    case '/services/employee-experience-consultancy': // a journey ribbon with moments
      return wrap(0.55, <>
        <path d="M4,20 Q12,11 20,20 T36,20" stroke={P} strokeWidth="1.6" />
        <circle cx="12" cy="15.5" r="2" fill={K}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.6s" repeatCount={inf} />}</circle>
        <circle cx="28" cy="15.5" r="2" fill={A}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.6s" begin="0.5s" repeatCount={inf} />}</circle>
        <circle cx="20" cy="20" r="1.7" fill={D} opacity="0.6" />
      </>)
    case '/services/organisational-capacity-building': // blooming growth
      return wrap(0.55, <>
        <g>{active && <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="9s" repeatCount={inf} />}
          <ellipse cx="20" cy="9" rx="2.4" ry="4.6" fill={K} /><ellipse cx="31" cy="20" rx="4.6" ry="2.4" fill={A} />
          <ellipse cx="20" cy="31" rx="2.4" ry="4.6" fill={P} /><ellipse cx="9" cy="20" rx="4.6" ry="2.4" fill={D} />
        </g>
        <circle cx="20" cy="20" r="3.6" fill={D} />
      </>)
    case '/services/organisational-development-consultancy': // growth rings + orbit
      return wrap(0.5, <>
        <circle cx="20" cy="20" r="13" stroke={D} strokeWidth="1" opacity="0.4" />
        <circle cx="20" cy="20" r="9" stroke={P} strokeWidth="1" opacity="0.5" />
        <circle cx="20" cy="20" r="5" stroke={P} strokeWidth="1" opacity="0.6" />
        <circle cx="20" cy="20" r="1.7" fill={P} />
        <g>{active && <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="6s" repeatCount={inf} />}
          <circle cx="20" cy="7" r="1.9" fill={A} /><circle cx="33" cy="20" r="1.5" fill={K} />
        </g>
      </>)
    // — Service & Experience —
    case '/services/customer-experience-consultancy': // touchpoints around concentric zones
      return wrap(0.5, <>
        <circle cx="20" cy="20" r="14" stroke={P} strokeWidth="1" opacity="0.35" />
        <circle cx="20" cy="20" r="8" stroke={P} strokeWidth="1" opacity="0.5" />
        <circle cx="20" cy="20" r="3" fill={P} />
        <circle cx="20" cy="6" r="2" fill={K}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.7s" repeatCount={inf} />}</circle>
        <circle cx="34" cy="20" r="2" fill={A}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.7s" begin="0.42s" repeatCount={inf} />}</circle>
        <circle cx="20" cy="34" r="2" fill={P}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.7s" begin="0.84s" repeatCount={inf} />}</circle>
        <circle cx="6" cy="20" r="2" fill={D}>{active && <animate attributeName="r" values="2;3.2;2" dur="1.7s" begin="1.26s" repeatCount={inf} />}</circle>
      </>)
    case '/services/service-design-consultancy': // needs (circle) meet capability (polygon)
      return wrap(0.55, <>
        <g>{active && <animateTransform attributeName="transform" type="translate" values="0 0;3.5 0;0 0" dur="2.6s" repeatCount={inf} />}<circle cx="9" cy="20" r="5" fill={K} /></g>
        <g>{active && <animateTransform attributeName="transform" type="translate" values="0 0;-3.5 0;0 0" dur="2.6s" repeatCount={inf} />}<polygon points="31,14.5 36.5,20 31,25.5 25.5,20" fill={A} /></g>
        <g stroke={P} strokeWidth="1.5" strokeLinecap="round">{active && <animate attributeName="opacity" values="0.3;1;0.3" dur="1.3s" repeatCount={inf} />}
          <line x1="20" y1="16" x2="20" y2="24" /><line x1="16" y1="20" x2="24" y2="20" />
        </g>
      </>)
    case '/services/scaling-operations-consultancy': // cluster expanding within a boundary
      return wrap(0.5, <>
        <circle cx="20" cy="20" r="14" stroke={P} strokeWidth="1" opacity="0.4">{active && <animate attributeName="r" values="14;15.5;14" dur="2s" repeatCount={inf} />}</circle>
        <g transform="translate(20 20)">
          <g>{active && <animateTransform attributeName="transform" type="scale" values="1;1.7;1" dur="2s" repeatCount={inf} />}
            <circle cx="-4" cy="-4" r="1.7" fill={D} /><circle cx="4" cy="-4" r="1.7" fill={P} />
            <circle cx="-4" cy="4" r="1.7" fill={P} /><circle cx="4" cy="4" r="1.7" fill={A} />
            <circle cx="0" cy="0" r="1.7" fill={K} />
          </g>
        </g>
      </>)
    default:
      return wrap(0.4, <>
        <circle cx="20" cy="20" r="11" stroke={P} strokeWidth="1.6">{active && <animate attributeName="r" values="11;13;11" dur="1.8s" repeatCount={inf} />}</circle>
        <circle cx="20" cy="20" r="3" fill={P} />
      </>)
  }
}

export default function Nav() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const [openPanel, setOpenPanel] = useState(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState(null)
  const [hoveredService, setHoveredService] = useState(null)
  const scrollPosRef = useRef(0)
  const navRef = useRef(null)
  const prevPanelRef = useRef(null)

  // Track panel switches
  useEffect(() => {
    if (openPanel && prevPanelRef.current && prevPanelRef.current !== openPanel) {
      setIsSwitching(true)
      // Reset switching flag after the new panel has mounted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSwitching(false)
        })
      })
    }
    prevPanelRef.current = openPanel
  }, [openPanel])

  const closePanel = () => {
    setOpenPanel(null)
    setHoveredService(null)
  }

  // Scroll listener for transparent nav on homepage
  useEffect(() => {
    if (!isHomepage) {
      setIsScrolled(false)
      return
    }

    const handleScroll = () => {
      // Transition to solid after scrolling past ~90vh (leaving some buffer before hero ends)
      const threshold = window.innerHeight * 0.85
      setIsScrolled(window.scrollY > threshold)
    }

    handleScroll() // Check initial position
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomepage])

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Body scroll lock for mobile overlay
  useEffect(() => {
    if (mobileOpen) {
      scrollPosRef.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPosRef.current}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollPosRef.current)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setMobileAccordion(null)
  }, [pathname])

  const toggleMobile = () => {
    setMobileOpen(prev => !prev)
    if (mobileOpen) setMobileAccordion(null)
  }

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileAccordion(null)
  }

  const toggleAccordion = (key) => {
    setMobileAccordion(prev => prev === key ? null : key)
  }

  const handleClick = (panel) => {
    // Toggle on both touch and desktop: click opens or closes
    setOpenPanel(openPanel === panel ? null : panel)
    setHoveredService(null)
  }

  // Transparent when on homepage, not scrolled, no panel open, and mobile menu closed
  const isTransparent = isHomepage && !isScrolled && !openPanel && !mobileOpen

  return (
    <>
      <nav
        ref={navRef}
        className={`nav-bar${isTransparent ? ' nav-bar--transparent' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: isTransparent ? 'transparent' : 'var(--white)',
          borderBottom: isTransparent ? '1px solid transparent' : '1px solid rgba(0,0,0,0.06)',
          height: '70px',
          transition: 'background-color 0.4s var(--ease), border-color 0.4s var(--ease)',
          willChange: 'transform',
        }}
      >
        <div className="nav-bar__inner" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}>

          {/* Logo */}
          <Link href="/" onClick={closePanel} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image
              src={isTransparent ? '/logo-white.svg' : '/logo-black.svg'}
              alt="Mutomorro"
              width={150}
              height={30}
              style={{ height: 'auto', width: '150px' }}
              priority
            />
          </Link>

          {/* Nav links - left group (hidden on mobile) */}
          <div className="nav-bar__links" style={{
            alignItems: 'center',
            gap: '4px',
            marginLeft: '3rem',
          }}>
            {['About', 'For organisations', 'For your people', 'Explore'].map((item) => {
              const key = item.toLowerCase().replace(/ /g, '-')
              const isActive = openPanel === key
              return (
                <button
                  key={key}
                  onClick={() => handleClick(key)}
                  className={`nav-link${isActive ? ' nav-link--active' : ''}${isTransparent ? ' nav-link--transparent' : ''}`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          {/* CTAs - right group (hidden on mobile) */}
          <div className="nav-bar__ctas" style={{
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto',
          }}>
            <button
              onClick={() => handleClick('search')}
              aria-label="Search the site"
              className={`nav-search-btn${openPanel === 'search' ? ' nav-search-btn--active' : ''}${isTransparent ? ' nav-search-btn--transparent' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="9" cy="9" r="6" />
                <line x1="13.5" y1="13.5" x2="17" y2="17" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/states-of-vitality"
              onClick={closePanel}
              className="sov-nav-btn"
            >
              <span style={{ position: 'relative', zIndex: 1 }}>States of Vitality</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => { trackCtaClick({ location: 'nav', label: 'Talk to us', destination: '/contact' }); closePanel() }}
              className={isTransparent ? 'btn-primary btn-primary--dark' : 'btn-primary'}
              style={{ fontSize: '14px', padding: '10px 24px' }}
            >
              Talk to us
            </Link>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className={`mobile-nav__hamburger${mobileOpen ? ' mobile-nav__hamburger--open' : ''}`}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
          </button>

        </div>
      </nav>

      {/* Spacer to offset fixed nav on non-homepage pages */}
      {!isHomepage && <div style={{ height: '70px' }} />}

      {/* Search Panel */}
      <SearchPanel
        isOpen={openPanel === 'search'}
        instantClose={isSwitching}
        onClose={closePanel}
      />

      {/* About Panel */}
      <NavPanel
        isOpen={openPanel === 'about'}
        instantClose={isSwitching}
        onClose={closePanel}
      >
        <div>
          {[
            { label: 'About us', desc: 'Who we are and why we exist', href: '/about' },
            { label: 'Philosophy', desc: 'Intentional Ecosystems - how we think about organisations', href: '/philosophy' },
            { label: 'The EMERGENT Framework', desc: 'Eight dimensions of organisational health', href: '/emergent-framework' },
            { label: 'How we work', desc: 'Our four-stage approach to working together', href: '/how-we-work' },
            { label: 'Projects and experience', desc: 'What working with us leads to', href: '/projects' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closePanel}
              className="nav-contents-row nav-panel-stagger"
              style={i === 0 ? { borderTop: '1px solid rgba(0,0,0,0.06)' } : undefined}
            >
              <span className="nav-contents-row__title">{item.label}</span>
              <span className="nav-contents-row__desc">{item.desc}</span>
              <span className="nav-contents-row__arrow">›</span>
            </Link>
          ))}
        </div>
      </NavPanel>

      {/* For organisations Panel */}
      <NavPanel
        isOpen={openPanel === 'for-organisations'}
        instantClose={isSwitching}
        onClose={closePanel}
      >
        <div
          onMouseLeave={() => setHoveredService(null)}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 2rem' }}
        >
          {[
            {
              title: 'Purpose & Direction',
              links: ['Culture Change', 'Organisational Purpose', 'Strategic Alignment'],
              hrefs: [
                '/services/culture-change-consultancy',
                '/services/organisational-purpose-consultancy',
                '/services/strategic-alignment-consultancy',
              ],
            },
            {
              title: 'Structure & Operations',
              links: ['Post-Merger Integration', 'Organisational Restructuring', 'Operational Effectiveness', 'Organisational Design'],
              hrefs: [
                '/services/post-merger-integration-consultancy',
                '/services/organisational-restructuring-consultancy',
                '/services/operational-effectiveness-consultancy',
                '/services/organisational-design-consultancy',
              ],
            },
            {
              title: 'Change & Development',
              links: ['Change Management', 'Employee Experience', 'Capacity Building', 'Organisational Development'],
              hrefs: [
                '/services/change-management-consultancy',
                '/services/employee-experience-consultancy',
                '/services/organisational-capacity-building',
                '/services/organisational-development-consultancy',
              ],
            },
            {
              title: 'Service & Experience',
              links: ['Customer Experience', 'Service Design', 'Scaling Operations'],
              hrefs: [
                '/services/customer-experience-consultancy',
                '/services/service-design-consultancy',
                '/services/scaling-operations-consultancy',
              ],
            },
          ].map((col) => (
            <div key={col.title} className="nav-panel-stagger nav-menu-col">
              <span className="kicker" style={{ marginBottom: '20px' }}>{col.title}</span>
              {col.links.map((link, i) => (
                <Link
                  key={link}
                  href={col.hrefs[i]}
                  onClick={closePanel}
                  onMouseEnter={() => setHoveredService(col.hrefs[i])}
                  className="nav-menu-link"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <ServiceGlyph href={col.hrefs[i]} active={hoveredService === col.hrefs[i]} />
                    <span className="nav-menu-link__label">{link}</span>
                  </span>
                  <span className="nav-menu-link__chevron">›</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </NavPanel>

      {/* For your people Panel */}
      <NavPanel
        isOpen={openPanel === 'for-your-people'}
        instantClose={isSwitching}
        onClose={closePanel}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '0 4rem' }}>

          {/* LEFT - Training */}
          <div className="nav-panel-stagger nav-menu-col">
            <span className="kicker" style={{ marginBottom: '20px' }}>Training</span>

            {/* Door card - purple text box (left) + image (right) for legibility */}
            <Link
              href="/training"
              onClick={closePanel}
              style={{
                display: 'flex',
                minHeight: '170px',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '24px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(34,28,43,0.14)',
              }}
              className="nav-training-door"
            >
              {/* Purple text box - left */}
              <div style={{
                flex: '1.3',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <span className="nav-menu-link__label" style={{ fontSize: '20px', color: 'var(--white)' }}>
                  Browse all training
                  <span className="nav-menu-link__chevron" style={{ marginLeft: '8px', color: 'var(--white)' }}>›</span>
                </span>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.85)',
                  margin: '8px 0 0',
                }}>
                  Practical learning for the people doing the work
                </p>
              </div>
              {/* Image - right */}
              <div
                aria-hidden="true"
                style={{
                  flex: '1',
                  backgroundColor: 'var(--dark)',
                  backgroundImage: 'url("https://cdn.sanity.io/images/c6pg4t4h/production/b36b0ebf993e00a6c5e97d8d828e62f8067e321b-1536x1024.png?w=700&q=80&auto=format")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Link>

            {/* Popular areas + Popular courses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2.5rem' }}>

              {/* Popular areas */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Popular areas</span>
                {[
                  { label: 'Change Management', href: '/training/change-management' },
                  { label: 'Systems Thinking', href: '/training/systems-thinking' },
                  { label: 'Team Effectiveness', href: '/training/team-effectiveness' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closePanel} className="nav-menu-link">
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

              {/* Popular courses */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Popular courses</span>
                {[
                  { label: 'Theory of Change', href: '/training/theory-of-change-workshop' },
                  { label: 'Process Mapping', href: '/training/process-mapping-workshop' },
                  { label: 'Scenario Planning', href: '/training/scenario-planning-workshop' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closePanel} className="nav-menu-link">
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

            </div>

            <Link
              href="/training"
              onClick={closePanel}
              style={{
                display: 'inline-block',
                marginTop: '16px',
                fontSize: '14px',
                color: '#9B51E0',
                textDecoration: 'none',
              }}
            >
              See all training areas ›
            </Link>
          </div>

          {/* RIGHT - Develop your people */}
          <div className="nav-panel-stagger" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '4rem' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>Develop your people</span>

            {/* Deeper Ground - flagship card with a simple visual (placeholder for now) */}
            <Link
              href="/develop/deeper-ground"
              onClick={closePanel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                minHeight: '170px',
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 16px rgba(34,28,43,0.06)',
                padding: '20px 22px',
                borderRadius: '4px',
                marginBottom: '24px',
                textDecoration: 'none',
                overflow: 'hidden',
              }}
              className="nav-training-door"
            >
              <div style={{ flex: 1 }}>
                <span className="nav-menu-link__label" style={{ fontSize: '20px' }}>
                  Deeper Ground
                  <span className="nav-menu-link__chevron" style={{ marginLeft: '8px' }}>›</span>
                </span>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: 'rgba(34,28,43,0.6)',
                  margin: '10px 0 0',
                }}>
                  Our leadership programme for senior leaders navigating complexity.
                </p>
              </div>
              {/* Simple depth/systems visual - placeholder evoking the Deeper Ground theme */}
              <svg width="116" height="116" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="60" cy="60" r="54" stroke="#9B51E0" strokeWidth="1.2" opacity="0.14" />
                <circle cx="60" cy="60" r="42" stroke="#9B51E0" strokeWidth="1.2" opacity="0.22" />
                <circle cx="60" cy="60" r="30" stroke="#9B51E0" strokeWidth="1.2" opacity="0.35" />
                <circle cx="60" cy="60" r="18" stroke="#9B51E0" strokeWidth="1.4" opacity="0.55" />
                <circle cx="60" cy="60" r="6" fill="#9B51E0" opacity="0.85" />
              </svg>
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2.5rem' }}>

              {/* Support for Leaders */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Support for Leaders</span>
                {[
                  { label: 'Executive Coaching', href: '/develop/executive-coaching' },
                  { label: 'Leadership Facilitation', href: '/develop/leadership-facilitation' },
                  { label: 'Strategic Thinking Partner', href: '/develop/strategic-thinking-partner' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closePanel} className="nav-menu-link">
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

              {/* Support for Teams */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Support for Teams</span>
                {[
                  { label: 'Team Sessions', href: '/develop/team-sessions' },
                  { label: 'Manager Coaching', href: '/develop/manager-coaching' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closePanel} className="nav-menu-link">
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

            </div>
          </div>

        </div>
      </NavPanel>

      {/* Explore Panel */}
      <NavPanel
        isOpen={openPanel === 'explore'}
        instantClose={isSwitching}
        onClose={closePanel}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0 4rem' }}>

          {/* LEFT - Read & learn (leads with the two image tiles) */}
          <div className="nav-panel-stagger">
            <span className="kicker" style={{ marginBottom: '18px' }}>Read &amp; learn</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem', marginBottom: '24px' }}>
              {[
                { title: 'Tools & Toolkits', desc: 'The tool codex - walkthroughs & downloadable templates', href: '/tools', img: 'https://cdn.sanity.io/images/c6pg4t4h/production/ca8dd321a4c138e915bb64faa7dfede3d497f241-2800x1980.png?w=600&q=80&auto=format' },
                { title: 'Thinking', desc: 'Articles, perspectives & ideas', href: '/articles', img: 'https://cdn.sanity.io/images/c6pg4t4h/production/a7de82f1809af5c51882d812594e627184011b7f-1672x941.png?w=600&q=80&auto=format' },
              ].map((tile) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  onClick={closePanel}
                  style={{
                    display: 'block',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: 'var(--white)',
                  }}
                >
                  <div style={{ height: '180px', backgroundColor: 'var(--warm)', backgroundImage: `url("${tile.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: '14px 16px 16px' }}>
                    <span className="nav-menu-link__label" style={{ fontSize: '16px' }}>
                      {tile.title}
                      <span className="nav-menu-link__chevron" style={{ marginLeft: '6px' }}>›</span>
                    </span>
                    <p style={{ fontSize: '12.5px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(34,28,43,0.6)', margin: '6px 0 0' }}>{tile.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            <span className="kicker" style={{ marginBottom: '14px' }}>Featured</span>
            <Link
              href="/resources/thinking-in-ecosystems"
              onClick={closePanel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '4px',
                padding: '14px',
                textDecoration: 'none',
              }}
            >
              <img
                src="https://cdn.sanity.io/images/c6pg4t4h/production/a1183aad79022f1aa0200d6be7b3f0897223f157-2480x3508.png?w=160&auto=format&q=82&fit=max"
                alt=""
                style={{ width: '68px', height: 'auto', borderRadius: '2px', flexShrink: 0, boxShadow: '0 2px 8px rgba(34,28,43,0.18)' }}
              />
              <div>
                <span className="nav-menu-link__label" style={{ fontSize: '16px' }}>Thinking in Ecosystems</span>
                <p style={{ fontSize: '12.5px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(34,28,43,0.6)', margin: '4px 0 0' }}>Six ways of seeing your organisation - download the primer ›</p>
              </div>
            </Link>
          </div>

          {/* RIGHT - States of Vitality (flagship) + wider ecosystem */}
          <div className="nav-panel-stagger" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '4rem' }}>

            {/* States of Vitality - flagship */}
            <Link
              href="/states-of-vitality"
              onClick={closePanel}
              className="nav-training-door"
              style={{
                display: 'block',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '24px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(34,28,43,0.16)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: '124px',
                  backgroundColor: 'var(--warm)',
                  backgroundImage: 'url("/images/nav/sov-hero.webp")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ background: 'var(--dark)', padding: '16px 18px' }}>
                <span className="kicker" style={{ color: '#C9A8F0', marginBottom: '8px' }}>Organisational Health diagnostic</span>
                <span style={{ display: 'block', fontSize: '19px', fontWeight: 500, color: 'var(--white)' }}>
                  States of Vitality
                  <span style={{ marginLeft: '6px' }}>›</span>
                </span>
                <p style={{ fontSize: '12.5px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(255,255,255,0.78)', margin: '6px 0 0' }}>
                  See your whole organisation clearly across eight dimensions.
                </p>
              </div>
            </Link>

            <span className="kicker" style={{ marginBottom: '18px' }}>Our wider ecosystem</span>
            {[
              { name: 'Moresapien', desc: 'A field guide to the mind - biases, fallacies & mental models', href: 'https://moresapien.org', accent: '#7C5CFF' },
              { name: 'Fieldmarks', desc: 'Systems thinking - how things connect & where the leverage is', href: 'https://fieldmarks.org', accent: '#1F9E8F' },
              { name: 'Theory of Change Toolkit', desc: 'Build a robust theory of change, step by step', href: 'https://toctoolkit.org', accent: '#E08A3C' },
            ].map((site) => (
              <a
                key={site.href}
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closePanel}
                style={{
                  display: 'block',
                  background: 'var(--white)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderLeft: `3px solid ${site.accent}`,
                  borderRadius: '4px',
                  padding: '13px 16px',
                  marginBottom: '12px',
                  textDecoration: 'none',
                }}
              >
                <span className="nav-menu-link__label" style={{ fontSize: '15px' }}>
                  {site.name}
                  <span style={{ marginLeft: '6px', fontSize: '12px', color: 'rgba(34,28,43,0.4)' }}>↗</span>
                </span>
                <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(34,28,43,0.6)', marginTop: '4px' }}>{site.desc}</span>
              </a>
            ))}
            <p style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(34,28,43,0.45)', margin: '14px 0 0' }}>More coming soon</p>
          </div>

        </div>
      </NavPanel>

      {/* Mobile overlay */}
      <div className={`mobile-nav__overlay${mobileOpen ? ' mobile-nav__overlay--open' : ''}`}>
        <div className="mobile-nav__content">
          {/* About accordion */}
          <div>
            <button className="mobile-nav__accordion-trigger" onClick={() => toggleAccordion('about')}>
              <span className="mobile-nav__accordion-label">About</span>
              <svg className={`mobile-nav__accordion-chevron${mobileAccordion === 'about' ? ' mobile-nav__accordion-chevron--open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div className={`mobile-nav__accordion-panel${mobileAccordion === 'about' ? ' mobile-nav__accordion-panel--open' : ''}`}>
              <div className="mobile-nav__accordion-inner">
                {[
                  { label: 'About us', desc: 'Who we are and why we exist', href: '/about' },
                  { label: 'Philosophy', desc: 'Intentional Ecosystems - how we think about organisations', href: '/philosophy' },
                  { label: 'The EMERGENT Framework', desc: 'Eight dimensions of organisational health', href: '/emergent-framework' },
                  { label: 'How we work', desc: 'Our four-stage approach to working together', href: '/how-we-work' },
                  { label: 'Projects and experience', desc: 'What working with us leads to', href: '/projects' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__about-item">
                    <span className="mobile-nav__about-title">{item.label}</span>
                    <span className="mobile-nav__about-desc">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* For organisations accordion */}
          <div>
            <button className="mobile-nav__accordion-trigger" onClick={() => toggleAccordion('for-organisations')}>
              <span className="mobile-nav__accordion-label">For organisations</span>
              <svg className={`mobile-nav__accordion-chevron${mobileAccordion === 'for-organisations' ? ' mobile-nav__accordion-chevron--open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div className={`mobile-nav__accordion-panel${mobileAccordion === 'for-organisations' ? ' mobile-nav__accordion-panel--open' : ''}`}>
              <div className="mobile-nav__accordion-inner">
                {[
                  {
                    title: 'Purpose & Direction',
                    links: [
                      { label: 'Culture Change', href: '/services/culture-change-consultancy' },
                      { label: 'Organisational Purpose', href: '/services/organisational-purpose-consultancy' },
                      { label: 'Strategic Alignment', href: '/services/strategic-alignment-consultancy' },
                    ],
                  },
                  {
                    title: 'Structure & Operations',
                    links: [
                      { label: 'Post-Merger Integration', href: '/services/post-merger-integration-consultancy' },
                      { label: 'Organisational Restructuring', href: '/services/organisational-restructuring-consultancy' },
                      { label: 'Operational Effectiveness', href: '/services/operational-effectiveness-consultancy' },
                      { label: 'Organisational Design', href: '/services/organisational-design-consultancy' },
                    ],
                  },
                  {
                    title: 'Change & Development',
                    links: [
                      { label: 'Change Management', href: '/services/change-management-consultancy' },
                      { label: 'Employee Experience', href: '/services/employee-experience-consultancy' },
                      { label: 'Capacity Building', href: '/services/organisational-capacity-building' },
                      { label: 'Organisational Development', href: '/services/organisational-development-consultancy' },
                    ],
                  },
                  {
                    title: 'Service & Experience',
                    links: [
                      { label: 'Customer Experience', href: '/services/customer-experience-consultancy' },
                      { label: 'Service Design', href: '/services/service-design-consultancy' },
                      { label: 'Scaling Operations', href: '/services/scaling-operations-consultancy' },
                    ],
                  },
                ].map((cat) => (
                  <div key={cat.title} className="mobile-nav__service-category">
                    <span className="kicker" style={{ marginBottom: '8px' }}>{cat.title}</span>
                    {cat.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={closeMobile} className="mobile-nav__service-link">{link.label}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* For your people accordion */}
          <div>
            <button className="mobile-nav__accordion-trigger" onClick={() => toggleAccordion('for-your-people')}>
              <span className="mobile-nav__accordion-label">For your people</span>
              <svg className={`mobile-nav__accordion-chevron${mobileAccordion === 'for-your-people' ? ' mobile-nav__accordion-chevron--open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div className={`mobile-nav__accordion-panel${mobileAccordion === 'for-your-people' ? ' mobile-nav__accordion-panel--open' : ''}`}>
              <div className="mobile-nav__accordion-inner">

                {/* Training */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Training</span>
                  <Link href="/training" onClick={closeMobile} className="mobile-nav__service-link">Browse all training</Link>
                </div>

                {/* Popular areas */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Popular areas</span>
                  {[
                    { label: 'Change Management', href: '/training/change-management' },
                    { label: 'Systems Thinking', href: '/training/systems-thinking' },
                    { label: 'Team Effectiveness', href: '/training/team-effectiveness' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__service-link">{item.label}</Link>
                  ))}
                </div>

                {/* Popular courses */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Popular courses</span>
                  {[
                    { label: 'Theory of Change', href: '/training/theory-of-change-workshop' },
                    { label: 'Process Mapping', href: '/training/process-mapping-workshop' },
                    { label: 'Scenario Planning', href: '/training/scenario-planning-workshop' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__service-link">{item.label}</Link>
                  ))}
                </div>

                {/* Develop your people */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Leadership Programme</span>
                  <Link href="/develop/deeper-ground" onClick={closeMobile} className="mobile-nav__service-link">Deeper Ground</Link>
                </div>
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Support for Leaders</span>
                  {[
                    { label: 'Executive Coaching', href: '/develop/executive-coaching' },
                    { label: 'Leadership Facilitation', href: '/develop/leadership-facilitation' },
                    { label: 'Strategic Thinking Partner', href: '/develop/strategic-thinking-partner' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__service-link">{item.label}</Link>
                  ))}
                </div>
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Support for Teams</span>
                  {[
                    { label: 'Team Sessions', href: '/develop/team-sessions' },
                    { label: 'Manager Coaching', href: '/develop/manager-coaching' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__service-link">{item.label}</Link>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Explore accordion */}
          <div>
            <button className="mobile-nav__accordion-trigger" onClick={() => toggleAccordion('explore')}>
              <span className="mobile-nav__accordion-label">Explore</span>
              <svg className={`mobile-nav__accordion-chevron${mobileAccordion === 'explore' ? ' mobile-nav__accordion-chevron--open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div className={`mobile-nav__accordion-panel${mobileAccordion === 'explore' ? ' mobile-nav__accordion-panel--open' : ''}`}>
              <div className="mobile-nav__accordion-inner">

                {/* States of Vitality - flagship */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Organisational Health diagnostic</span>
                  <Link href="/states-of-vitality" onClick={closeMobile} className="mobile-nav__service-link">States of Vitality</Link>
                </div>

                {/* Read & learn */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Read &amp; learn</span>
                  <Link href="/tools" onClick={closeMobile} className="mobile-nav__service-link">Tools & Toolkits</Link>
                  <Link href="/articles" onClick={closeMobile} className="mobile-nav__service-link">Thinking</Link>
                  <Link href="/resources/thinking-in-ecosystems" onClick={closeMobile} className="mobile-nav__service-link">Thinking in Ecosystems primer</Link>
                </div>

                {/* Our wider ecosystem */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Our wider ecosystem</span>
                  {[
                    { label: 'Moresapien', href: 'https://moresapien.org' },
                    { label: 'Fieldmarks', href: 'https://fieldmarks.org' },
                    { label: 'Theory of Change Toolkit', href: 'https://toctoolkit.org' },
                  ].map((item) => (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={closeMobile} className="mobile-nav__service-link">{item.label} ↗</a>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mobile-nav__ctas">
            <Link href="/states-of-vitality" onClick={closeMobile} className="btn-sec">States of Vitality</Link>
            <Link href="/contact" onClick={() => { trackCtaClick({ location: 'nav-mobile', label: 'Talk to us', destination: '/contact' }); closeMobile() }} className="btn-primary">Talk to us</Link>
          </div>
        </div>
      </div>

    </>
  )
}