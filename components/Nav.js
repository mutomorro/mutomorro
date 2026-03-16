'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavPanel from './NavPanel'

export default function Nav() {
  const [openPanel, setOpenPanel] = useState(null)

  const togglePanel = (panel) => {
    setOpenPanel(openPanel === panel ? null : panel)
  }

  const closePanel = () => setOpenPanel(null)

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
      }}>

        {/* Logo */}
        <Link href="/" onClick={closePanel} style={{ textDecoration: 'none' }}>
          <span className="heading-gradient" style={{
            fontSize: '1.35rem',
            fontWeight: '400',
            letterSpacing: '-0.01em',
          }}>
            Mutomorro
          </span>
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
                onClick={() => togglePanel(key)}
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

      </nav>

      {/* About Panel */}
      <NavPanel isOpen={openPanel === 'about'} onClose={closePanel}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
          <div>
            <span className="kicker">About</span>
            <p className="body-text" style={{ color: 'rgba(0,0,0,0.55)' }}>
              Who we are, how we think, and what we believe about organisations.
            </p>
          </div>
          <div>
            {[
              { label: 'About us', desc: 'Who we are and why we exist', href: '/about' },
              { label: 'Philosophy', desc: 'Intentional Ecosystems - how we think about organisations', href: '/philosophy' },
              { label: 'The EMERGENT Framework', desc: 'The eight dimensions of organisational health', href: '/emergent-framework' },
              { label: 'How we work', desc: 'Our four-stage approach to working together', href: '/how-we-work' },
              { label: 'Projects and experience', desc: 'What working with us leads to', href: '/projects' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePanel}
                className="nav-panel-link"
              >
                <div>
                  <p className="nav-panel-link__title">{item.label}</p>
                  <p className="nav-panel-link__desc">{item.desc}</p>
                </div>
                <span className="nav-panel-link__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </NavPanel>

      {/* How We Help Panel */}
      <NavPanel isOpen={openPanel === 'how-we-help'} onClose={closePanel}>
        <div>
          <span className="kicker" style={{ marginBottom: '2rem' }}>How We Help</span>

          {/* Four application categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            {[
              {
                title: 'Purpose & Direction',
                desc: 'Who we are and where we are going',
                links: ['Culture Change', 'Organisational Purpose', 'Strategic Alignment'],
                hrefs: [
                  '/services/culture-change-consultancy',
                  '/services/organisational-purpose-consultancy',
                  '/services/strategic-alignment-consultancy',
                ],
              },
              {
                title: 'Structure & Operations',
                desc: 'How we\'re organised and how work flows',
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
                desc: 'How we develop our collective abilities',
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
                desc: 'How we deliver value to customers',
                links: ['Customer Experience', 'Service Design', 'Scaling Operations'],
                hrefs: [
                  '/services/customer-experience-consultancy',
                  '/services/service-design-consultancy',
                  '/services/scaling-operations-consultancy',
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: '15px', fontWeight: '400', color: 'var(--dark)', marginBottom: '4px' }}>
                  {col.title}
                </p>
                <p style={{ fontSize: '13px', fontWeight: '300', color: 'rgba(0,0,0,0.4)', marginBottom: '16px' }}>
                  {col.desc}
                </p>
                {col.links.map((link, i) => (
                  <Link
                    key={link}
                    href={col.hrefs[i]}
                    onClick={closePanel}
                    className="inline-link"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '300',
                      color: 'rgba(0,0,0,0.6)',
                      padding: '5px 0',
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Building Capability - visually distinct lower section */}
          <div style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            maxWidth: '50%',
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '400', color: 'var(--dark)', marginBottom: '4px' }}>
                For Leaders
              </p>
              {[
                { label: 'Leadership Programme', href: '/services/leadership-programme' },
                { label: 'Executive Coaching', href: '/services/executive-coaching' },
                { label: 'Leadership Facilitation', href: '/services/leadership-facilitation' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closePanel}
                  className="inline-link"
                  style={{ display: 'block', fontSize: '14px', fontWeight: '300', color: 'rgba(0,0,0,0.6)', padding: '5px 0' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '400', color: 'var(--dark)', marginBottom: '4px' }}>
                For Teams
              </p>
              {[
                { label: 'Bespoke Training', href: '/services/bespoke-training' },
                { label: 'Problem Solving Workshops', href: '/services/problem-solving-workshops' },
                { label: 'Manager Coaching', href: '/services/manager-coaching' },
                { label: 'Prebuilt Courses', href: '/courses' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closePanel}
                  className="inline-link"
                  style={{ display: 'block', fontSize: '14px', fontWeight: '300', color: 'rgba(0,0,0,0.6)', padding: '5px 0' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </NavPanel>

      {/* Explore Panel */}
      <NavPanel isOpen={openPanel === 'explore'} onClose={closePanel}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>

          {/* Read and think */}
          <div>
            <span className="kicker" style={{ marginBottom: '24px' }}>Read and think</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'The EMERGENT Framework', desc: 'The eight dimensions of organisational health', href: '/emergent-framework' },
                { label: 'Tools of the Trade', desc: 'Practical models, frameworks and concepts', href: '/tools' },
                { label: 'Thinking', desc: 'Articles, perspectives and ideas', href: '/article' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closePanel}
                  className="nav-panel-link"
                >
                  <div>
                    <p className="nav-panel-link__title">{item.label}</p>
                    <p className="nav-panel-link__desc">{item.desc}</p>
                  </div>
                  <span className="nav-panel-link__arrow">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Learn and develop */}
          <div>
            <span className="kicker" style={{ marginBottom: '24px' }}>Learn and develop</span>
            <Link
              href="/courses"
              onClick={closePanel}
              className="nav-panel-link"
            >
              <div>
                <p className="nav-panel-link__title">Courses</p>
                <p className="nav-panel-link__desc">Ready-made courses on popular topics</p>
              </div>
              <span className="nav-panel-link__arrow">→</span>
            </Link>
          </div>

        </div>
      </NavPanel>

    </>
  )
}
