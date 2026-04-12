import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '../sanity/image'

function ContentCard({ item, basePath, actionLabel }) {
  return (
    <Link href={`/${basePath}/${item.slug.current}/`} className="card-a">
      <div className="card-a__corner" />

      {item.heroImage && (
        <div className="card-a__image">
          <Image
            className="card-a__image-inner"
            src={urlFor(item.heroImage).width(600).height(338).url()}
            alt={item.heroImage.alt || item.title}
            width={600}
            height={338}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      <div className="card-a__body">
        {item.category && (
          <span className="card-a__tag">{item.category}</span>
        )}
        <div className="card-a__title">{item.title}</div>
        {item.shortSummary && (
          <p className="card-a__text">{item.shortSummary}</p>
        )}
      </div>

      <div className="card-a__footer">
        <div className="card-a__footer-bg" />
        <div className="card-a__action">
          {actionLabel} <span className="arrow">→</span>
        </div>
      </div>
    </Link>
  )
}

export default function RelatedContent({ relatedTools, relatedArticles }) {
  if (!relatedTools?.length && !relatedArticles?.length) return null

  return (
    <>
      {relatedTools?.length > 0 && (
        <div className="scroll-in" style={{
          marginTop: '4rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(0,0,0,0.08)',
        }}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
            Related tools
          </span>
          <div className="card-grid" style={{ marginTop: '1.5rem' }}>
            {relatedTools.map((tool) => (
              <ContentCard
                key={tool._id}
                item={tool}
                basePath="tools"
                actionLabel="Explore tool"
              />
            ))}
          </div>
        </div>
      )}

      {relatedArticles?.length > 0 && (
        <div className="scroll-in" style={{
          marginTop: '4rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(0,0,0,0.08)',
        }}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
            Related reading
          </span>
          <div className="card-grid" style={{ marginTop: '1.5rem' }}>
            {relatedArticles.map((article) => (
              <ContentCard
                key={article._id}
                item={article}
                basePath="articles"
                actionLabel="Read article"
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
