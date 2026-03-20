'use client'

import { useState, useEffect, useRef } from 'react'

const USE_CASES = [
  {
    title: 'Strategic alignment',
    teaser: 'See if strategy is truly embedded - or just living in documents.',
    description: 'Understand whether strategy is clear at every level, where it\'s getting stuck, and what\'s preventing it from translating into day-to-day decisions and actions.',
  },
  {
    title: 'Culture change',
    teaser: 'Understand your culture before trying to change it.',
    description: 'See what\'s really happening across your organisation - not just what\'s assumed. Identify where culture supports your goals and where it creates friction.',
  },
  {
    title: 'Transformation planning',
    teaser: 'Know what you\'re working with before you begin.',
    description: 'Identify where change will flow easily and where it may meet resistance. Build transformation plans that account for your organisation\'s real dynamics.',
  },
  {
    title: 'Merger or acquisition',
    teaser: 'See beyond financials to how organisations actually function.',
    description: 'Understand the true health of organisations coming together. Identify cultural compatibility, integration risks, and where attention will be needed most.',
  },
  {
    title: 'Scaling and growth',
    teaser: 'Know what will hold as you grow - and what needs attention.',
    description: 'Identify which foundations are solid and which will strain under growth. Build from a clear understanding of your current strengths and gaps.',
  },
  {
    title: 'Leadership transition',
    teaser: 'Give new leaders a clear picture of what they\'re inheriting.',
    description: 'Accelerate understanding and impact with an evidence-based view of organisational health. No more months spent figuring out how things really work.',
  },
  {
    title: 'Employee experience',
    teaser: 'Go deeper than engagement scores.',
    description: 'See what\'s shaping how people experience working in your organisation - not just satisfaction levels, but the underlying dynamics that drive them.',
  },
  {
    title: 'Customer experience',
    teaser: 'Reveal how internal dynamics affect what customers receive.',
    description: 'See the connections between how you work internally and what customers actually experience. Internal friction often shows up externally.',
  },
  {
    title: 'Post-change review',
    teaser: 'See whether previous changes have truly embedded.',
    description: 'Assess whether past initiatives have stuck - and understand what\'s needed to make them part of how the organisation actually works.',
  },
]

export default function UseCaseCards() {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  const toggleCard = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="sov-usecase-grid" ref={gridRef}>
      {USE_CASES.map((uc, i) => {
        const isExpanded = expandedIndex === i
        return (
          <button
            key={i}
            onClick={() => toggleCard(i)}
            style={{
              background: 'var(--white)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transitionDelay: isVisible ? `${i * 50}ms` : '0ms',
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? (isExpanded ? 'none' : undefined)
                : 'translateY(20px)',
              boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }
            }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#221C2B',
              margin: '0 0 8px',
              paddingRight: '24px',
              lineHeight: '1.3',
            }}>
              {uc.title}
            </h3>

            <div style={{
              overflow: 'hidden',
              transition: 'max-height 0.35s ease, opacity 0.25s ease',
              maxHeight: isExpanded ? '200px' : '0px',
              opacity: isExpanded ? 1 : 0,
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '400',
                lineHeight: '1.7',
                color: 'rgba(0,0,0,0.65)',
                margin: 0,
              }}>
                {uc.description}
              </p>
            </div>

            <div style={{
              overflow: 'hidden',
              transition: 'max-height 0.25s ease, opacity 0.2s ease',
              maxHeight: isExpanded ? '0px' : '60px',
              opacity: isExpanded ? 0 : 1,
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '400',
                lineHeight: '1.6',
                color: 'rgba(0,0,0,0.55)',
                margin: 0,
              }}>
                {uc.teaser}
              </p>
            </div>

            {/* Expand/collapse indicator */}
            <span style={{
              position: 'absolute',
              top: '24px',
              right: '20px',
              fontSize: '18px',
              fontWeight: '300',
              color: 'rgba(0,0,0,0.2)',
              lineHeight: 1,
              transition: 'transform 0.3s ease, color 0.2s ease',
              transform: isExpanded ? 'rotate(45deg)' : 'none',
            }}>
              +
            </span>
          </button>
        )
      })}
    </div>
  )
}
