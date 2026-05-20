import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { client, getThemeHub, getAllThemeSlugs } from '../../../sanity/client'
import { urlFor } from '../../../sanity/image'
import CTA from '../../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'

export const revalidate = 3600

export async function generateStaticParams() {
  const themes = await getAllThemeSlugs()
  return themes.map((theme) => ({ slug: theme.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  if (slug === 'scaling-operations') return {}

  const theme = await client.fetch(
    `*[_type == "theme" && slug.current == $slug][0]{ title, seoTitle, seoDescription, "slug": slug.current }`,
    { slug }
  )
  if (!theme) return {}

  const rawTitle = theme.seoTitle || `${theme.title} - Resources and Thinking`
  const title = rawTitle.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description =
    theme.seoDescription ||
    `Tools, articles, courses and case studies on ${theme.title.toLowerCase()} from Mutomorro.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://mutomorro.com/topics/${theme.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://mutomorro.com/topics/${theme.slug}`,
      type: 'website',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      images: ['/og-default.png'],
    },
  }
}

const portableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || '#'
      const isExternal = /^https?:\/\//.test(href)
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

function ServiceLink({ anchorType, anchorUrl, themeTitle }) {
  if (!anchorUrl) return null

  if (anchorType === 'service') {
    return (
      <Link href={anchorUrl} className="inline-link">
        Explore our {themeTitle.toLowerCase()} consultancy →
      </Link>
    )
  }
  if (anchorType === 'develop') {
    return (
      <Link href={anchorUrl} className="inline-link">
        Explore our development programmes →
      </Link>
    )
  }
  if (anchorType === 'fieldmarks') {
    return (
      <a href={anchorUrl} target="_blank" rel="noopener noreferrer" className="inline-link">
        Explore our field guide to systems thinking →
      </a>
    )
  }
  return null
}

function ContentList({ heading, intro, items, basePath, actionLabel }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: '4rem' }}>
      <h2 className="heading-h2" style={{ margin: '0 0 16px' }}>{heading}</h2>
      {intro && (
        <p className="body-text" style={{ margin: '0 0 24px', maxWidth: '720px', color: 'rgba(0,0,0,0.7)' }}>
          {intro}
        </p>
      )}
      <div className="topic-card-grid">
        {items.map((item) => {
          const imageUrl = item.heroImage?.asset
            ? urlFor(item.heroImage).width(600).height(338).url()
            : null
          return (
            <Link
              key={item._id}
              href={`${basePath}/${item.slug}`}
              className="topic-card"
            >
              {imageUrl && (
                <div className="topic-card__image">
                  <Image
                    className="topic-card__image-inner"
                    src={imageUrl}
                    alt={item.heroImage?.alt?.split('|')[0]?.trim() || item.title || ''}
                    width={600}
                    height={338}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}
              <div className="topic-card__body">
                <div className="topic-card__title">{item.title}</div>
                {item.shortSummary && (
                  <p className="topic-card__text">{item.shortSummary}</p>
                )}
                <div className="topic-card__action">
                  {actionLabel} <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default async function TopicHubPage({ params }) {
  const { slug } = await params

  if (slug === 'scaling-operations') notFound()

  const theme = await getThemeHub(slug)
  if (!theme) notFound()

  const hasContent =
    (theme.tools && theme.tools.length > 0) ||
    (theme.articles && theme.articles.length > 0) ||
    (theme.courses && theme.courses.length > 0) ||
    (theme.caseStudies && theme.caseStudies.length > 0)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Topics',
        item: 'https://mutomorro.com/topics/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: theme.title,
        item: `https://mutomorro.com/topics/${theme.slug}/`,
      },
    ],
  }

  return (
    <main className="page-topic">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <div className="breadcrumb">
            <Link href="/topics" className="breadcrumb__link">Topics</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">{theme.title}</span>
          </div>

          <span className="kicker" style={{ marginBottom: '20px' }}>Topic</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            {theme.title}
          </h1>

          {theme.description && theme.description.length > 0 && (
            <div
              className="lead-text"
              style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px' }}
            >
              <PortableText value={theme.description} components={portableTextComponents} />
            </div>
          )}

          {theme.anchorUrl && (
            <p style={{ marginTop: '24px' }}>
              <ServiceLink
                anchorType={theme.anchorType}
                anchorUrl={theme.anchorUrl}
                themeTitle={theme.title}
              />
            </p>
          )}
        </div>
      </BackgroundPattern>

      {/* Content sections */}
      <section className="section--full section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          {!hasContent && (
            <p className="lead-text" style={{ color: 'rgba(0,0,0,0.5)' }}>
              We&rsquo;re building this hub. Check back soon for tools, articles, courses and case studies.
            </p>
          )}

          <ContentList
            heading="Tools"
            intro={theme.toolsIntro}
            items={theme.tools}
            basePath="/tools"
            actionLabel="Explore tool"
          />
          <ContentList
            heading="Articles"
            intro={theme.articlesIntro}
            items={theme.articles}
            basePath="/articles"
            actionLabel="Read article"
          />
          <ContentList
            heading="Courses"
            intro={theme.coursesIntro}
            items={theme.courses}
            basePath="/courses"
            actionLabel="View course"
          />
          <ContentList
            heading="Case Studies"
            intro={theme.caseStudiesIntro}
            items={theme.caseStudies}
            basePath="/projects"
            actionLabel="Read case study"
          />

          {theme.relatedThemes && theme.relatedThemes.length > 0 && (
            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px', display: 'block' }}>
                You might also explore
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {theme.relatedThemes.map((related) => (
                  <Link
                    key={related._id}
                    href={`/topics/${related.slug}`}
                    className="topic-tag"
                  >
                    {related.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTA />
    </main>
  )
}
