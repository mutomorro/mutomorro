'use client'

import Link from 'next/link'
import ServiceFilter from '../../components/ServiceFilter'
import { urlFor } from '../../sanity/image'

export default function ArticlesGrid({ items }) {
  return (
    <ServiceFilter
      items={items}
      contentType="articles"
      renderCard={(article) => (
        <Link
          href={`/articles/${article.slug.current}`}
          className="card-d"
        >
          {article.category && (
            <div className="card-d__badge">{article.category}</div>
          )}

          {article.heroImage?.asset && (
            <div className="card-d__image">
              <img
                className="card-d__image-inner"
                src={urlFor(article.heroImage).width(600).height(338).url()}
                alt={article.heroImage.alt || article.title}
              />
            </div>
          )}

          <div className="card-d__body" style={article.category && !article.heroImage ? { paddingTop: '40px' } : undefined}>
            <div className="card-d__title">{article.title}</div>
            {article.shortSummary && (
              <p className="card-d__text">{article.shortSummary}</p>
            )}
            {article.publishedAt && (
              <p className="card-d__meta">
                {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          <div className="card-d__footer">
            <div className="card-d__footer-fill" />
            <div className="card-d__action">
              Read article <span className="arrow">→</span>
            </div>
          </div>
        </Link>
      )}
    />
  )
}
