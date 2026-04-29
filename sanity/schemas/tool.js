export default {
  name: 'tool',
  title: 'Tools',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'taxonomy', title: 'Taxonomy' },
    { name: 'content', title: 'Content' },
    { name: 'toolkit', title: 'Toolkit' },
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
      name: 'emergentDimensions',
      title: 'EMERGENT Dimensions',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Resonant Purpose', value: 'resonant-purpose' },
          { title: 'Embedded Strategy', value: 'embedded-strategy' },
          { title: 'Energy from Culture', value: 'energy-from-culture' },
          { title: 'Momentum through Work', value: 'momentum-through-work' },
          { title: 'Generative Capacity', value: 'generative-capacity' },
          { title: 'Tuned to Change', value: 'tuned-to-change' },
          { title: 'Narrative Connections', value: 'narrative-connections' },
          { title: 'Service Innovation', value: 'service-innovation' },
        ],
      },
      description:
        'Which EMERGENT dimensions does this tool connect to?',
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
    {
      name: 'topics',
      title: 'Topics',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'Granular subject tags - e.g. Decision Making, Teamwork, Lean.',
    },

    // ── Content ──
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
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
          ],
        },
      ],
    },

    // ── Toolkit ──
    {
      name: 'hasToolkit',
      title: 'Has downloadable toolkit?',
      type: 'boolean',
      group: 'toolkit',
      initialValue: false,
    },
    {
      name: 'toolkitFile',
      title: 'Toolkit PDF',
      type: 'file',
      group: 'toolkit',
      description: 'Upload the PDF if this tool has a downloadable version.',
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
      name: 'seoKeyword',
      title: 'Focus Keyword',
      type: 'string',
      group: 'seo',
      description:
        'Primary keyword from RankMath - carried over for reference.',
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