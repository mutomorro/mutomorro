'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {

  useEffect(() => {
    const logMiss = async () => {
      try {
        await fetch('/api/log-404', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent || null,
          }),
        })
      } catch (e) {
        // Silent fail - don't break the page if logging fails
      }
    }
    logMiss()
  }, [])

  return (
    <section className="section--full" style={{
      padding: '80px 48px',
      background: 'var(--white)',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>

        <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
          404
        </span>

        <h1 className="heading-h1" style={{ margin: '0 0 20px' }}>
          This page has gone dormant
        </h1>

        <p className="body-text" style={{ margin: '0 auto 2.5rem', maxWidth: '480px' }}>
          Even the healthiest ecosystems have the occasional dead end. The page you're looking for doesn't exist - but plenty of good things do.
        </p>

        <div className="button-row" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/services" className="btn-sec">
            How we help
          </Link>
          <Link href="/contact" className="btn-sec">
            Talk to us
          </Link>
        </div>

      </div>
    </section>
  )
}