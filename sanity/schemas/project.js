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
      name: 'challenge',
      title: 'Challenge',
      type: 'text',
    },
    {
      name: 'approach',
      title: 'Approach',
      type: 'text',
    },
    {
      name: 'outcome',
      title: 'Outcome',
      type: 'text',
    },
  ],
}