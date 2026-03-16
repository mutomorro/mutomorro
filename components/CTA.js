import Link from 'next/link'

export default function CTA({
  label = 'Let\'s talk',
  heading = 'Ready to think differently about your organisation?',
  body = 'Whether you\'re diagnosing root causes, redesigning for the future, or building on what already works well - we\'d love to hear about your organisation.',
  buttonText = 'Talk to us',
  buttonLink = '/contact',
  secondaryText,
  secondaryLink,
}) {
  return (
    <section className="section--full dark-bg" style={{
      padding: '7rem 48px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <span className="kicker" style={{ marginBottom: '20px' }}>{label}</span>
        <h2 className="heading-h2" style={{
          color: '#ffffff',
          margin: '0 0 1.5rem',
        }}>{heading}</h2>
        <p style={{
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: '300',
          margin: '0 0 2.5rem',
        }}>{body}</p>
        <div className="button-row" style={{ justifyContent: 'center' }}>
          <Link href={buttonLink} className="btn-primary btn-primary--dark btn-primary--lg">
            {buttonText}
          </Link>
          {secondaryText && secondaryLink && (
            <Link href={secondaryLink} className="btn-sec btn-sec--dark">
              {secondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
