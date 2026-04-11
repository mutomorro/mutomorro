import Link from 'next/link'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export default function CTA({
  label = 'Let\'s talk',
  heading = 'Interested in working together?',
  body = 'Whether you\'re navigating a big change, rethinking how things work, or building on what\'s already good - we\'d love to hear from you.',
  buttonText = 'Talk to us',
  buttonLink = '/contact',
  secondaryText,
  secondaryLink,
}) {
  return (
    <BackgroundPattern variant="network" className="section--full dark-bg section-padding-cta" style={{
      textAlign: 'center',
      background: 'radial-gradient(ellipse at 50% 120%, rgba(60,30,70,0.9) 0%, #221C2B 70%)',
    }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative' }}>
        <span className="kicker" style={{ marginBottom: '20px' }}>{label}</span>
        <h2 className="heading-h2 heading-gradient" style={{
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
    </BackgroundPattern>
  )
}
