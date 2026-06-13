import { client, getCourse, getSidebarCallouts } from '../../../sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import RelatedContent from '../../../components/RelatedContent'
import ContentTable from '../../../components/ContentTable'
import ContentAccordion from '../../../components/ContentAccordion'
import ContentTabs from '../../../components/ContentTabs'
import PageCallouts from '../../../components/PageCallouts'
import CalloutTeaser from '../../../components/CalloutTeaser'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import { urlFor } from '../../../sanity/image'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'

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

  const rawTitle = course.seoTitle || course.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = course.seoDescription || course.shortSummary || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mutomorro.com/training/${slug}`,
      type: 'article',
      publishedTime: course._createdAt,
      modifiedTime: course._updatedAt,
      images: [{
        url: course.heroImageUrl || '/og-default.png',
        width: 1200,
        height: 630,
      }],
    },
  }
}

export default async function TrainingPage({ params }) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) notFound()

  const sidebarCallouts = await getSidebarCallouts('courses', course._id)

  const heroImageUrl = course.heroImage ? urlFor(course.heroImage).width(900).url() : null

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
    ...(heroImageUrl && { image: heroImageUrl }),
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
                <Image
                  src={heroImageUrl}
                  alt={course.title || ''}
                  width={900}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
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
                    ...makeHeadingBlocks(buildHeadingIndex(course.body).idByKey),
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

      <CTA label="Work with us" heading="Want to put these ideas into practice?" />
    </main>
  )
}
