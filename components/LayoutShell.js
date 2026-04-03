'use client'

import { usePathname } from 'next/navigation'
import Nav from './Nav'
import Footer from './Footer'
import ScrollObserver from './ScrollObserver'
import { ConsentProvider } from './CookieConsent/ConsentProvider'
import CookieBanner from './CookieConsent/CookieBanner'
import TrackingScripts from './CookieConsent/TrackingScripts'
import { PostHogProvider } from '../app/providers'
import PostHogPageView from '../app/PostHogPageView'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function LayoutShell({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return children
  }

  return (
    <>
      {/* SVG filters for marker highlights */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="rough1" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="rough2" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed="7" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="rough3" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed="13" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'Mutomorro',
            url: 'https://mutomorro.com',
            logo: 'https://mutomorro.com/logo-black.svg',
            description: 'Systems-led organisational development consultancy. We help leaders redesign how their organisations work across purpose, structure, people, and service.',
            founder: {
              '@type': 'Person',
              name: 'James Freeman-Gray',
              url: 'https://www.linkedin.com/in/jamesbfg/',
            },
            areaServed: 'GB',
            priceRange: '$$',
            sameAs: [
              'https://www.linkedin.com/company/mutomorro/',
            ],
          }),
        }}
      />
      <Analytics />
      <SpeedInsights />
      <PostHogProvider>
        <PostHogPageView />
        <ConsentProvider>
          <Nav />
          <ScrollObserver />
          {children}
          <Footer />
          <CookieBanner />
          <TrackingScripts />
          <Analytics />
          <SpeedInsights />
        </ConsentProvider>
      </PostHogProvider>
    </>
  )
}
