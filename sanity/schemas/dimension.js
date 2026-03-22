import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dimension',
  title: 'EMERGENT Dimensions',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Dimension title',
      type: 'string',
      description: 'e.g. Embedded Strategy',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor word',
      type: 'string',
      description: 'The single EMERGENT word e.g. Embedded',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'letter',
      title: 'EMERGENT letter',
      type: 'string',
      description: 'The letter in EMERGENT e.g. E',
      validation: Rule => Rule.required().max(1),
      group: 'content',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the EMERGENT sequence (1-8)',
      validation: Rule => Rule.required().min(1).max(8),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'colour',
      title: 'Dimension colour',
      type: 'string',
      description: 'Hex colour for this dimension e.g. #d4735e',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'The compelling H1 statement - not a description, a statement e.g. "Strategy that lives in how you decide"',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'lensQuestion',
      title: 'Lens question',
      type: 'string',
      description: 'The distinctive question this dimension asks',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      description: '2-3 sentences establishing what this dimension is in plain language',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      description: 'One sentence for cards and the overview page',
      validation: Rule => Rule.required(),
      group: 'content',
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
      group: 'content',
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
      group: 'content',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Custom page title for search engines. If blank, uses dimension title.',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Meta description for search results. If blank, uses short summary.',
      group: 'seo',
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
