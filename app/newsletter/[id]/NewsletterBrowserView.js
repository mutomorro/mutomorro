'use client'

import { useEffect, useRef } from 'react'

export default function NewsletterBrowserView({ htmlBody, sentDate }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const resizeIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (doc?.body) {
          iframe.style.height = doc.body.scrollHeight + 'px'
        }
      } catch (e) {
        // Silently ignore cross-origin errors
      }
    }

    iframe.addEventListener('load', resizeIframe)

    // Also resize on window resize
    window.addEventListener('resize', resizeIframe)

    return () => {
      iframe.removeEventListener('load', resizeIframe)
      window.removeEventListener('resize', resizeIframe)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#f0f0f0',
      overflowY: 'auto',
    }}>
      {/* Banner */}
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '12px 44px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
        }}>
          This is a web version of an email sent on {sentDate}.{' '}
          <a
            href="https://mutomorro.com"
            style={{ color: '#9B51E0', textDecoration: 'underline' }}
          >
            Subscribe to receive future emails
          </a>
        </p>
      </div>

      {/* Email content in iframe to isolate from site CSS */}
      <div style={{
        maxWidth: '580px',
        margin: '0 auto 40px',
      }}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlBody}
          title="Newsletter"
          style={{
            width: '100%',
            border: 'none',
            display: 'block',
            minHeight: '800px',
          }}
          sandbox="allow-same-origin allow-popups"
        />
      </div>
    </div>
  )
}
