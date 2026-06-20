import Link from 'next/link'

// Where-to-start on-ramp (Wave 2 - Batch 3; per-service explainer added Jun 2026).
// Renders a short framing block - kicker + varied H2 + explainer - and, for the
// services that have sub-pages, the sub-page cards beneath it. H2 + explainer come
// from Sanity (whereToStartHeading / whereToStartIntro); when the H2 is blank it
// falls back to an auto heading derived from the sub-page count. Renders nothing
// when there's no copy AND no sub-pages, so the section self-hides cleanly.

const CARD_GLYPHS = ['◎', '▷', '◇', '✦']
const NUMBER_WORDS = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four' }

export default function WhereToStart({ heading, intro, subPages = [], serviceSlug }) {
  const count = subPages.length
  if (!heading && !intro && !count) return null

  const derivedHeading = count
    ? count === 1
      ? 'A focused way in'
      : `${NUMBER_WORDS[count] || count} ways in`
    : null
  const h2 = heading || derivedHeading

  return (
    <section
      id="start"
      className="section--full section-padding"
      style={{ background: 'var(--warm)' }}
    >
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        <div className="scroll-in" style={{ marginBottom: count ? '2.5rem' : 0 }}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
            Where to start
          </span>
          {h2 && <h2 className="heading-h2" style={{ margin: 0 }}>{h2}</h2>}
          {intro && (
            <p className="lead-text" style={{ maxWidth: '760px', margin: '1.25rem 0 0' }}>
              {intro}
            </p>
          )}
        </div>

        {count > 0 && (
          <div className={`start-grid start-grid--${count === 1 ? 'one' : 'multi'}`}>
            {subPages.map((sp, i) => (
              <Link
                key={sp.slug}
                href={`/services/${serviceSlug}/${sp.slug}`}
                className="start-card scroll-in"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="start-card__icon" aria-hidden="true">
                  {CARD_GLYPHS[i % CARD_GLYPHS.length]}
                </span>
                <h3 className="start-card__title">{sp.title}</h3>
                {sp.heroTagline && (
                  <p className="start-card__blurb">{sp.heroTagline}</p>
                )}
                <span className="start-card__go">
                  Explore <span className="arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
