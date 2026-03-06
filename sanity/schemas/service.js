import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Services',
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
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Purpose & Direction', value: 'purpose-direction' },
          { title: 'Structure & Operations', value: 'structure-operations' },
          { title: 'People & Capability', value: 'people-capability' },
          { title: 'Service & Experience', value: 'service-experience' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order within category',
      type: 'number',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'One punchy sentence - shown on cards and in the hero',
      type: 'string',
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      description: 'One sentence for category overview pages',
      type: 'string',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: '2-3 sentence opening paragraph',
      type: 'text',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'relatedDimensions',
      title: 'Related EMERGENT dimensions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'dimension' }] }],
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
    },
    prepare({ title, category }) {
      const categories = {
        'purpose-direction': 'Purpose & Direction',
        'structure-operations': 'Structure & Operations',
        'people-capability': 'People & Capability',
        'service-experience': 'Service & Experience',
      }
      return {
        title,
        subtitle: categories[category] || category,
      }
    },
  },
  orderings: [
    {
      title: 'Category then order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
})