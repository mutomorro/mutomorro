import Link from 'next/link'
import { getAllThemesForIndex } from '../../sanity/client'
import CTA from '../../components/CTA'

export const revalidate = 3600

export const metadata = {
  title: 'Topics - Resources and Thinking | Mutomorro',
  description:
    "Explore Mutomorro's collection of tools, articles, courses and case studies, organised by subject.",
  alternates: {
    canonical: 'https://mutomorro.com/topics/',
  },
  openGraph: {
    title: 'Topics - Resources and Thinking | Mutomorro',
    description:
      "Explore Mutomorro's collection of tools, articles, courses and case studies, organised by subject.",
    url: 'https://mutomorro.com/topics/',
    type: 'website',
  },
}

function formatCounts({ toolCount, articleCount, courseCount, caseStudyCount }) {
  const parts = []
  if (toolCount > 0) parts.push(`${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}`)
  if (articleCount > 0) parts.push(`${articleCount} ${articleCount === 1 ? 'article' : 'articles'}`)
  if (courseCount > 0) parts.push(`${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`)
  if (caseStudyCount > 0) parts.push(`${caseStudyCount} ${caseStudyCount === 1 ? 'case study' : 'case studies'}`)
  return parts.join(' · ')
}

export default async function TopicsIndex() {
  const themes = await getAllThemesForIndex()

  return (
    <main className="page-topics-index">
      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Library</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Topics
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Everything we think about, write about, and build tools for &mdash; gathered by subject.
          </p>
        </div>
      </section>

      {/* Topic grid */}
      <section className="section--full section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {themes.length === 0 ? (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.4)' }}>
              No topics yet - check back soon.
            </p>
          ) : (
            <div className="topic-index-grid">
              {themes.map((theme) => {
                const counts = formatCounts(theme)
                return (
                  <Link
                    key={theme._id}
                    href={`/topics/${theme.slug}`}
                    className="topic-index-card"
                  >
                    <div className="topic-index-card__title">{theme.title}</div>
                    {counts && (
                      <p className="topic-index-card__counts">{counts}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <CTA />
    </main>
  )
}
