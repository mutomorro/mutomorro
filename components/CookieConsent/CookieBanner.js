'use client'

import { useConsent } from './ConsentProvider'
import Link from 'next/link'

export default function CookieBanner() {
  const { consentState, acceptCookies, declineCookies } = useConsent()

  if (consentState !== null) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p className="cookie-banner__heading">Cookies on this site</p>
          <p className="cookie-banner__body">
            We use one optional cookie to understand which organisations visit our site.
            This helps us have better conversations with the right people.
            No personal data is collected.{' '}
            <Link href="/privacy" className="cookie-banner__link">
              Read our cookie policy
            </Link>
          </p>
        </div>
        <div className="cookie-banner__buttons">
          <button onClick={declineCookies} className="btn-sec btn-sec--dark">
            Decline
          </button>
          <button onClick={acceptCookies} className="btn-primary btn-primary--dark">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
