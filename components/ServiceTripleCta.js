'use client'

import { usePostHog } from 'posthog-js/react'

export default function ServiceTripleCta({ prompt, serviceTitle, heroHeading, slug, position }) {
  const posthog = usePostHog()
  const pdfFilename = heroHeading || `${serviceTitle} Consultancy`
  const pdfPath = `/downloads/${encodeURIComponent(`${pdfFilename} - Mutomorro.pdf`)}`

  function track(action) {
    posthog?.capture('service_cta_click', {
      action,
      service: serviceTitle,
      position,
    })
  }

  function handleNewsletterScroll() {
    track('newsletter_scroll')
    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="triple-cta">
      {prompt && <p className="triple-cta__prompt">{prompt}</p>}
      <div className="triple-cta__buttons">
        <a
          href={`/contact?service=${encodeURIComponent(serviceTitle)}`}
          className="triple-cta__btn triple-cta__btn--primary"
          onClick={() => track('contact')}
        >
          Talk to us
        </a>
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="triple-cta__btn triple-cta__btn--secondary"
          onClick={() => track('download_pdf')}
        >
          Download the overview
        </a>
        <button
          type="button"
          className="triple-cta__btn triple-cta__btn--tertiary"
          onClick={handleNewsletterScroll}
        >
          Stay in the loop
        </button>
      </div>
    </div>
  )
}

export function ServiceTripleCtaDark({ serviceTitle, heroHeading, slug, position }) {
  const posthog = usePostHog()
  const pdfFilename = heroHeading || `${serviceTitle} Consultancy`
  const pdfPath = `/downloads/${encodeURIComponent(`${pdfFilename} - Mutomorro.pdf`)}`

  function track(action) {
    posthog?.capture('service_cta_click', {
      action,
      service: serviceTitle,
      position,
    })
  }

  function handleNewsletterScroll() {
    track('newsletter_scroll')
    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="section--full dark-bg section-padding-cta" style={{
      background: 'radial-gradient(ellipse at 50% 120%, rgba(60,30,70,0.9) 0%, #221C2B 70%)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <span className="kicker" style={{ marginBottom: '20px' }}>Let&rsquo;s talk</span>
        <h2 className="heading-h2 heading-gradient" style={{ margin: '0 0 1.5rem' }}>
          Want to explore how this could work for your organisation?
        </h2>
        <p style={{
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: '300',
          margin: '0 0 2.5rem',
        }}>
          Every organisation is different, so we always start with a conversation. No pitch, no obligation — just an honest discussion about where you are and whether our approach feels right.
        </p>
        <div className="triple-cta__buttons triple-cta__buttons--dark">
          <a
            href={`/contact?service=${encodeURIComponent(serviceTitle)}`}
            className="triple-cta__btn triple-cta__btn--primary-dark"
            onClick={() => track('contact')}
          >
            Talk to us
          </a>
          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="triple-cta__btn triple-cta__btn--secondary-dark"
            onClick={() => track('download_pdf')}
          >
            Download the overview
          </a>
          <button
            type="button"
            className="triple-cta__btn triple-cta__btn--tertiary-dark"
            onClick={handleNewsletterScroll}
          >
            Stay in the loop
          </button>
        </div>
      </div>
    </section>
  )
}
