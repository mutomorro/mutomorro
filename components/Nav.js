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
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid #f0ece6',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
      }}>

        {/* Logo */}
        <Link href="/" onClick={closePanel} style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: '400',
            background: 'var(--gradient-heading)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em',
          }}>
            Mutomorro
          </span>
        </Link>

        {/* Nav links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {['About', 'How We Help', 'Explore'].map((item) => {
            const key = item.toLowerCase().replace(/ /g, '-')
            const isActive = openPanel === key
            return (
              <button
                key={key}
                onClick={() => togglePanel(key)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '400' : '300',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-dark)',
                  letterSpacing: '-0.01em',
                  padding: 0,
                  borderBottom: isActive ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.15s',
                }}
              >
                {item}
              </button>
            )
          })}

          {/* CTA buttons */}
          <Link
            href="/states-of-vitality"
            onClick={closePanel}
            className="btn btn--outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
          >
            States of Vitality
          </Link>
          <Link
            href="/contact"
            onClick={closePanel}
            className="btn btn--primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
          >
            Talk to us
          </Link>
        </div>

      </nav>

{/* About Panel */}
<NavPanel isOpen={openPanel === 'about'} onClose={closePanel}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
    <div>
      <p className="label" style={{ marginBottom: '1rem' }}>About</p>
      <p style={{ fontSize: '1.1rem', fontWeight: '400', lineHeight: '1.7', color: '#555' }}>
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
          style={{
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 0',
            borderBottom: '1px solid #f0ece6',
          }}
        >
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.2rem' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '400', color: '#888', margin: 0 }}>
              {item.desc}
            </p>
          </div>
          <span style={{ color: 'var(--color-accent)', fontSize: '1.2rem', opacity: 0.5 }}>→</span>
        </Link>
      ))}
    </div>
  </div>
</NavPanel>

      {/* How We Help Panel */}
      <NavPanel isOpen={openPanel === 'how-we-help'} onClose={closePanel}>
        <div>
          <p className="label" style={{ marginBottom: '2rem' }}>How We Help</p>

          {/* Four application categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            {[
              {
                title: 'Purpose & Direction',
                desc: 'Who we are and where we are going',
                links: ['Organisational Purpose', 'Strategic Alignment', 'Culture Change'],
                hrefs: ['/how-we-help/organisational-purpose', '/how-we-help/strategic-alignment', '/how-we-help/culture-change'],
              },
              {
                title: 'Structure & Operations',
                desc: 'How we\'re organised and how work flows',
                links: ['Merger Integration', 'Organisational Restructures', 'Operational Effectiveness'],
                hrefs: ['/how-we-help/merger-integration', '/how-we-help/organisational-restructures', '/how-we-help/operational-effectiveness'],
              },
              {
                title: 'People & Capability',
                desc: 'How we develop our collective abilities',
                links: ['Change Management', 'Employee Experience', 'Capacity Development', 'Continuous Learning'],
                hrefs: ['/how-we-help/change-management', '/how-we-help/employee-experience', '/how-we-help/capacity-development', '/how-we-help/continuous-learning'],
              },
              {
                title: 'Service & Experience',
                desc: 'How we deliver value to customers',
                links: ['Customer Experience', 'Service Design', 'Scaling Operations'],
                hrefs: ['/how-we-help/customer-experience', '/how-we-help/service-design', '/how-we-help/scaling-operations'],
              },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: '0.95rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.35rem' }}>
                  {col.title}
                </p>
                <p style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888', marginBottom: '1rem' }}>
                  {col.desc}
                </p>
                {col.links.map((link, i) => (
                  <Link
                    key={link}
                    href={col.hrefs[i]}
                    onClick={closePanel}
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#555',
                      textDecoration: 'none',
                      padding: '0.3rem 0',
                      transition: 'color 0.15s',
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
            borderTop: '1px solid #f0ece6',
            paddingTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            maxWidth: '50%',
          }}>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.35rem' }}>
                For Leaders
              </p>
              {['Leadership Programme', 'Executive Coaching', 'Leadership Facilitation'].map((link) => (
                <Link
                  key={link}
                  href={`/building-capability/${link.toLowerCase().replace(/ /g, '-')}`}
                  onClick={closePanel}
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '400', color: '#555', textDecoration: 'none', padding: '0.3rem 0' }}
                >
                  {link}
                </Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.35rem' }}>
                For Teams
              </p>
              {['Bespoke Training', 'Problem Solving Workshops', 'Manager Coaching', 'Prebuilt Courses'].map((link) => (
                <Link
                  key={link}
                  href={`/building-capability/${link.toLowerCase().replace(/ /g, '-')}`}
                  onClick={closePanel}
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '400', color: '#555', textDecoration: 'none', padding: '0.3rem 0' }}
                >
                  {link}
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
            <p className="label" style={{ marginBottom: '1.5rem' }}>Read and think</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { label: 'Tools of the Trade', desc: 'Practical models, frameworks and concepts', href: '/tools' },
                { label: 'Thinking', desc: 'Articles, perspectives and ideas', href: '/article' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closePanel}
                  style={{ textDecoration: 'none' }}
                >
                  <p style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '400', color: '#777', margin: 0 }}>
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Learn and develop */}
          <div>
            <p className="label" style={{ marginBottom: '1.5rem' }}>Learn and develop</p>
            <Link
              href="/courses"
              onClick={closePanel}
              style={{ textDecoration: 'none' }}
            >
              <p style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                Courses
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '400', color: '#777', margin: 0 }}>
                Ready-made courses on popular topics
              </p>
            </Link>
          </div>

        </div>
      </NavPanel>

    </>
  )
}