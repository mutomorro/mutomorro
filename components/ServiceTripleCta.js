'use client'

import { usePostHog } from 'posthog-js/react'

// PDF assets in public/downloads are named by service title, not heroHeading
// (which is a marketing headline). e.g. "Culture Change Consultancy - Mutomorro.pdf".
function pdfPathFor(serviceTitle) {
  return `/downloads/${encodeURIComponent(`${serviceTitle} Consultancy - Mutomorro.pdf`)}`
}

// Two real CTAs everywhere: "Talk to us" (the goal page, /enquiry) and
// "Download the overview" (the low-commitment, forwardable per-service PDF).
// Newsletter lives in the footer, so it is no longer an inline CTA.
export default function ServiceTripleCta({ prompt, serviceTitle, position }) {
  const posthog = usePostHog()
  const pdfPath = pdfPathFor(serviceTitle)

  function track(action) {
    posthog?.capture('service_cta_click', { action, service: serviceTitle, position })
  }

  return (
    <div className="triple-cta">
      {prompt && <p className="triple-cta__prompt">{prompt}</p>}
      <div className="triple-cta__buttons">
        <a
          href="/enquiry"
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
      </div>
    </div>
  )
}

export function ServiceTripleCtaDark({ serviceTitle, position }) {
  const posthog = usePostHog()
  const pdfPath = pdfPathFor(serviceTitle)

  function track(action) {
    posthog?.capture('service_cta_click', { action, service: serviceTitle, position })
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
            href="/enquiry"
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
        </div>
      </div>
    </section>
  )
}
