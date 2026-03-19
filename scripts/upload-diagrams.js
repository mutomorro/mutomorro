#!/usr/bin/env node

/**
 * upload-diagrams.js
 *
 * Screenshots 66 HTML visual files (proposition diagrams + stage infographics)
 * at 1920x1080, uploads them to Sanity, and links them to service documents.
 *
 * Usage:
 *   node scripts/upload-diagrams.js
 *
 * Requires SANITY_TOKEN in .env.local with write access.
 */

const puppeteer = require('puppeteer')
const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('Missing SANITY_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  token: SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const ROOT = path.resolve(__dirname, '..')
const PROPOSITIONS_DIR = path.join(ROOT, 'design-reference/visuals/diagrams/propositions')
const STAGES_DIR = path.join(ROOT, 'design-reference/visuals/diagrams/stages')
const TEMP_DIR = path.join(ROOT, '.tmp-screenshots')

// Map filename prefix → Sanity service document _id
const serviceMap = {
  'change-management': 'service-change-management-consultancy',
  'culture-change': 'service-culture-change-consultancy',
  'customer-experience': 'service-customer-experience-consultancy',
  'employee-experience': 'service-employee-experience-consultancy',
  'operational-effectiveness': 'service-operational-effectiveness-consultancy',
  'organisational-capacity-building': 'service-organisational-capacity-building',
  'organisational-design': 'service-organisational-design-consultancy',
  'organisational-development': 'service-organisational-development-consultancy',
  'organisational-purpose': 'service-organisational-purpose-consultancy',
  'organisational-restructuring': 'service-organisational-restructuring-consultancy',
  'post-merger-integration': 'service-post-merger-integration-consultancy',
  'scaling-operations': 'service-scaling-operations-consultancy',
  'service-design': 'service-service-design-consultancy',
  'strategic-alignment': 'service-strategic-alignment-consultancy',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePropositionFilename(filename) {
  // e.g. "change-management-proposition.html" → "change-management"
  const match = filename.match(/^(.+)-proposition\.html$/)
  return match ? match[1] : null
}

function parseStageFilename(filename) {
  // e.g. "change-management-stage-2-co-design.html" → { service: "change-management", stageNum: 2 }
  const match = filename.match(/^(.+)-stage-(\d+)-.+\.html$/)
  if (!match) return null
  return { service: match[1], stageNum: parseInt(match[2], 10) }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Create temp dir
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

  // Collect all tasks
  const tasks = []

  // Proposition diagrams
  const propFiles = fs.readdirSync(PROPOSITIONS_DIR).filter(f => f.endsWith('.html')).sort()
  for (const file of propFiles) {
    const serviceKey = parsePropositionFilename(file)
    if (!serviceKey) { console.warn(`Skipping unrecognised file: ${file}`); continue }
    if (serviceKey === 'culture-change') { continue } // Skip culture change
    const docId = serviceMap[serviceKey]
    if (!docId) { console.warn(`No service mapping for: ${serviceKey}`); continue }
    tasks.push({
      type: 'proposition',
      htmlPath: path.join(PROPOSITIONS_DIR, file),
      filename: file.replace('.html', '.png'),
      docId,
      serviceKey,
    })
  }

  // Stage infographics
  const stageFiles = fs.readdirSync(STAGES_DIR).filter(f => f.endsWith('.html')).sort()
  for (const file of stageFiles) {
    const parsed = parseStageFilename(file)
    if (!parsed) { console.warn(`Skipping unrecognised file: ${file}`); continue }
    if (parsed.service === 'culture-change') { continue } // Skip culture change
    const docId = serviceMap[parsed.service]
    if (!docId) { console.warn(`No service mapping for: ${parsed.service}`); continue }
    tasks.push({
      type: 'stage',
      htmlPath: path.join(STAGES_DIR, file),
      filename: file.replace('.html', '.png'),
      docId,
      serviceKey: parsed.service,
      stageIndex: parsed.stageNum - 1, // stage 1 = index 0
    })
  }

  console.log(`\nFound ${tasks.length} files to process (skipping culture-change)\n`)

  // Pre-fetch all service docs to get stage _key values
  const stageDocs = {}
  const serviceIds = [...new Set(tasks.filter(t => t.type === 'stage').map(t => t.docId))]
  for (const docId of serviceIds) {
    const doc = await client.fetch(`*[_id == $id][0]{ stages[]{ _key, stageNumber } }`, { id: docId })
    if (doc && doc.stages) {
      stageDocs[docId] = doc.stages
    } else {
      console.warn(`Could not fetch stages for ${docId}`)
    }
  }

  // Launch browser
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  let success = 0
  let errors = 0

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const label = `[${i + 1}/${tasks.length}]`
    const pngPath = path.join(TEMP_DIR, task.filename)

    try {
      // Screenshot
      await page.goto(`file://${task.htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 })
      await new Promise(r => setTimeout(r, 1000)) // extra wait for fonts
      await page.screenshot({
        path: pngPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 },
      })

      // Upload to Sanity
      const imageAsset = await client.assets.upload('image', fs.createReadStream(pngPath), {
        filename: task.filename,
      })

      // Link to document
      if (task.type === 'proposition') {
        await client
          .patch(task.docId)
          .set({
            propositionImage: {
              _type: 'image',
              asset: { _type: 'reference', _ref: imageAsset._id },
            },
          })
          .commit()
        console.log(`${label} ${task.filename} → ${task.docId}.propositionImage`)
      } else {
        // Stage: find the _key for this stage index
        const stages = stageDocs[task.docId]
        if (!stages || !stages[task.stageIndex]) {
          console.error(`${label} ERROR: No stage at index ${task.stageIndex} for ${task.docId}`)
          errors++
          continue
        }
        const stageKey = stages[task.stageIndex]._key

        await client
          .patch(task.docId)
          .set({
            [`stages[_key=="${stageKey}"].stageImage`]: {
              _type: 'image',
              asset: { _type: 'reference', _ref: imageAsset._id },
            },
          })
          .commit()
        console.log(`${label} ${task.filename} → ${task.docId}.stages[${task.stageIndex}].stageImage`)
      }

      success++
    } catch (err) {
      console.error(`${label} ERROR processing ${task.filename}: ${err.message}`)
      errors++
    }
  }

  await browser.close()

  // Clean up temp dir
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })

  console.log(`\nDone. ${success} succeeded, ${errors} failed.\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
