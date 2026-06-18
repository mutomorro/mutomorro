// Shared SEO metadata builder — the §I1 enforcement helper.
//
// Every route's generateMetadata() should `return buildMetadata({...})` so the
// canonical URL, OpenGraph image, og:url, and title-suffix handling stay
// consistent BY CONSTRUCTION. Routes still resolve their own per-type title /
// description / image values (that part is genuinely per-type); this owns the
// assembly so no route can silently ship without a canonical or an OG image.

const SITE_URL = 'https://mutomorro.com'
const DEFAULT_OG_IMAGE = '/og-default.png'

// Strip a stray "| Mutomorro" / "- Mutomorro" suffix so the root layout's title
// template ('%s | Mutomorro') doesn't double it up.
const stripSuffix = (t) => (t || '').replace(/\s*[|\-]\s*Mutomorro\s*$/i, '').trim() || t

/**
 * Build a Next.js metadata object with an enforced SEO baseline.
 *
 * @param {object}  o
 * @param {string}  o.title           Resolved title (e.g. seoTitle || title).
 * @param {string}  [o.description]   Resolved description (e.g. seoDescription || shortSummary).
 * @param {string}  o.path            Absolute path, e.g. `/tools/${slug}` — drives canonical + og:url.
 * @param {string}  [o.image]         Absolute image URL; falls back to the default OG image.
 * @param {'website'|'article'} [o.type]
 * @param {string}  [o.publishedTime] ISO date (article types).
 * @param {string}  [o.modifiedTime]  ISO date (article types).
 * @returns {import('next').Metadata}
 */
export function buildMetadata({
  title,
  description = '',
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
} = {}) {
  if (!path) throw new Error('buildMetadata: `path` is required (used for canonical + og:url)')
  const cleanTitle = stripSuffix(title)
  const url = `${SITE_URL}${path}`

  return {
    title: cleanTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: cleanTitle,
      description,
      url,
      type,
      // og:locale + og:site_name must be re-declared here: when a route returns its
      // own openGraph, Next.js drops the root layout's openGraph defaults (the same
      // quirk the 3 May 2026 fix handled for images). Added 18 Jun 2026.
      siteName: 'Mutomorro',
      locale: 'en_GB',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      images: [{ url: image || DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    // Twitter tags are inherited: the root layout sets the card type and Next.js
    // derives twitter title/description/image from openGraph above.
  }
}
