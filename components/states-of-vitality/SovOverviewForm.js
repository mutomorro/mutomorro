'use client'

import { useState, useRef } from 'react'
import posthog from 'posthog-js'
import { isPersonalEmail, PERSONAL_EMAIL_ERROR } from '../../lib/personal-email-domains'

const PDF_URL = '/downloads/States of Vitality - Overview.pdf'

export default function SovOverviewForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    newsletterOptIn: true,
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const startedAt = useRef(Date.now())

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(formData.email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }
    if (isPersonalEmail(formData.email)) {
      setStatus('error')
      setErrorMessage(PERSONAL_EMAIL_ERROR)
      return
    }

    setStatus('sending')

    try {
      const res = await fetch('/api/sov-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organisation: formData.organisation,
          newsletterOptIn: formData.newsletterOptIn,
          fax_number: '',
          _t: startedAt.current,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      try {
        posthog.capture('sov_overview_download', {
          organisation: formData.organisation,
          source_page: window.location.pathname,
        })
      } catch (_) { /* posthog optional */ }

      // Trigger download
      const a = document.createElement('a')
      a.href = PDF_URL + '?dl='
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong - please try again')
    }
  }

  if (status === 'success') {
    return (
      <div className="feedback-success" style={{ padding: '2rem' }}>
        <p style={{ fontSize: '18px', fontWeight: 400, lineHeight: 1.5, color: 'var(--dark)', margin: '0 0 8px' }}>
          Your download should start automatically
        </p>
        <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
          Check your downloads folder. If it didn't start,{' '}
          <a href={PDF_URL + '?dl='} download className="inline-link">click here to download</a>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="heading-h4" style={{ margin: '0 0 8px' }}>Download the overview</h3>
      <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(0,0,0,0.6)', margin: '0 0 1.5rem' }}>
        A short PDF introducing the States of Vitality assessment.
      </p>

      {status === 'error' && (
        <div className="feedback-error" style={{ marginBottom: '1.5rem' }}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input type="text" name="fax_number" tabIndex={-1} autoComplete="off"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} aria-hidden="true" />

        <div className="form-group">
          <label htmlFor="sov-overview-name" className="form-label">Name</label>
          <input type="text" id="sov-overview-name" name="name" required
            value={formData.name} onChange={handleChange} className="form-input" placeholder="Your name" />
        </div>

        <div className="form-group">
          <label htmlFor="sov-overview-email" className="form-label">Work email</label>
          <input type="email" id="sov-overview-email" name="email" required
            value={formData.email} onChange={handleChange} className="form-input" placeholder="you@company.com" />
        </div>

        <div className="form-group">
          <label htmlFor="sov-overview-org" className="form-label">Organisation</label>
          <input type="text" id="sov-overview-org" name="organisation" required
            value={formData.organisation} onChange={handleChange} className="form-input" placeholder="Your organisation" />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="sov-overview-optin" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" id="sov-overview-optin" name="newsletterOptIn"
              checked={formData.newsletterOptIn} onChange={handleChange}
              style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(0,0,0,0.6)' }}>
              Keep me updated with occasional insights and resources
            </span>
          </label>
        </div>

        <button type="submit" disabled={status === 'sending'} className="btn-primary"
          style={status === 'sending' ? { background: 'rgba(0,0,0,0.4)', cursor: 'default' } : undefined}>
          {status === 'sending' ? 'Preparing your download...' : 'Download the overview'}
        </button>
      </form>
    </div>
  )
}
