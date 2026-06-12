import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * Tabbed panels block for tool + article bodies.
 *
 * A set of labelled panels where the reader sees one at a time. Like the
 * accordion (sanity/schemas/accordion.js) the collapse is *presentational
 * only*: every panel is server-rendered into the page HTML, and the inactive
 * ones are hidden with the `hidden` attribute, never unmounted or fetched on
 * click. Crawlers and AI answer engines therefore see the full content of all
 * panels — the same SEO contract the accordion and table blocks hold to.
 * Acceptance is checked against view-source, not the live DOM.
 *
 * Each tab's `body` is the same *constrained* Portable Text array used by the
 * accordion: paragraphs, bullet lists, bold, italic and the shared internal/
 * external `link` annotation. Headings, images, tables and nested tabs are
 * deliberately excluded — a tab panel is inline reference detail, not a sub-page.
 *
 * Rendered by components/ContentTabs.js as an ARIA tablist.
 */

// Plain-text preview helper, so editors can tell tabs apart.
function bodyText(blocks) {
  return (blocks || [])
    .map((b) => (b?.children || []).map((c) => c?.text || '').join(''))
    .join(' ')
    .trim()
}

// One constrained Portable Text block: normal paragraphs and bullet lists, with
// bold, italic and the link annotation. Mirrors the accordion's accordionBlock.
const tabBlock = defineArrayMember({
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
  name: 'tabs',
  title: 'Tabs',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Group label (accessibility)',
      type: 'string',
      description:
        'A short description of what the tabs cover, e.g. "Pricing options". Read out by screen readers; not shown on the page. Optional.',
    }),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      validation: (Rule) =>
        Rule.required().min(2).error('A tabs block needs at least two tabs.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tab',
          title: 'Tab',
          fields: [
            defineField({
              name: 'label',
              title: 'Tab label',
              type: 'string',
              description: 'The always-visible button text — keep it short.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Panel content',
              type: 'array',
              of: [tabBlock],
              description:
                'Shown when this tab is active. Present in the page source for every tab, so all panels still help the page rank.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', body: 'body' },
            prepare({ label, body }) {
              return {
                title: label || 'Tab',
                subtitle: bodyText(body).slice(0, 60) || 'Tab panel',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { tabs: 'tabs', label: 'label' },
    prepare({ tabs, label }) {
      const n = tabs?.length || 0
      const first = tabs?.[0]?.label
      return {
        title: label || first || 'Tabs',
        subtitle: `${n} tab${n === 1 ? '' : 's'}`,
      }
    },
  },
})
