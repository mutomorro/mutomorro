'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

// Read a cookie value client-side (mirrors components/CookieConsent/ConsentProvider.js).
function readCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

export function PostHogProvider({ children }) {
  useEffect(() => {
    try {
      if (window.localStorage?.getItem('mutomorro_ph_opt_out') === '1') return
    } catch {}

    // Start in the persistence mode the visitor's consent already implies. A returning
    // visitor who previously accepted cookies must init with localStorage+cookie so their
    // stored distinct_id is loaded at startup, preserving cross-session identity. Without
    // this, init always ran cookieless ('memory') and orphaned the stored id on every
    // visit, so returning-visitor, lifecycle and multi-session funnel metrics stayed empty.
    // TrackingScripts still upgrades persistence in-session when consent is first given.
    const consented = readCookie('mutomorro_consent') === 'accepted'

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      persistence: consented ? 'localStorage+cookie' : 'memory',
      disable_session_recording: true,
      disable_surveys: true,
      autocapture: {
        capture_dead_clicks: false,
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
