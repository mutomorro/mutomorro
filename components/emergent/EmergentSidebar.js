'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function EmergentSidebar({ dimensions, articles }) {
  const pathname = usePathname()

  // Track which dimension groups are expanded
  const [expanded, setExpanded] = useState(() => {
    // Auto-expand the dimension the user is currently viewing
    const currentDim = dimensions.find(d =>
      pathname.includes(`/emergent-framework/${d.slug.current}`)
    )
    if (currentDim) return { [currentDim._id]: true }
    return {}
  })

  function toggleGroup(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside style={{
      width: '280px',
      flexShrink: 0,
      position: 'sticky',
      top: '70px',
      height: 'calc(100vh - 70px)',
      overflowY: 'auto',
      background: 'var(--dark)',
      padding: '2rem 0',
    }}>
      {/* Sidebar header */}
      <div style={{ padding: '0 24px', marginBottom: '2rem' }}>
        <Link
          href="/emergent-framework"
          style={{
            fontSize: '13px',
            fontWeight: '400',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: pathname === '/emergent-framework'
              ? '#fff'
              : 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
        >
          EMERGENT Framework
        </Link>
      </div>

      {/* Dimension groups */}
      <nav>
        {dimensions.map((dimension) => {
          const isExpanded = expanded[dimension._id]
          const dimensionPath = `/emergent-framework/${dimension.slug.current}`
          const isActiveDimension = pathname.startsWith(dimensionPath)
          const dimensionArticles = articles[dimension.slug.current] || []

          return (
            <div key={dimension._id} style={{ marginBottom: '4px' }}>
              {/* Dimension heading - clickable to expand/collapse */}
              <button
                onClick={() => toggleGroup(dimension._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                {/* Active indicator */}
                <span style={{
                  width: '3px',
                  height: '16px',
                  background: isActiveDimension ? dimension.colour : 'transparent',
                  borderRadius: '1px',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }} />

                {/* Dimension name */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: isActiveDimension ? '400' : '300',
                  color: isActiveDimension ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'color 0.2s',
                  flex: 1,
                }}>
                  {dimension.anchor}
                </span>

                {/* Expand/collapse arrow */}
                {dimensionArticles.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}>
                    ▶
                  </span>
                )}
              </button>

              {/* Articles within this dimension */}
              {isExpanded && dimensionArticles.length > 0 && (
                <div style={{ paddingBottom: '8px' }}>
                  {/* Dimension overview link */}
                  <Link
                    href={dimensionPath}
                    style={{
                      display: 'block',
                      padding: '6px 24px 6px 47px',
                      fontSize: '14px',
                      fontWeight: '300',
                      color: pathname === dimensionPath
                        ? '#fff'
                        : 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      borderLeft: pathname === dimensionPath
                        ? `2px solid var(--accent)`
                        : '2px solid transparent',
                    }}
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
                        style={{
                          display: 'block',
                          padding: '6px 24px 6px 47px',
                          fontSize: '14px',
                          fontWeight: '300',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                          textDecoration: 'none',
                          transition: 'color 0.15s',
                          borderLeft: isActive
                            ? `2px solid var(--accent)`
                            : '2px solid transparent',
                        }}
                      >
                        {article.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
