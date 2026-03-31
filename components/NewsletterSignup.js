'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export default function NewsletterSignup({ variant = 'inline' }) {
  const [formData, setFormData] = useState({ firstName: '', email: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [honeypot, setHoneypot] = useState('')
  const [formLoadedAt] = useState(Date.now())

  const isFooter = variant === 'footer' || variant === 'footer-row'
  const isFooterRow = variant === 'footer-row'
  const isHomepage = variant === 'homepage'

  const honeypotField = (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
      <label htmlFor="company_website">Company Website</label>
      <input
        type="text"
        id="company_website"
        name="company_website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  )

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, company_website: honeypot, _t: formLoadedAt }),
      })

      if (!res.ok) throw new Error()
      posthog.capture('newsletter_signup', {
        source_page: window.location.pathname,
      })
      setStatus('success')
      setFormData({ firstName: '', email: '' })
    } catch {
      setStatus('error')
    }
  }

  // ── Success state ──
  if (status === 'success') {
    return (
      <div className="feedback-success" style={(isFooter || isHomepage) ? { borderLeftColor: 'var(--accent)' } : undefined}>
        <p style={{
          fontSize: (isFooter || isHomepage) ? '15px' : '17px',
          fontWeight: '400',
          lineHeight: '1.5',
          color: (isFooter || isHomepage) ? 'rgba(255,255,255,0.9)' : 'var(--dark)',
          margin: 0,
        }}>
          You're in. We'll be in touch.
        </p>
      </div>
    )
  }

  // ── Homepage variant: on dark, slightly larger than footer ──
  if (isHomepage) {
    return (
      <div>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          maxWidth: '440px',
        }}>
          {honeypotField}
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="form-input form-input--dark"
            style={{ width: '130px', fontSize: '15px', padding: '14px 16px' }}
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="form-input form-input--dark"
            style={{ flex: '1', minWidth: '170px', fontSize: '15px', padding: '14px 16px' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary btn-primary--dark"
            style={{
              fontSize: '15px',
              padding: '14px 28px',
              ...(status === 'sending' ? { background: 'rgba(255,255,255,0.5)', cursor: 'default' } : {}),
            }}
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p style={{
            fontSize: '13px',
            color: 'var(--pink)',
            margin: '12px 0 0',
          }}>
            Something went wrong - please try again.
          </p>
        )}
      </div>
    )
  }

  // ── Footer-row variant: form only, no heading/description ──
  if (isFooterRow) {
    return (
      <div>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {honeypotField}
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="form-input form-input--dark"
            style={{ width: '120px', fontSize: '14px', padding: '12px 14px' }}
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="form-input form-input--dark"
            style={{ flex: '1', minWidth: '180px', fontSize: '14px', padding: '12px 14px' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary btn-primary--dark"
            style={{
              fontSize: '14px',
              padding: '12px 24px',
              ...(status === 'sending' ? { background: 'rgba(255,255,255,0.5)', cursor: 'default' } : {}),
            }}
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p style={{
            fontSize: '13px',
            color: 'var(--pink)',
            margin: '12px 0 0',
          }}>
            Something went wrong - please try again.
          </p>
        )}
      </div>
    )
  }

  // ── Footer variant: compact, horizontal, on dark ──
  if (isFooter) {
    return (
      <div>
        <p className="footer-heading">Stay in the loop</p>
        <p style={{
          fontSize: '15px',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 20px',
          maxWidth: '320px',
        }}>
          Occasional insights on organisational development and change. No spam.
        </p>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          maxWidth: '400px',
        }}>
          {honeypotField}
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="form-input form-input--dark"
            style={{ width: '120px', fontSize: '14px', padding: '12px 14px' }}
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="form-input form-input--dark"
            style={{ flex: '1', minWidth: '160px', fontSize: '14px', padding: '12px 14px' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary btn-primary--dark"
            style={{
              fontSize: '14px',
              padding: '12px 24px',
              ...(status === 'sending' ? { background: 'rgba(255,255,255,0.5)', cursor: 'default' } : {}),
            }}
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p style={{
            fontSize: '13px',
            color: 'var(--pink)',
            margin: '12px 0 0',
          }}>
            Something went wrong - please try again.
          </p>
        )}
      </div>
    )
  }

  // ── Inline variant: for articles, slightly larger ──
  return (
    <div style={{
      borderTop: '1px solid rgba(0,0,0,0.08)',
      paddingTop: '2.5rem',
      marginTop: '3rem',
    }}>
      <span className="kicker">Stay in the loop</span>
      <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
        Enjoyed this? Get more like it.
      </h3>
      <p className="lead-text" style={{ margin: '0 0 1.5rem', maxWidth: '480px' }}>
        Occasional insights on organisational development, change, and making work work better. No spam, easy unsubscribe.
      </p>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        maxWidth: '520px',
      }}>
        {honeypotField}
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          className="form-input"
          style={{ width: '140px' }}
        />
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          className="form-input"
          style={{ flex: '1', minWidth: '180px' }}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary"
          style={status === 'sending' ? { background: 'rgba(0,0,0,0.4)', cursor: 'default' } : undefined}
        >
          {status === 'sending' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{
          fontSize: '14px',
          color: 'var(--pink)',
          margin: '12px 0 0',
        }}>
          Something went wrong - please try again.
        </p>
      )}
    </div>
  )
}
