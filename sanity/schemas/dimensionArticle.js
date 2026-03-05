import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dimensionArticle',
  title: 'Dimension Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. What is Embedded Strategy?',
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
      name: 'dimension',
      title: 'Parent dimension',
      type: 'reference',
      to: [{ type: 'dimension' }],
      description: 'Which dimension does this article belong to?',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position within the dimension (1 = first article shown)',
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      description: 'One sentence for article listings',
      validation: Rule => Rule.required(),
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
  ],
  orderings: [
    {
      title: 'Dimension then order',
      name: 'dimensionOrder',
      by: [
        { field: 'dimension.title', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      dimension: 'dimension.title',
      order: 'order',
    },
    prepare({ title, dimension, order }) {
      return {
        title: title,
        subtitle: `${dimension} - Article ${order}`,
      }
    },
  },
})