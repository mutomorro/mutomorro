import Link from 'next/link'

export default function SectionNavFooter({ prevArticle, nextArticle, dimensionSlug, dimensionColour }) {
  return (
    <nav className="scroll-in" style={{
      marginTop: '4rem',
      paddingTop: '3rem',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '2rem',
    }}>
      {/* Previous */}
      <div style={{ flex: 1 }}>
        {prevArticle && (
          <Link
            href={`/emergent-framework/${dimensionSlug}/${prevArticle.slug.current}`}
            className="btn-sec"
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            ← {prevArticle.title}
          </Link>
        )}
      </div>

      {/* Next */}
      <div style={{ flex: 1, textAlign: 'right' }}>
        {nextArticle && (
          <Link
            href={`/emergent-framework/${dimensionSlug}/${nextArticle.slug.current}`}
            className="btn-sec"
            style={{ textAlign: 'right', justifyContent: 'flex-end' }}
          >
            {nextArticle.title} →
          </Link>
        )}
      </div>
    </nav>
  )
}
