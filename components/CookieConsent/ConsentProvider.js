'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import posthog from 'posthog-js'

const ConsentContext = createContext(null)

const COOKIE_NAME = 'mutomorro_consent'
const COOKIE_DAYS = 365

// Record the consent decision so we can measure the accept rate - the hard
// ceiling on every returning-visitor / multi-session metric. Fired in 'memory'
// mode for a fresh visitor (no persistent storage), so it's captured for accept
// AND decline. For decline we fire here, synchronously, before TrackingScripts'
// opt-out effect runs on the next render. No-op under the owner opt-out (init
// skipped, so __loaded is false).
function captureConsent(decision) {
  if (posthog?.__loaded) {
    posthog.capture('cookie_consent', { decision })
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export function ConsentProvider({ children }) {
  const [consentState, setConsentState] = useState(undefined)

  useEffect(() => {
    const stored = getCookie(COOKIE_NAME)
    if (stored === 'accepted' || stored === 'declined') {
      setConsentState(stored)
    } else {
      setConsentState(null)
    }
  }, [])

  function acceptCookies() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS)
    captureConsent('accepted')
    setConsentState('accepted')
  }

  function declineCookies() {
    captureConsent('declined') // before TrackingScripts opt-out stops capture
    setCookie(COOKIE_NAME, 'declined', COOKIE_DAYS)
    setConsentState('declined')
  }

  function resetConsent() {
    deleteCookie(COOKIE_NAME)
    setConsentState(null)
  }

  return (
    <ConsentContext.Provider value={{ consentState, acceptCookies, declineCookies, resetConsent }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
