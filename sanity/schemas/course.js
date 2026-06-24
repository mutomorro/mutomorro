import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'course',
  title: 'Courses',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'taxonomy', title: 'Taxonomy' },
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'core',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      group: 'taxonomy',
      to: [{ type: 'theme' }],
      description: 'Primary theme - which service area does this course relate to?',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'taxonomy',
      options: {
        list: [
  { title: 'Change', value: 'change' },
  { title: 'Culture', value: 'culture' },
  { title: 'Leadership', value: 'leadership' },
  { title: 'Operations', value: 'operations' },
  { title: 'Purpose', value: 'purpose' },
  { title: 'Service Design', value: 'service-design' },
  { title: 'Storytelling', value: 'storytelling' },
  { title: 'Strategy', value: 'strategy' },
  { title: 'Teams', value: 'teams' },
],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      group: 'core',
      description: 'One or two sentences for cards and listings',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
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
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      group: 'core',
      description: 'e.g. 4 hours, 2 days, 6 weeks',
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      group: 'core',
      options: {
        list: [
          { title: 'Self-paced online', value: 'self-paced' },
          { title: 'Live online', value: 'live-online' },
          { title: 'In person', value: 'in-person' },
          { title: 'Blended', value: 'blended' },
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        { type: 'table' },
        { type: 'accordion' },
        { type: 'tabs' },
        { type: 'courseEntry' },
        {
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
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      group: 'taxonomy',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
        },
      ],
      description: 'Which services relate to this content (used for filtering on list pages)',
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      description: 'Articles that relate to this course.',
    }),
    defineField({
      name: 'relatedTools',
      title: 'Related Tools',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'tool' }] }],
      description: 'Tools that relate to this course.',
    }),
    defineField({
      name: 'relatedDimensions',
      title: 'Related dimensions',
      type: 'array',
      group: 'taxonomy',
      description: 'Which EMERGENT dimensions does this course relate to?',
      of: [
        {
          type: 'reference',
          to: [{ type: 'dimension' }],
        },
      ],
    }),
    defineField({
      name: 'sidebarPrimary',
      title: 'Right-sidebar CTA (override)',
      type: 'object',
      group: 'content',
      description: 'Optional. The primary call-to-action card shown in the right sidebar. Leave blank to use the default enquiry CTA.',
      fields: [
        { name: 'heading', title: 'Heading', type: 'string' },
        { name: 'body', title: 'Body', type: 'text', rows: 3 },
        { name: 'label', title: 'Button label', type: 'string' },
        { name: 'url', title: 'Button URL', type: 'string' },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Custom page title for search engines. Falls back to course title if blank.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Meta description for search results. Falls back to short summary if blank.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      format: 'format',
    },
    prepare({ title, category, format }) {
      return {
        title: title,
        subtitle: `${category} - ${format}`,
      }
    },
  },
})
