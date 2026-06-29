import { imageSlugField, uniqueImageSlugs } from './_imageSlug'

export default {
  name: 'tool',
  title: 'Tools',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'taxonomy', title: 'Taxonomy' },
    { name: 'content', title: 'Content' },
    { name: 'toolkitPage', title: 'Toolkit Page' },
    { name: 'seo', title: 'SEO' },
    { name: 'practitioner', title: 'Practitioner' },
  ],
  fields: [
    // ── Core ──
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'core',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'shortSummary',
      title: 'Short Summary',
      type: 'text',
      rows: 3,
      group: 'core',
      description:
        'One or two sentences for cards, listing pages, and search results.',
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'core',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO.',
        },
      ],
      description: 'The main diagram or visual for this tool.',
    },

    // ── Taxonomy ──
    {
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      group: 'taxonomy',
      to: [{ type: 'theme' }],
      description: 'Primary theme - which service area does this tool relate to?',
      validation: (rule) => rule.required(),
    },
    {
      name: 'serviceCategories',
      title: 'Service Categories',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Purpose & Direction', value: 'purpose-direction' },
          { title: 'Structure & Operations', value: 'structure-operations' },
          { title: 'People & Capability', value: 'people-capability' },
          { title: 'Service & Experience', value: 'service-experience' },
        ],
      },
      description:
        'Which broad areas does this tool relate to? Used for filtering on the tools page.',
    },
    {
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      description:
        'Which services is this tool most relevant to? Creates cross-links between tools and service pages.',
    },
    {
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      description: 'Articles that relate to this tool. Creates cross-links between tools and article pages.',
    },
    {
      name: 'relatedTools',
      title: 'Related Tools',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'tool' }] }],
      description: 'Other tools that relate to this one. Creates cross-links between tool pages.',
    },
    // ── Content ──
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      // Within-page uniqueness for image URL slugs (shared rule — see _imageSlug.js).
      validation: (Rule) => uniqueImageSlugs(Rule),
      of: [
        { type: 'block' },
        { type: 'table' },
        { type: 'accordion' },
        { type: 'tabs' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            imageSlugField,
          ],
        },
      ],
    },

    // ── Toolkit Page ──
    {
      name: 'hasToolkit',
      title: 'Has downloadable toolkit?',
      type: 'boolean',
      group: 'toolkitPage',
      initialValue: false,
    },
    {
      name: 'toolkitFile',
      title: 'Toolkit PDF',
      type: 'file',
      group: 'toolkitPage',
      description: 'Upload the PDF if this tool has a downloadable version.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitDescription',
      title: 'Toolkit Page Description',
      type: 'text',
      rows: 3,
      group: 'toolkitPage',
      description:
        'Brief description of the template for the template download page intro. 2-3 sentences: what it contains, what it helps you do. Falls back to Short Summary if empty.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitWhatsInside',
      title: "What's In This Template",
      type: 'array',
      of: [{ type: 'block' }],
      group: 'toolkitPage',
      description:
        "Left column content: describe what the PDF contains, what sections it includes, when you'd reach for it. 100-150 words.",
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitTips',
      title: 'Tips For Using It',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'toolkitPage',
      description:
        'Right column content: practical advice for workshops, preparation tips, common approaches. 100-150 words.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitServiceCallout',
      title: 'Service Connection Text',
      type: 'text',
      rows: 3,
      group: 'toolkitPage',
      description:
        'Optional 2-3 sentences connecting this tool to the primary related service. If empty, a generic fallback is used.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitSeoTitle',
      title: 'Template SEO Title',
      type: 'string',
      group: 'toolkitPage',
      description:
        'Custom page title for the template page. Falls back to "{Tool Title} Template - Free PDF Download | Mutomorro" if empty.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
    {
      name: 'toolkitSeoDescription',
      title: 'Template SEO Description',
      type: 'text',
      rows: 3,
      group: 'toolkitPage',
      description:
        'Meta description for the template page. Falls back to generating from the template description if empty.',
      hidden: ({ document }) => !document?.hasToolkit,
    },

    // ── SEO ──
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description:
        'Custom page title for search engines. If blank, falls back to the tool title.',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'Meta description for search results. If blank, falls back to the short summary.',
    },
    {
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      group: 'seo',
      description:
        'Controls display position on the tools listing page. Lower numbers appear first. Leave blank to sort alphabetically after ordered items.',
    },
    // ── Practitioner ──
    {
      name: 'practitionerInsight',
      title: 'Practitioner Insight',
      type: 'text',
      rows: 4,
      group: 'practitioner',
      description: 'A short first-person note about how this tool has been used in practice. 2-4 sentences. Displays in the practitioner box on the page.',
    },
    {
      name: 'insightServiceSlug',
      title: 'Related Service Slug',
      type: 'string',
      group: 'practitioner',
      description: 'The slug of the most relevant service page (e.g. "change-management-consultancy"). Used to generate a link in the practitioner box.',
    },
    {
      name: 'lastReviewed',
      title: 'Last Reviewed',
      type: 'date',
      group: 'practitioner',
      description: 'The date this tool page was last reviewed for accuracy. Displays as "Last reviewed: [date]" on the page.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'shortSummary',
      media: 'heroImage',
    },
  },
}