'use client'

import { usePostHog } from 'posthog-js/react'
import { pdfPathFor } from '../ServiceTripleCta'

// Quiet PDF offer at the end of the Approach section (Wave 2) - the
// board/committee moment for a reader who's just consumed the depth and isn't
// ready to call. Low-commitment, forwardable. Shares the per-service PDF path +
// the service_cta_click tracking with the two-CTA blocks (position: after-approach).
export default function ApproachPdfOffer({ serviceTitle }) {
  const posthog = usePostHog()
  if (!serviceTitle) return null
  const pdfPath = pdfPathFor(serviceTitle)

  return (
    <a
      href={pdfPath}
      target="_blank"
      rel="noopener noreferrer"
      className="pdf-offer"
      onClick={() =>
        posthog?.capture('service_cta_click', {
          action: 'download_pdf',
          service: serviceTitle,
          position: 'after-approach',
        })
      }
    >
      <span className="pdf-offer__icon" aria-hidden="true">📄</span>
      <span className="pdf-offer__text">
        <span className="pdf-offer__title">Prefer the detail on paper?</span>
        <span className="pdf-offer__sub">
          Download the {serviceTitle} overview - a 4-page PDF to share or take to your board.
        </span>
      </span>
      <span className="pdf-offer__action">Download the overview</span>
    </a>
  )
}
