import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ============================================
// PROJECTS
// ============================================

export async function getAllProjects() {
  return await client.fetch(`*[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    clientSector,
    challenge,
    shortSummary
  }`)
}

export async function getProject(slug) {
  return await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug }
  )
}

// ============================================
// TOOLS
// ============================================

export async function getAllTools() {
  return await client.fetch(`*[_type == "tool"] | order(title asc) {
    _id,
    title,
    slug,
    category,
    shortSummary,
    heroImage
  }`)
}

export async function getTool(slug) {
  return await client.fetch(
    `*[_type == "tool" && slug.current == $slug][0]`,
    { slug }
  )
}

// ============================================
// EMERGENT DIMENSIONS
// ============================================

export async function getAllDimensions() {
  return await client.fetch(`*[_type == "dimension"] | order(order asc) {
    _id,
    title,
    anchor,
    letter,
    order,
    slug,
    colour,
    tagline,
    shortSummary
  }`)
}

export async function getDimension(slug) {
  return await client.fetch(
    `*[_type == "dimension" && slug.current == $slug][0] {
      ...,
      relatedDimensions[]-> {
        _id,
        title,
        anchor,
        slug,
        colour,
        shortSummary
      }
    }`,
    { slug }
  )
}

// ============================================
// DIMENSION ARTICLES
// ============================================

export async function getDimensionArticles(dimensionSlug) {
  return await client.fetch(
    `*[_type == "dimensionArticle" && dimension->slug.current == $dimensionSlug] | order(order asc) {
      _id,
      title,
      slug,
      order,
      shortSummary
    }`,
    { dimensionSlug }
  )
}

export async function getDimensionArticle(dimensionSlug, articleSlug) {
  return await client.fetch(
    `*[_type == "dimensionArticle" && dimension->slug.current == $dimensionSlug && slug.current == $articleSlug][0] {
      ...,
      dimension-> {
        title,
        anchor,
        slug,
        colour
      }
    }`,
    { dimensionSlug, articleSlug }
  )
}

// ============================================
// ARTICLES
// ============================================

export async function getAllArticles() {
  return await client.fetch(`*[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    category,
    shortSummary,
    heroImage
  }`)
}

export async function getArticle(slug) {
  return await client.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      ...,
      relatedDimensions[]-> {
        _id,
        title,
        anchor,
        slug,
        colour
      }
    }`,
    { slug }
  )
}

// ============================================
// COURSES
// ============================================

export async function getAllCourses() {
  return await client.fetch(`*[_type == "course"] | order(title asc) {
    _id,
    title,
    slug,
    category,
    format,
    duration,
    shortSummary,
    heroImage
  }`)
}

export async function getCourse(slug) {
  return await client.fetch(
    `*[_type == "course" && slug.current == $slug][0] {
      ...,
      relatedDimensions[]-> {
        _id,
        title,
        anchor,
        slug,
        colour
      }
    }`,
    { slug }
  )
}

// Get all services grouped by category
export async function getAllServices() {
  return client.fetch(`
    *[_type == "service"] | order(category asc, order asc) {
      _id,
      title,
      slug,
      category,
      order,
      tagline,
      shortSummary,
    }
  `)
}

// ============================================
// SERVICES
// ============================================

// Get all services in a category
export async function getServicesByCategory(category) {
  return client.fetch(`
    *[_type == "service" && category == $category] | order(order asc) {
      _id,
      title,
      slug,
      category,
      tagline,
      shortSummary,
    }
  `, { category })
}

// Get single service
export async function getService(category, slug) {
  return client.fetch(`
    *[_type == "service" && category == $category && slug.current == $slug][0] {
      _id,
      title,
      slug,
      category,
      tagline,
      shortSummary,
      intro,
      body,
      relatedDimensions[]-> {
        title,
        slug,
        colour,
        anchor,
      },
      relatedServices[]-> {
        title,
        slug,
        category,
        shortSummary,
      },
    }
  `, { category, slug })
}