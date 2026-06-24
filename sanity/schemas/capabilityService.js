import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'capabilityService',
  title: 'Building Capability',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'audience', title: "Who it's for" },
    { name: 'structure', title: 'Structure' },
    { name: 'difference', title: 'Difference' },
    { name: 'takeaways', title: 'Takeaways' },
    { name: 'examples', title: 'Examples' },
    { name: 'cta', title: 'CTA' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // === Content group ===
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'For Leaders', value: 'for-leaders' },
          { title: 'For Teams', value: 'for-teams' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audienceLabel',
      title: 'Audience Label',
      type: 'string',
      group: 'content',
      description: 'Display name shown above the hero heading, e.g. "For Leaders"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      group: 'content',
      description: 'Controls sort order within the audience group',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO.',
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      description:
        'Rich content shown between the hero and the "How it works" section. ' +
        'Search-worthy pages hold the situations layer here (menu table + situation ' +
        'sections, each with two accordions). Trust pages may use this lightly or not at all.',
      of: [
        { type: 'block' },
        { type: 'table' },
        { type: 'accordion' },
        { type: 'tabs' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      group: 'content',
      to: [{ type: 'theme' }],
      description:
        'Optional - which service area this page relates to. Drives the "explore this service" ' +
        'card in the right sidebar (via the theme\'s anchor URL). Leave unset if no theme fits.',
    }),

    // === Who it's for group ===
    defineField({
      name: 'audienceHeading',
      title: 'Audience Section Heading',
      type: 'string',
      group: 'audience',
      validation: (Rule) => Rule.required(),
    }),
defineField({
      name: 'audienceBody',
      title: 'Audience Body',
      type: 'array',
      description: 'Who would benefit from this and why - conversational, specific, not generic',
      group: 'audience',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
    }),

    // === Structure group ===
    defineField({
      name: 'structureHeading',
      title: 'Structure Heading',
      type: 'string',
      group: 'structure',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'structureIntro',
      title: 'Structure Intro',
      type: 'text',
      group: 'structure',
      rows: 4,
    }),
    defineField({
      name: 'structureItems',
      title: 'Structure Items',
      type: 'array',
      group: 'structure',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'itemTitle',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'itemDescription',
              title: 'Description',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'itemTitle' },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),

    // === Difference group ===
    defineField({
      name: 'differenceHeading',
      title: 'Difference Heading',
      type: 'string',
      group: 'difference',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'differenceIntro',
      title: 'Difference Intro',
      type: 'text',
      group: 'difference',
      rows: 4,
    }),
    defineField({
      name: 'differenceItems',
      title: 'Difference Items',
      type: 'array',
      group: 'difference',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'itemTitle',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'itemDescription',
              title: 'Description',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'itemTitle' },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),

    // === Takeaways group ===
    defineField({
      name: 'takeawayHeading',
      title: 'Takeaway Heading',
      type: 'string',
      group: 'takeaways',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'takeawayIntro',
      title: 'Takeaway Intro',
      type: 'text',
      group: 'takeaways',
      rows: 4,
    }),
    defineField({
      name: 'takeawayItems',
      title: 'Takeaway Items',
      type: 'array',
      group: 'takeaways',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'itemTitle',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'itemDescription',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'itemTitle' },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(3),
    }),

    // === Examples group ===
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      group: 'examples',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'testimonialQuote',
      title: 'Testimonial Quote',
      type: 'text',
      group: 'examples',
      rows: 4,
    }),
    defineField({
      name: 'testimonialAttribution',
      title: 'Testimonial Attribution',
      type: 'string',
      group: 'examples',
    }),

    // === CTA group ===
    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading (override)',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaBody',
      title: 'CTA Body (override)',
      type: 'text',
      group: 'cta',
      rows: 3,
    }),
    defineField({
      name: 'ctaButtonLabel',
      title: 'CTA Button Label (override)',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaButtonUrl',
      title: 'CTA Button URL (override)',
      type: 'string',
      group: 'cta',
    }),

    defineField({
      name: 'sidebarPrimary',
      title: 'Right-sidebar CTA (override)',
      type: 'object',
      group: 'cta',
      description: 'Optional. The primary call-to-action card shown in the right sidebar. Leave blank to use the default enquiry CTA.',
      fields: [
        { name: 'heading', title: 'Heading', type: 'string' },
        { name: 'body', title: 'Body', type: 'text', rows: 3 },
        { name: 'label', title: 'Button label', type: 'string' },
        { name: 'url', title: 'Button URL', type: 'string' },
      ],
    }),

    // === SEO group ===
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'audienceLabel',
    },
  },
})