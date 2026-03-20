'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useMemo, useCallback, Suspense } from 'react'

function ServiceFilterInner({ items, renderCard, gridClass = 'grid-3', contentType = 'items' }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialFilter = searchParams.get('service') || 'all'
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  // Extract unique services from items
  const services = useMemo(() => {
    const serviceMap = new Map()
    items.forEach(item => {
      if (item.relatedServices) {
        item.relatedServices.forEach(s => {
          if (s && s.title && s.slug) {
            serviceMap.set(s.slug, s.title)
          }
        })
      }
    })
    return Array.from(serviceMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter(item =>
      item.relatedServices?.some(s => s.slug === activeFilter)
    )
  }, [items, activeFilter])

  const handleFilter = useCallback((slug) => {
    setActiveFilter(slug)
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') {
      params.delete('service')
    } else {
      params.set('service', slug)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [searchParams, router, pathname])

  return (
    <>
      {services.length > 0 && (
        <div className="filter-pills">
          <button
            className={`filter-pill${activeFilter === 'all' ? ' filter-pill--active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            All
          </button>
          {services.map(([slug, title]) => (
            <button
              key={slug}
              className={`filter-pill${activeFilter === slug ? ' filter-pill--active' : ''}`}
              onClick={() => handleFilter(slug)}
            >
              {title}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="body-text" style={{ color: 'rgba(0,0,0,0.4)', marginBottom: '16px' }}>
            No {contentType} found for this service.
          </p>
          <button
            className="filter-pill"
            onClick={() => handleFilter('all')}
            style={{ color: 'var(--accent)' }}
          >
            Show all {contentType}
          </button>
        </div>
      ) : (
        <div className={gridClass}>
          {filteredItems.map((item, index) => (
            <div
              key={item._id}
              className="filter-fade-in"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {renderCard(item, index)}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function ServiceFilter(props) {
  return (
    <Suspense>
      <ServiceFilterInner {...props} />
    </Suspense>
  )
}
