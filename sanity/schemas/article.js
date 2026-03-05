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
          { title: 'Organisational Health', value: 'organisational-health' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Culture', value: 'culture' },
          { title: 'Strategy', value: 'strategy' },
          { title: 'Change', value: 'change' },
          { title: 'Systems Thinking', value: 'systems-thinking' },
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
    }),
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