'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export default function ResourceDownloadForm({
  resourceTitle,
  resourceSlug,
  resourceType,
  downloadUrl,
  downloadButtonLabel,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organisation: '',
    newsletterOptIn: true,
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const typeLabels = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }
  const typeLabel = typeLabels[resourceType] || 'Resource'
  const buttonText = downloadButtonLabel || `Download ${typeLabel}`
  const headingText = downloadButtonLabel || 'Get your free copy'

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

    if (!isValidEmail(formData.email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/resource-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          organisation: formData.organisation || undefined,
          newsletterOptIn: formData.newsletterOptIn,
          resourceSlug,
          resourceTitle,
          resourceType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      posthog.capture('resource_download', {
        resource_name: resourceTitle,
        organisation: formData.organisation || undefined,
        source_page: window.location.pathname,
      })

      // Trigger the download
      if (downloadUrl) {
        const a = document.createElement('a')
        a.href = downloadUrl + '?dl='
        a.download = ''
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong - please try again')
    }
  }

  // ── Success state ──
  if (status === 'success') {
    return (
      <div className="feedback-success" style={{ padding: '2rem' }}>
        <p style={{
          fontSize: '18px',
          fontWeight: '400',
          lineHeight: '1.5',
          color: 'var(--dark)',
          margin: '0 0 8px',
        }}>
          Your download should start automatically
        </p>
        <p style={{
          fontSize: '15px',
          fontWeight: '300',
          lineHeight: '1.5',
          color: 'rgba(0,0,0,0.55)',
          margin: '0 0 1.5rem',
        }}>
          Check your downloads folder. If it didn't start,{' '}
          <a
            href={downloadUrl + '?dl='}
            download
            className="inline-link"
          >
            click here to download
          </a>.
        </p>

        {/* LinkedIn follow band */}
        <div className="linkedin-band" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.06)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          marginTop: '20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="28" height="28" rx="4" fill="#0A66C2"/>
            <path d="M8.5 11.5H11V19.5H8.5V11.5ZM9.75 10.5C8.92 10.5 8.25 9.83 8.25 9C8.25 8.17 8.92 7.5 9.75 7.5C10.58 7.5 11.25 8.17 11.25 9C11.25 9.83 10.58 10.5 9.75 10.5ZM20.5 19.5H18V15.6C18 14.57 17.98 13.25 16.56 13.25C15.12 13.25 14.9 14.37 14.9 15.53V19.5H12.4V11.5H14.8V12.7H14.83C15.17 12.03 16.04 11.32 17.33 11.32C19.86 11.32 20.5 12.97 20.5 15.1V19.5Z" fill="white"/>
          </svg>
          <p style={{
            flex: 1,
            fontSize: '14px',
            margin: 0,
            color: 'rgba(255,255,255,0.7)',
          }}>
            We share thinking like this regularly on LinkedIn
          </p>
          <a
            href="https://www.linkedin.com/company/mutomorro"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#0A66C2',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              border: 'none',
            }}
          >
            Follow us
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    )
  }

  // ── The form ──
  return (
    <div>
      <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
        {headingText}
      </h3>
      <p style={{
        fontSize: '15px',
        fontWeight: '300',
        lineHeight: '1.5',
        color: 'rgba(0,0,0,0.55)',
        margin: '0 0 1.5rem',
      }}>
        Fill in your details and the PDF is yours.
      </p>

      {status === 'error' && (
        <div className="feedback-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* First name + Last name */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '24px',
        }}>
          <div>
            <label htmlFor="res-firstName" className="form-label">First name</label>
            <input
              type="text"
              id="res-firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="res-lastName" className="form-label">Last name</label>
            <input
              type="text"
              id="res-lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="form-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="res-email" className="form-label">Work email</label>
          <input
            type="email"
            id="res-email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="form-input"
          />
        </div>

        {/* Organisation */}
        <div className="form-group">
          <label htmlFor="res-organisation" className="form-label">Organisation (optional)</label>
          <input
            type="text"
            id="res-organisation"
            name="organisation"
            value={formData.organisation}
            onChange={handleChange}
            placeholder="Your organisation"
            className="form-input"
          />
        </div>

        {/* Newsletter opt-in */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor="res-newsletterOptIn"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              id="res-newsletterOptIn"
              name="newsletterOptIn"
              checked={formData.newsletterOptIn}
              onChange={handleChange}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: '15px',
              fontWeight: '300',
              lineHeight: '1.5',
              color: 'rgba(0,0,0,0.6)',
            }}>
              Keep me updated with occasional insights and resources
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary"
          style={status === 'sending' ? { background: 'rgba(0,0,0,0.4)', cursor: 'default' } : undefined}
        >
          {status === 'sending' ? 'Preparing your download...' : buttonText}
        </button>
      </form>
    </div>
  )
}
