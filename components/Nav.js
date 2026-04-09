'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import NavPanel from './NavPanel'

export default function Nav() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const [openPanel, setOpenPanel] = useState(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isCoarse, setIsCoarse] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState(null)
  const scrollPosRef = useRef(0)
  const closeTimer = useRef(null)
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

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = useCallback(() => {
    clearClose()
    closeTimer.current = setTimeout(() => {
      setOpenPanel(null)
    }, 250)
  }, [])

  const closePanel = () => {
    clearClose()
    setOpenPanel(null)
  }

  // Detect coarse pointer (touch devices)
  useEffect(() => {
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches)
  }, [])

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

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearClose()
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

  const handleLinkEnter = (panel) => {
    if (isCoarse) return
    clearClose()
    setOpenPanel(panel)
  }

  const handleLinkLeave = () => {
    if (isCoarse) return
    scheduleClose()
  }

  const handlePanelEnter = () => {
    if (isCoarse) return
    clearClose()
  }

  const handlePanelLeave = () => {
    if (isCoarse) return
    scheduleClose()
  }

  const handleClick = (panel) => {
    // Toggle on both touch and desktop: click opens or closes
    setOpenPanel(openPanel === panel ? null : panel)
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
            {['About', 'How We Help', 'Explore'].map((item) => {
              const key = item.toLowerCase().replace(/ /g, '-')
              const isActive = openPanel === key
              return (
                <button
                  key={key}
                  onClick={() => handleClick(key)}
                  onMouseEnter={() => handleLinkEnter(key)}
                  onMouseLeave={handleLinkLeave}
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
            <Link
              href="/states-of-vitality"
              onClick={closePanel}
              className="sov-nav-btn"
            >
              <span style={{ position: 'relative', zIndex: 1 }}>States of Vitality</span>
            </Link>
            <Link
              href="/contact"
              onClick={closePanel}
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

      {/* About Panel */}
      <NavPanel
        isOpen={openPanel === 'about'}
        instantClose={isSwitching}
        onClose={closePanel}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div>
          {[
            { label: 'About us', desc: 'Who we are and why we exist', href: '/about' },
            { label: 'Philosophy', desc: 'Intentional Ecosystems — how we think about organisations', href: '/philosophy' },
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

      {/* How We Help Panel */}
      <NavPanel
        isOpen={openPanel === 'how-we-help'}
        instantClose={isSwitching}
        onClose={closePanel}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div>
          {/* Four service categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 2rem' }}>
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
                title: 'People & Capability',
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
                    className="nav-menu-link"
                  >
                    <span className="nav-menu-link__label">{link}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Building Capability - tonal shift background, full-width bleed */}
          <div className="nav-panel-stagger nav-capability-bar">
            <div className="section-padding-flush" style={{ maxWidth: 'calc(1350px + 96px)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 2rem' }}>
              {/* Leadership Programme - featured card */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Leadership Programme</span>
                <div style={{
                  background: '#FAF6F1',
                  padding: '8px 18px 18px',
                  borderRadius: '4px',
                }}>
                  <Link
                    href="/develop/deeper-ground"
                    onClick={closePanel}
                    className="nav-menu-link"
                    style={{ marginBottom: '14px' }}
                  >
                    <span className="nav-menu-link__label">Deeper Ground</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: 'rgba(34,28,43,0.6)',
                    margin: '0',
                  }}>
                    A transformative programme for senior leaders navigating complexity - building the inner capacity to lead with clarity and courage.
                  </p>
                </div>
              </div>

              {/* Support for Leaders */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Support for Leaders</span>
                {[
                  { label: 'Executive Coaching', href: '/develop/executive-coaching' },
                  { label: 'Leadership Facilitation', href: '/develop/leadership-facilitation' },
                  { label: 'Senior Leader Support', href: '/develop/senior-leader-support' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closePanel}
                    className="nav-menu-link"
                  >
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

              {/* For Teams */}
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>Support for Teams</span>
                {[
                  { label: 'Bespoke Training', href: '/develop/bespoke-training' },
                  { label: 'Team Sessions', href: '/develop/team-sessions' },
                  { label: 'Manager Coaching', href: '/develop/manager-coaching' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closePanel}
                    className="nav-menu-link"
                  >
                    <span className="nav-menu-link__label">{item.label}</span>
                    <span className="nav-menu-link__chevron">›</span>
                  </Link>
                ))}
              </div>

              {/* Empty 4th column for alignment with service grid above */}
              <div />
            </div>
          </div>
        </div>
      </NavPanel>

      {/* Explore Panel */}
      <NavPanel
        isOpen={openPanel === 'explore'}
        instantClose={isSwitching}
        onClose={closePanel}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div className="explore-panel">
          {/* Left column - destinations */}
          <div className="explore-panel__left nav-panel-stagger">
            {/* Read and think */}
            <div>
              <span className="explore-zone-label">Read and think</span>
              <div className="explore-dest-cards">
              <Link href="/tools" onClick={closePanel} className="explore-dest-card">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="explore-dest-card__icon">
                  <rect x="3" y="6" width="17" height="22" rx="1" stroke="#9B51E0" strokeWidth="1.3" fill="none"/>
                  <rect x="24" y="6" width="17" height="22" rx="1" stroke="#9B51E0" strokeWidth="1.3" fill="none" opacity="0.4"/>
                  <line x1="8" y1="13" x2="15" y2="13" stroke="#9B51E0" strokeWidth="1" opacity="0.5"/>
                  <line x1="8" y1="17" x2="14" y2="17" stroke="#9B51E0" strokeWidth="1" opacity="0.35"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="#9B51E0" strokeWidth="1" opacity="0.25"/>
                  <path d="M11 32 L11 36 L15 34 Z" fill="#9B51E0" opacity="0.4"/>
                  <circle cx="32" cy="14" r="2.5" stroke="#9B51E0" strokeWidth="1" fill="none" opacity="0.35"/>
                  <circle cx="29" cy="22" r="1.5" stroke="#9B51E0" strokeWidth="1" fill="none" opacity="0.25"/>
                </svg>
                <div className="explore-dest-card__text">
                  <span className="explore-dest-card__title">Tools of the Trade</span>
                  <span className="explore-dest-card__desc">Practical frameworks and models</span>
                </div>
                <span className="explore-dest-card__chevron">›</span>
              </Link>
              <Link href="/articles" onClick={closePanel} className="explore-dest-card">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="explore-dest-card__icon">
                  <circle cx="22" cy="19" r="11" stroke="#9B51E0" strokeWidth="1.3" fill="none"/>
                  <circle cx="22" cy="19" r="4.5" stroke="#9B51E0" strokeWidth="1" fill="none" opacity="0.35"/>
                  <circle cx="22" cy="19" r="1.5" fill="#9B51E0" opacity="0.5"/>
                  <line x1="22" y1="8" x2="22" y2="5" stroke="#9B51E0" strokeWidth="1" opacity="0.4"/>
                  <line x1="22" y1="30" x2="22" y2="33" stroke="#9B51E0" strokeWidth="1" opacity="0.4"/>
                  <line x1="11" y1="19" x2="8" y2="19" stroke="#9B51E0" strokeWidth="1" opacity="0.4"/>
                  <line x1="33" y1="19" x2="36" y2="19" stroke="#9B51E0" strokeWidth="1" opacity="0.4"/>
                  <path d="M16 36 L22 39 L28 36" stroke="#9B51E0" strokeWidth="1" fill="none" opacity="0.25"/>
                </svg>
                <div className="explore-dest-card__text">
                  <span className="explore-dest-card__title">Thinking</span>
                  <span className="explore-dest-card__desc">Articles, perspectives, and ideas</span>
                </div>
                <span className="explore-dest-card__chevron">›</span>
              </Link>
              </div>
            </div>

            {/* Courses box */}
            <Link href="/courses" onClick={closePanel} className="explore-courses-card">
              <div>
                <span className="explore-zone-label" style={{ color: '#9B51E0' }}>Learn and develop</span>
                <span className="explore-courses-card__title">Courses</span>
                <span className="explore-courses-card__desc">Ready-made sessions on popular topics</span>
              </div>
              <span className="explore-courses-card__chevron">›</span>
            </Link>
          </div>

          {/* Right column - featured + tasters */}
          <div className="explore-panel__right nav-panel-stagger">
            <span className="explore-zone-label">Popular resources</span>
            {/* Featured resource */}
            <Link href="/resources/thinking-in-ecosystems" onClick={closePanel} className="explore-featured">
              <div className="explore-featured__image">
                <div className="explore-featured__image-inner">
                  <img
                    src="https://cdn.sanity.io/images/c6pg4t4h/production/a1183aad79022f1aa0200d6be7b3f0897223f157-2480x3508.png"
                    alt="Thinking in Ecosystems primer"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
              <div className="explore-featured__text">
                <span className="kicker" style={{ marginBottom: '10px' }}>Featured</span>
                <span className="explore-featured__title">Thinking in Ecosystems</span>
                <span className="explore-featured__desc">Six ways of seeing your organisation for leaders ready to create thriving organisational ecosystems</span>
                <span className="explore-featured__cta">Download primer ›</span>
              </div>
            </Link>

            {/* Taster cards */}
            <div className="explore-tasters">
              {[
                { type: 'Tool', title: 'PESTLE Analysis', meta: 'Most popular', href: '/tools/pestle-analysis' },
                { type: 'Tool', title: "Kotter's 8 Steps", meta: 'Change classic', href: '/tools/kotters-8-step-change-model' },
                { type: 'Article', title: 'The Friction Audit', meta: '5 min read', href: '/articles/the-friction-audit' },
                { type: 'Article', title: 'Guide to Change Readiness', meta: '7 min read', href: '/articles/a-guide-to-change-readiness' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={closePanel} className="explore-taster">
                  <span className="explore-taster__type">{item.type}</span>
                  <span className="explore-taster__title">{item.title}</span>
                  <span className="explore-taster__meta">{item.meta}</span>
                </Link>
              ))}
            </div>
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

          {/* How We Help accordion */}
          <div>
            <button className="mobile-nav__accordion-trigger" onClick={() => toggleAccordion('how-we-help')}>
              <span className="mobile-nav__accordion-label">How We Help</span>
              <svg className={`mobile-nav__accordion-chevron${mobileAccordion === 'how-we-help' ? ' mobile-nav__accordion-chevron--open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div className={`mobile-nav__accordion-panel${mobileAccordion === 'how-we-help' ? ' mobile-nav__accordion-panel--open' : ''}`}>
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
                    title: 'People & Capability',
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

                {/* Building Capability */}
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Leadership Programme</span>
                  <Link href="/develop/deeper-ground" onClick={closeMobile} className="mobile-nav__service-link">Deeper Ground</Link>
                </div>
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Support for Leaders</span>
                  {[
                    { label: 'Executive Coaching', href: '/develop/executive-coaching' },
                    { label: 'Leadership Facilitation', href: '/develop/leadership-facilitation' },
                    { label: 'Senior Leader Support', href: '/develop/senior-leader-support' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__service-link">{item.label}</Link>
                  ))}
                </div>
                <div className="mobile-nav__service-category">
                  <span className="kicker" style={{ marginBottom: '8px' }}>Support for Teams</span>
                  {[
                    { label: 'Bespoke Training', href: '/develop/bespoke-training' },
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
                <span className="kicker" style={{ marginBottom: '8px' }}>Read and think</span>
                {[
                  { label: 'Tools of the Trade', href: '/tools' },
                  { label: 'Thinking', href: '/articles' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-nav__explore-link">{item.label}</Link>
                ))}
                <span className="kicker" style={{ marginTop: '20px', marginBottom: '8px' }}>Learn and develop</span>
                <Link href="/courses" onClick={closeMobile} className="mobile-nav__explore-link">Courses</Link>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mobile-nav__ctas">
            <Link href="/states-of-vitality" onClick={closeMobile} className="btn-sec">States of Vitality</Link>
            <Link href="/contact" onClick={closeMobile} className="btn-primary">Talk to us</Link>
          </div>
        </div>
      </div>

    </>
  )
}