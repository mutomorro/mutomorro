'use client'

import { useState } from 'react'

export default function ContactForm({ service }) {
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
        body: JSON.stringify({ ...formData, service }),
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
      <div className="feedback-success" style={{ maxWidth: '540px' }}>
        <p style={{
          fontSize: '18px',
          fontWeight: '400',
          lineHeight: '1.6',
          color: 'var(--dark)',
          margin: '0 0 0.5rem',
        }}>
          Thanks for getting in touch.
        </p>
        <p style={{
          fontSize: '16px',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'var(--dark)',
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
        <div className="feedback-error" style={{ marginBottom: '2rem' }}>
          {errorMessage}
        </div>
      )}

      {/* Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">Your name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          className="form-input"
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email address</label>
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

      {/* Organisation */}
      <div className="form-group">
        <label htmlFor="organisation" className="form-label">
          Organisation <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(optional)</span>
        </label>
        <input
          type="text"
          id="organisation"
          name="organisation"
          value={formData.organisation}
          onChange={handleChange}
          placeholder="Where you work"
          className="form-input"
        />
      </div>

      {/* Message */}
      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label htmlFor="message" className="form-label">What are you working on?</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your situation..."
          className="form-input form-textarea"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary"
        style={status === 'sending' ? { background: 'rgba(0,0,0,0.4)', cursor: 'default' } : undefined}
      >
        {status === 'sending' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}
