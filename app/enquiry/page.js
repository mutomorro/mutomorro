import ContactForm from '../../components/ContactForm'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export const metadata = {
  title: 'Work with us',
  description:
    "Tell us about your organisation and what you're trying to shift. We'll explore whether we're the right fit - no pitch, no obligation.",
  openGraph: {
    siteName: 'Mutomorro',
    locale: 'en_GB',
    url: 'https://mutomorro.com/enquiry',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

export default async function EnquiryPage({ searchParams }) {
  // Some CTAs carry the area the enquiry came from as ?service=<slug> (training,
  // develop, the housing sector callouts). ContactForm forwards it to
  // /api/contact and logs it to PostHog, so we know where the enquiry started
  // without surfacing it here. Future option: use `service` to tailor the hero
  // copy (consultancy / sector / training variants) instead of one neutral hero.
  const params = await searchParams
  const service = params?.service || null

  return (
    <main className="contact-page">

      {/* Hero */}
      <BackgroundPattern variant="network" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Work with us</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px', margin: '0 0 32px' }}>
            Tell us how we can help
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Our best work starts with understanding your context. Let&apos;s talk about where you
            are, where you want to get to, and how we might get there together.
          </p>
        </div>
      </BackgroundPattern>

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
              No pitch, no obligation - just an honest conversation about where you are
              and whether our approach feels right.
            </p>
            <ContactForm service={service} />
          </div>

          {/* Right: sidebar */}
          <div className="scroll-in delay-1" style={{ paddingTop: '0.5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="kicker" style={{
                color: 'rgba(0,0,0,0.4)',
                marginBottom: '16px',
              }}>
                What happens next
              </span>
              <div className="body-small" style={{ color: 'rgba(0,0,0,0.6)' }}>
                <p style={{ margin: '0 0 1rem' }}>
                  Tell us a little about your organisation and what you&apos;re hoping to shift.
                  We&apos;ll come back to you within a day or two.
                </p>
                <p style={{ margin: 0 }}>
                  From there we can arrange a conversation to explore ideas and work out
                  whether there&apos;s a good fit - and what working together might look like.
                </p>
              </div>
            </div>

            {/* Connect */}
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
                href="https://www.linkedin.com/company/mutomorro/"
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
