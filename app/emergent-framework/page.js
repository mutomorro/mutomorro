import DimensionExplorer from '../../components/DimensionExplorer'
import { getFrameworkOverview } from '../../sanity/client'
import { PortableText } from '@portabletext/react'

export const metadata = {
  title: 'The EMERGENT Framework - Mutomorro',
  description: 'Eight dimensions of organisational health. A model for understanding how purpose, strategy, culture, capacity, and the way work gets done all shape each other.',
}

export default async function EmergentFramework() {
  const overview = await getFrameworkOverview()

  return (
    <main>

      <div className="de-page-container">

        {/* Header */}
        <div className="de-overview-kicker">{overview?.subtitle || 'A model of organisational health'}</div>
        <h1 className="de-overview-title">{overview?.title || 'The EMERGENT Framework'}</h1>

        {/* Short intro */}
        <div className="de-overview-intro">
          {overview?.body ? (
            <PortableText value={overview.body} />
          ) : (
            <>
              <p>Every organisation is a living system - not a machine with parts to optimise, but an ecosystem where purpose, strategy, culture, capacity, and the way work gets done all shape each other constantly.</p>
              <p>The EMERGENT Framework describes eight interconnected dimensions that together determine how healthy an organisation is. Explore each one below.</p>
            </>
          )}
        </div>

        {/* Tabbed dimension explorer */}
        <DimensionExplorer />

        {/* Footer note */}
        <div className="de-footer-note">
          These eight dimensions are interconnected. They form an ecosystem where health along each one influences all the others. The real power comes from the connections, not the individual dimensions.
        </div>

      </div>

    </main>
  )
}
