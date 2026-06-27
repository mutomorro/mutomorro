'use client'

import { usePostHog } from 'posthog-js/react'

// Single source of truth for the States of Vitality product-site handoff.
// /states-of-vitality is a bridge page: its whole job is sending visitors to
// statesofvitality.com (a separate site, separate PostHog project 173891).
// Every outbound link on the page routes through here so three things can't
// drift apart: the destination URL, the UTM tags, and the tracking event.
//
// Why this matters: the links use rel="noreferrer" (referrer stripped), so
// before this the crossing was invisible on BOTH sides - mutomorro recorded
// nothing, and SoV filed every arrival under "Direct".
const PRODUCT_SITE_URL = 'https://statesofvitality.com'

// UTM tags let the SoV project attribute mutomorro arrivals even with the
// referrer stripped. utm_content mirrors `location` so we can tell which CTA
// drove the click.
function destinationFor(location) {
  const params = new URLSearchParams({
    utm_source: 'mutomorro',
    utm_medium: 'cta',
    utm_campaign: 'sov_handoff',
    utm_content: location,
  })
  return `${PRODUCT_SITE_URL}/?${params.toString()}`
}

export default function SovLink({ location, variant = 'button', align = 'left', tone = 'light', label }) {
  const posthog = usePostHog()
  const href = destinationFor(location)
  const text = label || (variant === 'inline' ? 'statesofvitality.com →' : 'Explore States of Vitality →')

  // Fire before the new tab opens. target="_blank" means this page does not
  // unload, so a plain capture lands reliably (no beacon transport needed).
  const track = () => {
    posthog?.capture('sov_site_clickthrough', {
      cta_location: location,
      label: text,
      destination: href,
    })
  }

  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={tone === 'dark' ? 'sov-product-link sov-product-link--dark' : 'sov-product-link'}
        style={tone === 'dark' ? { fontSize: '14px' } : undefined}
        onClick={track}
      >
        {text}
      </a>
    )
  }

  const wrapperClass = `sov-cta-cluster${align === 'center' ? ' sov-cta-cluster--center' : ''}`
  return (
    <div className={wrapperClass}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary btn-primary--dark sov-cta-btn"
        onClick={track}
      >
        {text}
      </a>
    </div>
  )
}
