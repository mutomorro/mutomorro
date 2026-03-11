// scripts/import-projects.js
// Migrates case studies from WordPress to Sanity
// Splits content into 5 named sections matching the project schema:
//   clientAndContext | theObjective | theApproach | whatChanged | keyInsight
//
// SETUP:
//   1. Copy the WP All Export CSV to: wp-export/projects-export.csv
//   2. Ensure SANITY_TOKEN is set in .env.local
//   3. Run: node scripts/import-projects.js
//
// Safe to re-run — uses createOrReplace with deterministic IDs.

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { createClient } = require('@sanity/client')
const csv = require('csv-parser')

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CSV_PATH = path.join(__dirname, '../wp-export/projects-export.csv')

// Maps the h6 section label in WordPress → Sanity field name
const SECTION_FIELD_MAP = {
  'client and context': 'clientAndContext',
  'the objective':      'theObjective',
  'the approach':       'theApproach',
  'what changed':       'whatChanged',
  'key insight':        'keyInsight',
}

// Sector mapping — derived from slug (not in the CSV)
const SECTOR_MAP = {
  'housing-association-merger-integration':     'Housing',
  'customer-experience-in-social-housing':      'Housing',
  'culture-change-in-social-housing':           'Housing',
  'housing-association-service-improvement':    'Housing',
  'public-sector-service-design-case-study':    'Public Sector',
  'public-sector-change-management-case-study': 'Public Sector',
  'social-purpose-strategy-case-study':         'Social Enterprise',
  'charity-culture-change-case-study':          'Charity',
  'charity-organisational-design':              'Charity',
  'employee-experience-strategy-case-study':    'Housing',
  'change-management-training-case-study':      'Housing',
}

// ─── SANITY CLIENT ────────────────────────────────────────────────────────────

require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// ─── KEY GENERATOR ───────────────────────────────────────────────────────────

let keyCounter = 0
const k = () => `k${(++keyCounter).toString().padStart(6, '0')}`

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

async function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/jpeg',
      }))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// Cache so the same URL is never uploaded twice across the whole run
const uploadCache = new Map()

async function uploadImage(imageUrl, altText = '') {
  if (!imageUrl || !imageUrl.trim()) return null

  const cacheKey = imageUrl.split('?')[0]
  if (uploadCache.has(cacheKey)) {
    console.log(`  ↺ Reusing: ${path.basename(cacheKey)}`)
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: uploadCache.get(cacheKey) },
      alt: altText,
    }
  }

  console.log(`  ↑ Uploading: ${path.basename(cacheKey)}`)
  try {
    const { buffer, contentType } = await fetchBuffer(imageUrl)
    const asset = await client.assets.upload('image', buffer, {
      filename: path.basename(cacheKey),
      contentType,
    })
    uploadCache.set(cacheKey, asset._id)
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText,
    }
  } catch (err) {
    console.error(`  ✗ Upload failed for ${path.basename(imageUrl)}: ${err.message}`)
    return null
  }
}

// ─── HTML SECTION SPLITTER ───────────────────────────────────────────────────
// Splits Gutenberg HTML into named sections using the uagb/info-box h6 labels.
// Returns an object keyed by Sanity field name, each value being a raw HTML string.

function splitIntoSections(html) {
  // Replace each uagb/info-box block with a plain text delimiter
  const marked = html.replace(
    /<!-- wp:uagb\/info-box[\s\S]*?-->([\s\S]*?)<!-- \/wp:uagb\/info-box -->/g,
    (match, inner) => {
      const prefixEl = inner.match(/<h6[^>]*>([\s\S]*?)<\/h6>/i)
      const label = prefixEl
        ? prefixEl[1].replace(/<[^>]+>/g, '').trim().toLowerCase()
        : 'unknown'
      return `\n\n===SECTION:${label}===\n\n`
    }
  )

  // Split: [preamble, label, content, label, content, ...]
  const parts = marked.split(/===SECTION:(.+?)===/)
  const preamble = (parts[0] || '').trim()
  const sections = {}

  for (let i = 1; i < parts.length; i += 2) {
    const label     = parts[i].trim().toLowerCase()
    const content   = (parts[i + 1] || '').trim()
    const fieldName = SECTION_FIELD_MAP[label]

    if (fieldName) {
      // Prepend the preamble paragraph to clientAndContext
      sections[fieldName] = fieldName === 'clientAndContext' && preamble
        ? `${preamble}\n\n${content}`
        : content
    } else {
      console.warn(`  ⚠  Unknown section label: "${label}" — skipping`)
    }
  }

  return sections
}

// ─── GUTENBERG HTML → PORTABLE TEXT ──────────────────────────────────────────

async function htmlToBlocks(html) {
  if (!html || !html.trim()) return []

  const blocks = []

  // Strip all remaining block comments
  html = html.replace(/<!-- \/?(wp|uagb):[^-].*?-->/gs, '')

  // Collect figure/img blocks and replace with async-upload placeholders
  const imageSlots = []
  html = html.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (match, inner) => {
    const srcMatch = inner.match(/\bsrc=["']([^"']+)["']/)
    const altMatch = inner.match(/\balt=["']([^"']*)["']/)
    if (!srcMatch) return ''
    imageSlots.push({ imgUrl: srcMatch[1], imgAlt: altMatch ? altMatch[1] : '' })
    return `\n<p>__IMG_SLOT_${imageSlots.length - 1}__</p>\n`
  })

  // Split into paragraph-level segments
  const segments = html
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)

  for (const segment of segments) {
    const inner = segment.replace(/^<p[^>]*>|<\/p>$/gi, '').trim()
    if (!inner) continue

    // Image slot placeholder
    const slotMatch = inner.match(/^__IMG_SLOT_(\d+)__$/)
    if (slotMatch) {
      const slot = imageSlots[parseInt(slotMatch[1])]
      const uploaded = await uploadImage(slot.imgUrl, slot.imgAlt)
      if (uploaded) blocks.push({ _type: 'image', _key: k(), ...uploaded })
      continue
    }

    // Single heading
    const hMatch = inner.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>$/i)
    if (hMatch) {
      const text = cleanText(hMatch[2])
      if (text) blocks.push(textBlock(hMatch[1].toLowerCase(), text))
      continue
    }

    // Single list item
    const liMatch = inner.match(/^<li[^>]*>([\s\S]*?)<\/li>$/i)
    if (liMatch) {
      const text = cleanText(liMatch[1])
      if (text) {
        const b = textBlock('normal', text)
        b.listItem = 'bullet'
        blocks.push(b)
      }
      continue
    }

    // Mixed heading + text — split and process each part
    if (inner.match(/<h[1-6][^>]*>/i)) {
      const parts = inner.split(/(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)/gi).filter(p => p.trim())
      for (const part of parts) {
        const ph = part.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>$/i)
        if (ph) {
          const text = cleanText(ph[2])
          if (text) blocks.push(textBlock(ph[1].toLowerCase(), text))
        } else {
          const text = cleanText(part)
          if (text) blocks.push(textBlock('normal', text))
        }
      }
      continue
    }

    // Plain paragraph
    const text = cleanText(inner)
    if (text) blocks.push(textBlock('normal', text))
  }

  return blocks
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function textBlock(style, text) {
  return {
    _type: 'block',
    _key: k(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: [] }],
  }
}

// ─── CSV READER ───────────────────────────────────────────────────────────────

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📁 Reading CSV...')

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✗ CSV not found at: ${CSV_PATH}`)
    process.exit(1)
  }

  const rows = await readCSV(CSV_PATH)
  console.log(`  Found ${rows.length} case studies\n`)

  let imported = 0
  let failed = 0

  for (const row of rows) {
    const title        = (row['Title']     || '').trim()
    const slug         = (row['Slug']      || '').trim()
    const excerpt      = (row['Excerpt']   || '').trim()
    const content      = (row['Content']   || '').trim()
    const dateStr      = (row['Date']      || '').trim()
    const heroImageUrl = (row['Image URL'] || '').split('|')[0].trim()
    const clientSector = SECTOR_MAP[slug] || ''

    if (!title || !slug) {
      console.warn(`⚠  Skipping row — missing title or slug`)
      failed++
      continue
    }

    console.log(`→ ${title}`)
    if (!clientSector) console.warn(`  ⚠  No sector mapped for: ${slug}`)

    keyCounter = 0

    // Upload hero image
    const heroImage = heroImageUrl
      ? await uploadImage(heroImageUrl, title)
      : null

    // Split HTML into named sections then convert each to Portable Text
    const rawSections   = splitIntoSections(content)
    const sectionBlocks = {}
    let totalBlocks = 0
    let totalImages = 0

    for (const [fieldName, sectionHtml] of Object.entries(rawSections)) {
      if (!sectionHtml) continue
      const blocks = await htmlToBlocks(sectionHtml)
      if (blocks.length > 0) {
        sectionBlocks[fieldName] = blocks
        totalBlocks += blocks.length
        totalImages += blocks.filter(b => b._type === 'image').length
      }
    }

    const foundSections   = Object.keys(sectionBlocks)
    const missingSections = Object.values(SECTION_FIELD_MAP).filter(f => !foundSections.includes(f))
    if (missingSections.length > 0) {
      console.warn(`  ⚠  Missing sections: ${missingSections.join(', ')}`)
    }

    const doc = {
      _type: 'project',
      _id: `project-${slug}`,
      title,
      slug: { _type: 'slug', current: slug },
      shortSummary: excerpt,
      clientSector,
      ...(dateStr && { publishedAt: dateStr.split(' ')[0] }),
      ...(heroImage && { heroImage }),
      ...sectionBlocks,
    }

    try {
      await client.createOrReplace(doc)
      console.log(`  ✓ ${foundSections.length}/5 sections — ${totalBlocks} blocks, ${totalImages} images\n`)
      imported++
    } catch (err) {
      console.error(`  ✗ Sanity write failed: ${err.message}\n`)
      failed++
    }

    await new Promise(r => setTimeout(r, 400))
  }

  console.log('─'.repeat(50))
  console.log(`Done. Imported: ${imported}  Failed: ${failed}`)
  console.log(`Total unique images uploaded: ${uploadCache.size}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
