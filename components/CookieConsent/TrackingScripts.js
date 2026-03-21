'use client'

/*
 * Conditional script loader - only renders tracking scripts when consent is accepted.
 *
 * To add a future tracking script:
 * 1. Import Script from 'next/script' (already done)
 * 2. Add another <Script> block inside the return, guarded by the same consent check
 */

import { useConsent } from './ConsentProvider'
import Script from 'next/script'

export default function TrackingScripts() {
  const { consentState } = useConsent()

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
