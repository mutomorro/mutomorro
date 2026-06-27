'use client'

import posthog from 'posthog-js'

// Ungated resource download (e.g. the monthly newsletter PDF). Mirrors the
// `resource_download` event that ResourceDownloadForm fires, but with
// gated:false - so free and gated downloads are countable together AND apart.
// Before this, free downloads were a plain <a download> that fired nothing,
// which is why resource_download looked tiny (it only ever counted gated ones).
//
// The click fires the event then lets the browser download; a download isn't a
// navigation, so the page stays put and the event lands reliably.
export default function FreeDownload({ resourceTitle, downloadUrl, downloadFileName, downloadButtonLabel, resourceType }) {
  const typeLabels = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }
  const typeLabel = typeLabels[resourceType] || 'Resource'
  const buttonText = downloadButtonLabel || `Download the ${typeLabel.toLowerCase()}`
  const href = downloadUrl + '?dl=' + (downloadFileName ? encodeURIComponent(downloadFileName) : '')

  const track = () => {
    posthog?.capture('resource_download', { resource_name: resourceTitle, gated: false })
  }

  return (
    <div className="resource-download-panel">
      <span className="kicker resource-download-panel__kicker">Free download</span>
      <p className="resource-download-panel__lead">
        The full {typeLabel.toLowerCase()}, as a PDF - yours to keep. No sign-up, no email.
      </p>
      <a href={href} download className="btn-primary resource-download-panel__btn" onClick={track}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {buttonText}
      </a>
      <p className="resource-download-panel__meta">PDF · Free · No email required</p>
    </div>
  )
}
