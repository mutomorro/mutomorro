// Page Callout schema
// Reusable page-width callout band that can be targeted at page types,
// specific pages, or both. Renders as a distinct visual band within page templates.

import { defineField, defineType } from 'sanity'

const blockContent = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
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
  ],
}

const PAGE_TYPE_OPTIONS = [
  { title: 'Services', value: 'services' },
  { title: 'Case Studies', value: 'caseStudies' },
  { title: 'Tools', value: 'tools' },
  { title: 'Articles', value: 'articles' },
  { title: 'Courses', value: 'courses' },
  { title: 'Develop (Building Capability)', value: 'develop' },
  { title: 'Sectors', value: 'sectors' },
]

const TARGETABLE_TYPES = [
  { type: 'service' },
  { type: 'project' },
  { type: 'tool' },
  { type: 'article' },
  { type: 'course' },
  { type: 'capabilityService' },
  { type: 'sectorLandingPage' },
]

export default defineType({
  name: 'pageCallout',
  title: 'Page Callout',
  type: 'document',

  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'targeting', title: 'Targeting' },
    { name: 'settings', title: 'Settings' },
  ],

  fields: [
    // ===========================
    // CONTENT
    // ===========================

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal name for this callout - shown in the Studio list. Not displayed on the page.',
      group: 'content',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Optional heading shown on the page. Leave blank to hide.',
      group: 'content',
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The callout body. Supports bold, italics, links and bullet lists.',
      group: 'content',
      of: blockContent.of,
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Optional image. Shows in full-width callouts; use "Show image in sidebar card" below to also show it in the compact sidebar card.',
      group: 'content',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for screen readers and search engines.',
        },
      ],
    }),

    defineField({
      name: 'showImageInSidebar',
      title: 'Show image in sidebar card',
      type: 'boolean',
      description: 'When on, the image above also appears in the compact right-sidebar card. Off by default to keep sidebar cards tight. (Full-width callouts always show the image.)',
      group: 'content',
      initialValue: false,
      hidden: ({ parent }) => !parent?.image?.asset || parent?.placement === 'page',
    }),

    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'url',
      description: 'Destination for the callout link. Supports external URLs and relative paths (e.g. /services/foo).',
      group: 'content',
      validation: (rule) => rule.uri({
        allowRelative: true,
        scheme: ['http', 'https', 'mailto', 'tel'],
      }),
    }),

    defineField({
      name: 'linkLabel',
      title: 'Link Label',
      type: 'string',
      description: 'Text for the link - e.g. "Explore the toolkit". An arrow is added automatically. Only rendered if Link URL is also set.',
      group: 'content',
    }),

    // ===========================
    // TARGETING
    // ===========================

    defineField({
      name: 'showOnPageTypes',
      title: 'Show on all pages of type',
      type: 'array',
      description: 'When a type is selected, the callout appears on ALL pages of that type (unless excluded below).',
      group: 'targeting',
      of: [{ type: 'string' }],
      options: {
        list: PAGE_TYPE_OPTIONS,
      },
    }),

    defineField({
      name: 'includePages',
      title: 'Also show on these specific pages',
      type: 'array',
      description: 'Additive - pages listed here get the callout regardless of the page type setting above.',
      group: 'targeting',
      of: [
        {
          type: 'reference',
          to: TARGETABLE_TYPES,
        },
      ],
    }),

    defineField({
      name: 'excludePages',
      title: 'Exclude these pages',
      type: 'array',
      description: 'Pages listed here will NOT show the callout, even if their page type is selected above. Exclusions override everything.',
      group: 'targeting',
      of: [
        {
          type: 'reference',
          to: TARGETABLE_TYPES,
        },
      ],
    }),

    // ===========================
    // SETTINGS
    // ===========================

    defineField({
      name: 'placement',
      title: 'Placement',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: 'Full-width (in page)', value: 'page' },
          { title: 'Right sidebar', value: 'sidebar' },
          { title: 'Both', value: 'both' },
        ],
        layout: 'radio',
      },
      initialValue: 'page',
      description: 'Where this callout appears. "Full-width" renders as a horizontal band between sections. "Right sidebar" renders as a compact card in the content sidebar on article/tool/project/course pages. "Both" does both.',
    }),

    defineField({
      name: 'showInDownloadSuccess',
      title: 'Feature in download success',
      type: 'boolean',
      description: 'When on, this callout is also featured in the success message after someone downloads a tool\'s template. Only shows for tools this callout targets (via the "Tools" page type or a specific tool in "Also show on these specific pages"). Independent of Placement — a good spot for a "now go deeper" nudge.',
      group: 'settings',
      initialValue: false,
    }),

    defineField({
      name: 'accentColor',
      title: 'Accent Colour',
      type: 'string',
      description: 'Optional hex colour code (e.g. #6366F0). Used as a left border and link colour. Leave blank for default site styling.',
      group: 'settings',
      validation: (rule) =>
        rule.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
          name: 'hex colour',
          invert: false,
        }).error('Must be a hex colour like #6366F0 or #fff'),
    }),

    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Controls stacking order when multiple callouts target the same page. Lower numbers appear first.',
      group: 'settings',
      initialValue: 10,
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle to switch the callout on/off without deleting it.',
      group: 'settings',
      initialValue: true,
    }),

    defineField({
      name: 'showTeaser',
      title: 'Show teaser',
      type: 'boolean',
      description: 'When on, a compact teaser banner is rendered near the top of targeted case study, tool, and article pages. The full callout still renders at the bottom as normal.',
      group: 'settings',
      initialValue: false,
    }),

    defineField({
      name: 'teaserText',
      title: 'Teaser text',
      type: 'string',
      description: 'The one-line text shown in the teaser. Keep it short - one sentence max. Only used when Show teaser is on.',
      group: 'settings',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent || {}
          if (parent.showTeaser && !(value && value.trim())) {
            return "Teaser is enabled but has no text - it won't render without teaser text."
          }
          return true
        }).warning(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      showOnPageTypes: 'showOnPageTypes',
      includePages: 'includePages',
      media: 'image',
    },
    prepare({ title, isActive, showOnPageTypes, includePages, media }) {
      const typeCount = showOnPageTypes?.length || 0
      const pageCount = includePages?.length || 0
      const parts = []
      if (typeCount > 0) parts.push(`${typeCount} type${typeCount === 1 ? '' : 's'}`)
      if (pageCount > 0) parts.push(`${pageCount} page${pageCount === 1 ? '' : 's'}`)
      const subtitle = (parts.length ? parts.join(' + ') : 'No targeting') + (isActive === false ? ' - inactive' : '')
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})
