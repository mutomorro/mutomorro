const PRODUCT_SITE_URL = 'https://statesofvitality.com'

/**
 * The single bridge-page CTA. This page's job is to build understanding and
 * hand off cleanly to the product site, so there is exactly one action:
 * "Explore States of Vitality →" linking to statesofvitality.com.
 *
 * All three placements (hero, mid-page, final) sit on dark sections, so this
 * uses the dark primary button style. `align="center"` is used in the final
 * section; everything else is left-aligned.
 */
export default function SovExploreCta({ align = 'left' }) {
  const wrapperClass = `sov-cta-cluster${align === 'center' ? ' sov-cta-cluster--center' : ''}`
  return (
    <div className={wrapperClass}>
      <a
        href={PRODUCT_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary btn-primary--dark sov-cta-btn"
      >
        Explore States of Vitality →
      </a>
    </div>
  )
}
