// One-shot extractor: pulls every published `tool` document from Sanity
// and writes a JSON + CSV audit file to ~/Projects/mutomorro/tool-audit/.
//
// Body Portable Text is converted to Markdown via a manual block walker
// so we don't depend on packages that may not be installed.

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve(process.env.HOME, 'Projects/mutomorro/tool-audit')
const JSON_PATH = path.join(OUT_DIR, 'tools-extract.json')
const CSV_PATH = path.join(OUT_DIR, 'tools-summary.csv')

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
})

const imgBuilder = imageUrlBuilder(client)

const QUERY = `*[_type == "tool" && !(_id in path("drafts.**"))] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  shortSummary,
  serviceCategories,
  emergentDimensions,
  topics,
  hasToolkit,
  seoTitle,
  seoDescription,
  seoKeyword,
  "relatedServices": relatedServices[]->{ _id, title, "slug": slug.current },
  "bodyRaw": body
}`

// ---------------------------------------------------------------------------
// Portable Text → Markdown
// ---------------------------------------------------------------------------

function escapeMarkdown(text) {
  // Conservative: preserve common chars; just escape backticks & backslashes.
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`')
}

function applyMarks(child, markDefs) {
  if (!child || typeof child.text !== 'string') return ''
  let text = escapeMarkdown(child.text)
  const marks = child.marks || []
  if (marks.length === 0) return text

  const decorators = []
  let linkHref = null

  for (const m of marks) {
    if (m === 'strong') decorators.push('strong')
    else if (m === 'em') decorators.push('em')
    else if (m === 'underline') decorators.push('underline')
    else if (m === 'code') decorators.push('code')
    else if (m === 'strike-through') decorators.push('strike')
    else {
      // Annotation reference (e.g. link)
      const def = (markDefs || []).find((d) => d._key === m)
      if (def && def._type === 'link' && def.href) {
        linkHref = def.href
      }
    }
  }

  if (decorators.includes('code')) text = '`' + text + '`'
  if (decorators.includes('strong')) text = `**${text}**`
  if (decorators.includes('em')) text = `*${text}*`
  if (decorators.includes('strike')) text = `~~${text}~~`
  // Underline isn't standard markdown — leave as-is.
  if (linkHref) text = `[${text}](${linkHref})`

  return text
}

function renderTextBlock(block) {
  const children = (block.children || [])
    .map((c) => applyMarks(c, block.markDefs))
    .join('')

  const style = block.style || 'normal'
  switch (style) {
    case 'h1':
      return `# ${children}`
    case 'h2':
      return `## ${children}`
    case 'h3':
      return `### ${children}`
    case 'h4':
      return `#### ${children}`
    case 'h5':
      return `##### ${children}`
    case 'h6':
      return `###### ${children}`
    case 'blockquote':
      return children
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n')
    case 'normal':
    default:
      return children
  }
}

function imageMarkdown(block) {
  try {
    if (block.asset || block._type === 'image') {
      const url = imgBuilder.image(block).width(1200).url()
      const alt = block.alt || ''
      return `![${alt}](${url})`
    }
  } catch {
    // fall through
  }
  return '[IMAGE]'
}

function portableTextToMarkdown(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  const out = []
  let listBuffer = null // { type: 'bullet'|'number', items: [{level, text}] }

  const flushList = () => {
    if (!listBuffer) return
    const lines = listBuffer.items.map((it) => {
      const indent = '  '.repeat(Math.max(0, (it.level || 1) - 1))
      const marker = listBuffer.type === 'number' ? '1.' : '-'
      return `${indent}${marker} ${it.text}`
    })
    out.push(lines.join('\n'))
    listBuffer = null
  }

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue

    if (block._type === 'block') {
      if (block.listItem) {
        const type = block.listItem === 'number' ? 'number' : 'bullet'
        const text = (block.children || [])
          .map((c) => applyMarks(c, block.markDefs))
          .join('')
        if (!listBuffer || listBuffer.type !== type) {
          flushList()
          listBuffer = { type, items: [] }
        }
        listBuffer.items.push({ level: block.level || 1, text })
        continue
      }

      flushList()
      out.push(renderTextBlock(block))
      continue
    }

    flushList()

    if (block._type === 'image') {
      out.push(imageMarkdown(block))
      continue
    }

    out.push('[UNSUPPORTED BLOCK]')
  }

  flushList()
  return out.filter((s) => s !== '').join('\n\n')
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

function computeStats(markdown) {
  if (!markdown) {
    return { wordCount: 0, headingCount: 0, hasImages: false, linkCount: 0 }
  }

  // Word count: strip markdown noise then split on whitespace
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`-]/g, ' ')
  const words = stripped.split(/\s+/).filter(Boolean)

  const headingCount = (markdown.match(/^#{1,6}\s+/gm) || []).length
  const hasImages =
    /!\[[^\]]*\]\([^)]*\)/.test(markdown) || /\[IMAGE\]/.test(markdown)
  const linkCount = (markdown.match(/(?<!!)\[[^\]]+\]\([^)]+\)/g) || []).length

  return {
    wordCount: words.length,
    headingCount,
    hasImages,
    linkCount,
  }
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const s = Array.isArray(value) ? value.join('|') : String(value)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function buildCsv(tools) {
  const header = [
    'title',
    'slug',
    'wordCount',
    'headingCount',
    'hasImages',
    'linkCount',
    'hasToolkit',
    'hasSeoTitle',
    'hasSeoDescription',
    'serviceCategories',
    'emergentDimensions',
  ]
  const rows = tools.map((t) =>
    [
      t.title,
      t.slug,
      t.bodyStats.wordCount,
      t.bodyStats.headingCount,
      t.bodyStats.hasImages,
      t.bodyStats.linkCount,
      !!t.hasToolkit,
      !!t.seoTitle,
      !!t.seoDescription,
      t.serviceCategories || [],
      t.emergentDimensions || [],
    ]
      .map(csvEscape)
      .join(',')
  )
  return [header.join(','), ...rows].join('\n') + '\n'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching tools from Sanity…')
  const raw = await client.fetch(QUERY)
  console.log(`Received ${raw.length} tool documents.`)

  const tools = raw.map((t) => {
    const bodyMarkdown = portableTextToMarkdown(t.bodyRaw)
    const bodyStats = computeStats(bodyMarkdown)
    return {
      id: t._id,
      title: t.title || null,
      slug: t.slug || null,
      url: t.slug ? `/tools/${t.slug}` : null,
      shortSummary: t.shortSummary || null,
      serviceCategories: t.serviceCategories || [],
      emergentDimensions: t.emergentDimensions || [],
      topics: t.topics || [],
      hasToolkit: !!t.hasToolkit,
      seoTitle: t.seoTitle || null,
      seoDescription: t.seoDescription || null,
      seoKeyword: t.seoKeyword || null,
      relatedServices: (t.relatedServices || []).map((rs) => ({
        title: rs.title,
        slug: rs.slug,
      })),
      bodyMarkdown,
      bodyStats,
    }
  })

  const payload = {
    extractedAt: new Date().toISOString(),
    totalTools: tools.length,
    tools,
  }

  await writeFile(JSON_PATH, JSON.stringify(payload, null, 2), 'utf8')
  await writeFile(CSV_PATH, buildCsv(tools), 'utf8')

  const empty = tools.filter((t) => !t.bodyMarkdown).length
  console.log(`Wrote ${JSON_PATH}`)
  console.log(`Wrote ${CSV_PATH}`)
  console.log(
    `Total: ${tools.length} | empty body: ${empty} | with toolkit: ${tools.filter((t) => t.hasToolkit).length}`
  )
}

main().catch((err) => {
  console.error('Extraction failed:', err)
  process.exit(1)
})
