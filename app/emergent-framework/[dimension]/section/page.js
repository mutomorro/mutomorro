import { PortableText } from '@portabletext/react'
import { getDimensionArticle, getDimension } from '../../../../sanity/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SectionNavFooter from '../../../../components/emergent/SectionNavFooter'
import { SECTION_ORDER, DIMENSION_LETTERS } from '../../../../components/emergent/constants'

// ============================================
// SEO METADATA
// ============================================

export async function generateMetadata({ params }) {
  const { dimension, section } = await params
  const article = await getDimensionArticle(dimension, section)
  if (!article) return {}

  const dimTitle = article.dimension?.title || dimension
  return {
    title: `${article.title} - ${dimTitle} - EMERGENT Framework - Mutomorro`,
    description: `${article.title} for the ${dimTitle} dimension of the EMERGENT Framework.`,
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function DimensionSectionPage({ params }) {
  const { dimension, section } = await params

  // Fetch article content and parent dimension in parallel
  const [article, dim] = await Promise.all([
    getDimensionArticle(dimension, section),
    getDimension(dimension),
  ])

  if (!article || !dim) notFound()

  // Get dimension colour for accent styling
  const dimColour = dim.colour || 'var(--color-accent)'
  const dimTitle = dim.title
  const letter = DIMENSION_LETTERS[dimension] || dimTitle.charAt(0)

  // Find section label for the breadcrumb
  const sectionInfo = SECTION_ORDER.find(s => s.slug === section)
  const sectionLabel = sectionInfo?.label || article.title

  return (
    <div style={{ '--active-dim': dimColour }}>

      {/* ==========================================
          HERO
          ========================================== */}
      <div style={{
        padding: '48px 72px 40px',
        maxWidth: '800px',
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/emergent-framework"
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--color-accent)',
              textDecoration: 'none',
            }}
          >
            EMERGENT Framework
          </Link>
          <span style={{ color: 'rgba(34,28,43,0.25)', fontSize: '13px' }}>›</span>
          <Link
            href={`/emergent-framework/${dimension}/what-it-means`}
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: dimColour,
              textDecoration: 'none',
            }}
          >
            {dimTitle}
          </Link>
          <span style={{ color: 'rgba(34,28,43,0.25)', fontSize: '13px' }}>›</span>
          <span style={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(34,28,43,0.45)',
          }}>
            {sectionLabel}
          </span>
        </div>

        {/* Kicker */}
        <div style={{
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: dimColour,
          marginBottom: '12px',
        }}>
          Dimension {letter} - {dimTitle}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: '#221C2B',
          margin: '0 0 12px',
        }}>
          {article.title}
        </h1>

        {/* Tagline - only on first section */}
        {section === 'what-it-means' && dim.tagline && (
          <p style={{
            fontSize: '20px',
            fontWeight: 300,
            lineHeight: 1.5,
            color: 'rgba(34,28,43,0.55)',
            margin: '0 0 8px',
          }}>
            {dim.tagline}
          </p>
        )}

        {/* Lens question - only on first section */}
        {section === 'what-it-means' && dim.lensQuestion && (
          <p style={{
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'rgba(34,28,43,0.4)',
            fontStyle: 'italic',
            margin: '16px 0 0',
            borderLeft: `3px solid ${dimColour}`,
            paddingLeft: '20px',
          }}>
            {dim.lensQuestion}
          </p>
        )}
      </div>

      {/* ==========================================
          BODY CONTENT
          ========================================== */}
      <div style={{
        padding: '0 72px 40px',
        maxWidth: '800px',
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 300,
          lineHeight: 1.75,
          color: '#221C2B',
        }}>
          <PortableText value={article.body} />
        </div>
      </div>

      {/* ==========================================
          PREV / NEXT NAVIGATION
          ========================================== */}
      <SectionNavFooter
        dimensionSlug={dimension}
        currentSectionSlug={section}
        dimensionColour={dimColour}
      />
    </div>
  )
}