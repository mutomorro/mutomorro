'use client'

import { useState } from 'react'

export default function ToolDownloadForm({ toolTitle, toolSlug, pdfUrl, heroImageUrl }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newsletterOptIn: true,
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/tool-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          toolTitle,
          toolSlug,
          newsletterOptIn: formData.newsletterOptIn,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong - please try again')
    }
  }

  // ── After successful submission: show thumbnail + download ──
  if (status === 'success') {
    return (
      <div>
        {/* Success message */}
        <div className="feedback-success" style={{ marginBottom: '2rem' }}>
          <p style={{
            fontSize: '18px',
            fontWeight: '400',
            lineHeight: '1.5',
            color: 'var(--dark)',
            margin: '0 0 4px',
          }}>
            Here's your {toolTitle} template
          </p>
          <p style={{
            fontSize: '15px',
            fontWeight: '300',
            lineHeight: '1.5',
            color: 'rgba(0,0,0,0.55)',
            margin: 0,
          }}>
            Click below to download your copy.
          </p>
        </div>

        {/* Thumbnail + download button */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
        }}>
          {heroImageUrl && (
            <div style={{
              width: '220px',
              flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#fff',
            }}>
              <img
                src={heroImageUrl}
                alt={toolTitle}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          )}
          <div>
            <p style={{
              fontSize: '17px',
              fontWeight: '400',
              margin: '0 0 1rem',
              color: 'var(--dark)',
            }}>
              {toolTitle}
            </p>
            <a
              href={pdfUrl + '?dl='}
              download
              className="btn-primary"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── The form ──
  const formContent = (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 className="heading-h4" style={{ margin: '0 0 12px' }}>
          Get this template
        </h3>
        <p className="lead-text" style={{ margin: 0, maxWidth: '480px', fontSize: '16px' }}>
          Fill in your details and the PDF will appear right here - no email, no waiting.
        </p>
      </div>

      {status === 'error' && (
        <div className="feedback-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>

        {/* First name + Last name side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '24px',
        }}>
          <div>
            <label htmlFor="firstName" className="form-label">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="form-label">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="form-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Work email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="form-input"
          />
        </div>

        {/* Newsletter opt-in */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor="newsletterOptIn"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              id="newsletterOptIn"
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
              Send me occasional insights on organisational development and change - no spam, easy unsubscribe.
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
          {status === 'sending' ? 'Getting your template...' : 'Get this template'}
        </button>
      </form>
    </div>
  )

  if (!heroImageUrl) return formContent

  return (
    <div className="tool-form-grid">
      <div className="tool-form-grid__preview">
        <div style={{
          border: '1px solid rgba(0,0,0,0.12)',
          background: '#fff',
        }}>
          <img
            src={heroImageUrl}
            alt={toolTitle}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      </div>
      <div className="tool-form-grid__form">
        {formContent}
      </div>
    </div>
  )
}
