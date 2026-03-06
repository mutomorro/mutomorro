'use client'

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // idle, sending, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', organisation: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    fontSize: '0.95rem',
    fontWeight: '300',
    fontFamily: 'var(--font-source-sans), sans-serif',
    border: '1.5px solid #e0dbd4',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: 'var(--color-dark)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '400',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '0.5rem',
  }

  return (
    <main>

      {/* Hero */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 1rem' }}>Get in touch</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            Start with a conversation
          </h1>
          <p className="lead" style={{ maxWidth: '560px' }}>
            No pitch. No obligation. Just an honest discussion about whether
            our approach feels right for you.
          </p>
        </div>
      </section>

      {/* Form + reassurance */}
      <section className="section section--white">
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6rem',
            alignItems: 'start',
          }}>

            {/* Form */}
            <div>
              {status === 'success' ? (
                <div style={{
                  padding: '2.5rem',
                  backgroundColor: 'var(--color-warm)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--color-accent)',
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '400',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.75rem',
                  }}>
                    Thank you - message received.
                  </h2>
                  <p style={{
                    fontSize: '0.95rem',
                    fontWeight: '300',
                    color: '#555',
                    margin: 0,
                    lineHeight: '1.6',
                  }}>
                    We'll be in touch within 2 working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                      <label style={labelStyle}>Your name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="James Freeman-Gray"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Email address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="james@mutomorro.com"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Organisation</label>
                      <input
                        type="text"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>What's on your mind? *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="Tell us a bit about what you're working on or what you're looking for..."
                      />
                    </div>

                    {status === 'error' && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-pink)',
                        margin: 0,
                      }}>
                        Something went wrong - please try again or email us directly at hello@mutomorro.com
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn btn--primary"
                      style={{
                        alignSelf: 'flex-start',
                        opacity: status === 'sending' ? 0.6 : 1,
                        cursor: status === 'sending' ? 'wait' : 'pointer',
                        border: 'none',
                        fontFamily: 'var(--font-source-sans), sans-serif',
                      }}
                    >
                      {status === 'sending' ? 'Sending...' : 'Send message'}
                    </button>

                  </div>
                </form>
              )}
            </div>

            {/* Reassurance */}
            <div style={{ paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                {[
                  {
                    heading: 'No pitch, no obligation',
                    body: "We start every conversation by listening. There's no prepared presentation and no pressure. If our approach feels right, we'll talk about what working together could look like.",
                  },
                  {
                    heading: "You'll hear back within 2 working days",
                    body: "We'll respond personally - not with an automated sequence. If you'd like a call, we'll find a time that works.",
                  },
                  {
                    heading: "If it's not the right fit, we'll say so",
                    body: "Honestly. We'd rather have a good conversation that leads nowhere than start something that isn't right for you. We can usually point you in a better direction if we're not it.",
                  },
                ].map((item) => (
                  <div key={item.heading} style={{
                    borderTop: '1px solid #f0ece6',
                    paddingTop: '1.5rem',
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '400',
                      color: 'var(--color-dark)',
                      margin: '0 0 0.6rem',
                    }}>
                      {item.heading}
                    </h3>
                    <p style={{
                      fontSize: '0.925rem',
                      fontWeight: '300',
                      lineHeight: '1.7',
                      color: '#666',
                      margin: 0,
                    }}>
                      {item.body}
                    </p>
                  </div>
                ))}

                {/* Location */}
                <div style={{
                  borderTop: '1px solid #f0ece6',
                  paddingTop: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '400',
                    color: 'var(--color-dark)',
                    margin: '0 0 0.6rem',
                  }}>
                    Where we are
                  </h3>
                  <p style={{
                    fontSize: '0.925rem',
                    fontWeight: '300',
                    lineHeight: '1.7',
                    color: '#666',
                    margin: '0 0 0.25rem',
                  }}>
                    London - Paul Street, EC2A 4NE
                  </p>
                  <p style={{
                    fontSize: '0.925rem',
                    fontWeight: '300',
                    lineHeight: '1.7',
                    color: '#666',
                    margin: '0 0 0.75rem',
                  }}>
                    Glasgow - 15 Candleriggs, G1 1TQ
                  </p>
                  <p style={{
                    fontSize: '0.925rem',
                    fontWeight: '300',
                    color: '#888',
                    margin: 0,
                    fontStyle: 'italic',
                  }}>
                    Based in the UK - working with organisations across the world.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}