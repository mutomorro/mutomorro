import { client, getCourse, getSidebarCallouts } from '../../../sanity/client'
import { buildMetadata } from '@/lib/seo'
import { ogImage, jsonLdImage } from '@/lib/image-proxy'
import ProxyHeroImage from '@/components/ProxyHeroImage'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import RelatedContent from '../../../components/RelatedContent'
import ContentTable from '../../../components/ContentTable'
import ContentAccordion from '../../../components/ContentAccordion'
import ContentTabs from '../../../components/ContentTabs'
import ContentCourse from '../../../components/ContentCourse'
import PageCallouts from '../../../components/PageCallouts'
import CalloutTeaser from '../../../components/CalloutTeaser'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import { urlFor } from '../../../sanity/image'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'

// Per-page closing-CTA wording (the button still goes to /contact via the CTA
// component default — wording only, no routing change). Hook → heading, invitation
// → body. Falls back to the generic line for any unmapped slug.
const CLOSING_CTA = {
  'change-management': { heading: 'Got change coming, and people who’ll be leading it?', body: 'Tell us what’s changing and we’ll help you work out the right support for them.' },
  'systems-thinking': { heading: 'Wrestling with problems that keep coming back?', body: 'Tell us what you’re seeing and we’ll help you find the right way in.' },
  'team-effectiveness': { heading: 'Know your teams could be firing better?', body: 'Tell us where they’re stuck and we’ll help you shape the right day.' },
  'theory-of-change-workshop': { heading: 'Need to show your thinking - to a funder, a board, yourselves?', body: 'Tell us about your programme and we’ll help you plan the workshop.' },
  'process-mapping-workshop': { heading: 'Got a process that’s tangled up?', body: 'Tell us which one and we’ll help you scope a day around it.' },
  'scenario-planning-workshop': { heading: 'Planning through real uncertainty?', body: 'Tell us what’s on the horizon and we’ll help you shape the session.' },
  'customer-experience': { heading: 'Want your services seen through your customers’ eyes?', body: 'Tell us where the friction is and we’ll help you find the right starting point.' },
  'continuous-improvement': { heading: 'Want improvement to be a habit, not a one-off push?', body: 'Tell us about your work and we’ll help you shape the right training.' },
}

export const revalidate = 3600

export async function generateStaticParams() {
  const courses = await client.fetch(`*[_type == "course"]{ "slug": slug.current }`)
  return courses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const course = await client.fetch(
    `*[_type == "course" && slug.current == $slug][0]{
      title, seoTitle, seoDescription, shortSummary,
      _createdAt, _updatedAt,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!course) return {}

  return buildMetadata({
    title: course.seoTitle || course.title,
    description: course.seoDescription || course.shortSummary || '',
    path: `/training/${slug}`,
    image: course.heroImageUrl ? ogImage('training', slug, course.heroImageUrl) : undefined,
    type: 'article',
    publishedTime: course._createdAt,
    modifiedTime: course._updatedAt,
  })
}

export default async function TrainingPage({ params }) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) notFound()

  const sidebarCallouts = await getSidebarCallouts('courses', course._id)

  const heroImageUrl = course.heroImage ? urlFor(course.heroImage).width(900).url() : null

  // Heading anchors — shared by the ToC heading renderers below and the course
  // blocks (which stand in for the h3s they replaced) — plus a 1-based,
  // zero-padded number for each course in document order.
  const { idByKey } = buildHeadingIndex(course.body)
  const courseKeys = (course.body || [])
    .filter((b) => b?._type === 'courseEntry')
    .map((b) => b._key)
  const courseNum = (key) => {
    const i = courseKeys.indexOf(key)
    return i === -1 ? null : String(i + 1).padStart(2, '0')
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.seoTitle || course.title,
    description: course.seoDescription || course.shortSummary,
    provider: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/training/${course.slug.current}`,
    ...(heroImageUrl && { image: jsonLdImage('training', slug, heroImageUrl) }),
    ...(course._createdAt && { datePublished: course._createdAt }),
    ...(course._updatedAt && { dateModified: course._updatedAt }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Training',
        item: 'https://mutomorro.com/training',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: course.title,
        item: `https://mutomorro.com/training/${course.slug.current}`,
      },
    ],
  }

  return (
    <main className="page-tool">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`} style={{ position: 'relative' }}>
          {/* Left: text content */}
          <div>
            {/* Breadcrumb — root reads "Training", not "Courses" */}
            <div className="breadcrumb">
              <Link href="/training" className="breadcrumb__link">Training</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{course.title}</span>
            </div>

            <span className="kicker" style={{ marginBottom: '16px' }}>In-house training</span>
            <h1 className="heading-h1 heading-gradient" style={{ margin: '0 0 32px' }}>
              {course.title}
            </h1>
            {course.shortSummary && (
              <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {course.shortSummary}
              </p>
            )}
          </div>

          {/* Right: hero image */}
          {heroImageUrl && (
            <div className="content-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <ProxyHeroImage
                  type="training"
                  slug={slug}
                  alt={course.heroImage?.alt || course.title || ''}
                  fallbackSrc={heroImageUrl}
                  width={900}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </BackgroundPattern>

      <CalloutTeaser pageType="courses" pageId={course._id} />

      {/* Body — three-column layout with ToC and contextual sidebar */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <ThreeColumnLayout
          toc={<TableOfContents body={course.body} />}
          sidebar={
            <ContentSidebar
              theme={course.theme}
              contentType="course"
              currentSlug={slug}
              relatedTools={course.relatedTools}
              relatedCaseStudies={course.relatedCaseStudiesViaTheme}
              sidebarCallouts={sidebarCallouts}
              primaryOverride={course.sidebarPrimary}
              enquiryService={slug}
            />
          }
        >
          {course.body && (
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
                          sizes="(max-width: 768px) 100vw, 680px"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    ),
                    table: ({ value }) => <ContentTable value={value} />,
                    accordion: ({ value }) => <ContentAccordion value={value} />,
                    tabs: ({ value }) => <ContentTabs value={value} />,
                    courseEntry: ({ value }) => (
                      <ContentCourse
                        value={value}
                        id={idByKey.get(value._key)}
                        number={courseNum(value._key)}
                      />
                    ),
                  },
                  marks: {
                    link: ({ value, children }) => {
                      const href = value?.href || ''
                      const external = /^https?:/i.test(href)
                      return (
                        <a
                          href={href}
                          className="inline-link"
                          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {children}
                        </a>
                      )
                    },
                  },
                  block: {
                    ...makeHeadingBlocks(idByKey),
                    blockquote: ({ children }) => (
                      <blockquote className="pull-quote">{children}</blockquote>
                    ),
                  },
                }}
              />
            </div>
          )}

          <RelatedContent
            relatedTools={course.relatedTools}
            relatedArticles={course.relatedArticles}
          />
        </ThreeColumnLayout>
      </section>

      <PageCallouts pageType="courses" pageId={course._id} />

      <CTA
        label="Work with us"
        heading={(CLOSING_CTA[slug] || {}).heading || 'Want to put these ideas into practice?'}
        body={(CLOSING_CTA[slug] || {}).body}
      />
    </main>
  )
}
