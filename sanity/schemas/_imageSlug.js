// Shared permalink sub-field for stable image URLs, reused across content types so the
// contract can't drift (mirrors _seo.js). A body image carries a permanent `imageSlug`
// (its stable URL's last segment, e.g. overview | step-1-name); the parent body array
// enforces within-page uniqueness. Spread `imageSlugField` into a body image member's
// `fields`, and attach `validation: (Rule) => uniqueImageSlugs(Rule)` to the body array.

// Recognised image-slug shapes. KEEP IN SYNC with ROLE_SUFFIX in lib/image-proxy.js (the
// route's flat-path parser) — a slug the route can't recognise would 404 the image:
//   - overview                         the main / hero diagram
//   - statistic | diagram | pull-quote a body image named by what it IS (articles)
//   - step-N-name / stage-N-name       a sequenced body diagram (tools)
export const IMAGE_SLUG_RE = /^(overview|statistic|diagram|pull-quote|(?:step|stage)-\d+(-[a-z0-9]+)+)$/

// The permanent per-image URL slug. Optional: an empty value falls back to the legacy
// `_key` URL. Format is validated; the slug is SET ONCE and never renamed (it IS the
// public URL — renaming 404s the address Google indexed).
export const imageSlugField = {
  name: 'imageSlug',
  title: 'Image URL slug (permanent)',
  type: 'string',
  description:
    'Permanent URL slug naming what this image is — “overview”, “statistic”, “diagram”, ' +
    '“pull-quote”, or “step-N-name” for a sequenced diagram (e.g. step-1-political). ' +
    'Lowercase, hyphens. SET ONCE, NEVER CHANGE: this slug IS the public image URL.',
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value) return true
      return IMAGE_SLUG_RE.test(value)
        ? true
        : 'Use a controlled role word (overview, statistic, diagram, pull-quote) or step-N-name — lowercase, hyphens.'
    }),
}

// FREE-FORM variant — for types whose body images are unique descriptive diagrams rather
// than a controlled role set (case studies). The slug is any lowercase kebab phrase (derived
// from the alt text, e.g. `five-dimensions-of-organisational-design`); the route resolves it
// from the NESTED path `/img/<type>/<slug>/body/<imageSlug>`, so a hyphen-rich slug is safe.
// Still SET ONCE and unique-per-page (the URL must point at exactly one image).
export const FREEFORM_IMAGE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const freeformImageSlugField = {
  name: 'imageSlug',
  title: 'Image URL slug (permanent)',
  type: 'string',
  description:
    'Permanent URL slug describing this image, derived from its alt text (e.g. ' +
    '“five-dimensions-of-organisational-design”). Lowercase, hyphens, no spaces. ' +
    'SET ONCE, NEVER CHANGE: this slug IS the public image URL.',
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value) return true
      return FREEFORM_IMAGE_SLUG_RE.test(value)
        ? true
        : 'Lowercase letters, numbers and single hyphens only — no spaces or leading/trailing hyphens.'
    }),
}

// Within-page uniqueness for image URL slugs — two images on one page can't share an
// imageSlug (the stable URL must point at exactly one image). Checked at the array level
// so every sibling is visible deterministically.
export function uniqueImageSlugs(Rule) {
  return Rule.custom((blocks) => {
    const seen = new Map()
    for (const b of blocks || []) {
      if (b?._type !== 'image' || !b?.imageSlug) continue
      if (seen.has(b.imageSlug)) {
        return `Two images share the URL slug "${b.imageSlug}" — each image needs a unique slug.`
      }
      seen.set(b.imageSlug, b._key)
    }
    return true
  })
}
