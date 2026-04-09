import { notFound } from 'next/navigation'
import { getProject } from '../../../sanity/client'
import { client } from '../../../sanity/client'
import Image from 'next/image'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../../../sanity/image'
import Lightbox from '../../../components/Lightbox'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await client.fetch(`*[_type == "project"]{ "slug": slug.current }`)
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{
      title, seoTitle, seoDescription, shortSummary,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!project) return {}

  const rawTitle = project.seoTitle || project.title
  const title = rawTitle?.replace(/\s*[\|\-]\s*Mutomorro\s*$/i, '') || rawTitle
  const description = project.seoDescription || project.shortSummary || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(project.heroImageUrl && {
        images: [{ url: project.heroImageUrl, width: 1200, height: 630 }],
      }),
    },
  }
}

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const heroImageUrl = project.heroImage ? urlFor(project.heroImage).width(600).url() : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.seoTitle || project.title,
    description: project.seoDescription || project.shortSummary,
    author: {
      '@type': 'Person',
      name: 'James Freeman-Gray',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
    url: `https://mutomorro.com/projects/${project.slug.current}`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Projects',
        item: 'https://mutomorro.com/projects',
      },
      ...(project.clientSector ? [{
        '@type': 'ListItem',
        position: 2,
        name: project.clientSector,
        item: 'https://mutomorro.com/projects',
      }] : []),
      {
        '@type': 'ListItem',
        position: project.clientSector ? 3 : 2,
        name: project.title,
        item: `https://mutomorro.com/projects/${project.slug.current}`,
      },
    ],
  }

  // Section definitions - only render sections that have content
  const sections = [
    { key: 'clientAndContext', label: 'Client & context' },
    { key: 'theObjective', label: 'The objective' },
    { key: 'theApproach', label: 'The approach' },
    { key: 'whatChanged', label: 'What changed' },
    { key: 'keyInsight', label: 'Key insight' },
  ]

  const portableTextComponents = {
    types: {
      image: ({ value }) => (
        <div className="img-mat" style={{ margin: '2.5rem 0' }}>
          <Lightbox src={urlFor(value).width(900).url()} alt={value.alt || ''} cover={false} />
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
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`}>
          <div>
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link href="/projects" className="breadcrumb__link">Projects</Link>
              {project.clientSector && (
                <>
                  <span className="breadcrumb__sep">/</span>
                  <span className="breadcrumb__current">{project.clientSector}</span>
                </>
              )}
            </div>

            {project.clientSector && (
              <span className="kicker" style={{ marginBottom: '16px' }}>{project.clientSector}</span>
            )}
            <h1 className="heading-h1" style={{
              color: '#ffffff',
              margin: '0 0 32px',
            }}>
              {project.title}
            </h1>
            {project.shortSummary && (
              <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {project.shortSummary}
              </p>
            )}
          </div>

          {heroImageUrl && (
            <div className="content-hero-image-wrap">
              <div className="img-perspective" style={{ maxWidth: '100%' }}>
                <Image
                  src={heroImageUrl}
                  alt={project.title || ''}
                  width={600}
                  height={400}
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content sections */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div className="wrap--narrow">

          {sections.map(({ key, label }) => {
            const content = project[key]
            if (!content) return null

            return (
              <div key={key} className="scroll-in" style={{
                marginBottom: '4rem',
                paddingBottom: '4rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                  {label}
                </span>
                <div className="portable-text">
                  <PortableText value={content} components={portableTextComponents} />
                </div>
              </div>
            )
          })}

          {/* Legacy field fallback - for projects that still use old fields */}
          {!project.clientAndContext && !project.theObjective && !project.theApproach && (
            <>
              {project.challenge && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The challenge</span>
                  <div className="portable-text">
                    <PortableText value={project.challenge} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.approach && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>Our approach</span>
                  <div className="portable-text">
                    <PortableText value={project.approach} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.outcome && (
                <div className="scroll-in" style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The outcome</span>
                  <div className="portable-text">
                    <PortableText value={project.outcome} components={portableTextComponents} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CTA />

    </main>
  )
}
