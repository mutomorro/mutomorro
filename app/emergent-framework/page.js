import Link from 'next/link'
import { getAllDimensions } from '../../sanity/client'
import { DIMENSION_LETTERS } from '../../components/emergent/constants'

export const metadata = {
  title: 'The EMERGENT Framework - Mutomorro',
  description: 'Eight dimensions of organisational health. A model for understanding how purpose, strategy, culture, capacity, and the way work gets done all shape each other.',
}

export default async function EmergentFramework() {
  const dimensions = await getAllDimensions()

  return (
    <main>

      {/* Header - light background, gradient title */}
      <div className="ew-overview-header">
        <div className="ew-overview-kicker">A model of organisational health</div>
        <h1 className="ew-overview-title">The EMERGENT Framework</h1>
      </div>

      {/* Two-column intro */}
      <div className="ew-overview-columns">
        <div className="ew-overview-text">
          <p>Every organisation is a living system. Not a machine with parts to optimise, but an ecosystem where purpose, strategy, culture, capacity, and the way work gets done all shape each other constantly.</p>
          <p>The EMERGENT Framework describes eight dimensions that together determine how healthy an organisation is and how well it can respond to whatever comes next.</p>

          <div className="ew-overview-pull-quote">
            These are not departments or initiatives. They are interconnected conditions. Strengthen one, and the others shift.
          </div>

          <p>The framework emerged from fifteen years of working with organisations navigating change - from 30-person charities to 80,000-person corporates. The same patterns kept appearing. Organisations that treated problems in isolation kept solving the same things in different forms. Organisations that understood how their parts connected made progress that lasted.</p>
        </div>

        {/* Ecosystem visual placeholder */}
        <div className="ew-overview-visual">
          <div className="ew-visual-placeholder">
            <div className="ew-visual-ring ew-visual-ring--outer" />
            <div className="ew-visual-ring ew-visual-ring--inner" />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-es)', top: '8%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-mw)', top: '18%', right: '12%' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-ev)', top: '45%', right: '2%' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-rp)', bottom: '18%', right: '12%' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-gc)', bottom: '8%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-ec)', bottom: '18%', left: '12%' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-nc)', top: '45%', left: '2%' }} />
            <div className="ew-visual-dot" style={{ background: 'var(--dim-tc)', top: '18%', left: '12%' }} />
            <div className="ew-visual-centre">
              Ecosystem visual<span>Canvas animation slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension list */}
      <div className="ew-overview-grid-label">Explore the eight dimensions</div>
      <div className="ew-overview-grid">
        {dimensions.map((dimension) => {
          const slug = dimension.slug.current
          const letter = dimension.letter || DIMENSION_LETTERS[slug] || dimension.title.charAt(0)

          return (
            <Link
              key={dimension._id}
              href={`/emergent-framework/${slug}`}
              className="ew-overview-card"
            >
              <div className="ew-card-letter-large" style={{ color: dimension.colour }}>
                {letter}
              </div>
              <div className="ew-card-divider" />
              <div className="ew-card-content">
                <div className="ew-card-left">
                  <div className="ew-card-name">{dimension.title}</div>
                  <div className="ew-card-tagline">{dimension.tagline}</div>
                </div>
                <div className="ew-card-summary">{dimension.shortSummary}</div>
              </div>
              <div className="ew-card-arrow">&rarr;</div>
            </Link>
          )
        })}
      </div>

    </main>
  )
}
