import { slugifyHeading } from './slugify'

// Render heading text by joining span text from the original block value.
// Children are React nodes (Spans with marks etc) - we cannot reliably
// stringify them, but value.children is the raw PT children array.
function textFromBlock(value) {
  if (!value?.children) return ''
  return value.children
    .filter((c) => c?._type === 'span' || typeof c?.text === 'string')
    .map((c) => c.text || '')
    .join('')
}

// PortableText `components.block` overrides for h2/h3 that emit anchor ids
// matching the ones the TableOfContents component generates. Spread these
// into a per-template `block: { ... }` object alongside any custom styles
// the template already has (e.g. blockquote).
export const headingBlocks = {
  h2: ({ children, value }) => {
    const id = slugifyHeading(textFromBlock(value))
    return (
      <h2 id={id || undefined} className="scroll-target">
        {children}
      </h2>
    )
  },
  h3: ({ children, value }) => {
    const id = slugifyHeading(textFromBlock(value))
    return (
      <h3 id={id || undefined} className="scroll-target">
        {children}
      </h3>
    )
  },
}
