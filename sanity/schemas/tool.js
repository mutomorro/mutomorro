export default {
  name: 'tool',
  title: 'Tools',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Change', value: 'change' },
          { title: 'Teams', value: 'teams' },
          { title: 'Strategy', value: 'strategy' },
          { title: 'Culture', value: 'culture' },
          { title: 'Process', value: 'process' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Service Design', value: 'service-design' },
        ],
      },
    },
    {
      name: 'shortSummary',
      title: 'Short Summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences for cards and previews.',
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'The main diagram or visual for this tool.',
    },
    {
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [
    { type: 'block' },
    { 
      type: 'image',
      options: { hotspot: true },
    },
  ],
},
    {
      name: 'breakdownImages',
      title: 'Breakdown Images',
      type: 'array',
      of: [{ type: 'image' }],
      description: 'Step by step visuals explaining each part of the tool.',
    },
    {
      name: 'hasToolkit',
      title: 'Has downloadable toolkit?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'toolkitFile',
      title: 'Toolkit PDF',
      type: 'file',
      description: 'Upload the PDF if this tool has a downloadable version.',
      hidden: ({ document }) => !document?.hasToolkit,
    },
  ],
}