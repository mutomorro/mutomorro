import { slugifyHeading, headingText } from './slugify'

// PortableText `components.block` overrides for h2/h3 that emit anchor ids
// matching the ones TableOfContents generates.
//
// Pass in the `idByKey` map from buildHeadingIndex(body) so repeated headings
// (e.g. "Strengths" under each of Belbin's nine roles) get unique, de-duplicated
// anchors that stay 1:1 with the ToC. We look the id up by the block's _key
// rather than re-slugifying its text, because the de-duplication suffix (-2,
// -3, …) depends on the heading's position in the whole body — which a single
// block can't know on its own. The bare-slug fallback preserves the old
// behaviour if no map is supplied.
//
// Spread the result into a per-template `block: { ... }` object alongside any
// custom styles the template already has (e.g. blockquote).
export function makeHeadingBlocks(idByKey) {
  const idFor = (value) =>
    idByKey?.get(value?._key) || slugifyHeading(headingText(value)) || undefined
  return {
    h2: ({ children, value }) => (
      <h2 id={idFor(value)} className="scroll-target">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={idFor(value)} className="scroll-target">
        {children}
      </h3>
    ),
  }
}
