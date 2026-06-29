import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/seo'
import { getProject } from '../../../sanity/client'
import { client } from '../../../sanity/client'
import Link from 'next/link'
import CTA from '../../../components/CTA'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../../../sanity/image'
import Lightbox from '../../../components/Lightbox'
import ProxyHeroImage from '@/components/ProxyHeroImage'
import { ogImage, isProxyEnabled, bodyCanonicalUrl, bodyRenderSrcSet, RENDER_WIDTHS } from '@/lib/image-proxy'
import ContentTable from '../../../components/ContentTable'
import ContentAccordion from '../../../components/ContentAccordion'
import ContentTabs from '../../../components/ContentTabs'
import PageCallouts from '../../../components/PageCallouts'
import CalloutTeaser from '../../../components/CalloutTeaser'
import ThreeColumnLayout from '../../../components/ThreeColumnLayout'
import TableOfContents from '../../../components/TableOfContents'
import ContentSidebar from '../../../components/ContentSidebar'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import { makeHeadingBlocks } from '../../../lib/portable-text-headings'
import { buildHeadingIndex } from '../../../lib/slugify'
import { getSidebarCallouts } from '../../../sanity/client'

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

  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.shortSummary || '',
    path: `/projects/${slug}`,
    image: project.heroImageUrl ? ogImage('project', slug, project.heroImageUrl) : undefined,
    type: 'article',
  })
}

export default async function CaseStudy({ params }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const sidebarCallouts = await getSidebarCallouts('caseStudies', project._id)

  const heroImageUrl = project.heroImage ? urlFor(project.heroImage).width(900).url() : null

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

  // Flatten all section bodies into one PortableText array so TableOfContents
  // can extract headings across the whole case study. Falls back to legacy
  // challenge/approach/outcome fields for older projects.
  const combinedBody = (() => {
    const blocks = []
    for (const { key } of sections) {
      if (Array.isArray(project[key])) blocks.push(...project[key])
    }
    if (blocks.length === 0) {
      for (const k of ['challenge', 'approach', 'outcome']) {
        if (Array.isArray(project[k])) blocks.push(...project[k])
      }
    }
    return blocks
  })()

  const hasBody = Array.isArray(project.body) && project.body.length > 0

  // Portable Text components. The heading-anchor index must be built from the
  // same array that is rendered AND fed to the ToC, so we use a small factory
  // and instantiate it per source (the new body, and the legacy combined body).
  const makeComponents = (headingSource, proxyBody = false) => ({
    types: {
      image: ({ value }) => {
        // Stable-URL proxy: when enabled for this case study AND the block is addressable,
        // feed the Lightbox the proxy <picture> URLs (stable PNG <img> + AVIF/WebP srcset)
        // so a re-upload never resets the image's Google ranking. Gated to the `body`
        // instance only — the legacy named-field arrays carry their OWN _keys (not in
        // `body`), so proxying them would resolve-miss and 404. Falls back to the plain
        // CDN Lightbox otherwise (unchanged behaviour).
        const proxyOn = proxyBody && isProxyEnabled('project', slug) && (value?.imageSlug || value?._key)
        const id = { imageSlug: value?.imageSlug, alt: value?.alt, key: value?._key }
        const proxyProps = proxyOn
          ? {
              proxySrc: bodyCanonicalUrl('project', slug, id),
              proxyAvifSrcSet: bodyRenderSrcSet('project', slug, id, RENDER_WIDTHS, 'avif'),
              proxyWebpSrcSet: bodyRenderSrcSet('project', slug, id, RENDER_WIDTHS, 'webp'),
              proxyZoomSrc: `${bodyCanonicalUrl('project', slug, id)}?w=2000`,
            }
          : {}
        return (
          <div className="img-mat" style={{ margin: '2.5rem 0' }}>
            <Lightbox src={urlFor(value).url()} alt={value.alt || ''} cover={false} {...proxyProps} />
          </div>
        )
      },
      table: ({ value }) => <ContentTable value={value} />,
      accordion: ({ value }) => <ContentAccordion value={value} />,
      tabs: ({ value }) => <ContentTabs value={value} />,
    },
    marks: {
      link: ({ value, children }) => (
        <a href={value.href} className="inline-link">{children}</a>
      ),
    },
    block: {
      ...makeHeadingBlocks(buildHeadingIndex(headingSource).idByKey),
      // Migrated section labels: the small eyebrow. Rendered as a div (not a p)
      // so the .portable-text p rule can't override the .kicker font-size. Kept
      // out of the ToC, which only indexes h2/h3.
      kicker: ({ children }) => <div className="kicker">{children}</div>,
      blockquote: ({ children }) => (
        <blockquote className="pull-quote">{children}</blockquote>
      ),
    },
  })

  const portableTextComponents = makeComponents(combinedBody)
  const bodyComponents = makeComponents(hasBody ? project.body : [], true)
  const tocSource = hasBody ? project.body : combinedBody

  return (
    <main className="page-project">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <BackgroundPattern variant="network" className="section--full dark-bg section-padding-hero">
        <div className={`section__inner content-hero-grid${heroImageUrl ? '' : ' content-hero-grid--single'}`} style={{ position: 'relative' }}>
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

            {project.theme?.title ? (
              <Link href={`/topics/${project.theme.slug}`} className="kicker kicker--link" style={{ marginBottom: '16px' }}>
                {project.theme.title}
              </Link>
            ) : project.clientSector ? (
              <span className="kicker" style={{ marginBottom: '16px' }}>{project.clientSector}</span>
            ) : null}
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
                <ProxyHeroImage
                  type="project"
                  slug={slug}
                  alt={project.heroImage?.alt || project.title || ''}
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

      <CalloutTeaser pageType="caseStudies" pageId={project._id} />

      {/* Content sections — three-column layout with ToC and sidebar */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <ThreeColumnLayout
          toc={<TableOfContents body={tocSource} />}
          sidebar={
            <ContentSidebar
              theme={project.theme}
              contentType="project"
              currentSlug={slug}
              relatedTools={project.relatedToolsViaTheme}
              relatedArticles={project.relatedArticlesViaTheme}
              sidebarCallouts={sidebarCallouts}
            />
          }
        >
          {hasBody ? (
            <div className="portable-text">
              <PortableText value={project.body} components={bodyComponents} />
            </div>
          ) : (
            <>
          {sections.map(({ key, label }) => {
            const content = project[key]
            if (!content) return null

            return (
              <div key={key} style={{
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
                <div style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The challenge</span>
                  <div className="portable-text">
                    <PortableText value={project.challenge} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.approach && (
                <div style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>Our approach</span>
                  <div className="portable-text">
                    <PortableText value={project.approach} components={portableTextComponents} />
                  </div>
                </div>
              )}
              {project.outcome && (
                <div style={{ marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>The outcome</span>
                  <div className="portable-text">
                    <PortableText value={project.outcome} components={portableTextComponents} />
                  </div>
                </div>
              )}
            </>
          )}
            </>
          )}
        </ThreeColumnLayout>
      </section>

      <PageCallouts pageType="caseStudies" pageId={project._id} />

      <CTA />

    </main>
  )
}
