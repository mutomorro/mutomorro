// Slugify a heading string for use as an in-page anchor id.
// Must produce the same output in TableOfContents and the PortableText
// heading renderers so ToC links resolve to real headings.
export function slugifyHeading(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Plain text of a heading block, joined from its raw span children.
// (children React nodes can't be reliably stringified; value.children can.)
export function headingText(block) {
  if (!block?.children) return ''
  return block.children
    .filter((c) => c?._type === 'span' || typeof c?.text === 'string')
    .map((c) => c?.text || '')
    .join('')
}

// Build the canonical heading index for a Portable Text body: one entry per
// h2/h3 heading, in document order, each with a UNIQUE anchor id.
//
// Headings frequently repeat on a page — Belbin's nine roles each carry a
// "Characteristics" / "Strengths" / "Allowable weaknesses" subheading, for
// example. A bare text slug collides for every repeat, which breaks two things:
//   1. The DOM — multiple elements share id="strengths", so getElementById
//      only finds the first and every "Strengths" ToC link jumps to the first
//      role's section.
//   2. React — the ToC list and (potentially) the headings render with
//      duplicate keys, which logs errors and can drop/duplicate nodes.
// We de-duplicate by suffixing repeats (-2, -3, …) and key the result by each
// block's unique _key so the ToC and the heading renderer agree on the same id
// for the same block, regardless of which one runs first.
export function buildHeadingIndex(body) {
  const headings = []
  const idByKey = new Map()
  if (!Array.isArray(body)) return { headings, idByKey }

  const counts = new Map()
  for (const block of body) {
    // Standard h2/h3 headings, plus `courseEntry` blocks — each course unit
    // (sanity/schemas/courseEntry.js) stands in for the h3 it replaced, so it
    // must appear in the ToC and own an anchor id. Treat its title as an h3.
    let text
    let level
    if (block?._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
      text = headingText(block).trim()
      level = block.style === 'h2' ? 2 : 3
    } else if (block?._type === 'courseEntry' && typeof block.title === 'string') {
      text = block.title.trim()
      level = 3
    } else {
      continue
    }
    if (!text) continue
    const base = slugifyHeading(text)
    if (!base) continue

    const n = (counts.get(base) || 0) + 1
    counts.set(base, n)
    const id = n === 1 ? base : `${base}-${n}`

    if (block._key) idByKey.set(block._key, id)
    headings.push({ id, text, level, _key: block._key })
  }

  return { headings, idByKey }
}
