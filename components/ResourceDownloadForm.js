'use client'

import { useState } from 'react'

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
