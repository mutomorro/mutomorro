import { defineField, defineType } from 'sanity'
import { seoGroup, seoFields } from './_seo'

export default defineType({
  name: 'theme',
  title: 'Themes',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'content', title: 'Hub Content' },
    { name: 'taxonomy', title: 'Taxonomy' },
    seoGroup,
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'core',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      group: 'core',
      of: [{ type: 'block' }],
      description: 'Intro paragraph for the topic hub page.',
    }),
    defineField({
      name: 'toolsIntro',
      title: 'Tools Section Intro',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Short intro text shown above the tools list on the hub page.',
    }),
    defineField({
      name: 'articlesIntro',
      title: 'Articles Section Intro',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Short intro text shown above the articles list on the hub page.',
    }),
    defineField({
      name: 'coursesIntro',
      title: 'Courses Section Intro',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Short intro text shown above the courses list on the hub page.',
    }),
    defineField({
      name: 'caseStudiesIntro',
      title: 'Case Studies Section Intro',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Short intro text shown above the case studies list on the hub page.',
    }),
    defineField({
      name: 'anchorType',
      title: 'Anchor type',
      type: 'string',
      group: 'taxonomy',
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
      group: 'taxonomy',
      description: 'The page this theme links to.',
      validation: (Rule) =>
        Rule.required().uri({ allowRelative: true, scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'relatedThemes',
      title: 'Related Themes',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'theme' }] }],
      description: 'Related topic hubs to link to (2-3 recommended).',
      validation: (rule) => rule.max(4),
    }),
    ...seoFields,
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
