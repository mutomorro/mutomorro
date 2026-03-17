#!/usr/bin/env node

/**
 * EMERGENT Framework Content Import
 *
 * Reads markdown files from content/ directories and patches
 * dimensionArticle documents in Sanity with Portable Text body content.
 *
 * Usage:
 *   node import-emergent-content.js                    # Import all dimensions
 *   node import-emergent-content.js enacted-culture    # Import one dimension
 *
 * Requires: SANITY_TOKEN environment variable
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { markdownToPortableText } from './md-to-portable-text.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ID = 'c6pg4t4h'
const DATASET = 'production'
const API_VERSION = '2024-01-01'

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('Error: SANITY_TOKEN environment variable is required.')
  console.error('Get a token from: https://www.sanity.io/manage/project/c6pg4t4h/api#tokens')
  process.exit(1)
}

const DIMENSIONS = [
  'momentum-through-work',
  'evolving-service',
  'generative-capacity',
  'enacted-culture',
  'narrative-connections',
  'tuned-to-change'
]

const SECTIONS = [
  'what-it-means',
  'recognising-patterns',
  'the-wider-effect',
  'cultivating-conditions',
  'explore-it-yourself'
]

async function sanityQuery(query) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${SANITY_TOKEN}` }
  })
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data.result
}

async function sanityPatch(documentId, body) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`
    },
    body: JSON.stringify({
      mutations: [{ patch: { id: documentId, set: { body } } }]
    })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sanity patch failed for ${documentId}: ${res.status} ${text}`)
  }
  return await res.json()
}

async function getArticleMap() {
  console.log('Querying Sanity for dimensionArticle documents...')
  const articles = await sanityQuery(`
    *[_type == "dimensionArticle"]{
      _id, title, sectionType,
      "dimensionSlug": dimension->slug.current,
      "dimensionTitle": dimension->title,
      "hasBody": defined(body)
    }
  `)

  const map = {}
  for (const article of articles) {
    const key = `${article.dimensionSlug}/${article.sectionType}`
    if (!map[key] || article._id.startsWith('drafts.')) {
      map[key] = article
    }
  }
  return map
}

async function importDimension(dimensionSlug, articleMap) {
  const contentDir = path.join(__dirname, 'content', dimensionSlug)

  if (!fs.existsSync(contentDir)) {
    console.log(`  Skipping ${dimensionSlug} - no content directory`)
    return { imported: 0, skipped: 0, errors: 0 }
  }

  let imported = 0, skipped = 0, errors = 0

  for (const section of SECTIONS) {
    const mdFile = path.join(contentDir, `${section}.md`)
    const key = `${dimensionSlug}/${section}`
    const article = articleMap[key]

    if (!article) {
      console.log(`  Warning: No article found in Sanity for ${key}`)
      errors++
      continue
    }

    if (!fs.existsSync(mdFile)) {
      console.log(`  Skipping ${key} - no markdown file`)
      skipped++
      continue
    }

    if (article.hasBody) {
      console.log(`  Skipping ${key} - already has body content`)
      skipped++
      continue
    }

    try {
      const markdown = fs.readFileSync(mdFile, 'utf-8')
      const portableText = markdownToPortableText(markdown)

      console.log(`  Patching ${key} (${portableText.length} blocks) -> ${article._id}`)
      await sanityPatch(article._id, portableText)
      imported++

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.error(`  Error patching ${key}: ${err.message}`)
      errors++
    }
  }

  return { imported, skipped, errors }
}

async function main() {
  const targetDimension = process.argv[2]
  const dimensions = targetDimension ? [targetDimension] : DIMENSIONS

  console.log('')
  console.log('EMERGENT Framework Content Import')
  console.log('=================================')
  console.log('')

  try {
    await sanityQuery('*[_type == "dimension"][0]{title}')
    console.log('Sanity connection verified.')
    console.log('')
  } catch (err) {
    console.error('Failed to connect to Sanity. Check your token.')
    console.error(err.message)
    process.exit(1)
  }

  const articleMap = await getArticleMap()
  console.log(`Found ${Object.keys(articleMap).length} articles in Sanity.`)
  console.log('')

  let totalImported = 0, totalSkipped = 0, totalErrors = 0

  for (const dim of dimensions) {
    console.log(`Processing: ${dim}`)
    const { imported, skipped, errors } = await importDimension(dim, articleMap)
    totalImported += imported
    totalSkipped += skipped
    totalErrors += errors
    console.log('')
  }

  console.log('Summary')
  console.log('-------')
  console.log(`Imported: ${totalImported}`)
  console.log(`Skipped:  ${totalSkipped}`)
  console.log(`Errors:   ${totalErrors}`)
  console.log('')
  if (totalImported > 0) {
    console.log('Content patched as drafts. Review in Sanity Studio then publish.')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
