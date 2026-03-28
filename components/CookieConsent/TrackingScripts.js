'use client'

/*
 * Conditional script loader - only renders tracking scripts when consent is accepted.
 * Also upgrades PostHog from anonymous (memory) to cookie-based persistence on consent.
 */

import { useConsent } from './ConsentProvider'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import Script from 'next/script'

export default function TrackingScripts() {
  const { consentState } = useConsent()

  // Upgrade or downgrade PostHog persistence based on consent
  useEffect(() => {
    if (consentState === 'accepted') {
      posthog.opt_in_capturing()
      posthog.set_config({ persistence: 'localStorage+cookie' })
    } else if (consentState === 'declined') {
      posthog.opt_out_capturing()
    }
  }, [consentState])

  if (consentState !== 'accepted') return null

  return (
    <>
      {/* Apollo website visitor tracking (appId: 663dd782155ddf01af138471) */}
      <Script
        id="apollo-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"663dd782155ddf01af138471"})},document.head.appendChild(o)}initApollo();`
        }}
      />
    </>
  )
}
