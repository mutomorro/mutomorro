'use client'

import Link from 'next/link'
import Image from 'next/image'
import ServiceFilter from '../../components/ServiceFilter'
import { urlFor } from '../../sanity/image'

export default function ToolsGrid({ items }) {
  return (
    <ServiceFilter
      items={items}
      contentType="tools"
      renderCard={(tool) => (
        <Link
          href={`/tools/${tool.slug.current}`}
          className="card-a"
        >
          <div className="card-a__corner" />

          {tool.heroImage && (
            <div className="card-a__image">
              <Image
                className="card-a__image-inner"
                src={urlFor(tool.heroImage).width(600).height(338).url()}
                alt={tool.heroImage.alt || tool.title}
                width={600}
                height={338}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}

          <div className="card-a__body">
            {tool.category && (
              <span className="card-a__tag">{tool.category}</span>
            )}
            <div className="card-a__title">{tool.title}</div>
            {tool.shortSummary && (
              <p className="card-a__text">{tool.shortSummary}</p>
            )}
          </div>

          <div className="card-a__footer">
            <div className="card-a__footer-bg" />
            <div className="card-a__action">
              Explore tool <span className="arrow">→</span>
            </div>
          </div>
        </Link>
      )}
    />
  )
}
