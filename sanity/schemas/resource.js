import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export default defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // --- Core ---
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The resource name, e.g. "A Primer on Change Readiness"',
      validation: Rule => Rule.required(),
      group: 'core',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
      group: 'core',
    }),
    defineField({
      name: 'resourceType',
      title: 'Resource type',
      type: 'string',
      options: {
        list: [
          { title: 'Primer', value: 'primer' },
          { title: 'Whitepaper', value: 'whitepaper' },
          { title: 'Guide', value: 'guide' },
        ],
      },
      validation: Rule => Rule.required(),
      group: 'core',
    }),
    defineField({
      name: 'resourceTypeLabel',
      title: 'Resource type label',
      type: 'string',
      description: 'Override display label if needed (e.g. "Introductory Primer" instead of just "Primer")',
      group: 'core',
    }),

    // --- Content ---
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Short line below the title - e.g. "A 10-minute read for leaders navigating change"',
      group: 'content',
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'array',
      of: [{ type: 'block' }],
      description: '2-4 paragraphs explaining what this resource covers and why it matters',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: '3-6 key takeaways the reader will get. Displayed as a checklist on the landing page',
      group: 'content',
    }),

    // --- Download ---
    defineField({
      name: 'downloadFile',
      title: 'Download file',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'The PDF to download',
      validation: Rule => Rule.required(),
      group: 'download',
    }),
    defineField({
      name: 'downloadFileName',
      title: 'Download filename',
      type: 'string',
      description: 'Override the download filename if needed',
      group: 'download',
    }),
    defineField({
      name: 'previewImage',
      title: 'Preview image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image of the first page of the PDF - shown as a visual preview on the landing page',
      group: 'download',
    }),
    defineField({
      name: 'previewImageAlt',
      title: 'Preview image alt text',
      type: 'string',
      description: 'Alt text for the preview image',
      group: 'download',
    }),
    defineField({
      name: 'gated',
      title: 'Gated download',
      type: 'boolean',
      description: 'Require a form (name, email) before download? If false, the download button appears without a form',
      initialValue: true,
      validation: Rule => Rule.required(),
      group: 'download',
    }),
    defineField({
      name: 'downloadButtonLabel',
      title: 'Download button label',
      type: 'string',
      description: 'Override button text. Defaults to "Download [type]" for free or "Get your free copy" for gated',
      group: 'download',
    }),

    // --- Related ---
    defineField({
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      description: 'Which services connect to this resource',
      group: 'related',
    }),
    defineField({
      name: 'relatedTools',
      title: 'Related Tools',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tool' }] }],
      description: 'Which tools complement this resource',
      group: 'related',
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      description: 'Which articles explore similar themes',
      group: 'related',
    }),

    // --- SEO ---
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Custom page title for search engines. Falls back to title',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Meta description. Falls back to first 160 chars of introduction',
      group: 'seo',
    }),
    defineField({
      name: 'seoImage',
      title: 'SEO image',
      type: 'image',
      description: 'Social sharing image. Falls back to previewImage',
      group: 'seo',
    }),
  ],

  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'content', title: 'Content' },
    { name: 'download', title: 'Download' },
    { name: 'related', title: 'Related' },
    { name: 'seo', title: 'SEO' },
  ],

  preview: {
    select: {
      title: 'title',
      resourceType: 'resourceType',
    },
    prepare({ title, resourceType }) {
      const typeLabels = { primer: 'Primer', whitepaper: 'Whitepaper', guide: 'Guide' }
      return {
        title: title,
        subtitle: typeLabels[resourceType] || resourceType,
      }
    },
  },
})
