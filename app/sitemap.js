import { client } from '../sanity/client'

const BASE_URL = 'https://mutomorro.com'

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/philosophy/`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/how-we-work/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/develop/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/emergent-framework/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/states-of-vitality/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tools/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/articles/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/courses/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/projects/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Fetch all dynamic content from Sanity
  const [services, tools, articles, projects, courses, capabilities, dimensions, dimensionArticles] = await Promise.all([
    client.fetch(`*[_type == "service" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "tool" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "article" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "project" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "course" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "capabilityService" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "dimension" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }`),
    client.fetch(`*[_type == "dimensionArticle" && !(_id in path("drafts.**"))]{ "slug": slug.current, "dimensionSlug": dimension->slug.current, _updatedAt }`),
  ])

  const dynamicEntries = [
    ...services.map(s => ({
      url: `${BASE_URL}/services/${s.slug}/`,
      lastModified: s._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.9,
    })),
    ...tools.map(t => ({
      url: `${BASE_URL}/tools/${t.slug}/`,
      lastModified: t._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...articles.map(a => ({
      url: `${BASE_URL}/articles/${a.slug}/`,
      lastModified: a._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...projects.map(p => ({
      url: `${BASE_URL}/projects/${p.slug}/`,
      lastModified: p._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...courses.map(c => ({
      url: `${BASE_URL}/courses/${c.slug}/`,
      lastModified: c._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...capabilities.map(c => ({
      url: `${BASE_URL}/develop/${c.slug}/`,
      lastModified: c._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...dimensions.map(d => ({
      url: `${BASE_URL}/emergent-framework/${d.slug}/`,
      lastModified: d._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...dimensionArticles.map(da => ({
      url: `${BASE_URL}/emergent-framework/${da.dimensionSlug}/${da.slug}/`,
      lastModified: da._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    })),
  ]

  return [...staticPages, ...dynamicEntries]
}
