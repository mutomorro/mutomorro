import Link from 'next/link'

// Where-to-start on-ramp (Wave 2 - Batch 3). A first-class home for a service's
// sub-pages: the dedicated half of the "Both" sub-page IA, alongside the
// sticky-nav jump links and the inline connector cards in Approach. Renders
// nothing when the service has no sub-pages (11 of 14 services), so the whole
// section simply disappears - no empty state.

const CARD_GLYPHS = ['◎', '▷', '◇', '✦']
const NUMBER_WORDS = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four' }

export default function WhereToStart({ subPages = [], serviceSlug }) {
  if (!subPages.length) return null

  const count = subPages.length
  const heading =
    count === 1 ? 'A focused way in' : `${NUMBER_WORDS[count] || count} ways in`

  return (
    <section
      id="start"
      className="section--full section-padding"
      style={{ background: 'var(--warm)' }}
    >
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        <div className="scroll-in" style={{ marginBottom: '2.5rem' }}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
            Where to start
          </span>
          <h2 className="heading-h2" style={{ margin: 0 }}>{heading}</h2>
        </div>

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
      </div>
    </section>
  )
}
