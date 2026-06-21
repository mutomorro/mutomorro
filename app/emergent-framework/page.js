import DimensionExplorer from '../../components/DimensionExplorer'
import { buildMetadata } from '@/lib/seo'
import { getFrameworkOverview } from '../../sanity/client'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../../sanity/image'
import ContentTable from '../../components/ContentTable'
import ContentAccordion from '../../components/ContentAccordion'
import ContentTabs from '../../components/ContentTabs'

const FALLBACK_TITLE = 'The EMERGENT Framework - eight dimensions of organisational health'
const FALLBACK_DESCRIPTION =
  'A model for understanding what makes organisations thrive. Eight interconnected dimensions covering strategy, culture, purpose, capacity, and more.'

export async function generateMetadata() {
  const overview = await getFrameworkOverview()
  return buildMetadata({
    title: overview?.seoTitle || FALLBACK_TITLE,
    description: overview?.seoDescription || FALLBACK_DESCRIPTION,
    path: '/emergent-framework',
  })
}

export default async function EmergentFramework() {
  const overview = await getFrameworkOverview()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: overview?.title || 'The EMERGENT Framework',
    description:
      'A model for understanding what makes organisations thrive. Eight interconnected dimensions covering strategy, culture, purpose, capacity, and more.',
    url: 'https://mutomorro.com/emergent-framework',
    publisher: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
  }

  const overviewComponents = {
    types: {
      image: ({ value }) => (
        <div style={{ margin: '2rem 0' }}>
          <Image
            src={urlFor(value).width(700).url()}
            alt={value.alt || ''}
            width={700}
            height={394}
            sizes="(max-width: 768px) 100vw, 700px"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ),
      table: ({ value }) => <ContentTable value={value} />,
      accordion: ({ value }) => <ContentAccordion value={value} />,
      tabs: ({ value }) => <ContentTabs value={value} />,
    },
    marks: {
      link: ({ value, children }) => <a href={value.href}>{children}</a>,
    },
    block: {
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="de-page-container">

        {/* Header */}
        <div className="de-overview-kicker">{overview?.subtitle || 'A model of organisational health'}</div>
        <h1 className="de-overview-title">{overview?.title || 'The EMERGENT Framework'}</h1>

        {/* Short intro */}
        <div className="de-overview-intro">
          {overview?.body ? (
            <PortableText value={overview.body} components={overviewComponents} />
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
