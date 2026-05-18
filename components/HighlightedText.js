// Wraps a target phrase with the .marker-highlight span when it appears
// inside `text`. Case-insensitive match; preserves the original casing.
// Falls back to plain text if the phrase isn't found, so per-page editorial
// changes (or upstream Sanity edits) don't break the page.
export default function HighlightedText({ text, highlight }) {
  if (!text) return null
  if (!highlight) return text
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="marker-highlight">{text.slice(idx, idx + highlight.length)}</span>
      {text.slice(idx + highlight.length)}
    </>
  )
}
