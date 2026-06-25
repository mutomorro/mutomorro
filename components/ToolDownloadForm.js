'use client'

import { useState, useEffect, useId, useRef } from 'react'
import posthog from 'posthog-js'
import { isFreeEmailProvider, FREE_EMAIL_MESSAGE, FREE_EMAIL_EMPHASIS } from '@/lib/email-validation'
import { identifyLead, trackFormStart } from '@/lib/analytics'

const [NOTICE_BEFORE, NOTICE_AFTER] = FREE_EMAIL_MESSAGE.split(FREE_EMAIL_EMPHASIS)

const LINKEDIN_URL = 'https://www.linkedin.com/company/mutomorro'

const PdfIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const LinkedInIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

export default function ToolDownloadForm({ toolTitle, toolSlug, pdfUrl, successCallout }) {
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
  const [previewVariant, setPreviewVariant] = useState(null) // null | 'optIn' | 'noOptIn' — dev-only

  // Namespace all field ids per instance so two forms on one page can't collide
  // (label htmlFor only binds to the first matching id). Submission/anti-spam
  // keys off the name attributes, not these ids.
  const fid = useId()
  const startedRef = useRef(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('preview') !== 'success') return
    setPreviewVariant(params.get('optedIn') === 'true' ? 'optIn' : 'noOptIn')
  }, [])

  function handleChange(e) {
    if (!startedRef.current) {
      startedRef.current = true
      trackFormStart('tool_download', { tool_name: toolTitle })
    }
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
          fax_number: honeypot,
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
      identifyLead(formData.email, { lead_stage: 'tool_download', last_tool: toolTitle })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong - please try again')
    }
  }

  // ── After successful submission: success message + download button ──
  const showSuccess = status === 'success' || previewVariant !== null
  if (showSuccess) {
    const isOptedIn = previewVariant !== null
      ? previewVariant === 'optIn'
      : formData.newsletterOptIn

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
              style={{ fontSize: '17px', padding: '16px 32px', gap: '10px', minWidth: '260px' }}
            >
              <PdfIcon />
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

        {/* Secondary: confirmation callout (opt-in only) + LinkedIn nudge */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(0,0,0,0.1)',
        }}>
          {isOptedIn && (
            <div style={{
              padding: '14px 16px',
              background: 'var(--warm)',
              borderLeft: '3px solid var(--accent)',
              marginBottom: '1.75rem',
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.55',
                margin: 0,
                color: 'rgba(0,0,0,0.85)',
              }}>
                We&apos;ve sent you a confirmation email — click the link to finish signing up.{' '}
                <strong style={{ fontWeight: 600 }}>Check your spam folder</strong>
                {' '}if you don&apos;t see it in a minute.
              </p>
            </div>
          )}

          {successCallout}

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-linkedin"
            style={{ fontSize: '17px', minWidth: '260px' }}
          >
            <LinkedInIcon />
            Join us on LinkedIn
          </a>
          <p style={{
            fontSize: '15px',
            fontWeight: '300',
            lineHeight: '1.55',
            color: 'rgba(0,0,0,0.7)',
            margin: '1rem 0 0',
          }}>
            Join us on LinkedIn for more tools, thinking and ideas for leaders.
          </p>
        </div>
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

        {/* Honeypot - hidden from real users; named "fax" (not "company website")
            so browser autofill won't fill it and false-flag a real person as a bot */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
          <label htmlFor={`${fid}-fax_number`}>Fax</label>
          <input
            type="text"
            id={`${fid}-fax_number`}
            name="fax_number"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="nope"
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
            <label htmlFor={`${fid}-firstName`} className="form-label">First name</label>
            <input
              type="text"
              id={`${fid}-firstName`}
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor={`${fid}-lastName`} className="form-label">Last name</label>
            <input
              type="text"
              id={`${fid}-lastName`}
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
          <label htmlFor={`${fid}-email`} className="form-label">Work email</label>
          <input
            type="email"
            id={`${fid}-email`}
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
            htmlFor={`${fid}-newsletterOptIn`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              id={`${fid}-newsletterOptIn`}
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
