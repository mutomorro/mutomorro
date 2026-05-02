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
      type: 'text',
      rows: 3,
      description: 'Short description for hub pages.',
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
