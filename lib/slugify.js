// Slugify a heading string for use as an in-page anchor id.
// Must produce the same output in TableOfContents and the PortableText
// heading renderers so ToC links resolve to real headings.
export function slugifyHeading(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
