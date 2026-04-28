'use client'

import { useState, useRef } from 'react'
import posthog from 'posthog-js'
import { isPersonalEmail, PERSONAL_EMAIL_ERROR } from '../../lib/personal-email-domains'

const EMPLOYEE_BANDS = ['Under 50', '50-100', '100-200', '200-500', '500+']

export default function SovQuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    employees: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const startedAt = useRef(Date.now())

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      const res = await fetch('/api/sov-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fax_number: '',
          _t: startedAt.current,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      try {
        posthog.capture('sov_quote_request', {
          organisation: formData.organisation,
          employees: formData.employees,
          source_page: window.location.pathname,
        })
      } catch (_) { /* posthog optional */ }

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
          Thanks - we'll be in touch shortly
        </p>
        <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
          We've received your details and will reply to your work email with a tailored quote and next steps.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="heading-h4" style={{ margin: '0 0 8px' }}>Get a quote</h3>
      <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.5, color: 'rgba(0,0,0,0.6)', margin: '0 0 1.5rem' }}>
        Tell us a little about your organisation and we'll come back with a tailored quote.
      </p>

      {status === 'error' && (
        <div className="feedback-error" style={{ marginBottom: '1.5rem' }}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input type="text" name="fax_number" tabIndex={-1} autoComplete="off"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} aria-hidden="true" />

        <div className="form-group">
          <label htmlFor="sov-quote-name" className="form-label">Name</label>
          <input type="text" id="sov-quote-name" name="name" required
            value={formData.name} onChange={handleChange} className="form-input" placeholder="Your name" />
        </div>

        <div className="form-group">
          <label htmlFor="sov-quote-email" className="form-label">Work email</label>
          <input type="email" id="sov-quote-email" name="email" required
            value={formData.email} onChange={handleChange} className="form-input" placeholder="you@company.com" />
        </div>

        <div className="form-group">
          <label htmlFor="sov-quote-org" className="form-label">Organisation</label>
          <input type="text" id="sov-quote-org" name="organisation" required
            value={formData.organisation} onChange={handleChange} className="form-input" placeholder="Your organisation" />
        </div>

        <div className="form-group">
          <label htmlFor="sov-quote-employees" className="form-label">Approximate number of employees</label>
          <select id="sov-quote-employees" name="employees" required
            value={formData.employees} onChange={handleChange} className="form-input">
            <option value="">Select a range</option>
            {EMPLOYEE_BANDS.map(band => (
              <option key={band} value={band}>{band}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sov-quote-message" className="form-label">Message (optional)</label>
          <textarea id="sov-quote-message" name="message" rows={4}
            value={formData.message} onChange={handleChange} className="form-input"
            placeholder="Anything you'd like us to know about your situation" />
        </div>

        <button type="submit" disabled={status === 'sending'} className="btn-primary"
          style={status === 'sending' ? { background: 'rgba(0,0,0,0.4)', cursor: 'default' } : undefined}>
          {status === 'sending' ? 'Sending...' : 'Request a quote'}
        </button>
      </form>
    </div>
  )
}
