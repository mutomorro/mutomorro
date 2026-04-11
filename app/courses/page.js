import { getAllCourses } from '../../sanity/client'
import CTA from '../../components/CTA'
import CoursesGrid from './CoursesGrid'

export const revalidate = 3600

export const metadata = {
  title: 'Courses - organisational development training',
  description: 'Collaborative learning sessions on change management, culture, leadership, systems thinking, service design, and more. Designed for teams and leaders.',
}

export default async function Courses() {
  const courses = await getAllCourses()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Courses</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Learn and develop
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Ready-made courses on leadership, change, culture and how organisations work.
          </p>
        </div>
      </section>

      {/* Course cards */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {courses.length === 0 ? (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.4)' }}>
              No courses yet - check back soon.
            </p>
          ) : (
            <CoursesGrid items={courses} />
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
