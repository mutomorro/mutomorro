// Service Sub-Page schema
// Simpler than the main service page - no stages, stats strip, or anchor nav
// Used for keyword-targeted pages that sit under a parent service
// e.g. /services/culture-change-consultancy/culture-change-programmes

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'serviceSubPage',
  title: 'Service Sub-Pages',
  type: 'document',

  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Content' },
    { name: 'proof', title: 'Proof' },
    { name: 'cta', title: 'CTA' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [

    // ===========================
    // CORE
    // ===========================

    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The page name - e.g. "Culture Change Programmes"',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL piece - e.g. "culture-change-programmes". This appears after the parent service slug.',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'parentService',
      title: 'Parent Service',
      type: 'reference',
      to: [{ type: 'service' }],
      description: 'Which service page is this a sub-page of?',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    // ===========================
    // HERO
    // ===========================

    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      description: 'The main H1 heading in the hero section',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'text',
      rows: 3,
      description: 'The lead paragraph below the heading',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),

    // ===========================
    // CONTENT SECTIONS
    // ===========================
    // Flexible array of content sections - each has a heading and rich text body

    defineField({
      name: 'sections',
      title: 'Content Sections',
      type: 'array',
      group: 'content',
      description: 'Add content sections in order. Each gets a heading and rich text body.',
      of: [
        {
          type: 'object',
          name: 'contentSection',
          title: 'Content Section',
          fields: [
            defineField({
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Section Body',
              type: 'array',
              of: [{ type: 'block' }],
              description: 'Rich text - supports paragraphs, bullet lists, bold, italic, links',
            }),
            defineField({
              name: 'backgroundStyle',
              title: 'Background Style',
              type: 'string',
              options: {
                list: [
                  { title: 'White (default)', value: 'white' },
                  { title: 'Warm (#FAF6F1)', value: 'warm' },
                ],
              },
              initialValue: 'white',
            }),
          ],
          preview: {
            select: { title: 'heading' },
          },
        },
      ],
    }),

    // ===========================
    // PROOF / CASE STUDIES
    // ===========================

    defineField({
      name: 'proofHeading',
      title: 'Proof Section Heading',
      type: 'string',
      description: 'e.g. "Organisations we have worked with"',
      group: 'proof',
    }),

    defineField({
      name: 'proofBody',
      title: 'Proof Section Body',
      type: 'text',
      rows: 3,
      description: 'Brief intro text before the case study cards',
      group: 'proof',
    }),

    defineField({
      name: 'relatedProjects',
      title: 'Related Case Studies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      description: 'Pick case studies to show on this page',
      group: 'proof',
    }),

    // ===========================
    // CTA
    // ===========================

    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading',
      type: 'string',
      description: 'e.g. "Ready to talk about culture change?"',
      group: 'cta',
    }),

    defineField({
      name: 'ctaBody',
      title: 'CTA Body',
      type: 'text',
      rows: 3,
      group: 'cta',
    }),

    defineField({
      name: 'ctaButtonLabel',
      title: 'CTA Button Label',
      type: 'string',
      initialValue: 'Start a conversation',
      group: 'cta',
    }),

    defineField({
      name: 'ctaButtonUrl',
      title: 'CTA Button URL',
      type: 'string',
      description: 'e.g. /contact?service=culture-change-consultancy',
      group: 'cta',
    }),

    // Link back to parent service
    defineField({
      name: 'parentLinkText',
      title: 'Parent Page Link Text',
      type: 'text',
      rows: 2,
      description: 'Text for the link back to the parent service page. e.g. "For a full picture of how we approach culture change..."',
      group: 'cta',
    }),

    // ===========================
    // SEO
    // ===========================

    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Overrides the default page title in search results',
      group: 'seo',
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'The meta description for search results (aim for 150-160 characters)',
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'parentService.title',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `Sub-page of: ${subtitle}` : 'No parent service set',
      }
    },
  },
})
