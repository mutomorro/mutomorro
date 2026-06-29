import { defineField, defineType } from 'sanity'
import { imageSlugField, uniqueImageSlugs } from './_imageSlug'

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'articleKicker',
      title: 'Kicker (SEO Heading)',
      type: 'string',
      description: 'Short, search-query-shaped heading that renders as the H1. The title field becomes the H2.',
    }),
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
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      to: [{ type: 'theme' }],
      description: 'Primary theme - which service area does this article relate to?',
      validation: (rule) => rule.required(),
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
        { type: 'table' },
        { type: 'accordion' },
        { type: 'tabs' },
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
            imageSlugField,
          ],
        },
      ],
      validation: (Rule) => [Rule.required(), uniqueImageSlugs(Rule)],
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
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Controls display position on the articles listing page. Lower numbers appear first. Leave blank to sort by publish date after ordered items.',
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
      themeTitle: 'theme.title',
      date: 'publishedAt',
    },
    prepare({ title, themeTitle, date }) {
      return {
        title,
        subtitle: [themeTitle, date].filter(Boolean).join(' - '),
      }
    },
  },
})