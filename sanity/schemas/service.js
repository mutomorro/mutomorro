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
    { name: 'proposition', title: 'Proposition' },
    { name: 'recognition', title: 'Recognition' },
    { name: 'triggers', title: 'Triggers' },
    { name: 'stats', title: 'Stats' },
    { name: 'perspective', title: 'Perspective' },
    { name: 'approach', title: 'Approach' },
    { name: 'outcomes', title: 'Outcomes' },
    { name: 'examples', title: 'Examples' },
    { name: 'start', title: 'Where to start' },
    { name: 'faq', title: 'FAQ' },
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
      name: 'heroKicker',
      title: 'Hero Kicker (H1 - SEO label)',
      type: 'string',
      description: 'Small uppercase label shown above the hero heading. This is the page\'s H1 and carries the primary SEO keyword - e.g. "Culture Change Consultancy". Falls back to the service title if blank.',
      group: 'hero',
    }),

    defineField({
      name: 'heroHeading',
      title: 'Hero Heading (large H2 statement)',
      type: 'string',
      description: 'The large hero statement - e.g. "Creating the conditions for a thriving culture". Rendered as H2.',
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

    defineField({
      name: 'heroStats',
      title: 'Hero Credibility Stats',
      type: 'array',
      group: 'hero',
      description:
        'Up to ~2 short proof points in the hero (gradient number + label). Ships empty - the strip stays off until you add stats. ' +
        'IMPORTANT: any size or range MUST carry its unit in the label so it cannot be misread - e.g. value "50-3,000", label "employees in the organisations we work with".',
      validation: (rule) => rule.max(3),
      of: [
        {
          type: 'object',
          name: 'heroStat',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "20+" or "50-3,000"', validation: (r) => r.required() }),
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "20+ years" or "employees in the organisations we work with"', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
    }),

    defineField({
      name: 'heroSectors',
      title: 'Hero Sectors',
      type: 'array',
      group: 'hero',
      description:
        'Sector names shown as pills in the hero (e.g. Housing, Nonprofit, Government, Fintech). Sector names, not client names. Ships empty - the row stays off until you add sectors.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
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
      name: 'propositionCaption',
      title: 'Proposition Caption',
      type: 'string',
      description: 'Caption below the diagram - e.g. "Change the conditions, and culture shifts naturally."',
      group: 'context',
    }),

    // ===========================
    // PROPOSITION (new interactive 3-step stepper - optional)
    // Renders the new PropositionStepper component when populated.
    // Falls back to the legacy Recognition section if empty.
    // ===========================

    defineField({
      name: 'propositionSteps',
      title: 'Proposition Steps',
      type: 'array',
      description: 'Three-step interactive stepper. Leave empty to fall back to the legacy Recognition section.',
      group: 'proposition',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'stepNumber',
              title: 'Step Number',
              type: 'number',
              description: 'e.g. 1, 2, 3',
              validation: (rule) => rule.required().min(1).max(3),
            }),
            defineField({
              name: 'kicker',
              title: 'Step Kicker',
              type: 'string',
              description: 'Small label above the headline - e.g. "The conditions"',
            }),
            defineField({
              name: 'headline',
              title: 'Step Headline',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Step Body',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              name: 'animationKey',
              title: 'Animation Key',
              type: 'string',
              description: 'Which canvas animation to use for this step (slug-based). For Culture Change: "culture-change-1", "culture-change-3", "culture-change-4".',
            }),
          ],
          preview: {
            select: { number: 'stepNumber', title: 'headline' },
            prepare({ number, title }) {
              return { title: `${number}. ${title}` }
            },
          },
        },
      ],
      validation: (rule) => rule.max(3),
    }),

    defineField({
      name: 'propositionKicker',
      title: 'Proposition Section Kicker',
      type: 'string',
      description: 'Small label above the main proposition headline. Defaults to "Our proposition" if blank.',
      group: 'proposition',
    }),

    defineField({
      name: 'propositionHeadline',
      title: 'Proposition Section Headline',
      type: 'string',
      description: 'The main heading for the why-us argument.',
      group: 'proposition',
    }),

    defineField({
      name: 'propositionLead',
      title: 'Proposition Lead Line',
      type: 'text',
      rows: 3,
      description:
        'The keyword lead sentence under the headline - folds up the old Context framing so the SEO phrase and buyer framing survive the merge. ' +
        'e.g. "Our culture change consultancy works with the conditions that shape how your organisation functions - not a programme run alongside the work, but a change to the environment culture grows from."',
      group: 'proposition',
    }),

    defineField({
      name: 'propositionPhilosophyLinkLabel',
      title: 'Philosophy link label (step 3)',
      type: 'string',
      description: 'Optional link shown at step 3 only - e.g. "Read more about our philosophy"',
      group: 'proposition',
    }),

    defineField({
      name: 'propositionPhilosophyLinkUrl',
      title: 'Philosophy link URL (step 3)',
      type: 'string',
      description: 'Optional. e.g. "/philosophy"',
      group: 'proposition',
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
    // TRIGGERS (new "leaders come to us at moments like these" section)
    // Optional. Only renders when triggerCards has items.
    // ===========================

    defineField({
      name: 'triggerSectionKicker',
      title: 'Trigger Section Kicker',
      type: 'string',
      description: 'Small label - defaults to "Common catalysts" if blank',
      group: 'triggers',
    }),

    defineField({
      name: 'triggerSectionHeading',
      title: 'Trigger Section Heading',
      type: 'string',
      description: 'Defaults to "Leaders come to us at moments like these" if blank',
      group: 'triggers',
    }),

    defineField({
      name: 'triggerCards',
      title: 'Trigger Cards',
      type: 'array',
      description: 'Short phrases shown as pill-shaped chips on a dark background. e.g. "Bringing two cultures together"',
      group: 'triggers',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'phrase',
              title: 'Phrase',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'phrase' } },
        },
      ],
    }),

    // ===========================
    // STATS
    // ===========================

    defineField({
      name: 'statsSectionKicker',
      title: 'Stats Section Kicker',
      type: 'string',
      description: 'Small label above the stats - e.g. "Independent research". Optional.',
      group: 'stats',
    }),

    defineField({
      name: 'statsSectionHeading',
      title: 'Stats Section Heading',
      type: 'string',
      description: 'Heading shown above the stats row. Optional - if blank, the stats render without a heading.',
      group: 'stats',
    }),

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
      name: 'approachIntroHeading',
      title: 'Approach Intro Slide Heading',
      type: 'string',
      description: 'Headline shown on the INTRO slide of the Approach slider - e.g. "How we work"',
      group: 'approach',
    }),

    defineField({
      name: 'approachPrinciples',
      title: 'Approach Principles',
      type: 'array',
      description: 'Optional principle cards shown on the INTRO slide of the Approach slider.',
      group: 'approach',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
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
              name: 'stageLinkLabel',
              title: 'Stage Link Label (optional)',
              type: 'string',
              description: 'e.g. "Learn more about our culture change programmes" - links to a sub-page',
            }),
            defineField({
              name: 'stageLinkUrl',
              title: 'Stage Link URL (optional)',
              type: 'string',
              description: 'e.g. "/services/culture-change-consultancy/culture-change-programmes"',
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
      name: 'proofSectionKicker',
      title: 'Proof Section Kicker',
      type: 'string',
      description: 'Defaults to "Proof in practice" if blank',
      group: 'examples',
    }),

    defineField({
      name: 'proofSectionHeading',
      title: 'Proof Section Heading',
      type: 'string',
      description: 'Defaults to "See how this works in real organisations" if blank',
      group: 'examples',
    }),

    defineField({
      name: 'proofSectionIntro',
      title: 'Proof Section Intro',
      type: 'text',
      description: 'Optional short paragraph below the proof heading - sets up the breadth-of-experience context above the case study cards.',
      group: 'examples',
      rows: 3,
    }),

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
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      description: 'Articles that relate to this service. Auto-populated from reverse relationships.',
      group: 'examples',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'relatedTools',
      title: 'Related Tools',
      type: 'array',
      description: 'Tools that relate to this service. Auto-populated from reverse relationships.',
      group: 'examples',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tool' }],
        },
      ],
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
    // Where to start (on-ramp explainer + sub-page cards)
    // ===========================

    defineField({
      name: 'whereToStartHeading',
      title: 'Where to Start Heading',
      type: 'string',
      description: 'Varied H2 for the "Where to start" section, e.g. "A practical first step". If blank, falls back to an auto heading ("A focused way in" / "Two ways in") and the section only shows when the service has sub-pages.',
      group: 'start',
    }),

    defineField({
      name: 'whereToStartIntro',
      title: 'Where to Start Intro',
      type: 'text',
      description: 'Short explainer below the heading - where a leader might begin with this service. Renders the section even when there are no sub-pages.',
      group: 'start',
      rows: 3,
    }),

    // ===========================
    // FAQ (new) - only renders if faqItems has items
    // ===========================

    defineField({
      name: 'faqSectionKicker',
      title: 'FAQ Section Kicker',
      type: 'string',
      description: 'Optional small label above the FAQ heading',
      group: 'faq',
    }),

    defineField({
      name: 'faqSectionHeading',
      title: 'FAQ Section Heading',
      type: 'string',
      description: 'Defaults to "Common questions" if blank',
      group: 'faq',
    }),

    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      description: 'Accordion items rendered as JSON-LD FAQPage markup for SEO rich snippet eligibility',
      group: 'faq',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
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