'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavPanel from './NavPanel'

export default function Nav() {
  const [openPanel, setOpenPanel] = useState(null)
  const [isCoarse, setIsCoarse] = useState(false)
  const closeTimer = useRef(null)
  const navRef = useRef(null)

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
    if (isCoarse) {
      setOpenPanel(openPanel === panel ? null : panel)
    }
  }

  return (
    <>
      <nav className="nav-bar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        height: '70px',
        padding: '0 48px',
      }}>
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
              src="/logo-black.svg"
              alt="Mutomorro"
              width={150}
              height={30}
              style={{ height: 'auto', width: '150px' }}
              priority
            />
          </Link>

          {/* Nav links - left group */}
          <div style={{
            display: 'flex',
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
                  className={`nav-link${isActive ? ' nav-link--active' : ''}`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          {/* CTAs - right group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto',
          }}>
            <Link
              href="/states-of-vitality"
              onClick={closePanel}
              className="btn-sec"
              style={{ fontSize: '14px', padding: '8px 0' }}
            >
              States of Vitality
            </Link>
            <Link
              href="/contact"
              onClick={closePanel}
              className="btn-primary"
              style={{ fontSize: '14px', padding: '10px 24px' }}
            >
              Talk to us
            </Link>
          </div>

        </div>
      </nav>

      {/* About Panel */}
      <NavPanel
        isOpen={openPanel === 'about'}
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

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', margin: '32px 0' }} />

          {/* Building Capability */}
          <div className="nav-panel-stagger">
            <span className="kicker" style={{ marginBottom: '24px' }}>Building Capability</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 2rem', maxWidth: '50%' }}>
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>For Leaders</span>
                {[
                  { label: 'Leadership Programme', href: '/services/leadership-programme' },
                  { label: 'Executive Coaching', href: '/services/executive-coaching' },
                  { label: 'Leadership Facilitation', href: '/services/leadership-facilitation' },
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
              <div className="nav-menu-col">
                <span className="kicker" style={{ marginBottom: '20px' }}>For Teams</span>
                {[
                  { label: 'Bespoke Training', href: '/services/bespoke-training' },
                  { label: 'Problem Solving Workshops', href: '/services/problem-solving-workshops' },
                  { label: 'Manager Coaching', href: '/services/manager-coaching' },
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
            </div>
          </div>
        </div>
      </NavPanel>

      {/* Explore Panel */}
      <NavPanel
        isOpen={openPanel === 'explore'}
        onClose={closePanel}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div style={{ maxWidth: '50%' }}>
          {/* Read and think */}
          <div className="nav-panel-stagger nav-menu-col">
            <span className="kicker" style={{ marginBottom: '20px' }}>Read and think</span>
            {[
              { label: 'The EMERGENT Framework', href: '/emergent-framework' },
              { label: 'Tools of the Trade', href: '/tools' },
              { label: 'Thinking', href: '/article' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePanel}
                className="nav-menu-link"
              >
                <span className="nav-menu-link__label">{item.label}</span>
                <span className="nav-menu-link__chevron">›</span>
              </Link>
            ))}
          </div>

          {/* Learn and develop */}
          <div className="nav-panel-stagger nav-menu-col" style={{ marginTop: '32px' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>Learn and develop</span>
            <Link
              href="/courses"
              onClick={closePanel}
              className="nav-menu-link"
            >
              <span className="nav-menu-link__label">Courses</span>
              <span className="nav-menu-link__chevron">›</span>
            </Link>
          </div>
        </div>
      </NavPanel>

    </>
  )
}
