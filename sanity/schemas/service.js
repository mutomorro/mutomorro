// Service schema - expanded for full service page template
// Replaces the previous basic service schema
// See Sanity_Service_Schema_Specification.md for the full field-by-field rationale

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',

  // Organise fields into collapsible groups in Sanity Studio
  // This stops the editing screen feeling overwhelming
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'context', title: 'Context' },
    { name: 'recognition', title: 'Recognition' },
    { name: 'stats', title: 'Stats' },
    { name: 'perspective', title: 'Perspective' },
    { name: 'approach', title: 'Approach' },
    { name: 'outcomes', title: 'Outcomes' },
    { name: 'examples', title: 'Examples' },
    { name: 'cta', title: 'CTA' },
    { name: 'logoStrip', title: 'Logo Strip' },
    { name: 'seo', title: 'SEO' },
    { name: 'related', title: 'Related' },
  ],

  fields: [

    // ===========================
    // CORE
    // ===========================

    defineField({
      name: 'title',
      title: 'Service Name',
      type: 'string',
      description: 'The service name - e.g. "Culture Change"',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL piece - e.g. "culture-change". Click Generate to create from the title.',
      group: 'core',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Which category this service belongs to - determines the URL path',
      group: 'core',
      options: {
        list: [
          { title: 'Purpose & Direction', value: 'purpose-direction' },
          { title: 'Structure & Operations', value: 'structure-operations' },
          { title: 'People & Capability', value: 'people-capability' },
          { title: 'Service & Experience', value: 'service-experience' },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'categoryLabel',
      title: 'Category Label',
      type: 'string',
      description: 'The display name shown on the page - e.g. "Purpose & Direction"',
      group: 'core',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls the order within a category (lower numbers first)',
      group: 'core',
    }),

    // ===========================
    // HERO
    // ===========================

    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      description: 'The H1 - e.g. "Organisational Culture Change"',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'text',
      description: 'The one-liner below the heading',
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
      description: 'The big bold proposition - e.g. "We know culture isn\'t a programme you run..."',
      group: 'context',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'contextBody',
      title: 'Context Body',
      type: 'array',
      description: 'The supporting text explaining the proposition',
      group: 'context',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'propositionImage',
      title: 'Proposition Diagram',
      type: 'image',
      description: 'The proposition diagram for this service (16:9, unique per service)',
      group: 'context',
      options: { hotspot: true },
    }),

    defineField({
      name: 'propositionCaption',
      title: 'Proposition Caption',
      type: 'string',
      description: 'Caption below the diagram - e.g. "Change the conditions, and culture shifts naturally."',
      group: 'context',
    }),

    // ===========================
    // RECOGNITION
    // ===========================

    defineField({
      name: 'recognitionHeading',
      title: 'Recognition Heading',
      type: 'string',
      description: 'e.g. "Creating a culture people actually want to be part of"',
      group: 'recognition',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'recognitionIntro',
      title: 'Recognition Intro',
      type: 'text',
      description: 'The opening line before the recognition items',
      group: 'recognition',
      rows: 3,
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'recognitionItems',
      title: 'Recognition Items',
      type: 'array',
      description: 'The things visitors will recognise - "yes, that\'s what I\'m looking for" (4-6 items)',
      group: 'recognition',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Item Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'text' },
          },
        },
      ],
      validation: (rule) => rule.required().min(3).max(8),
    }),

    defineField({
      name: 'recognitionBridge',
      title: 'Recognition Bridge',
      type: 'array',
      description: 'The bridging paragraph(s) below the items - situational triggers that help visitors see their specific context',
      group: 'recognition',
      of: [{ type: 'block' }],
    }),

    // ===========================
    // STATS
    // ===========================

    defineField({
      name: 'stats',
      title: 'Stats Strip',
      type: 'array',
      description: 'Four statistics with sources. Leave empty to hide the stats strip.',
      group: 'stats',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'statValue',
              title: 'Value',
              type: 'string',
              description: 'e.g. "4x", "23%", "2.2%"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'statLabel',
              title: 'Label',
              type: 'string',
              description: 'e.g. "higher retention"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'statSource',
              title: 'Source',
              type: 'string',
              description: 'e.g. "SHRM 2024"',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { value: 'statValue', label: 'statLabel' },
            prepare({ value, label }) {
              return { title: `${value} ${label}` }
            },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),

    // ===========================
    // PERSPECTIVE
    // ===========================

    defineField({
      name: 'perspectiveHeading',
      title: 'Perspective Heading',
      type: 'string',
      description: 'e.g. "Culture is a living thing"',
      group: 'perspective',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'perspectiveBody',
      title: 'Perspective Body',
      type: 'array',
      description: 'How Mutomorro sees this topic through an ecosystem lens',
      group: 'perspective',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'perspectiveImage',
      title: 'Perspective Image',
      type: 'image',
      description: 'The visual for this section (ecosystem animation placeholder, or a static image)',
      group: 'perspective',
      options: { hotspot: true },
    }),

    defineField({
      name: 'perspectiveLinkLabel',
      title: 'Perspective Link Label',
      type: 'string',
      description: 'e.g. "Learn about our Intentional Ecosystems approach" - leave blank for no link',
      group: 'perspective',
    }),

    defineField({
      name: 'perspectiveLinkUrl',
      title: 'Perspective Link URL',
      type: 'string',
      description: 'e.g. "/philosophy"',
      group: 'perspective',
    }),

    // ===========================
    // APPROACH
    // ===========================

    defineField({
      name: 'approachIntro',
      title: 'Approach Intro',
      type: 'array',
      description: 'The introductory text before the four stages',
      group: 'approach',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      description: 'The four stages - Understand, Co-design, Implement, Build capability',
      group: 'approach',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'stageNumber',
              title: 'Stage Number',
              type: 'string',
              description: 'e.g. "01", "02", "03", "04"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stageTitle',
              title: 'Stage Title',
              type: 'string',
              description: 'e.g. "Understand" - also shown in the overview journey cards',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stageSummary',
              title: 'Stage Summary',
              type: 'string',
              description: 'One line for the journey card - e.g. "See your culture clearly"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stageHeading',
              title: 'Stage Heading',
              type: 'string',
              description: 'The H2 for the full section - e.g. "Understanding your culture as it really is"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stageBody',
              title: 'Stage Body',
              type: 'array',
              description: 'The main intro paragraphs (always visible)',
              of: [{ type: 'block' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stageInPractice',
              title: 'What This Looks Like in Practice',
              type: 'array',
              description: 'Bullet items for the "in practice" section',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'stageOutcome',
              title: 'What You Get',
              type: 'text',
              description: 'The outcome text',
              rows: 3,
            }),
            defineField({
              name: 'stageImage',
              title: 'Stage Infographic',
              type: 'image',
              description: 'The infographic visual (16:9, unique per service eventually)',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { number: 'stageNumber', title: 'stageTitle' },
            prepare({ number, title }) {
              return { title: `${number}. ${title}` }
            },
          },
        },
      ],
      validation: (rule) => rule.required().length(4),
    }),

    // ===========================
    // OUTCOMES
    // ===========================

    defineField({
      name: 'outcomesHeading',
      title: 'Outcomes Heading',
      type: 'string',
      description: 'e.g. "What becomes possible"',
      group: 'outcomes',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'outcomesIntro',
      title: 'Outcomes Intro',
      type: 'text',
      description: 'The opening paragraph before the outcomes list',
      group: 'outcomes',
      rows: 4,
    }),

    defineField({
      name: 'outcomes',
      title: 'Outcomes',
      type: 'array',
      description: 'What becomes possible - the tangible results (4-6 items)',
      group: 'outcomes',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'outcomeTitle',
              title: 'Outcome Title',
              type: 'string',
              description: 'e.g. "Make decisions that stick"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'outcomeDescription',
              title: 'Outcome Description',
              type: 'text',
              description: 'e.g. "Because the decision-making patterns themselves have changed..."',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'outcomeTitle' },
          },
        },
      ],
      validation: (rule) => rule.required().min(3).max(8),
    }),

    defineField({
      name: 'outcomesClosing',
      title: 'Outcomes Closing',
      type: 'text',
      description: 'The closing paragraph after the outcomes list',
      group: 'outcomes',
      rows: 4,
    }),

    // ===========================
    // EXAMPLES
    // ===========================

    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      description: 'Link to 1-2 project case studies. The page pulls title, summary and image from the project.',
      group: 'examples',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (rule) => rule.max(3),
    }),

    defineField({
      name: 'testimonialQuote',
      title: 'Testimonial Quote',
      type: 'text',
      description: 'A client quote',
      group: 'examples',
      rows: 4,
    }),

    defineField({
      name: 'testimonialAttribution',
      title: 'Testimonial Attribution',
      type: 'string',
      description: 'e.g. "Name, Role, Organisation"',
      group: 'examples',
    }),

    // ===========================
    // CTA
    // ===========================

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
    // MID-PAGE CTAs
    // (lightweight inline buttons at two fixed points on the page)
    // ===========================

    defineField({
      name: 'midCtaAfterProofText',
      title: 'Mid-page CTA after proof - text (optional)',
      type: 'string',
      description: 'Short prompt line above the button after the Examples section. Leave blank for default: "Want to explore what this could look like for your organisation?"',
      group: 'cta',
    }),

    defineField({
      name: 'midCtaAfterProofButton',
      title: 'Mid-page CTA after proof - button label (optional)',
      type: 'string',
      description: 'Button label after the Examples section. Leave blank for default: "Let\'s talk"',
      group: 'cta',
    }),

    defineField({
      name: 'midCtaAfterOutcomesText',
      title: 'Mid-page CTA after outcomes - text (optional)',
      type: 'string',
      description: 'Short prompt line above the button after the Outcomes section. Leave blank for default: "Ready to make this happen?"',
      group: 'cta',
    }),

    defineField({
      name: 'midCtaAfterOutcomesButton',
      title: 'Mid-page CTA after outcomes - button label (optional)',
      type: 'string',
      description: 'Button label after the Outcomes section. Leave blank for default: "Get in touch"',
      group: 'cta',
    }),

    // ===========================
    // LOGO STRIP
    // ===========================

    defineField({
      name: 'showLogoStrip',
      title: 'Show Logo Strip',
      type: 'boolean',
      description: 'Whether to show the scrolling logo strip on this page',
      group: 'logoStrip',
      initialValue: true,
    }),

    defineField({
      name: 'logoStripPosition',
      title: 'Logo Strip Position',
      type: 'string',
      description: 'Where the logo strip appears on the page',
      group: 'logoStrip',
      options: {
        list: [
          { title: 'After Recognition', value: 'after-recognition' },
          { title: 'After Perspective', value: 'after-perspective' },
          { title: 'After Examples', value: 'after-examples' },
        ],
      },
      initialValue: 'after-recognition',
    }),

    // ===========================
    // SEO
    // ===========================

    defineField({
      name: 'primaryKeyword',
      title: 'Primary Keyword',
      type: 'string',
      description: 'The main search term this page targets - e.g. "organisational culture change". This guides the content, not shown on the page.',
      group: 'seo',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'array',
      description: 'Supporting search terms - e.g. "culture change consultancy", "workplace culture transformation"',
      group: 'seo',
      of: [{ type: 'string' }],
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom page title for search engines. Should include the primary keyword. Leave blank to use the Hero Heading.',
      group: 'seo',
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      description: 'Meta description for search results. Should include the primary keyword naturally. Leave blank to use the Hero Tagline.',
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

    // ===========================
    // RELATED
    // ===========================

    defineField({
      name: 'relatedDimensions',
      title: 'Related EMERGENT Dimensions',
      type: 'array',
      description: 'Which dimensions of the EMERGENT Framework relate to this service',
      group: 'related',
      of: [
        {
          type: 'reference',
          to: [{ type: 'dimension' }],
        },
      ],
    }),

    defineField({
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      description: 'Other services to suggest - "You might also be interested in..."',
      group: 'related',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
        },
      ],
    }),
  ],

  // What you see in the Sanity Studio document list
  preview: {
    select: {
      title: 'title',
      subtitle: 'categoryLabel',
    },
  },
})