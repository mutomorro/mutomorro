import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dimension',
  title: 'EMERGENT Dimensions',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Dimension title',
      type: 'string',
      description: 'e.g. Embedded Strategy',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor word',
      type: 'string',
      description: 'The single EMERGENT word e.g. Embedded',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'letter',
      title: 'EMERGENT letter',
      type: 'string',
      description: 'The letter in EMERGENT e.g. E',
      validation: Rule => Rule.required().max(1),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the EMERGENT sequence (1-8)',
      validation: Rule => Rule.required().min(1).max(8),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'colour',
      title: 'Dimension colour',
      type: 'string',
      description: 'Hex colour for this dimension e.g. #d4735e',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'The compelling H1 statement - not a description, a statement e.g. "Strategy that lives in how you decide"',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lensQuestion',
      title: 'Lens question',
      type: 'string',
      description: 'The distinctive question this dimension asks',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      description: '2-3 sentences establishing what this dimension is in plain language',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      description: 'One sentence for cards and the overview page',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Full wiki content for this dimension',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'relatedDimensions',
      title: 'Related dimensions',
      type: 'array',
      description: 'Which other dimensions connect most closely to this one',
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
      title: 'EMERGENT order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'anchor',
      order: 'order',
    },
    prepare({ title, subtitle, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle: `Anchor: ${subtitle}`,
      }
    },
  },
})