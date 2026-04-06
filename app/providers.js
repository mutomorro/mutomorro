'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'memory',
      disable_session_recording: true,
      disable_surveys: true,
      autocapture: {
        capture_dead_clicks: false,
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
