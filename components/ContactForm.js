'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('success')
      setFormData({ name: '', email: '', organisation: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong - please try again')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        borderLeft: '3px solid var(--color-accent, #9B51E0)',
        padding: '1.5rem 2rem',
        maxWidth: '540px',
      }}>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: '400',
          lineHeight: '1.6',
          color: 'var(--color-dark, #221C2B)',
          margin: '0 0 0.5rem',
        }}>
          Thanks for getting in touch.
        </p>
        <p style={{
          fontSize: '1rem',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'var(--color-dark, #221C2B)',
          opacity: 0.6,
          margin: 0,
        }}>
          I'll come back to you within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '540px' }}>

      {status === 'error' && (
        <div style={{
          borderLeft: '3px solid #FF4279',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          fontSize: '0.9375rem',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'var(--color-dark, #221C2B)',
        }}>
          {errorMessage}
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="name"
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
          Your name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
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
          Email address
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

      {/* Organisation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="organisation"
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
          Organisation <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(optional)</span>
        </label>
        <input
          type="text"
          id="organisation"
          name="organisation"
          value={formData.organisation}
          onChange={handleChange}
          placeholder="Where you work"
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

      {/* Message */}
      <div style={{ marginBottom: '2rem' }}>
        <label
          htmlFor="message"
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
          What are you working on?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your situation..."
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
            resize: 'vertical',
            minHeight: '140px',
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

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary"
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
        {status === 'sending' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}