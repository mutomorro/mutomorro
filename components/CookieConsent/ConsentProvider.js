'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ConsentContext = createContext(null)

const COOKIE_NAME = 'mutomorro_consent'
const COOKIE_DAYS = 365

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
    setConsentState('accepted')
  }

  function declineCookies() {
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
