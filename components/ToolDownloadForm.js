'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export default function ToolDownloadForm({ toolTitle, toolSlug, pdfUrl, heroImageUrl }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newsletterOptIn: true,
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [formLoadedAt] = useState(Date.now())

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
          company_website: honeypot,
          _t: formLoadedAt,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      posthog.capture('tool_download', {
        tool_name: toolTitle,
        source_page: window.location.pathname,
      })
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

        {/* LinkedIn follow band */}
        <div className="linkedin-band" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          background: 'var(--warm, #FAF6F1)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
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
            color: 'var(--black, #1a1a1a)',
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

        {/* Honeypot - hidden from real users */}
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
