import { getPageCallouts } from '../sanity/client'

const DEFAULT_ACCENT = '#9B51E0'

function hexToRgba(hex, alpha) {
  let h = (hex || DEFAULT_ACCENT).replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Server component. Renders a compact teaser strip near the top of a page
// for any callouts that have showTeaser=true and a teaserText. The full
// callout still renders separately via PageCallouts. Returns nothing if
// no callouts qualify.
export default async function CalloutTeaser({ pageType, pageId }) {
  const callouts = await getPageCallouts(pageType, pageId)
  if (!callouts || callouts.length === 0) return null

  const teasers = callouts.filter(
    (c) => c.showTeaser && c.teaserText && c.teaserText.trim()
  )
  if (teasers.length === 0) return null

  return (
    <>
      {teasers.map((callout) => (
        <Teaser key={callout._id} callout={callout} />
      ))}
    </>
  )
}

function Teaser({ callout }) {
  const { _id, teaserText, accentColor } = callout
  const accent = accentColor || DEFAULT_ACCENT
  const tint = hexToRgba(accent, 0.09)

  return (
    <section
      className="section--full callout-teaser"
      style={{
        background: tint,
        borderLeft: `4px solid ${accent}`,
      }}
      aria-label="Page teaser"
    >
      <div className="callout-teaser__inner">
        <p className="callout-teaser__text">
          {teaserText}
          {' '}
          <a
            href={`#callout-${_id}`}
            className="callout-teaser__link"
            style={{
              color: accent,
              backgroundImage: `linear-gradient(${accent}, ${accent})`,
            }}
          >
            See below <span aria-hidden="true">↓</span>
          </a>
        </p>
      </div>
    </section>
  )
}
