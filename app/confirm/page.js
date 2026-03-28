'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const isSuccess = status === 'success'

  // Hide nav, footer, cookie banner - this is a standalone moment, not a website page
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = 'nav, footer, .cookie-banner { display: none !important; }'
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--warm, #FAF6F1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <img
          src="/logo-black.svg"
          alt="Mutomorro"
          width={140}
          height={32}
          style={{ marginBottom: '48px' }}
        />

        {isSuccess ? (
          <>
            <h1
              className="heading-h2"
              style={{ marginBottom: '20px' }}
            >
              You're confirmed.
            </h1>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: '#000',
              marginBottom: '32px',
            }}>
              Thanks - you're on the list. You'll get an email from me shortly to say hello properly. In the meantime, if you haven't already, there are 59 models and frameworks in the toolkit:
            </p>
            <Link
              href="/tools"
              className="btn-primary"
            >
              Browse the toolkit
            </Link>
          </>
        ) : (
          <>
            <h1
              className="heading-h2"
              style={{ marginBottom: '20px' }}
            >
              Something went wrong.
            </h1>
            <p style={{
              fontSize: '18px',
              fontWeight: '300',
              lineHeight: '1.75',
              color: '#000',
            }}>
              This confirmation link doesn't seem to be valid. If you think this is a mistake, drop us a line at{' '}
              <a
                href="mailto:hello@mutomorro.com"
                className="link-inline"
              >
                hello@mutomorro.com
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'var(--warm, #FAF6F1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ fontSize: '18px', fontWeight: '300', color: 'rgba(0,0,0,0.4)' }}>
          Loading...
        </p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
