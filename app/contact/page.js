import ContactForm from '../../components/ContactForm'

export const metadata = {
  title: 'Get in touch - Mutomorro',
  description: 'Every conversation starts with listening. Tell us what you\'re working on and we\'ll explore it together.',
}

export default function ContactPage() {
  return (
    <main>

      {/* ==========================================
          HERO (dark)
          ========================================== */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ margin: '0 0 1rem' }}>
            Get in touch
          </p>
          <h1
            className="heading-gradient heading-display"
            style={{ margin: '0 0 1.5rem', maxWidth: '680px' }}
          >
            Let's start with a conversation
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '600px' }}>
            Every conversation starts with listening. Tell us what you're working on
            and we'll explore it together.
          </p>
        </div>
      </section>

      {/* ==========================================
          FORM (white)
          ========================================== */}
      <section className="section section--white">
        <div className="wrap" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '5rem',
          alignItems: 'start',
        }}>

          {/* Left: form */}
          <div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '400',
              lineHeight: '1.2',
              margin: '0 0 0.75rem',
            }}>
              What are you working on?
            </h2>
            <p style={{
              fontSize: '1.125rem',
              fontWeight: '300',
              lineHeight: '1.6',
              color: 'rgba(0,0,0,0.55)',
              margin: '0 0 2.5rem',
              maxWidth: '480px',
            }}>
              No pitch, no obligation - just an honest discussion about
              where you are and whether our approach feels right.
            </p>
            <ContactForm />
          </div>

          {/* Right: sidebar */}
          <div style={{ paddingTop: '0.5rem' }}>

            {/* Direct email */}
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.5)',
                margin: '0 0 0.5rem',
              }}>
                Prefer email?
              </p>
              <a
                href="mailto:hello@mutomorro.com"
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: '400',
                  color: 'var(--color-accent, #9B51E0)',
                  textDecoration: 'none',
                }}
              >
                hello@mutomorro.com
              </a>
            </div>

            {/* What to expect */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '2rem',
              marginBottom: '2.5rem',
            }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.5)',
                margin: '0 0 1rem',
              }}>
                What to expect
              </p>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: '300',
                lineHeight: '1.7',
                color: 'rgba(0,0,0,0.6)',
              }}>
                <p style={{ margin: '0 0 1rem' }}>
                  I'll reply within 48 hours, usually sooner.
                </p>
                <p style={{ margin: '0 0 1rem' }}>
                  If it sounds like there's something worth exploring, I'll suggest a
                  30-minute conversation - no preparation needed on your side.
                </p>
                <p style={{ margin: 0 }}>
                  If I'm not the right fit for what you need, I'll say so honestly
                  and point you toward someone who is.
                </p>
              </div>
            </div>

            {/* LinkedIn */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '2rem',
            }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.5)',
                margin: '0 0 0.5rem',
              }}>
                Connect
              </p>
              <a
                href="https://www.linkedin.com/in/jamesfreemanuk/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: '400',
                  color: 'var(--color-accent, #9B51E0)',
                  textDecoration: 'none',
                }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}