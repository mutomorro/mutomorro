import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'theme',
  title: 'Themes',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Intro paragraph for the topic hub page.',
    }),
    defineField({
      name: 'toolsIntro',
      title: 'Tools Section Intro',
      type: 'text',
      rows: 2,
      description: 'Short intro text shown above the tools list on the hub page.',
    }),
    defineField({
      name: 'articlesIntro',
      title: 'Articles Section Intro',
      type: 'text',
      rows: 2,
      description: 'Short intro text shown above the articles list on the hub page.',
    }),
    defineField({
      name: 'coursesIntro',
      title: 'Courses Section Intro',
      type: 'text',
      rows: 2,
      description: 'Short intro text shown above the courses list on the hub page.',
    }),
    defineField({
      name: 'caseStudiesIntro',
      title: 'Case Studies Section Intro',
      type: 'text',
      rows: 2,
      description: 'Short intro text shown above the case studies list on the hub page.',
    }),
    defineField({
      name: 'anchorType',
      title: 'Anchor type',
      type: 'string',
      options: {
        list: [
          { title: 'Service', value: 'service' },
          { title: 'Develop', value: 'develop' },
          { title: 'Fieldmarks', value: 'fieldmarks' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'anchorUrl',
      title: 'Anchor URL',
      type: 'url',
      description: 'The page this theme links to.',
      validation: (Rule) =>
        Rule.required().uri({ allowRelative: true, scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'relatedThemes',
      title: 'Related Themes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'theme' }] }],
      description: 'Related topic hubs to link to (2-3 recommended).',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom page title for search engines. Falls back to theme title if empty.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Meta description for search engines.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      anchorType: 'anchorType',
      anchorUrl: 'anchorUrl',
    },
    prepare({ title, anchorType, anchorUrl }) {
      return {
        title,
        subtitle: `${anchorType} - ${anchorUrl}`,
      }
    },
  },
  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
