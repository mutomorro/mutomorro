import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Displayed below the title on the article page',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Change Management', value: 'change-management' },
          { title: 'Culture Change', value: 'culture-change' },
          { title: 'Culture', value: 'culture' },
          { title: 'Organisational Purpose', value: 'organisational-purpose' },
          { title: 'Organisational Health', value: 'organisational-health' },
          { title: 'Organisational Design', value: 'organisational-design' },
          { title: 'Organisational Development', value: 'organisational-development' },
          { title: 'Operational Effectiveness', value: 'operational-effectiveness' },
          { title: 'Strategic Alignment', value: 'strategic-alignment' },
          { title: 'Strategy', value: 'strategy' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Capacity Building', value: 'capacity-building' },
          { title: 'Service Design', value: 'service-design' },
          { title: 'Systems Thinking', value: 'systems-thinking' },
          { title: 'Change', value: 'change' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences for cards and listings',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
      validation: Rule => Rule.required(),
    }),

    // --- SEO fields ---
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Overrides the page title in search results (50-60 characters ideal)',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Displayed in search results below the title (120-160 characters ideal)',
      group: 'seo',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO keywords',
      type: 'string',
      description: 'Comma-separated keywords for internal reference',
      group: 'seo',
    }),

    // --- Cross-references ---
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
      description: 'Other articles shown as related content',
      group: 'references',
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
        },
      ],
      description: 'Which services relate to this content',
      group: 'references',
    }),
    defineField({
      name: 'relatedTools',
      title: 'Related Tools',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tool' }],
        },
      ],
      description: 'Which tools relate to this content',
      group: 'references',
    }),
    defineField({
      name: 'relatedDimensions',
      title: 'Related dimensions',
      type: 'array',
      description: 'Which EMERGENT dimensions does this article relate to?',
      of: [
        {
          type: 'reference',
          to: [{ type: 'dimension' }],
        },
      ],
      group: 'references',
    }),
  ],

  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'references', title: 'Related content' },
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      date: 'publishedAt',
    },
    prepare({ title, category, date }) {
      return {
        title: title,
        subtitle: `${category} - ${date}`,
      }
    },
  },
})