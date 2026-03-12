'use client'

import { useState } from 'react'

export default function ToolDownloadForm({ toolTitle, toolSlug, pdfUrl, heroImageUrl }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newsletterOptIn: false,
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
        <div style={{
          borderLeft: '3px solid var(--color-accent, #9B51E0)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
        }}>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '400',
            lineHeight: '1.5',
            color: 'var(--color-dark, #221C2B)',
            margin: '0 0 0.25rem',
          }}>
            Here's your {toolTitle} template
          </p>
          <p style={{
            fontSize: '0.9375rem',
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
              fontSize: '1.0625rem',
              fontWeight: '400',
              margin: '0 0 1rem',
              color: 'var(--color-dark, #221C2B)',
            }}>
              {toolTitle}
            </p>
            <a
              href={pdfUrl + '?dl='}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                fontWeight: '400',
                fontSize: '0.9375rem',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                padding: '1rem 2.25rem',
                borderRadius: '0',
                color: '#fff',
                background: '#000',
                cursor: 'pointer',
              }}
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── The form ──
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: '400',
          lineHeight: '1.2',
          margin: '0 0 0.75rem',
        }}>
          Get the template
        </h3>
        <p style={{
          fontSize: '1rem',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'rgba(0,0,0,0.55)',
          margin: 0,
          maxWidth: '480px',
        }}>
          Fill in your details and the PDF will appear right here - no email, no waiting.
        </p>
      </div>

      {status === 'error' && (
        <div style={{
          borderLeft: '3px solid #FF4279',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.9375rem',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'var(--color-dark, #221C2B)',
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>

        {/* First name + Last name side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div>
            <label
              htmlFor="firstName"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.5)',
                marginBottom: '0.5rem',
              }}
            >
              First name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: '300',
                padding: '0.875rem 1rem',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '0',
                background: 'transparent',
                width: '100%',
                color: 'var(--color-dark, #221C2B)',
                outline: 'none',
                WebkitAppearance: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--color-accent, #9B51E0)'
                e.target.style.borderBottomWidth = '2px'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,0,0,0.12)'
                e.target.style.borderBottomWidth = '1px'
              }}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.5)',
                marginBottom: '0.5rem',
              }}
            >
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: '300',
                padding: '0.875rem 1rem',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '0',
                background: 'transparent',
                width: '100%',
                color: 'var(--color-dark, #221C2B)',
                outline: 'none',
                WebkitAppearance: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--color-accent, #9B51E0)'
                e.target.style.borderBottomWidth = '2px'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,0,0,0.12)'
                e.target.style.borderBottomWidth = '1px'
              }}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '400',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.5)',
              marginBottom: '0.5rem',
            }}
          >
            Work email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            style={{
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: '300',
              padding: '0.875rem 1rem',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '0',
              background: 'transparent',
              width: '100%',
              color: 'var(--color-dark, #221C2B)',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-accent, #9B51E0)'
              e.target.style.borderBottomWidth = '2px'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(0,0,0,0.12)'
              e.target.style.borderBottomWidth = '1px'
            }}
          />
        </div>

        {/* Newsletter opt-in */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor="newsletterOptIn"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
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
                accentColor: 'var(--color-accent, #9B51E0)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: '0.9375rem',
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
          style={{
            fontFamily: 'inherit',
            fontWeight: '400',
            fontSize: '0.9375rem',
            letterSpacing: '0.06em',
            padding: '1rem 2.25rem',
            border: 'none',
            borderRadius: '0',
            color: '#fff',
            background: status === 'sending' ? 'rgba(0,0,0,0.4)' : '#000000',
            cursor: status === 'sending' ? 'default' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status === 'sending' ? 'Getting your template...' : 'Get the template'}
        </button>
      </form>
    </div>
  )
}