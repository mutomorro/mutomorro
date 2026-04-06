import { notFound } from 'next/navigation'
import { getCourse } from '../../../sanity/client'
import { client } from '../../../sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { urlFor } from '../../../sanity/image'
import BackgroundPattern from '../../../components/animations/BackgroundPattern'

export const revalidate = 3600

export async function generateStaticParams() {
  const courses = await client.fetch(`*[_type == "course"]{ "slug": slug.current }`)
  return courses.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const course = await client.fetch(
    `*[_type == "course" && slug.current == $slug][0]{
      title, seoTitle, seoDescription, shortSummary,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!course) return {}

  const rawTitle = course.seoTitle || course.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = course.seoDescription || course.shortSummary || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(course.heroImageUrl && {
        images: [{ url: course.heroImageUrl, width: 1200, height: 630 }],
      }),
    },
  }
}

export default async function CoursePage({ params }) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  return (
    <main className="page-course">

      {/* Hero */}
      <BackgroundPattern variant="constellation" style={{ background: 'var(--dark)' }}>
        <section className="section--full dark-bg" style={{ padding: '100px 48px 120px', background: 'transparent' }}>
          <div className="wrap--narrow">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/courses" className="breadcrumb__link">Courses</Link>
              {course.category && (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <span className="breadcrumb__current">{course.category}</span>
                </>
              )}
            </div>

            {course.category && (
              <span className="kicker" style={{ marginBottom: '16px' }}>{course.category}</span>
            )}
            <h1 className="heading-h1" style={{
              color: '#ffffff',
              margin: '0 0 32px',
            }}>
              {course.title}
            </h1>

            {/* Duration / format metadata */}
            {(course.duration || course.format) && (
              <p style={{
                fontSize: '15px',
                fontWeight: '400',
                color: 'var(--accent)',
                margin: '0 0 20px',
                letterSpacing: '0.02em',
              }}>
                {course.duration}{course.duration && course.format ? ' · ' : ''}{course.format}
              </p>
            )}

            {course.shortSummary && (
              <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {course.shortSummary}
              </p>
            )}
          </div>
        </section>
      </BackgroundPattern>

      {/* Body */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div className="wrap--narrow">
          <div className="portable-text">
            <PortableText
              value={course.body}
              components={{
                types: {
                  image: ({ value }) => (
                    <div className="img-mat" style={{ margin: '2.5rem 0' }}>
                      <Image
                        src={urlFor(value).width(900).url()}
                        alt={value.alt || ''}
                        width={900}
                        height={506}
                        sizes="(max-width: 768px) 100vw, 800px"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  ),
                },
                marks: {
                  link: ({ value, children }) => (
                    <a href={value.href} className="inline-link">{children}</a>
                  ),
                },
                block: {
                  blockquote: ({ children }) => (
                    <blockquote className="pull-quote">{children}</blockquote>
                  ),
                },
              }}
            />
          </div>

          {/* Related dimensions */}
          {course.relatedDimensions?.length > 0 && (
            <div className="scroll-in" style={{
              marginTop: '4rem',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                Related dimensions
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {course.relatedDimensions.map((dimension) => (
                  <Link
                    key={dimension._id}
                    href={`/emergent-framework/${dimension.slug.current}`}
                    style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: dimension.colour,
                      border: `1.5px solid ${dimension.colour}`,
                      padding: '8px 16px',
                      textDecoration: 'none',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {dimension.anchor}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTA
        label="Interested in this course?"
        heading="Get in touch to find out more or book a place"
        buttonText="Talk to us"
        buttonLink="/contact"
      />

    </main>
  )
}
