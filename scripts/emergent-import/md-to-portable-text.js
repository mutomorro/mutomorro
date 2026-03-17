/**
 * Markdown to Portable Text converter
 * Handles: paragraphs, h2/h3 headings, bold, italic, bullet lists
 * Faithful mechanical conversion - no AI rewriting
 */

function generateKey() {
  return Math.random().toString(36).substring(2, 14)
}

function parseInlineFormatting(text) {
  const spans = []
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.substring(lastIndex, match.index)
      if (plain) {
        spans.push({ _type: 'span', _key: generateKey(), text: plain, marks: [] })
      }
    }
    if (match[2]) {
      spans.push({ _type: 'span', _key: generateKey(), text: match[2], marks: ['strong'] })
    } else if (match[3]) {
      spans.push({ _type: 'span', _key: generateKey(), text: match[3], marks: ['em'] })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const plain = text.substring(lastIndex)
    if (plain) {
      spans.push({ _type: 'span', _key: generateKey(), text: plain, marks: [] })
    }
  }

  if (spans.length === 0) {
    spans.push({ _type: 'span', _key: generateKey(), text: text, marks: [] })
  }

  return spans
}

export function markdownToPortableText(markdown) {
  let cleaned = markdown
    .replace(/\\-/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const lines = cleaned.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trimEnd()

    if (line.trim() === '' || /^---+$/.test(line.trim())) {
      i++
      continue
    }

    // H2
    if (line.startsWith('## ')) {
      const text = line.substring(3).replace(/\*\*/g, '').trim()
      blocks.push({
        _type: 'block', _key: generateKey(), style: 'h2', markDefs: [],
        children: parseInlineFormatting(text)
      })
      i++
      continue
    }

    // H3
    if (line.startsWith('### ')) {
      const text = line.substring(4).replace(/\*\*/g, '').trim()
      blocks.push({
        _type: 'block', _key: generateKey(), style: 'h3', markDefs: [],
        children: parseInlineFormatting(text)
      })
      i++
      continue
    }

    // Bullet list
    if (/^[\*\-] /.test(line)) {
      const text = line.replace(/^[\*\-] /, '').trim()
      blocks.push({
        _type: 'block', _key: generateKey(), style: 'normal',
        listItem: 'bullet', level: 1, markDefs: [],
        children: parseInlineFormatting(text)
      })
      i++
      continue
    }

    // Paragraph - collect lines until blank/heading/bullet
    let paragraphLines = [line]
    i++
    while (i < lines.length) {
      const nextLine = lines[i].trimEnd()
      if (
        nextLine.trim() === '' ||
        nextLine.startsWith('#') ||
        /^[\*\-] /.test(nextLine) ||
        /^---+$/.test(nextLine.trim())
      ) break
      paragraphLines.push(nextLine)
      i++
    }

    const fullText = paragraphLines.join(' ').trim()
    if (fullText) {
      blocks.push({
        _type: 'block', _key: generateKey(), style: 'normal', markDefs: [],
        children: parseInlineFormatting(fullText)
      })
    }
  }

  return blocks
}
