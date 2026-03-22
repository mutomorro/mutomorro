import { Source_Sans_3 } from 'next/font/google'
import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ScrollObserver from '../components/ScrollObserver'
import { ConsentProvider } from '../components/CookieConsent/ConsentProvider'
import CookieBanner from '../components/CookieConsent/CookieBanner'
import TrackingScripts from '../components/CookieConsent/TrackingScripts'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-source-sans',
})

export const metadata = {
  title: 'Mutomorro',
  description: 'Organisational development consultancy',
  verification: {
    google: 'RAdCNT8DuIKnkt8EZhxgJdETnbll1joUHY34P65WFy4',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSans.className}`}>
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
      </body>
    </html>
  )
}