import { PortableText } from '@portabletext/react'

/**
 * Renders a `table` Portable Text block as a real, semantic HTML <table>.
 *
 * Each cell carries its own Portable Text array, so cells are rendered *through*
 * PortableText — that's what makes in-cell bold and links work. The link mark
 * mirrors the tool/article body serializer so internal (relative) and external
 * (https) links behave identically inside cells and outside them.
 *
 * This is a server component (no 'use client'): the table is emitted in the
 * server-rendered HTML so crawlers and AI answer engines see a genuine <table>.
 *
 * React keys are derived from position (`r`, `${r}-${c}`), NOT cell `_key`s.
 * Nested cell `_key`s aren't guaranteed unique among siblings (table data can be
 * authored/imported by paths that reuse keys), and duplicate keys let React drop
 * or duplicate cells on render. Position is unique per render and the table is
 * static (no client reordering), so this is both safe and correct — don't switch
 * back to `_key`.
 */

const cellComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          className="inline-link"
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {children}
        </a>
      )
    },
  },
}

function Cell({ cell }) {
  return <PortableText value={cell?.content || []} components={cellComponents} />
}

export default function ContentTable({ value }) {
  const rows = value?.rows || []
  if (!rows.length) return null

  const firstRowHeader = value?.firstRowHeader !== false
  const headerRow = firstRowHeader ? rows[0] : null
  const bodyRows = firstRowHeader ? rows.slice(1) : rows
  const caption = value?.caption

  return (
    <div
      className="content-table-wrap"
      role="region"
      aria-label={caption || 'Table'}
      tabIndex={0}
    >
      <table className="content-table">
        {caption ? <caption className="content-table__caption">{caption}</caption> : null}
        {headerRow ? (
          <thead>
            <tr>
              {(headerRow.cells || []).map((cell, i) => (
                <th key={i} scope="col">
                  <Cell cell={cell} />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {bodyRows.map((row, r) => (
            <tr key={r}>
              {(row?.cells || []).map((cell, c) => (
                <td key={`${r}-${c}`}>
                  <Cell cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
