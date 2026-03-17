import Link from 'next/link'

export default function SectionNavFooter({ prevArticle, nextArticle, dimensionSlug }) {
  return (
    <nav className="ew-section-nav-footer">
      {/* Previous */}
      {prevArticle ? (
        <Link
          href={`/emergent-framework/${dimensionSlug}/${prevArticle.slug.current}`}
          className="ew-section-nav-btn"
        >
          <span>&larr;</span> {prevArticle.title}
        </Link>
      ) : (
        <Link
          href={`/emergent-framework/${dimensionSlug}`}
          className="ew-section-nav-btn"
        >
          <span>&larr;</span> Back to overview
        </Link>
      )}

      {/* Next */}
      {nextArticle ? (
        <Link
          href={`/emergent-framework/${dimensionSlug}/${nextArticle.slug.current}`}
          className="ew-section-nav-btn"
        >
          {nextArticle.title} <span>&rarr;</span>
        </Link>
      ) : (
        <Link
          href="/emergent-framework"
          className="ew-section-nav-btn"
        >
          Back to the model <span>&rarr;</span>
        </Link>
      )}
    </nav>
  )
}
