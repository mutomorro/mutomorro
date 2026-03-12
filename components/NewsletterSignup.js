'use client'

import { useState } from 'react'

export default function NewsletterSignup({ variant = 'inline' }) {
  const [formData, setFormData] = useState({ firstName: '', email: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const isFooter = variant === 'footer'

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
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setFormData({ firstName: '', email: '' })
    } catch {
      setStatus('error')
    }
  }

  // ── Success state ──
  if (status === 'success') {
    return (
      <div style={{
        borderLeft: isFooter ? '3px solid var(--color-accent, #9B51E0)' : '3px solid var(--color-accent, #9B51E0)',
        padding: '1rem 1.25rem',
      }}>
        <p style={{
          fontSize: isFooter ? '0.9375rem' : '1.0625rem',
          fontWeight: '400',
          lineHeight: '1.5',
          color: isFooter ? 'rgba(255,255,255,0.9)' : 'var(--color-dark, #221C2B)',
          margin: 0,
        }}>
          You're in. We'll be in touch.
        </p>
      </div>
    )
  }

  // ── Footer variant: compact, horizontal, on dark ──
  if (isFooter) {
    return (
      <div>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: '400',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          margin: '0 0 1rem',
        }}>
          Stay in the loop
        </p>
        <p style={{
          fontSize: '0.9375rem',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 1.25rem',
          maxWidth: '320px',
        }}>
          Occasional insights on organisational development and change. No spam.
        </p>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          maxWidth: '400px',
        }}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            style={{
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '300',
              padding: '0.75rem 0.875rem',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0',
              background: 'transparent',
              color: '#fff',
              outline: 'none',
              width: '120px',
              WebkitAppearance: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent, #9B51E0)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            style={{
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '300',
              padding: '0.75rem 0.875rem',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0',
              background: 'transparent',
              color: '#fff',
              outline: 'none',
              flex: '1',
              minWidth: '160px',
              WebkitAppearance: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent, #9B51E0)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              fontFamily: 'inherit',
              fontWeight: '400',
              fontSize: '0.875rem',
              letterSpacing: '0.06em',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0',
              color: 'var(--color-dark, #221C2B)',
              background: status === 'sending' ? 'rgba(255,255,255,0.5)' : '#fff',
              cursor: status === 'sending' ? 'default' : 'pointer',
            }}
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p style={{
            fontSize: '0.8125rem',
            color: '#FF4279',
            margin: '0.75rem 0 0',
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
      <p style={{
        fontSize: '0.8125rem',
        fontWeight: '400',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--color-accent, #9B51E0)',
        margin: '0 0 0.75rem',
      }}>
        Stay in the loop
      </p>
      <h3 style={{
        fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
        fontWeight: '400',
        lineHeight: '1.3',
        margin: '0 0 0.75rem',
      }}>
        Enjoyed this? Get more like it.
      </h3>
      <p style={{
        fontSize: '1rem',
        fontWeight: '300',
        lineHeight: '1.6',
        color: 'rgba(0,0,0,0.55)',
        margin: '0 0 1.5rem',
        maxWidth: '480px',
      }}>
        Occasional insights on organisational development, change, and making work work better. No spam, easy unsubscribe.
      </p>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        maxWidth: '520px',
      }}>
        <input
          type="text"
          name="firstName"
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
            width: '140px',
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
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          style={{
            fontFamily: 'inherit',
            fontSize: '1rem',
            fontWeight: '300',
            padding: '0.875rem 1rem',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '0',
            background: 'transparent',
            flex: '1',
            minWidth: '180px',
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
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            fontFamily: 'inherit',
            fontWeight: '400',
            fontSize: '0.9375rem',
            letterSpacing: '0.06em',
            padding: '0.875rem 2rem',
            border: 'none',
            borderRadius: '0',
            color: '#fff',
            background: status === 'sending' ? 'rgba(0,0,0,0.4)' : '#000',
            cursor: status === 'sending' ? 'default' : 'pointer',
          }}
        >
          {status === 'sending' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{
          fontSize: '0.875rem',
          color: '#FF4279',
          margin: '0.75rem 0 0',
        }}>
          Something went wrong - please try again.
        </p>
      )}
    </div>
  )
}