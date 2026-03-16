import Link from 'next/link'
import { getAllCourses } from '../../sanity/client'
import { urlFor } from '../../sanity/image'
import CTA from '../../components/CTA'

export default async function Courses() {
  const courses = await getAllCourses()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Courses</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 24px',
            maxWidth: '800px',
          }}>
            Learn and develop
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Ready-made courses on leadership, change, culture and organisational health.
          </p>
        </div>
      </section>

      {/* Course cards */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {courses.length === 0 ? (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.4)' }}>
              No courses yet - check back soon.
            </p>
          ) : (
            <div className="grid-3">
              {courses.map((course, index) => (
                <Link
                  key={course._id}
                  href={`/courses/${course.slug.current}`}
                  className="card-d scroll-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Category badge */}
                  {course.category && (
                    <div className="card-d__badge">{course.category}</div>
                  )}

                  {/* Image */}
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
              ))}
            </div>
          )}
        </div>
      </section>

      <CTA
        label="Looking for something bespoke?"
        heading="We design custom programmes too"
      />

    </main>
  )
}
