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
    shortSummary,
    "heroImageUrl": heroImage.asset->url
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
    `*[_type == "tool" && slug.current == $slug][0] {
      ...,
      "toolkitFileUrl": toolkitFile.asset->url
    }`,
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

// ============================================
// SERVICES
// ============================================

// Get all services (for listings)
export async function getAllServices() {
  return client.fetch(`
    *[_type == "service"] | order(category asc, order asc) {
      _id,
      title,
      slug,
      category,
      categoryLabel,
      order,
      heroTagline,
    }
  `)
}

// Get all services in a category
export async function getServicesByCategory(category) {
  return client.fetch(`
    *[_type == "service" && category == $category] | order(order asc) {
      _id,
      title,
      slug,
      category,
      categoryLabel,
      heroTagline,
    }
  `, { category })
}

// Get single service - full page content
export async function getService(slug) {
  return client.fetch(`
    *[_type == "service" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      category,
      categoryLabel,

      // Hero
      heroHeading,
      heroTagline,

      // Context
      contextHeading,
      contextBody,
      "propositionImageUrl": propositionImage.asset->url,
      propositionCaption,

      // Recognition
      recognitionHeading,
      recognitionIntro,
      recognitionItems,
      recognitionBridge,

      // Stats
      stats,

      // Perspective
      perspectiveHeading,
      perspectiveBody,
      "perspectiveImageUrl": perspectiveImage.asset->url,
      perspectiveLinkLabel,
      perspectiveLinkUrl,

      // Approach
      approachIntro,
      stages[] {
        stageNumber,
        stageTitle,
        stageSummary,
        stageHeading,
        stageBody,
        stageInPractice,
        stageOutcome,
        "stageImageUrl": stageImage.asset->url,
      },

      // Outcomes
      outcomesHeading,
      outcomesIntro,
      outcomes,
      outcomesClosing,

      // Examples
      relatedProjects[]-> {
        _id,
        title,
        slug,
        clientSector,
        shortSummary,
        "heroImageUrl": heroImage.asset->url,
      },
      testimonialQuote,
      testimonialAttribution,

      // CTA
      ctaHeading,
      ctaBody,
      ctaButtonLabel,
      ctaButtonUrl,

      // Mid-page CTAs
      midCtaAfterProofText,
      midCtaAfterProofButton,
      midCtaAfterOutcomesText,
      midCtaAfterOutcomesButton,

      // Logo strip
      showLogoStrip,
      logoStripPosition,

      // SEO
      seoTitle,
      seoDescription,

      // Related
      relatedDimensions[]-> {
        _id,
        title,
        slug,
        colour,
        anchor,
      },
      relatedServices[]-> {
        _id,
        title,
        slug,
        category,
        categoryLabel,
        heroTagline,
      },
    }
  `, { slug })
}

// ============================================
// CAPABILITY SERVICES (Building Capability)
// ============================================

// Get all capability services (for landing page listing)
export async function getAllCapabilityServices() {
  return client.fetch(`
    *[_type == "capabilityService"] | order(order asc) {
      _id,
      title,
      slug,
      audience,
      audienceLabel,
      order,
      heroTagline,
    }
  `)
}

// Get single capability service - full page content
export async function getCapabilityService(slug) {
  return client.fetch(`
    *[_type == "capabilityService" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      audience,
      audienceLabel,
      order,

      // Hero
      heroHeading,
      heroTagline,

      // Audience
      audienceHeading,
      audienceBody,

      // Structure
      structureHeading,
      structureIntro,
      structureItems[] {
        itemTitle,
        itemDescription,
      },

      // Difference
      differenceHeading,
      differenceIntro,
      differenceItems[] {
        itemTitle,
        itemDescription,
      },

      // Takeaways
      takeawayHeading,
      takeawayIntro,
      takeawayItems[] {
        itemTitle,
        itemDescription,
      },

      // CTA
      ctaHeading,
      ctaBody,
      ctaButtonLabel,
      ctaButtonUrl,

      // SEO
      seoTitle,
      seoDescription,
      seoKeywords,
    }
  `, { slug })
}