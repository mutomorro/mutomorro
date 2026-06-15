// Shared SEO schema fragments — the §I2 enforcement contract.
//
// Spread these into every routable document type so the SEO field group, the
// seoTitle/seoDescription fields, and image-with-alt all stay consistent and no
// type can drift (e.g. theme shipping ungrouped SEO fields, or an image field
// shipping with no alt subfield).
//
// NOT a document type — deliberately not imported/registered in sanity.config.js.

export const seoGroup = { name: 'seo', title: 'SEO' }

export const seoFields = [
  {
    name: 'seoTitle',
    title: 'SEO Title',
    type: 'string',
    group: 'seo',
    description: 'Custom page title for search engines. Falls back to the page title if blank.',
  },
  {
    name: 'seoDescription',
    title: 'SEO Description',
    type: 'text',
    rows: 3,
    group: 'seo',
    description: 'Meta description for search results. Falls back to the short summary if blank.',
  },
]

// An image field that always carries an alt subfield (hero / named / body images).
// Pass overrides to set name/title/group/description, e.g. imageWithAlt({ name: 'heroImage', title: 'Hero image', group: 'core' }).
export const imageWithAlt = (overrides = {}) => ({
  type: 'image',
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Describe the image for accessibility and SEO.',
    },
  ],
  ...overrides,
})
