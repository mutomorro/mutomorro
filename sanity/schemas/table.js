import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * Rich-cell table for tool + article bodies.
 *
 * Sanity has no native table type, so this models one directly: a table holds
 * `rows`, each row holds `cells`, and each cell holds a *constrained* Portable
 * Text array. That last part is the point — cells get the same bold / italic /
 * link affordances as the body, which is what makes a comparison table useful
 * to AI answer engines (it can cite a real, linked, semantic table).
 *
 * The `link` annotation mirrors the body's default link: an `href` that accepts
 * external https URLs and internal relative paths (e.g. /tools/5-whys), so links
 * behave identically inside cells and outside them. Headings and lists are
 * deliberately excluded from cells — they don't belong in a table cell.
 *
 * Rendered by components/ContentTable.js as a semantic <table>.
 */

// Plain-text preview helper, shared by the cell and row previews.
function cellText(cell) {
  const blocks = cell?.content || []
  return blocks
    .map((b) => (b?.children || []).map((c) => c?.text || '').join(''))
    .join(' ')
    .trim()
}

// One constrained Portable Text block: normal text only, with bold, italic and
// the link annotation. No headings, no lists.
const cellBlock = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [],
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
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description:
        'Shown above the table and used as the accessible <caption>. Leave blank for no caption.',
    }),
    defineField({
      name: 'firstRowHeader',
      title: 'First row is a header',
      type: 'boolean',
      initialValue: true,
      description:
        'Render the first row as header cells (<th>). Turn off only for a table with no header row.',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tableRow',
          title: 'Row',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'tableCell',
                  title: 'Cell',
                  fields: [
                    defineField({
                      name: 'content',
                      title: 'Content',
                      type: 'array',
                      of: [cellBlock],
                    }),
                  ],
                  preview: {
                    select: { content: 'content' },
                    prepare({ content }) {
                      return { title: cellText({ content }) || '(empty cell)' }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { cells: 'cells' },
            prepare({ cells }) {
              const text = (cells || []).map(cellText).filter(Boolean).join('  |  ')
              return { title: text || '(empty row)' }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { rows: 'rows', caption: 'caption' },
    prepare({ rows, caption }) {
      const n = rows?.length || 0
      return {
        title: caption || 'Table',
        subtitle: `${n} row${n === 1 ? '' : 's'}`,
      }
    },
  },
})
