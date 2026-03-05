import Link from 'next/link'

export default function CTA({
  label = 'Let\'s talk',
  heading = 'Ready to think differently about your organisation?',
  body = 'Whether you\'re diagnosing root causes, redesigning for the future, or building on what already works well - we\'d love to hear about your organisation.',
  buttonText = 'Talk to us',
  buttonLink = '/contact',
}) {
  return (
    <section style={{
      backgroundColor: 'var(--color-dark)',
      padding: '7rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <p className="label label--light" style={{ marginBottom: '1.5rem' }}>{label}</p>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: '400',
          color: '#ffffff',
          lineHeight: '1.2',
          margin: '0 0 1.5rem 0',
        }}>{heading}</h2>
        <p style={{
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: '300',
          margin: '0 0 2.5rem 0',
        }}>{body}</p>
        <Link href={buttonLink} className="btn btn--gradient">{buttonText}</Link>
      </div>
    </section>
  )
}