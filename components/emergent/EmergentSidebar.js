'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DIMENSION_LETTERS } from './constants'

export default function EmergentSidebar({ dimensions, articles }) {
  const pathname = usePathname()
  const router = useRouter()

  // Track which dimension groups are expanded
  const [expanded, setExpanded] = useState({})

  // Auto-expand the active dimension on mount and path change
  useEffect(() => {
    const activeDim = dimensions.find(d =>
      pathname.includes(`/emergent-framework/${d.slug.current}`)
    )
    if (activeDim) {
      setExpanded(prev => ({ ...prev, [activeDim.slug.current]: true }))
    }
  }, [pathname, dimensions])

  function handleDimensionClick(slug) {
    const wasExpanded = expanded[slug]
    // Close all others, toggle the clicked one
    setExpanded({ [slug]: !wasExpanded })
    // Navigate if we're opening it
    if (!wasExpanded) {
      router.push(`/emergent-framework/${slug}`)
    }
  }

  const isOverviewActive = pathname === '/emergent-framework'

  return (
    <aside className="ew-sidebar">
      {/* Brand */}
      <div className="ew-sidebar-brand">
        <Link href="/emergent-framework">
          The EMERGENT Framework&#8480;
        </Link>
      </div>

      {/* Overview link */}
      <div className="ew-sidebar-label">Overview</div>
      <nav className="ew-sidebar-nav">
        <Link
          href="/emergent-framework"
          className={`ew-nav-item ${isOverviewActive ? 'active' : ''}`}
        >
          <span className="ew-nav-overview-icon">&#9673;</span>
          <span className="ew-nav-letter-divider" />
          <span className="ew-nav-dim-name">Explore the model</span>
        </Link>

        <div className="ew-sidebar-divider" />
        <div className="ew-sidebar-label" style={{ paddingLeft: '16px', paddingTop: '12px' }}>
          Eight dimensions
        </div>

        {/* Dimension groups */}
        {dimensions.map((dimension) => {
          const slug = dimension.slug.current
          const isExpanded = expanded[slug]
          const dimensionPath = `/emergent-framework/${slug}`
          const isActiveDimension = pathname.startsWith(dimensionPath)
          const dimensionArticles = articles[slug] || []
          const letter = dimension.letter || DIMENSION_LETTERS[slug] || dimension.title.charAt(0)

          return (
            <div
              key={dimension._id}
              className={`ew-nav-group ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Dimension heading - click expands AND navigates */}
              <button
                className={`ew-nav-item ${isActiveDimension ? 'active' : ''}`}
                onClick={() => handleDimensionClick(slug)}
              >
                <span
                  className="ew-nav-letter"
                  style={{ color: dimension.colour }}
                >
                  {letter}
                </span>
                <span className="ew-nav-letter-divider" />
                <span className="ew-nav-dim-name">{dimension.title}</span>
                {dimensionArticles.length > 0 && (
                  <span className="ew-nav-expand">&#9662;</span>
                )}
              </button>

              {/* Sub-items */}
              <div className="ew-nav-subitems">
                {/* Overview link */}
                <Link
                  href={dimensionPath}
                  className={`ew-nav-subitem ${pathname === dimensionPath ? 'active' : ''}`}
                  style={pathname === dimensionPath ? { borderLeftColor: dimension.colour } : undefined}
                >
                  Overview
                </Link>

                {/* Article links */}
                {dimensionArticles.map((article) => {
                  const articlePath = `${dimensionPath}/${article.slug.current}`
                  const isActive = pathname === articlePath

                  return (
                    <Link
                      key={article._id}
                      href={articlePath}
                      className={`ew-nav-subitem ${isActive ? 'active' : ''}`}
                      style={isActive ? { borderLeftColor: dimension.colour } : undefined}
                    >
                      {article.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="ew-sidebar-footer">
        The eight dimensions are interconnected. Strengthening one often shifts the others.
      </div>
    </aside>
  )
}