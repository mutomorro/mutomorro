import Link from 'next/link'

export default function CTA({
  label = 'Let\'s talk',
  heading = 'Ready to think differently about your organisation?',
  body = 'Whether you\'re diagnosing root causes, redesigning for the future, or enhancing what already works well - we\'d love to hear about your organisation.',
  buttonText = 'Get in touch',
  buttonLink = '/contact',
}) {
  return (
    <section style={{
      backgroundColor: 'var(--color-dark)',
      padding: '6rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-coral)',
          margin: '0 0 1rem 0',
        }}>{label}</p>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: '700',
          color: '#ffffff',
          lineHeight: '1.2',
          margin: '0 0 1.5rem 0',
        }}>{heading}</h2>
        <p style={{
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: '300',
          margin: '0 0 2.5rem 0',
        }}>{body}</p>
        <Link href={buttonLink} style={{
          display: 'inline-block',
          padding: '1rem 2.5rem',
          background: 'var(--gradient-heading)',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '600',
          fontSize: '1rem',
        }}>{buttonText}</Link>
      </div>
    </section>
  )
}