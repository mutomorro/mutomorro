// scripts/patch-project-images.js
// Patches alt text and caption on inline image blocks in case study content.
// Images were already uploaded but without alt/title - this fixes that.
// Run: node scripts/patch-project-images.js

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c6pg4t4h',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const CSV_PATH = path.join(__dirname, '..', 'wp-export', 'projects-export.csv');
const FIELDS = ['clientAndContext', 'theObjective', 'theApproach', 'whatChanged', 'keyInsight'];

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Extract inline images from Gutenberg HTML in document order
function extractInlineImages(html) {
  const images = [];
  const figureRegex = /<figure[\s\S]*?<img[\s\S]*?\/figure>/gi;
  let match;
  while ((match = figureRegex.exec(html)) !== null) {
    const fig = match[0];
    const srcMatch = fig.match(/\bsrc="([^"]+)"/);
    const altMatch = fig.match(/\balt="([^"]*)"/);
    const titleMatch = fig.match(/\btitle="([^"]*)"/);
    if (!srcMatch) continue;
    const alt = altMatch ? altMatch[1] : '';
    const title = titleMatch ? titleMatch[1] : alt;
    images.push({ alt, caption: title || alt });
  }
  return images;
}

// Collect all image blocks across all fields in order, with field+index info
function collectImageBlocks(doc) {
  const found = [];
  for (const field of FIELDS) {
    const blocks = doc[field];
    if (!Array.isArray(blocks)) continue;
    blocks.forEach((block, idx) => {
      if (block._type === 'image') {
        found.push({ field, idx, key: block._key, block });
      }
    });
  }
  return found;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✗ CSV not found at: ${CSV_PATH}`);
    process.exit(1);
  }

  const rows = await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  console.log(`📁 Found ${rows.length} case studies\n`);

  let patched = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = row['Title'] || row['post_title'] || Object.values(row)[0];
    const content = row['Content'] || row['post_content'] || '';
    const slug = row['Slug'] || row['post_name'] || slugify(title);
    const docId = `project-${slug}`;

    const imageSlots = extractInlineImages(content);

    if (imageSlots.length === 0) {
      console.log(`→ ${title} — no inline images in CSV, skipping`);
      skipped++;
      continue;
    }

    console.log(`→ ${title} (${imageSlots.length} images)`);

    let doc;
    try {
      doc = await client.getDocument(docId);
    } catch (err) {
      console.error(`  ✗ Could not fetch ${docId}: ${err.message}`);
      continue;
    }

    if (!doc) {
      console.error(`  ✗ Document ${docId} not found`);
      continue;
    }

    const imageBlocks = collectImageBlocks(doc);

    if (imageBlocks.length === 0) {
      console.log(`  — No image blocks found in document, skipping`);
      skipped++;
      continue;
    }

    if (imageBlocks.length !== imageSlots.length) {
      console.warn(`  ⚠ Mismatch: ${imageBlocks.length} blocks in Sanity vs ${imageSlots.length} in CSV — patching what we can`);
    }

    // Build patched versions of each affected field
    const fieldCopies = {};
    for (const field of FIELDS) {
      if (Array.isArray(doc[field])) {
        fieldCopies[field] = doc[field].map(b => ({ ...b }));
      }
    }

    let anyChanged = false;

    imageBlocks.forEach((item, i) => {
      const slot = imageSlots[i];
      if (!slot) return;

      const block = fieldCopies[item.field][item.idx];
      block.alt = slot.alt;
      block.caption = slot.caption;
      anyChanged = true;
      console.log(`  ✓ [${item.field}] image ${i + 1} — alt: "${slot.alt}"`);
    });

    if (!anyChanged) {
      console.log(`  — Nothing to patch\n`);
      skipped++;
      continue;
    }

    // Only send fields that actually contain images
    const patchData = {};
    for (const field of FIELDS) {
      if (fieldCopies[field] && imageBlocks.some(b => b.field === field)) {
        patchData[field] = fieldCopies[field];
      }
    }

    try {
      await client.patch(docId).set(patchData).commit();
      console.log(`  ✓ Document patched\n`);
      patched++;
    } catch (err) {
      console.error(`  ✗ Patch failed: ${err.message}\n`);
    }
  }

  console.log('──────────────────────────────────────────────────');
  console.log(`Done. Patched: ${patched}  Skipped: ${skipped}`);
}

main().catch(console.error);
