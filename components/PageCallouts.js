import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getPageCallouts } from '../sanity/client'
import { urlFor } from '../sanity/image'

// Server component. Fetches and renders any active callouts targeted at this page.
// Returns nothing if no callouts match.
export default async function PageCallouts({ pageType, pageId }) {
  const callouts = await getPageCallouts(pageType, pageId)

  if (!callouts || callouts.length === 0) return null

  return (
    <>
      {callouts.map((callout) => (
        <Callout key={callout._id} callout={callout} />
      ))}
    </>
  )
}

function Callout({ callout }) {
  const { heading, body, image, linkUrl, linkLabel, accentColor } = callout
  const hasImage = Boolean(image?.asset)
  const imageUrl = hasImage ? urlFor(image).width(720).url() : null
  const imageAlt = image?.alt || heading || ''
  const showLink = Boolean(linkUrl && linkLabel)

  // Internal links use Next/Link, externals use anchor with rel
  const isExternal = linkUrl && /^(https?:|mailto:|tel:)/i.test(linkUrl)

  const linkColor = accentColor || 'var(--accent)'
  const borderColor = accentColor || 'var(--accent)'

  return (
    <section
      id={`callout-${callout._id}`}
      className="section--full section-padding page-callout"
      style={{ background: 'var(--warm)' }}
      aria-label={heading || 'Callout'}
    >
      <div
        className="page-callout__inner"
        style={{ maxWidth: '1350px', margin: '0 auto' }}
      >
        <div
          className={`page-callout__grid${hasImage ? ' page-callout__grid--with-image' : ''}`}
        >
          <div
            className="page-callout__content"
            style={{
              borderLeft: `4px solid ${borderColor}`,
              paddingLeft: '24px',
            }}
          >
            {heading && (
              <h2
                className="heading-h3 page-callout__heading"
                style={{ margin: '0 0 16px' }}
              >
                {heading}
              </h2>
            )}
            <div className="portable-text page-callout__body">
              <PortableText
                value={body}
                components={{
                  marks: {
                    link: ({ value, children }) => (
                      <a
                        href={value?.href}
                        className="inline-link"
                        {...(value?.href && /^https?:/i.test(value.href)
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {children}
                      </a>
                    ),
                  },
                }}
              />
            </div>
            {showLink && (
              <p style={{ margin: '20px 0 0' }}>
                {isExternal ? (
                  <a
                    href={linkUrl}
                    className="inline-link page-callout__link"
                    style={{ color: linkColor, backgroundImage: `linear-gradient(${linkColor}, ${linkColor})` }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkLabel} <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <Link
                    href={linkUrl}
                    className="inline-link page-callout__link"
                    style={{ color: linkColor, backgroundImage: `linear-gradient(${linkColor}, ${linkColor})` }}
                  >
                    {linkLabel} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </p>
            )}
          </div>

          {hasImage && (
            <div className="page-callout__image">
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={720}
                height={480}
                sizes="(max-width: 768px) 100vw, 480px"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
