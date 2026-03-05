import { Source_Sans_3 } from 'next/font/google'
import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-source-sans',
})

export const metadata = {
  title: 'Mutomorro',
  description: 'Organisational development consultancy',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSans.className}`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}