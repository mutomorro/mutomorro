'use client'

import Link from 'next/link'
import ServiceFilter from '../../components/ServiceFilter'
import { urlFor } from '../../sanity/image'

export default function CoursesGrid({ items }) {
  return (
    <ServiceFilter
      items={items}
      contentType="courses"
      renderCard={(course) => (
        <Link
          href={`/courses/${course.slug.current}`}
          className="card-d"
        >
          {course.category && (
            <div className="card-d__badge">{course.category}</div>
          )}

          {course.heroImage && (
            <div className="card-d__image">
              <img
                className="card-d__image-inner"
                src={urlFor(course.heroImage).width(600).height(338).url()}
                alt={course.heroImage.alt || course.title}
              />
            </div>
          )}

          <div className="card-d__body" style={course.category && !course.heroImage ? { paddingTop: '40px' } : undefined}>
            <div className="card-d__title">{course.title}</div>
            {course.shortSummary && (
              <p className="card-d__text">{course.shortSummary}</p>
            )}
            {(course.duration || course.format) && (
              <p className="card-d__meta">
                {course.duration}{course.duration && course.format ? ' · ' : ''}{course.format}
              </p>
            )}
          </div>

          <div className="card-d__footer">
            <div className="card-d__footer-fill" />
            <div className="card-d__action">
              View course <span className="arrow">→</span>
            </div>
          </div>
        </Link>
      )}
    />
  )
}
