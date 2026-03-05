import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f0ece6',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px',
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontSize: '1.35rem',
          fontWeight: '700',
          background: 'linear-gradient(90deg, #80388F, #FF4279, #FFA200)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          Mutomorro
        </span>
      </Link>

      {/* Nav links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
      }}>
        <Link href="/about" style={navLink}>About</Link>
        <Link href="/how-we-help" style={navLink}>How We Help</Link>
        <Link href="/learn" style={navLink}>Learn</Link>

        {/* CTA buttons */}
        <Link href="/states-of-vitality" style={secondaryButton}>
          States of Vitality
        </Link>
        <Link href="/contact" style={primaryButton}>
          Contact
        </Link>
      </div>

    </nav>
  )
}

const navLink = {
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#1a1a1a',
  letterSpacing: '-0.01em',
}

const primaryButton = {
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#ffffff',
  backgroundColor: '#80388F',
  padding: '0.6rem 1.25rem',
  borderRadius: '4px',
  letterSpacing: '-0.01em',
}

const secondaryButton = {
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#80388F',
  border: '2px solid #80388F',
  padding: '0.6rem 1.25rem',
  borderRadius: '4px',
  letterSpacing: '-0.01em',
}