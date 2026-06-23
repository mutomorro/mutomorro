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
        { title: 'H5', value: 'h5' },
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
            fields: [{ title: 'URL', name: 'href', type: 'url', validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }],
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
  fieldsets: [
    {
      name: 'legacy',
      title: 'Legacy sections (migrated into Body)',
      options: { collapsible: true, collapsed: true },
    },
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
      name: 'client',
      title: 'Client',
      type: 'string',
      group: 'core',
      description: 'The name of the client organisation.',
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
    {
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      group: 'core',
      to: [{ type: 'theme' }],
      description: 'Primary theme - which service area does this case study relate to?',
      validation: (rule) => rule.required(),
    },
    {
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      group: 'core',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      description: 'Which services does this case study relate to? Used for two-way linking between services and case studies.',
    },

    // ── Content sections ─────────────────────────────────────────────────────
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      description:
        'The main case study content - one flexible canvas (tables, accordions, tabs, ' +
        'bullet and numbered lists, inline images), matching Tools and Articles. The migrated ' +
        'case studies have their five former sections merged here as H2 headings; new case ' +
        'studies start from this single field.',
      of: [
        {
          type: 'block',
          // Standard body styles plus a reusable "Kicker" eyebrow label (small
          // uppercase accent text, rendered via the global .kicker class). The
          // migrated section labels use it, so each section keeps a single real
          // H2 (its descriptive heading) instead of two stacked H2s. Lists are
          // listed so numbered lists are available; marks keep Sanity defaults.
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Heading 5', value: 'h5' },
            { title: 'Section label', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
            { title: 'Kicker', value: 'kicker' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
        },
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
              description: 'Describe the image for screen readers and search engines',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'clientAndContext',
      title: 'Client and context',
      ...blockContent,
      group: 'content',
      fieldset: 'legacy',
      description: 'Who the client is, their sector, and the context for this work.',
    },
    {
      name: 'theObjective',
      title: 'The objective',
      ...blockContent,
      group: 'content',
      fieldset: 'legacy',
      description: 'What the organisation was trying to achieve.',
    },
    {
      name: 'theApproach',
      title: 'The approach',
      ...blockContent,
      group: 'content',
      fieldset: 'legacy',
      description: 'How the work was done — collaborative, capability-building, systems-thinking.',
    },
    {
      name: 'whatChanged',
      title: 'What changed',
      ...blockContent,
      group: 'content',
      fieldset: 'legacy',
      description: 'Tangible outcomes and new capabilities the organisation gained.',
    },
    {
      name: 'keyInsight',
      title: 'Key insight',
      ...blockContent,
      group: 'content',
      fieldset: 'legacy',
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
  ],

  preview: {
    select: {
      title: 'title',
      clientName: 'client',
      sector: 'clientSector',
      media: 'heroImage',
    },
    prepare({ title, clientName, sector, media }) {
      const parts = [clientName, sector].filter(Boolean)
      return {
        title,
        subtitle: parts.join(' · ') || 'No client set',
        media,
      }
    },
  },
}