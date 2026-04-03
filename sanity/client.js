import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const fetchOpts = { next: { revalidate: 3600 } }

// ============================================
// PROJECTS
// ============================================

export async function getAllProjects() {
  return await client.fetch(`*[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    client,
    clientSector,
    challenge,
    shortSummary,
    "heroImageUrl": heroImage.asset->url,
    "relatedServices": relatedServices[]->{_id, title, "slug": slug.current}
  }`, {}, fetchOpts)
}

export async function getProject(slug) {
  return await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug },
    fetchOpts
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
    heroImage,
    "relatedServices": relatedServices[]->{_id, title, "slug": slug.current}
  }`, {}, fetchOpts)
}

export async function getTool(slug) {
  return await client.fetch(
    `*[_type == "tool" && slug.current == $slug][0] {
      ...,
      "toolkitFileUrl": toolkitFile.asset->url
    }`,
    { slug },
    fetchOpts
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
  }`, {}, fetchOpts)
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
    { slug },
    fetchOpts
  )
}

// ============================================
// FRAMEWORK OVERVIEW (singleton)
// ============================================

export async function getFrameworkOverview() {
  return await client.fetch(
    `*[_type == "frameworkOverview"][0]{ title, subtitle, intro, body }`,
    {},
    fetchOpts
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
    { dimensionSlug },
    fetchOpts
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
    { dimensionSlug, articleSlug },
    fetchOpts
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
    heroImage,
    "relatedServices": relatedServices[]->{_id, title, "slug": slug.current}
  }`, {}, fetchOpts)
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
    { slug },
    fetchOpts
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
    heroImage,
    "relatedServices": relatedServices[]->{_id, title, "slug": slug.current}
  }`, {}, fetchOpts)
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
    { slug },
    fetchOpts
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
  `, {}, fetchOpts)
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
  `, { category }, fetchOpts)
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
        stageLinkLabel,
        stageLinkUrl,
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
  `, { slug }, fetchOpts)
}

// ============================================
// SERVICE SUB-PAGES
// ============================================

// Get a single service sub-page by parent service slug and sub-page slug
export async function getServiceSubPage(serviceSlug, subPageSlug) {
  return client.fetch(`
    *[_type == "serviceSubPage" && parentService->slug.current == $serviceSlug && slug.current == $subPageSlug][0] {
      _id,
      title,
      slug,

      // Parent service info
      "parentService": parentService-> {
        _id,
        title,
        slug,
        category,
        categoryLabel,
      },

      // Hero
      heroHeading,
      heroTagline,

      // Content sections
      sections[] {
        heading,
        body,
        backgroundStyle,
      },

      // Proof
      proofHeading,
      proofBody,
      relatedProjects[]-> {
        _id,
        title,
        slug,
        clientSector,
        shortSummary,
        "heroImageUrl": heroImage.asset->url,
      },

      // CTA
      ctaHeading,
      ctaBody,
      ctaButtonLabel,
      ctaButtonUrl,
      parentLinkText,

      // SEO
      seoTitle,
      seoDescription,
    }
  `, { serviceSlug, subPageSlug }, fetchOpts)
}

// Get all sub-pages for a given service (for listings or nav)
export async function getServiceSubPages(serviceSlug) {
  return client.fetch(`
    *[_type == "serviceSubPage" && parentService->slug.current == $serviceSlug] | order(title asc) {
      _id,
      title,
      slug,
      heroTagline,
    }
  `, { serviceSlug }, fetchOpts)
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
  `, {}, fetchOpts)
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
  `, { slug }, fetchOpts)
}


// ============================================
// RESOURCES
// ============================================

export async function getResource(slug) {
  return await client.fetch(
    `*[_type == "resource" && slug.current == $slug][0] {
      ...,
      "downloadUrl": downloadFile.asset->url,
      "previewImageUrl": previewImage.asset->url,
      relatedServices[]->{title, "slug": slug.current},
      relatedTools[]->{title, "slug": slug.current},
      relatedArticles[]->{title, "slug": slug.current}
    }`,
    { slug },
    fetchOpts
  )
}

export async function getAllResourceSlugs() {
  return await client.fetch(
    `*[_type == "resource"]{ "slug": slug.current }`,
    {},
    fetchOpts
  )
}

// ============================================
// SECTOR LANDING PAGES
// ============================================

export async function getSectorLandingPage(slug) {
  return client.fetch(`
    *[_type == "sectorLandingPage" && slug.current == $slug][0] {
      ...,
      featuredServices[] {
        sectorAngle,
        serviceRef-> {
          _type,
          title,
          "slug": slug.current,
          heroTagline
        }
      },
      featuredProjects[]-> {
        title,
        "slug": slug.current,
        summary,
        shortSummary,
        "heroImageUrl": heroImage.asset->url,
        clientSector
      },
      featuredTools[]-> {
        title,
        "slug": slug.current
      },
      featuredArticles[]-> {
        title,
        "slug": slug.current
      },
      "sectorLogos": sectorLogos[] {
        "url": asset->url,
        alt
      }
    }
  `, { slug }, fetchOpts)
}

export async function getAllSectorLandingPages() {
  return client.fetch(`
    *[_type == "sectorLandingPage"] | order(order asc) {
      title,
      "slug": slug.current,
      sectorLabel,
      heroHeading,
      heroSubheading
    }
  `, {}, fetchOpts)
}
