import Link from 'next/link'
import { getAllCourses } from '../../sanity/client'

export default async function Courses() {
  const courses = await getAllCourses()

  return (
    <main>
      <section className="section section--warm">
        <div className="wrap">
          <p className="label" style={{ margin: '0 0 1rem' }}>Courses</p>
          <h1 className="heading-gradient heading-large" style={{ margin: '0 0 1.5rem' }}>
            Learn and develop
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            Ready-made courses on leadership, change, culture and organisational health.
          </p>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="card-grid">
            {courses.length === 0 && (
              <p className="lead">No courses yet - check back soon.</p>
            )}
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course.slug.current}`}
                className="card"
              >
                <p className="card-label">{course.category}</p>
                <h2 className="card-title">{course.title}</h2>
                {course.duration && (
                  <p style={{
                    fontSize: '0.8rem',
                    fontWeight: '400',
                    color: 'var(--color-accent)',
                    margin: '0 0 0.5rem',
                  }}>{course.duration} · {course.format}</p>
                )}
                <p className="card-body">{course.shortSummary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}