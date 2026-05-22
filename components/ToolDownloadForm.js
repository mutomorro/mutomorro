'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { isFreeEmailProvider, FREE_EMAIL_MESSAGE, FREE_EMAIL_EMPHASIS } from '@/lib/email-validation'

const [NOTICE_BEFORE, NOTICE_AFTER] = FREE_EMAIL_MESSAGE.split(FREE_EMAIL_EMPHASIS)

export default function ToolDownloadForm({ toolTitle, toolSlug, pdfUrl }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newsletterOptIn: false,
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')
  const [emailNotice, setEmailNotice] = useState(false)
  const [noticeShake, setNoticeShake] = useState(0)
  const [honeypot, setHoneypot] = useState('')
  const [formLoadedAt] = useState(Date.now())

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (name === 'email') {
      setEmailNotice(false)
      setNoticeShake(0)
    }
  }

  function handleEmailBlur() {
    setEmailNotice(isFreeEmailProvider(formData.email))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isFreeEmailProvider(formData.email)) {
      setEmailNotice(true)
      setNoticeShake(n => n + 1)
      return
    }

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

  // ── After successful submission: success message + download button ──
  if (status === 'success') {
    return (
      <div className="feedback-success">
        <p style={{
          fontSize: '20px',
          fontWeight: '400',
          lineHeight: '1.4',
          color: 'var(--dark)',
          margin: '0 0 1.5rem',
        }}>
          Here&apos;s your {toolTitle} template
        </p>
        {pdfUrl ? (
          <>
            <a
              href={pdfUrl + '?dl='}
              download
              className="btn-primary"
              style={{ fontSize: '17px', padding: '16px 32px' }}
            >
              Download PDF
            </a>
            <p style={{
              fontSize: '15px',
              fontWeight: '300',
              lineHeight: '1.5',
              color: 'rgba(0,0,0,0.55)',
              margin: '1rem 0 0',
            }}>
              Click the button to save your copy.
            </p>
          </>
        ) : (
          <p className="body-text" style={{ margin: 0 }}>
            The PDF is being prepared - please check back shortly.
          </p>
        )}
      </div>
    )
  }

  // ── The form ──
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="heading-h4" style={{ margin: '0 0 10px' }}>
          Get this PDF template
        </h2>
        <p className="body-text" style={{ margin: 0 }}>
          Fill in your details and download the PDF straight away.
        </p>
      </div>

      {status === 'error' && (
        <div className="feedback-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>

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
          marginBottom: '20px',
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
          <label htmlFor="email" className="form-label">Work email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            placeholder="you@company.com"
            className="form-input"
            style={emailNotice ? { borderColor: 'var(--accent)' } : undefined}
          />
          {emailNotice && (
            <div
              key={noticeShake}
              className={noticeShake > 0 ? 'free-email-notice--shake' : undefined}
              style={{
                marginTop: '10px',
                padding: '12px 14px',
                background: 'var(--warm)',
                borderLeft: '3px solid var(--accent)',
                fontSize: '14px',
                fontWeight: '300',
                lineHeight: '1.55',
                color: 'rgba(0,0,0,0.7)',
              }}
            >
              {NOTICE_BEFORE}
              <strong style={{ fontWeight: 600 }}>{FREE_EMAIL_EMPHASIS}</strong>
              {NOTICE_AFTER}
            </div>
          )}
        </div>

        {/* Newsletter opt-in - unticked by default */}
        <div style={{ margin: '1.25rem 0 1.75rem' }}>
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
              Keep me updated with practical tools and thinking for leaders
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
}
