'use client'

import { useEffect, useState } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

const KEY = 'mutomorro_ph_opt_out'

export default function AnalyticsOptOutPage() {
  const { theme } = useAdminTheme()
  const [optedOut, setOptedOut] = useState(null)

  useEffect(() => {
    try {
      setOptedOut(window.localStorage.getItem(KEY) === '1')
    } catch {
      setOptedOut(false)
    }
  }, [])

  function optOut() {
    try {
      window.localStorage.setItem(KEY, '1')
      setOptedOut(true)
    } catch {}
  }

  function optIn() {
    try {
      window.localStorage.removeItem(KEY)
      setOptedOut(false)
    } catch {}
  }

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '24px',
    maxWidth: '560px',
  }

  const buttonBase = {
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '8px' }}>
        Analytics opt-out
      </h1>
      <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '24px' }}>
        Excludes this browser from PostHog tracking. Per-browser, per-device — bookmark this page and visit it once on each device you want excluded.
      </p>

      <div style={cardStyle}>
        <div style={{ fontSize: '13px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Status on this browser
        </div>
        <div style={{ fontSize: '18px', color: theme.textPrimary, marginBottom: '20px' }}>
          {optedOut === null ? 'Checking…' : optedOut ? 'Excluded from analytics' : 'Currently being tracked'}
        </div>

        {optedOut === false && (
          <button
            onClick={optOut}
            style={{ ...buttonBase, background: theme.textPrimary, color: theme.pageBg }}
          >
            Exclude this browser
          </button>
        )}
        {optedOut === true && (
          <button
            onClick={optIn}
            style={{ ...buttonBase, background: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.cardBorder}` }}
          >
            Re-enable tracking
          </button>
        )}

        <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '20px', marginBottom: 0, lineHeight: 1.5 }}>
          Refresh the page after toggling for it to take effect across the site. Clearing this browser&apos;s localStorage will reset the preference.
        </p>
      </div>
    </div>
  )
}
