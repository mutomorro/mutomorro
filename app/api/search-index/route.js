import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'

// Cache the search index for an hour on the edge. The dataset is small
// and rebuilds on Sanity publishes via revalidate, so this is fine.
export const revalidate = 3600

export async function GET() {
  const [tools, articles, services, projects, courses, resources, dimensions] = await Promise.all([
    client.fetch(`*[_type == "tool"]{ "type": "Tool", title, "slug": "/tools/" + slug.current, shortSummary, category }`),
    client.fetch(`*[_type == "article"]{ "type": "Article", title, "slug": "/articles/" + slug.current, shortSummary, "category": theme->title }`),
    client.fetch(`*[_type == "service"]{ "type": "Service", title, "slug": "/services/" + slug.current, "shortSummary": heroTagline, "category": categoryLabel }`),
    client.fetch(`*[_type == "project"]{ "type": "Case study", title, "slug": "/projects/" + slug.current, shortSummary, "category": clientSector }`),
    client.fetch(`*[_type == "course" && !(_id in path("drafts.**"))]{ "type": "Training", title, "slug": "/training/" + slug.current, shortSummary, category }`),
    client.fetch(`*[_type == "resource"]{ "type": "Resource", title, "slug": "/resources/" + slug.current, "shortSummary": description }`),
    client.fetch(`*[_type == "dimension"]{ "type": "Dimension", title, "slug": "/emergent-framework/" + slug.current, shortSummary, "category": "EMERGENT" }`),
  ])

  const items = [...tools, ...articles, ...services, ...projects, ...courses, ...resources, ...dimensions]
    .filter(item => item.title && item.slug)

  return NextResponse.json({ items })
}
