import { client, getToolTemplate, getDownloadSuccessCallout } from '@/sanity/client'
import { buildMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/sanity/image'
import ToolDownloadForm from '@/components/ToolDownloadForm'
import DownloadSuccessCallout from '@/components/DownloadSuccessCallout'

export const revalidate = 3600

// Strip a trailing "| Mutomorro" so the layout's title template doesn't double it up.
const stripSuffix = (s) => s?.replace(/\s*[|\-]\s*Mutomorro\s*$/i, '') || s

// Trim a description to a max length at a word boundary, dropping any dangling
// connector word so it ends cleanly. Google appends its own ellipsis when it truncates.
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'by', 'for',
  'with', 'from', 'into', 'through', 'that', 'as', 'at', 'is', 'its', 'it',
])
const capDescription = (str, max) => {
  if (!str || str.length <= max) return str
  let cut = str.slice(0, max).replace(/\s+\S*$/, '') // back off to a whole word
  cut = cut.replace(/[\s,;:\-–]+$/, '')              // tidy trailing punctuation
  const words = cut.split(/\s+/)
  while (
    words.length > 1 &&
    STOP_WORDS.has(words[words.length - 1].toLowerCase().replace(/[^\w']/g, ''))
  ) {
    words.pop()
  }
  return words.join(' ').replace(/[\s,;:\-–]+$/, '')
}

export async function generateStaticParams() {
  const tools = await client.fetch(
    `*[_type == "tool" && hasToolkit == true]{ "slug": slug.current }`
  )
  return tools.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tool = await client.fetch(
    `*[_type == "tool" && slug.current == $slug && hasToolkit == true][0]{
      title, shortSummary, toolkitDescription, toolkitSeoTitle, toolkitSeoDescription,
      "heroImageUrl": heroImage.asset->url
    }`,
    { slug }
  )
  if (!tool) return {}

  const title = stripSuffix(
    tool.toolkitSeoTitle || `${tool.title} Template - Free PDF Download | Mutomorro`
  )

  let description = tool.toolkitSeoDescription
  if (!description) {
    const base = (tool.toolkitDescription || tool.shortSummary || '').trim()
    const firstSentence = base.match(/^[^.!?]*[.!?]?/)?.[0]?.trim() || ''
    const sentence = firstSentence
      ? /[.!?]$/.test(firstSentence)
        ? firstSentence
        : `${firstSentence}.`
      : ''
    const lead = `Free ${tool.title} template (PDF).`
    description = capDescription(sentence ? `${lead} ${sentence}` : lead, 155)
  }

  return buildMetadata({
    title,
    description,
    path: `/tools/${slug}/template`,
    image: tool.heroImageUrl,
    type: 'website',
  })
}

const portableTextComponents = {
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} className="inline-link">
        {children}
      </a>
    ),
  },
}

export default async function ToolTemplatePage({ params }) {
  const { slug } = await params
  const tool = await getToolTemplate(slug)

  if (!tool) notFound()

  const successCallout = await getDownloadSuccessCallout(tool._id)

  const pdfUrl = tool.toolkitFileUrl || null
  const heroImageUrl = tool.heroImage ? urlFor(tool.heroImage).width(900).url() : null
  const modelName = tool.title.replace(/^The\s+/i, '')
  const service = tool.primaryService
  const caseStudy = tool.relatedCaseStudy
  const relatedTemplates = (tool.relatedTemplates || []).filter(Boolean)

  const intro = tool.toolkitDescription || tool.shortSummary || ''
  const whatsInside = tool.toolkitWhatsInside
  const tips = tool.toolkitTips
  const serviceCallout = tool.toolkitServiceCallout

  const hasWhatsInside = whatsInside?.length > 0
  const hasTips = tips?.length > 0
  const hasGuidance = hasWhatsInside || hasTips
  const hasNextSteps = !!service || relatedTemplates.length > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: `${tool.title} Template`,
    description: intro,
    url: `https://mutomorro.com/tools/${slug}/template`,
    encodingFormat: 'application/pdf',
    isAccessibleForFree: true,
    provider: {
      '@type': 'Organization',
      name: 'Mutomorro',
      url: 'https://mutomorro.com',
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://mutomorro.com/tools' },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.title,
        item: `https://mutomorro.com/tools/${slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Template',
        item: `https://mutomorro.com/tools/${slug}/template`,
      },
    ],
  }

  return (
    <main className="page-template">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Top — breadcrumbs, heading, intro, preview image + download form */}
      <section className="section--full warm-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="breadcrumb">
            <Link href="/tools" className="breadcrumb__link">Tools</Link>
            <span className="breadcrumb__sep">/</span>
            <Link href={`/tools/${slug}`} className="breadcrumb__link">{tool.title}</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Template</span>
          </div>

          <h1 className="heading-h1" style={{ margin: '0 0 20px' }}>
            {tool.title} - Free Template
          </h1>

          {intro && (
            <p className="lead-text" style={{ margin: '0 0 16px', maxWidth: '680px' }}>
              {intro}
            </p>
          )}

          <p className="body-text" style={{ margin: '0 0 3rem' }}>
            Based on our{' '}
            <Link href={`/tools/${slug}`} className="inline-link">
              full guide to the {tool.title}
            </Link>.
          </p>

          <div className="template-form-grid">
            <div className="template-form-grid__preview">
              {heroImageUrl && (
                <Image
                  src={heroImageUrl}
                  alt={`Free ${tool.title} template - downloadable PDF`}
                  width={900}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 720px"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
            </div>
            <div className="template-form-card">
              <ToolDownloadForm
                toolTitle={tool.title}
                toolSlug={slug}
                pdfUrl={pdfUrl}
                successCallout={successCallout ? <DownloadSuccessCallout callout={successCallout} /> : null}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — guidance */}
      {hasGuidance && (
        <section className="section--full warm-bg section-padding">
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className="template-guidance-grid">
              {hasWhatsInside && (
                <div>
                  <h2 className="heading-h4" style={{ margin: '0 0 16px' }}>
                    What&apos;s in this {modelName} template
                  </h2>
                  <div className="portable-text">
                    <PortableText
                      value={whatsInside}
                      components={portableTextComponents}
                    />
                  </div>
                </div>
              )}
              {hasTips && (
                <div>
                  <h2 className="heading-h4" style={{ margin: '0 0 16px' }}>
                    Tips for using it
                  </h2>
                  <div className="portable-text">
                    <PortableText
                      value={tips}
                      components={portableTextComponents}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section 5 — next steps */}
      {hasNextSteps && (
        <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div className={service ? 'template-next-grid' : ''}>
              {/* Service connection + case study */}
              {service && (
                <div>
                  <span className="kicker" style={{ display: 'block', marginBottom: '16px' }}>
                    Related service
                  </span>
                  <h2 className="heading-h3" style={{ margin: '0 0 16px' }}>
                    <Link href={`/services/${service.slug}`} className="inline-link">
                      {service.title}
                    </Link>
                  </h2>
                  <p className="body-text" style={{ marginBottom: '20px' }}>
                    {serviceCallout ||
                      `If you're working with ${tool.title} and want support putting it into practice, find out how we help organisations with ${service.title}.`}
                  </p>
                  <p className="body-text" style={{ margin: 0 }}>
                    <Link href={`/services/${service.slug}`} className="inline-link">
                      Find out more <span aria-hidden="true">→</span>
                    </Link>
                  </p>

                  {caseStudy && (
                    <Link href={`/projects/${caseStudy.slug}`} className="tpl-casestudy-card">
                      {caseStudy.heroImage && (
                        <img
                          className="tpl-casestudy-card__img"
                          src={urlFor(caseStudy.heroImage).width(240).height(240).url()}
                          alt={caseStudy.heroImage.alt || caseStudy.title}
                        />
                      )}
                      <div>
                        <span className="kicker" style={{ display: 'block', marginBottom: '8px' }}>
                          Case study
                        </span>
                        <p className="tpl-mini-card__title" style={{ fontSize: '17px' }}>
                          {caseStudy.title}
                        </p>
                        {caseStudy.shortSummary && (
                          <p className="body-text" style={{ fontSize: '15px', margin: '0 0 8px' }}>
                            {caseStudy.shortSummary}
                          </p>
                        )}
                        <span className="tpl-mini-card__action">Read the case study →</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {/* Related templates */}
              {relatedTemplates.length > 0 && (
                <div>
                  <span className="kicker" style={{ display: 'block', marginBottom: '16px' }}>
                    Related templates
                  </span>
                  <div className="tpl-list">
                    {relatedTemplates.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/tools/${t.slug}/template`}
                        className="tpl-mini-card"
                      >
                        {t.heroImage && (
                          <img
                            className="tpl-mini-card__img"
                            src={urlFor(t.heroImage).width(152).height(152).url()}
                            alt={t.heroImage.alt || t.title}
                          />
                        )}
                        <div>
                          <p className="tpl-mini-card__title">{t.title}</p>
                          <span className="tpl-mini-card__action">Get template →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
