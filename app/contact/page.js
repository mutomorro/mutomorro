import ContactForm from '../../components/ContactForm'

export const metadata = {
  title: 'Get in touch',
  description: 'Start a conversation about what you are working on. We will listen, share how we see it, and explore whether we can help.',
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams
  const service = params?.service || null
  return (
    <main className="contact-page">

      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Get in touch</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px', margin: '0 0 32px' }}>
            Let's start with a conversation
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Every conversation starts with listening. Tell us what you're working on
            and we'll explore it together.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div className="contact-grid" style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 440px',
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
            <ContactForm service={service} />
          </div>

          {/* Right: sidebar */}
          <div className="scroll-in delay-1" style={{ paddingTop: '0.5rem' }}>

            {/* What happens next */}
            <div style={{
              marginBottom: '2.5rem',
            }}>
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '16px',
              }}>
                What happens next
              </span>
              <div className="body-small" style={{ color: 'rgba(0,0,0,0.6)' }}>
                <p style={{ margin: '0 0 1rem' }}>
                  Do get in touch, whatever the project. We work with all kinds of
                  organisations, on all sorts of challenges - and we'd genuinely
                  love to hear from you.
                </p>
                <p style={{ margin: 0 }}>
                  Let us know what you're thinking, and we'll come back to you
                  within a day or two. From there, we can arrange a conversation
                  to explore ideas and work out whether there's a good fit.
                </p>
              </div>
            </div>

            {/* LinkedIn */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '2rem',
              marginBottom: '2.5rem',
            }}>
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '8px',
              }}>
                Connect
              </span>
              <a
                href="https://www.linkedin.com/company/mutomorro/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link"
                style={{ fontSize: '17px' }}
              >
                LinkedIn
              </a>
            </div>

            {/* Location */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <div>
                <span className="kicker" style={{
                  color: 'rgba(0,0,0,0.4)',
                  marginBottom: '6px',
                  fontSize: '12px',
                }}>
                  London
                </span>
                <p className="body-small" style={{ color: 'rgba(0,0,0,0.6)', margin: 0 }}>
                  86-90 Paul Street<br />
                  London EC2A 4NE
                </p>
              </div>
              <div>
                <span className="kicker" style={{
                  color: 'rgba(0,0,0,0.4)',
                  marginBottom: '6px',
                  fontSize: '12px',
                }}>
                  Glasgow
                </span>
                <p className="body-small" style={{ color: 'rgba(0,0,0,0.6)', margin: 0 }}>
                  15 Candleriggs Square<br />
                  Glasgow G1 1TQ Scotland
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
