'use client'

import posthog from 'posthog-js'

// Shared client-side analytics helpers for the commercial-funnel instrumentation.
// All helpers are safe no-ops when PostHog hasn't loaded (e.g. the owner opt-out
// in app/providers.js, where init is skipped entirely).

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Stitch a converting visitor's anonymous history to a stable, cross-session
// identity so a download and a later enquiry land on one person profile.
// We identify by a SHA-256 hash of the email, NOT the raw address: that keeps
// the analytics link (same email -> same id) without putting PII into PostHog,
// matching the site's cookieless / consent-aware setup. Returns a Promise.
export async function identifyLead(email, props = {}) {
  if (!email || !posthog?.__loaded) return
  try {
    const hex = await sha256Hex(email.trim().toLowerCase())
    posthog.identify(`lead_${hex.slice(0, 32)}`, props)
  } catch {}
}

// Mark the first real interaction with a form. Paired with the existing submit
// events (contact_form_submitted, tool_download, ...) this yields an
// abandonment view: form_started minus the matching submit.
export function trackFormStart(form, props = {}) {
  if (!posthog?.__loaded) return
  try {
    posthog.capture('form_started', { form, source_page: window.location.pathname, ...props })
  } catch {}
}

// A primary call-to-action click. Autocapture already records raw clicks, but an
// explicit event with a clean `location` is far easier to funnel and break down.
export function trackCtaClick(props = {}) {
  if (!posthog?.__loaded) return
  try {
    posthog.capture('cta_click', { source_page: window.location.pathname, ...props })
  } catch {}
}
