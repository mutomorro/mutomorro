import { createClient } from '@supabase/supabase-js'
import { client } from '../sanity/client'
import { sitemapImage } from '@/lib/image-proxy'

const BASE_URL = 'https://mutomorro.com'

export default async function sitemap() {
  // Static pages. These aren't backed by Sanity, so lastModified is anchored to
  // the 2 May 2026 trailing-slash-fix deployment — the last change to touch them.
  const STATIC_LASTMOD = new Date('2026-05-02')
  const staticPages = [
    { url: BASE_URL, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/philosophy`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/how-we-work`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/develop`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/emergent-framework`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/states-of-vitality`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/articles`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/training`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/projects`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/topics`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/diagnostics`, lastModified: new Date('2026-05-22'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/diagnostics/drift-audit`, lastModified: new Date('2026-05-22'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/newsletter`, lastModified: new Date('2026-05-29'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Fetch all dynamic content from Sanity.
  // Image URLs (hero + inline body images) are included so they surface
  // as <image:image> tags in the sitemap, speeding up Google's transition
  // away from the old wp-content image URLs.
  const [
    services,
    tools,
    articles,
    projects,
    courses,
    capabilities,
    dimensions,
    dimensionArticles,
    themes,
    serviceSubPages,
    sectorLandingPages,
    resources,
  ] = await Promise.all([
    client.fetch(`*[_type == "service" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      "propositionImageUrl": propositionImage.asset->url,
      "perspectiveImageUrl": perspectiveImage.asset->url,
      "stageImages": stages[].stageImage.asset->url
    }`),
    client.fetch(`*[_type == "tool" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      hasToolkit,
      "heroImageUrl": heroImage.asset->url,
      "bodyImages": body[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "article" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      "heroImageUrl": heroImage.asset->url,
      "bodyImages": body[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "project" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      "heroImageUrl": heroImage.asset->url,
      "clientAndContextImages": clientAndContext[_type == "image"].asset->url,
      "theObjectiveImages": theObjective[_type == "image"].asset->url,
      "theApproachImages": theApproach[_type == "image"].asset->url,
      "whatChangedImages": whatChanged[_type == "image"].asset->url,
      "keyInsightImages": keyInsight[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "course" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      "heroImageUrl": heroImage.asset->url,
      "bodyImages": body[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "capabilityService" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "dimension" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt,
      "bodyImages": body[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "dimensionArticle" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      "dimensionSlug": dimension->slug.current,
      _updatedAt,
      "bodyImages": body[_type == "image"].asset->url
    }`),
    client.fetch(`*[_type == "theme" && !(_id in path("drafts.**")) && slug.current != "scaling-operations"]{
      "slug": slug.current,
      _updatedAt
    }`),
    client.fetch(`*[_type == "serviceSubPage" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      "parentSlug": parentService->slug.current,
      _updatedAt
    }`),
    client.fetch(`*[_type == "sectorLandingPage" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt
    }`),
    client.fetch(`*[_type == "resource" && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt
    }`),
  ])

  // Public newsletter editions. Volume is tiny — .range(0, 999) is fine for
  // years and won't hit the Supabase 1,000-row default.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: publicNewsletters } = await supabaseAdmin
    .from('newsletter_sends')
    .select('issue_key, completed_at')
    .eq('is_public', true)
    .eq('status', 'complete')
    .order('completed_at', { ascending: false })
    .range(0, 999)

  // Build a deduped, null-stripped images array from any number of inputs.
  const collectImages = (...sources) => [
    ...new Set(sources.flat().filter(Boolean)),
  ]

  const dynamicEntries = [
    ...services.map(s => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: s._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: collectImages(s.propositionImageUrl, s.perspectiveImageUrl, s.stageImages),
    })),
    ...tools.map(t => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      lastModified: t._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      images: collectImages(sitemapImage('tool', t.slug, t.heroImageUrl), t.bodyImages),
    })),
    ...tools.filter(t => t.hasToolkit).map(t => ({
      url: `${BASE_URL}/tools/${t.slug}/template`,
      lastModified: t._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: collectImages(t.heroImageUrl),
    })),
    ...articles.map(a => ({
      url: `${BASE_URL}/articles/${a.slug}`,
      lastModified: a._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: collectImages(a.heroImageUrl, a.bodyImages),
    })),
    ...projects.map(p => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      images: collectImages(
        p.heroImageUrl,
        p.clientAndContextImages,
        p.theObjectiveImages,
        p.theApproachImages,
        p.whatChangedImages,
        p.keyInsightImages,
      ),
    })),
    ...courses.map(c => ({
      url: `${BASE_URL}/training/${c.slug}`,
      lastModified: c._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: collectImages(c.heroImageUrl, c.bodyImages),
    })),
    ...capabilities.map(c => ({
      url: `${BASE_URL}/develop/${c.slug}`,
      lastModified: c._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...dimensions.map(d => ({
      url: `${BASE_URL}/emergent-framework/${d.slug}`,
      lastModified: d._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: collectImages(d.bodyImages),
    })),
    ...dimensionArticles.map(da => ({
      url: `${BASE_URL}/emergent-framework/${da.dimensionSlug}/${da.slug}`,
      lastModified: da._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
      images: collectImages(da.bodyImages),
    })),
    ...themes.map(t => ({
      url: `${BASE_URL}/topics/${t.slug}`,
      lastModified: t._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...serviceSubPages
      .filter(s => s.parentSlug && s.slug)
      .map(s => ({
        url: `${BASE_URL}/services/${s.parentSlug}/${s.slug}`,
        lastModified: s._updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })),
    ...sectorLandingPages.map(s => ({
      url: `${BASE_URL}/sectors/${s.slug}`,
      lastModified: s._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...resources.map(r => ({
      url: `${BASE_URL}/resources/${r.slug}`,
      lastModified: r._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...(publicNewsletters || []).map(n => ({
      url: `${BASE_URL}/newsletter/${n.issue_key}`,
      lastModified: n.completed_at ? new Date(n.completed_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ]

  return [...staticPages, ...dynamicEntries]
}
