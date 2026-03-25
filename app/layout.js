import { Source_Sans_3 } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ScrollObserver from '../components/ScrollObserver'
import { ConsentProvider } from '../components/CookieConsent/ConsentProvider'
import CookieBanner from '../components/CookieConsent/CookieBanner'
import TrackingScripts from '../components/CookieConsent/TrackingScripts'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-source-sans',
})

export const metadata = {
  metadataBase: new URL('https://mutomorro.com'),
  title: {
    default: 'Mutomorro - Organisational development consultancy',
    template: '%s | Mutomorro',
  },
  description: 'We help leaders redesign how their organisations work. Systems-led organisational development across purpose, structure, people, and service.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Mutomorro',
  },
  twitter: {
    card: 'summary',
  },
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'RAdCNT8DuIKnkt8EZhxgJdETnbll1joUHY34P65WFy4',
  },
}

export default async function RootLayout({ children }) {
  const headersList = await headers()
  const isAdmin = headersList.get('x-admin-route') === '1'

  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSans.className}`}>
        {isAdmin ? (
          // Admin routes: no Nav, Footer, or public site chrome
          children
        ) : (
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
            <Script
              defer
              src="/stats/script.js"
              data-website-id="3277d9c5-e0d7-409d-804f-51ccdcc2119c"
              strategy="afterInteractive"
            />
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
          </>
        )}
      </body>
    </html>
  )
}