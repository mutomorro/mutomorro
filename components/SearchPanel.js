'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import NavPanel from './NavPanel'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'shortSummary', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

// Order results by type so they group visually.
const TYPE_ORDER = ['Tool', 'Article', 'Service', 'Case study', 'Course', 'Dimension', 'Resource']

export default function SearchPanel({ isOpen, instantClose, onClose }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Lazy-load the index the first time the panel opens.
  useEffect(() => {
    if (!isOpen || index) return
    setLoading(true)
    fetch('/api/search-index')
      .then(r => r.json())
      .then(data => {
        setIndex(new Fuse(data.items || [], FUSE_OPTIONS))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, index])

  // Focus the input when the panel opens, clear on close.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 250)
      return () => clearTimeout(t)
    } else {
      setQuery('')
    }
  }, [isOpen])

  const results = useMemo(() => {
    if (!index || query.trim().length < 2) return []
    const matches = index.search(query.trim()).slice(0, 20).map(r => r.item)
    // Group by type while preserving relevance order within each group.
    const grouped = {}
    matches.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = []
      grouped[item.type].push(item)
    })
    return TYPE_ORDER
      .filter(t => grouped[t])
      .map(t => ({ type: t, items: grouped[t] }))
  }, [index, query])

  return (
    <NavPanel isOpen={isOpen} instantClose={instantClose} onClose={onClose}>
      <div className="search-panel">
        <label className="search-panel__field nav-panel-stagger">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="6" />
            <line x1="13.5" y1="13.5" x2="17" y2="17" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, articles, services…"
            className="search-panel__input"
            autoComplete="off"
          />
        </label>

        <div className="search-panel__results nav-panel-stagger">
          {!query && (
            <p className="search-panel__hint">
              Type to search across articles, tools, services, case studies, courses and resources.
            </p>
          )}
          {query && query.trim().length < 2 && (
            <p className="search-panel__hint">Keep typing…</p>
          )}
          {query.trim().length >= 2 && loading && (
            <p className="search-panel__hint">Loading…</p>
          )}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="search-panel__hint">No matches for "{query}".</p>
          )}
          {results.map(group => (
            <div key={group.type} className="search-panel__group">
              <span className="kicker search-panel__group-label">{group.type}</span>
              {group.items.map(item => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  onClick={onClose}
                  className="nav-contents-row"
                >
                  <span className="nav-contents-row__title">{item.title}</span>
                  {item.shortSummary && (
                    <span className="nav-contents-row__desc">{item.shortSummary}</span>
                  )}
                  <span className="nav-contents-row__arrow">›</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </NavPanel>
  )
}
