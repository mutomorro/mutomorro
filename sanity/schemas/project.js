export default {
  name: 'project',
  title: 'Case Studies',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
    },
    {
      name: 'clientSector',
      title: 'Client Sector',
      type: 'string',
    },
    {
  name: 'shortSummary',
  title: 'Short Summary',
  type: 'text',
  description: 'A short 1-2 sentence summary for cards and previews. Keep it under 150 characters.',
  rows: 3,
    },
    {
  name: 'challenge',
  title: 'Challenge',
  type: 'array',
  of: [{ type: 'block' }],
    },
    {
      name: 'approach',
      title: 'Approach',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'outcome',
      title: 'Outcome',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}   