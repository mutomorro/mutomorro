'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#221C2B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Mutomorro Admin
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            Command Centre
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0',
              color: '#fff',
              fontSize: '16px',
              fontFamily: 'var(--font-source-sans), Source Sans 3, sans-serif',
              outline: 'none',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#9B51E0'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          />

          {error && (
            <p style={{
              color: '#FF4279',
              fontSize: '14px',
              marginBottom: '16px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: '#9B51E0',
              border: 'none',
              borderRadius: '0',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'var(--font-source-sans), Source Sans 3, sans-serif',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
