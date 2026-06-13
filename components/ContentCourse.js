import { PortableText } from '@portabletext/react'
import ContentAccordion from './ContentAccordion'

/**
 * Renders a `courseEntry` Portable Text block — one course inside a training
 * pillar page's "The courses" list (sanity/schemas/courseEntry.js).
 *
 * Layout (the approved "editorial, no card" design): a gradient index number on
 * top, a bold full-width title, then the intro prose beside a small "spec" rail
 * (format / who it's for / what you leave with) lifted out of the prose so it's
 * scannable, and the existing expandable accordions beneath.
 *
 * Server component, like ContentTable/ContentAccordion. The title carries the
 * `id` computed by buildHeadingIndex (lib/slugify.js) and the `scroll-target`
 * class, so the page ToC links and read-progress treat it exactly like the h3
 * it replaced. The intro renders through PortableText with the same link mark
 * as the surrounding body; the accordions reuse ContentAccordion verbatim.
 */

const introComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          className="inline-link"
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {children}
        </a>
      )
    },
  },
}

export default function ContentCourse({ value, id, number }) {
  const title = value?.title
  if (!title) return null

  const intro = value?.intro || []
  const accordions = value?.accordions || []
  const specRows = [
    ['Format', value?.format],
    ['For', value?.audience],
    ['You leave with', value?.outcome],
  ].filter(([, v]) => v)
  const showHead = intro.length > 0 || specRows.length > 0

  return (
    <section className="course-entry">
      {number && (
        <span className="course-entry__num" aria-hidden="true">
          {number}
        </span>
      )}
      <h3 id={id} className="course-entry__title scroll-target">
        {title}
      </h3>

      {showHead && (
        <div className={`course-entry__head${specRows.length ? '' : ' course-entry__head--full'}`}>
          {intro.length > 0 && (
            <div className="course-entry__intro">
              <PortableText value={intro} components={introComponents} />
            </div>
          )}
          {specRows.length > 0 && (
            <aside className="course-entry__spec" aria-label="Course at a glance">
              <dl>
                {specRows.map(([label, val]) => (
                  <div className="course-entry__spec-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      )}

      {accordions.length > 0 && (
        <div className="course-entry__detail">
          {accordions.map((a, i) => (
            <ContentAccordion key={a?._key || i} value={a} />
          ))}
        </div>
      )}
    </section>
  )
}
