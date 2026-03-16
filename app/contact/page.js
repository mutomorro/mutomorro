import ContactForm from '../../components/ContactForm'

export const metadata = {
  title: 'Get in touch - Mutomorro',
  description: 'Every conversation starts with listening. Tell us what you\'re working on and we\'ll explore it together.',
}

export default function ContactPage() {
  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Get in touch</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>
            Let's start with a conversation
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Every conversation starts with listening. Tell us what you're working on
            and we'll explore it together.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '5rem',
          alignItems: 'start',
        }}>

          {/* Left: form */}
          <div className="scroll-in">
            <h2 className="heading-h3" style={{ margin: '0 0 12px' }}>
              What are you working on?
            </h2>
            <p className="lead-text" style={{
              margin: '0 0 2.5rem',
              maxWidth: '480px',
              fontSize: '18px',
            }}>
              No pitch, no obligation - just an honest discussion about
              where you are and whether our approach feels right.
            </p>
            <ContactForm />
          </div>

          {/* Right: sidebar */}
          <div className="scroll-in delay-1" style={{ paddingTop: '0.5rem' }}>

            {/* Direct email */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '8px',
              }}>
                Prefer email?
              </span>
              <a
                href="mailto:hello@mutomorro.com"
                className="inline-link"
                style={{ fontSize: '17px' }}
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
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '16px',
              }}>
                What to expect
              </span>
              <div className="body-small" style={{ color: 'rgba(0,0,0,0.6)' }}>
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
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '8px',
              }}>
                Connect
              </span>
              <a
                href="https://www.linkedin.com/in/jamesfreemanuk/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link"
                style={{ fontSize: '17px' }}
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
