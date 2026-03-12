// sanity/schemas/project.js

const blockContent = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Section label', value: 'h6' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [{ title: 'URL', name: 'href', type: 'url' }],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for screen readers and search engines',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    },
  ],
}

export default {
  name: 'project',
  title: 'Case Studies',
  type: 'document',
  groups: [
    { name: 'core',    title: 'Core' },
    { name: 'content', title: 'Content' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    // ── Core ────────────────────────────────────────────────────────────────
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'core',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    {
      name: 'shortSummary',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      group: 'core',
      description: 'One or two sentences — shown on the case study listing page.',
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      group: 'core',
      description: 'One-line tagline — shown below the title on the case study page.',
    },
    {
      name: 'clientSector',
      title: 'Client sector',
      type: 'string',
      group: 'core',
      options: {
        list: [
          { title: 'Housing',          value: 'Housing' },
          { title: 'Charity',          value: 'Charity' },
          { title: 'Social Enterprise', value: 'Social Enterprise' },
          { title: 'Public Sector',    value: 'Public Sector' },
          { title: 'Financial Services', value: 'Financial Services' },
          { title: 'Health',           value: 'Health' },
          { title: 'Education',        value: 'Education' },
          { title: 'Other',            value: 'Other' },
        ],
      },
    },
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'core',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
    },
    {
      name: 'publishedAt',
      title: 'Published date',
      type: 'date',
      group: 'core',
    },

    // ── Content sections ─────────────────────────────────────────────────────
    {
      name: 'clientAndContext',
      title: 'Client and context',
      ...blockContent,
      group: 'content',
      description: 'Who the client is, their sector, and the context for this work.',
    },
    {
      name: 'theObjective',
      title: 'The objective',
      ...blockContent,
      group: 'content',
      description: 'What the organisation was trying to achieve.',
    },
    {
      name: 'theApproach',
      title: 'The approach',
      ...blockContent,
      group: 'content',
      description: 'How the work was done — collaborative, capability-building, systems-thinking.',
    },
    {
      name: 'whatChanged',
      title: 'What changed',
      ...blockContent,
      group: 'content',
      description: 'Tangible outcomes and new capabilities the organisation gained.',
    },
    {
      name: 'keyInsight',
      title: 'Key insight',
      ...blockContent,
      group: 'content',
      description: 'What this project revealed — the learning that shaped the Mutomorro approach.',
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    {
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Overrides the page title in search results. Leave blank to use the case study title.',
    },
    {
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Meta description shown in search results. Aim for 150-160 characters.',
      validation: Rule => Rule.max(160).warning('Keep under 160 characters for best SEO results'),
    },
    {
      name: 'focusKeyword',
      title: 'Focus keyword',
      type: 'string',
      group: 'seo',
      description: 'Primary keyword or phrase for this case study. Comma-separated if multiple.',
    },
  ],

  preview: {
    select: {
      title: 'title',
      sector: 'clientSector',
      media: 'heroImage',
    },
    prepare({ title, sector, media }) {
      return {
        title,
        subtitle: sector || 'No sector set',
        media,
      }
    },
  },
}