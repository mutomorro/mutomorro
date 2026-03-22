import Link from 'next/link'

export const metadata = {
  title: 'Unsubscribed',
  robots: 'noindex, nofollow',
}

export default function UnsubscribedPage() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF6F1',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '640px', textAlign: 'center' }}>
        <p style={{
          fontSize: '20px',
          fontWeight: 400,
          color: '#221C2B',
          letterSpacing: '0.06em',
          marginBottom: '48px',
        }}>
          Mutomorro
        </p>
        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>
          You&apos;ve been unsubscribed
        </h2>
        <p style={{
          fontSize: '18px',
          fontWeight: 300,
          lineHeight: 1.75,
          color: '#000',
          marginBottom: '32px',
        }}>
          You won&apos;t receive any more emails from us. If you change your mind, you can sign up again on our website.
        </p>
        <Link href="/" className="link-inline">
          Back to mutomorro.com
        </Link>
      </div>
    </div>
  )
}
