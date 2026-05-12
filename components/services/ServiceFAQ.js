'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'

export default function ServiceFAQ({ items = [], heading = 'Common questions', kicker }) {
  const [open, setOpen] = useState(0)

  if (!items?.length) return null

  return (
    <div className="service-faq">
      <div className="scroll-in" style={{ marginBottom: '2rem' }}>
        {kicker && (
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
            {kicker}
          </span>
        )}
        {heading && (
          <h2 className="heading-h2" style={{ margin: 0 }}>
            {heading}
          </h2>
        )}
      </div>

      <div className="service-faq__list">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div
              key={item._key || i}
              className={`service-faq__item ${isOpen ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="service-faq__trigger"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                <span className="service-faq__question">{item.question}</span>
                <span className="service-faq__icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="service-faq__answer portable-text">
                  <PortableText value={item.answer} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

