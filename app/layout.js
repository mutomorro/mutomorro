import { Source_Sans_3 } from 'next/font/google'
import './globals.css'
import LayoutShell from '../components/LayoutShell'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSans.className}`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
