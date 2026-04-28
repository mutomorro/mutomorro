'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import SovGatedModal from './SovGatedModal'

// Lazy-load the forms - only ship the JS once a CTA is opened
const SovOverviewForm = dynamic(() => import('./SovOverviewForm'), { ssr: false })
const SovQuoteForm = dynamic(() => import('./SovQuoteForm'), { ssr: false })

/**
 * The three SoV CTAs. The "Watch the walkthrough" button is intentionally
 * omitted for V1 (video not ready). The grid is sized to comfortably hold a
 * third button when it returns - flip `showWalkthrough` to true.
 *
 * Variants:
 *  - 'dark'   : on dark sections (white outlined buttons + primary)
 *  - 'light'  : on light sections (default primary + secondary)
 *  - 'inline' : compact inline layout for mid-page placement
 */
export default function SovCtaButtons({ variant = 'light', align = 'left', showWalkthrough = false }) {
  const [open, setOpen] = useState(null) // 'overview' | 'quote' | null

  const wrapperClass = `sov-cta-cluster sov-cta-cluster--${variant} sov-cta-cluster--${align}`
  const primaryClass =
    variant === 'dark'
      ? 'btn-primary btn-primary--dark sov-cta-btn'
      : 'btn-primary sov-cta-btn'
  const secondaryClass =
    variant === 'dark'
      ? 'btn-sec btn-sec--dark sov-cta-btn'
      : 'btn-sec sov-cta-btn'

  return (
    <>
      <div className={wrapperClass}>
        <button
          type="button"
          className={primaryClass}
          onClick={() => setOpen('quote')}
        >
          Get a quote
        </button>
        <button
          type="button"
          className={secondaryClass}
          onClick={() => setOpen('overview')}
        >
          Download the overview
        </button>
        {showWalkthrough && (
          <button
            type="button"
            className={secondaryClass}
            onClick={() => { /* hook up Loom URL when ready */ }}
          >
            Watch the walkthrough
          </button>
        )}
      </div>

      <SovGatedModal
        open={open === 'overview'}
        onClose={() => setOpen(null)}
        title="Download the States of Vitality overview"
      >
        <SovOverviewForm />
      </SovGatedModal>

      <SovGatedModal
        open={open === 'quote'}
        onClose={() => setOpen(null)}
        title="Request a States of Vitality quote"
      >
        <SovQuoteForm />
      </SovGatedModal>
    </>
  )
}
