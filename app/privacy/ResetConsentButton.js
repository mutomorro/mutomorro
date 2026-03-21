'use client'

import { useConsent } from '../../components/CookieConsent/ConsentProvider'

export default function ResetConsentButton() {
  let resetConsent = null

  try {
    const consent = useConsent()
    resetConsent = consent.resetConsent
  } catch {
    // ConsentProvider not available (shouldn't happen in normal use)
    return null
  }

  return (
    <button onClick={resetConsent} className="btn-primary">
      Reset cookie preferences
    </button>
  )
}
