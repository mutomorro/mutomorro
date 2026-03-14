import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'frameworkOverview',
  title: 'Framework Overview',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: 'The main heading for the overview page',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Sits below the title',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      description: 'Short intro for SEO and previews',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The full overview content',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Framework Overview',
        subtitle: 'EMERGENT Framework landing page content',
      }
    },
  },
})
