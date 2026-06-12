import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * Expandable "accordion" block for tool + article bodies.
 *
 * Long reference guides carry detail that casual readers skip and diligent
 * readers want in full. This block holds that detail behind a labelled summary,
 * rendered front-end as a native HTML <details>/<summary> (components/
 * ContentAccordion.js). Crucially the body is server-rendered whether the block
 * is open or closed, so search and AI answer engines see the full content — the
 * collapse is presentational only, never a JS fetch-on-click.
 *
 * `body` is a *constrained* Portable Text array, mirroring the table block's
 * cells (sanity/schemas/table.js): paragraphs, bullet lists, bold, italic and
 * the same internal/external `link` annotation as the body. Headings, images,
 * tables and nested accordions are deliberately excluded — this is inline
 * reference detail, not a sub-page.
 */

// Plain-text preview helper, so editors can tell instances apart.
function bodyText(blocks) {
  return (blocks || [])
    .map((b) => (b?.children || []).map((c) => c?.text || '').join(''))
    .join(' ')
    .trim()
}

// One constrained Portable Text block: normal paragraphs and bullet lists, with
// bold, italic and the link annotation. No headings, no other block types.
const accordionBlock = defineArrayMember({
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
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: (Rule) =>
              Rule.uri({
                allowRelative: true,
                scheme: ['http', 'https', 'mailto', 'tel'],
              }),
          },
        ],
      },
    ],
  },
})

export default defineType({
  name: 'accordion',
  title: 'Accordion (expandable)',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Summary label',
      type: 'string',
      description:
        'The always-visible, clickable label — e.g. "The detail: what to include and what to avoid".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Hidden content',
      type: 'array',
      of: [accordionBlock],
      description:
        'Shown when the reader expands the block. Present in the page source even when collapsed, so it still helps the page rank.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultOpen',
      title: 'Start expanded',
      type: 'boolean',
      initialValue: false,
      description: 'Render this instance already open on page load. Leave off for the usual collapsed state.',
    }),
  ],
  preview: {
    select: { title: 'title', body: 'body' },
    prepare({ title, body }) {
      return {
        title: title || 'Accordion',
        subtitle: bodyText(body).slice(0, 60) || 'Expandable detail',
      }
    },
  },
})
