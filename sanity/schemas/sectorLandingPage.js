import { defineField, defineType } from 'sanity'

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
  ],
}

export default defineType({
  name: 'sectorLandingPage',
  title: 'Sector Landing Page',
  type: 'document',
  icon: () => '🏢',

  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'context', title: 'Context' },
    { name: 'logos', title: 'Logos' },
    { name: 'services', title: 'Services' },
    { name: 'caseStudies', title: 'Case Studies' },
    { name: 'resources', title: 'Resources' },
    { name: 'cta', title: 'CTA' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [

    // ===========================
    // CORE
    // ===========================

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The sector name - e.g. "Housing"',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL piece - e.g. "housing". Click Generate to create from the title.',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'sectorLabel',
      title: 'Sector Label',
      type: 'string',
      description: 'Display label - e.g. "Housing organisations"',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls sort order for a future index page (lower numbers first)',
      group: 'core',
    }),

    // ===========================
    // HERO
    // ===========================

    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      description: 'The H1 - e.g. "Working with housing organisations"',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'text',
      description: '2-3 sentences below the heading',
      group: 'hero',
      rows: 3,
      validation: (rule) => rule.required(),
    }),

    // ===========================
    // CONTEXT
    // ===========================

    defineField({
      name: 'contextHeading',
      title: 'Context Heading',
      type: 'string',
      group: 'context',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'contextBody',
      title: 'Context Body',
      ...blockContent,
      description: 'Rich text explaining the sector context',
      group: 'context',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'contextHighlights',
      title: 'Context Highlights',
      type: 'array',
      description: 'Key points displayed as compact cards below the body text (max 4)',
      group: 'context',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'highlightText',
              title: 'Highlight Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'highlightText' },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),

    // ===========================
    // LOGOS
    // ===========================

    defineField({
      name: 'sectorLogos',
      title: 'Sector Logos',
      type: 'array',
      description: 'Logos of organisations in this sector',
      group: 'logos',
      of: [
        {
          type: 'image',
          options: { hotspot: false },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Organisation name for accessibility',
            }),
          ],
        },
      ],
    }),

    // ===========================
    // SERVICES
    // ===========================

    defineField({
      name: 'servicesHeading',
      title: 'Services Heading',
      type: 'string',
      group: 'services',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'servicesIntro',
      title: 'Services Intro',
      type: 'text',
      group: 'services',
      rows: 2,
    }),

    defineField({
      name: 'featuredServices',
      title: 'Featured Services',
      type: 'array',
      description: 'Services relevant to this sector (max 6)',
      group: 'services',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'serviceRef',
              title: 'Service',
              type: 'reference',
              to: [{ type: 'service' }, { type: 'capabilityService' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'sectorAngle',
              title: 'Sector Angle',
              type: 'text',
              description: '1-2 sentences explaining why this service matters for this sector',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'serviceRef.title', subtitle: 'sectorAngle' },
          },
        },
      ],
      validation: (rule) => rule.required().max(6),
    }),

    // ===========================
    // CASE STUDIES
    // ===========================

    defineField({
      name: 'caseStudiesHeading',
      title: 'Case Studies Heading',
      type: 'string',
      group: 'caseStudies',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'caseStudiesIntro',
      title: 'Case Studies Intro',
      type: 'text',
      group: 'caseStudies',
      rows: 2,
    }),

    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
      type: 'array',
      description: 'Case studies from this sector (max 4)',
      group: 'caseStudies',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (rule) => rule.required().max(4),
    }),

    // ===========================
    // RESOURCES
    // ===========================

    defineField({
      name: 'resourcesHeading',
      title: 'Resources Heading',
      type: 'string',
      group: 'resources',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'featuredTools',
      title: 'Featured Tools',
      type: 'array',
      description: 'Tools relevant to this sector (max 6)',
      group: 'resources',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tool' }],
        },
      ],
      validation: (rule) => rule.max(6),
    }),

    defineField({
      name: 'featuredArticles',
      title: 'Featured Articles',
      type: 'array',
      description: 'Articles relevant to this sector (max 4)',
      group: 'resources',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
      validation: (rule) => rule.max(4),
    }),

    // ===========================
    // CTA
    // ===========================

    defineField({
      name: 'bridgeText',
      title: 'Bridge Text',
      type: 'text',
      description: 'Short transitional text before the CTA - displayed in a mid-dark band',
      group: 'cta',
      rows: 2,
    }),

    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading (optional)',
      type: 'string',
      description: 'Leave blank to use the site-wide default',
      group: 'cta',
    }),

    defineField({
      name: 'ctaBody',
      title: 'CTA Body (optional)',
      type: 'text',
      description: 'Leave blank to use the site-wide default',
      group: 'cta',
      rows: 3,
    }),

    defineField({
      name: 'ctaButtonLabel',
      title: 'CTA Button Label (optional)',
      type: 'string',
      description: 'Leave blank to use the site-wide default',
      group: 'cta',
    }),

    defineField({
      name: 'ctaButtonUrl',
      title: 'CTA Button URL (optional)',
      type: 'string',
      description: 'Leave blank to use the site-wide default',
      group: 'cta',
    }),

    // ===========================
    // SEO
    // ===========================

    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom page title for search engines. Leave blank to use the Hero Heading.',
      group: 'seo',
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      description: 'Meta description for search results. Leave blank to use the Hero Subheading.',
      group: 'seo',
      rows: 3,
    }),

    defineField({
      name: 'seoImage',
      title: 'SEO Image',
      type: 'image',
      description: 'Social sharing image (Open Graph). Leave blank for a default.',
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'sectorLabel',
    },
  },
})
