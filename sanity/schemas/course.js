import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'course',
  title: 'Courses',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
  { title: 'Change', value: 'change' },
  { title: 'Culture', value: 'culture' },
  { title: 'Leadership', value: 'leadership' },
  { title: 'Operations', value: 'operations' },
  { title: 'Purpose', value: 'purpose' },
  { title: 'Service Design', value: 'service-design' },
  { title: 'Storytelling', value: 'storytelling' },
  { title: 'Strategy', value: 'strategy' },
  { title: 'Teams', value: 'teams' },
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
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. 4 hours, 2 days, 6 weeks',
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Self-paced online', value: 'self-paced' },
          { title: 'Live online', value: 'live-online' },
          { title: 'In person', value: 'in-person' },
          { title: 'Blended', value: 'blended' },
        ],
      },
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
      description: 'Which EMERGENT dimensions does this course relate to?',
      of: [
        {
          type: 'reference',
          to: [{ type: 'dimension' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      format: 'format',
    },
    prepare({ title, category, format }) {
      return {
        title: title,
        subtitle: `${category} - ${format}`,
      }
    },
  },
})