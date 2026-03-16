/**
 * import-courses.js
 *
 * Imports all 27 published sessions into Sanity as course documents.
 * Same pattern as import-articles.js:
 *   1. Reads the WordPress CSV export
 *   2. Downloads hero images from WordPress
 *   3. Uploads images to Sanity
 *   4. Converts HTML body content to Portable Text (with inline images)
 *   5. Creates course documents in Sanity
 *
 * Prerequisites:
 *   npm install cheerio csv-parse @sanity/client
 *   (Already installed if you ran import-articles.js)
 *
 * Usage:
 *   SANITY_TOKEN=skEWTi0lpiXAV3fbZczLxncwGC7zpUnop1r2tVmuGVo5HP5hk5WJ4GzQrKwhVrMFcxBjy1B5TjoohsaU4zRcURudI3ojzsZv5ZdEMGiG4QqP1w1mjL8DLXs5iq5HC3ANrZwuFRz9MmCHgdcai0eVBa3eQ6E10paWezjeW04yiLAKlKZaoCwk node scripts/import-courses.js
 *
 * CSV file expected at: wp-export/Session-Export-2026-March-07-1840.csv
 * If the filename differs, update CSV_PATH below.
 */

const { createClient } = require('@sanity/client');
const { parse } = require('csv-parse/sync');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// ─── Configuration ──────────────────────────────────────────────────────────

const SANITY_PROJECT_ID = 'c6pg4t4h';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

const CSV_PATH = path.join(__dirname, '..', 'wp-export', 'Session-Export-2026-March-07-1840.csv');
const IMAGE_BACKUP_DIR = path.join(__dirname, '..', 'wp-export', 'images', 'courses');

const DELAY_BETWEEN_COURSES = 1000;
const DELAY_BETWEEN_IMAGES = 500;

// ─── Category mapping ───────────────────────────────────────────────────────
// WordPress "Key Themes" (dimension names) → Sanity course category values

const THEME_TO_CATEGORY = {
  'Change Fluency': 'change',
  'Collective Capacity': 'teams',
  'Cultural Vitality': 'culture',
  'Living Strategy': 'strategy',
  'Narrative Connections': 'storytelling',
  'Operational Flow': 'operations',
  'Service Innovation': 'service-design',
  'Unifying Purpose': 'purpose',
};

// Display labels for the categories (used in Sanity schema)
const CATEGORY_LABELS = {
  'change': 'Change',
  'teams': 'Teams',
  'culture': 'Culture',
  'strategy': 'Strategy',
  'storytelling': 'Storytelling',
  'operations': 'Operations',
  'service-design': 'Service Design',
  'purpose': 'Purpose',
  'leadership': 'Leadership',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateKey() {
  return crypto.randomBytes(6).toString('hex');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getToken() {
  if (process.env.SANITY_TOKEN) return process.env.SANITY_TOKEN;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Paste your Sanity API token: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Image handling ─────────────────────────────────────────────────────────

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`    ⚠ Failed to download: ${url} (${response.status})`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    console.log(`    ⚠ Error downloading ${url}: ${err.message}`);
    return null;
  }
}

async function uploadImageToSanity(client, imageBuffer, filename) {
  try {
    const asset = await client.assets.upload('image', imageBuffer, { filename });
    return asset._id;
  } catch (err) {
    console.log(`    ⚠ Error uploading ${filename}: ${err.message}`);
    return null;
  }
}

async function downloadAndUploadImage(client, url) {
  if (!url || !url.startsWith('http')) return null;
  const filename = url.split('/').pop().split('?')[0];
  const backupPath = path.join(IMAGE_BACKUP_DIR, filename);
  let buffer;

  if (fs.existsSync(backupPath)) {
    console.log(`    ↻ Using cached: ${filename}`);
    buffer = fs.readFileSync(backupPath);
  } else {
    console.log(`    ↓ Downloading: ${filename}`);
    buffer = await downloadImage(url);
    if (!buffer) return null;
    fs.writeFileSync(backupPath, buffer);
  }

  console.log(`    ↑ Uploading to Sanity: ${filename}`);
  const assetId = await uploadImageToSanity(client, buffer, filename);
  await sleep(DELAY_BETWEEN_IMAGES);
  return assetId;
}

// ─── HTML to Portable Text ──────────────────────────────────────────────────
// Same conversion as import-articles.js

async function htmlToPortableText(html, client) {
  if (!html) return [];

  // Strip WordPress block comments and wrapper divs
  let cleaned = html.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*(?:uagb-|wp-block-|entry-content)[^"]*"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/div>/gi, '');
  cleaned = cleaned.replace(/<figure[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/figure>/gi, '');
  cleaned = cleaned.replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, '');
  cleaned = cleaned.replace(/<a[^>]*class="[^"]*uagb-buttons[^"]*"[^>]*>.*?<\/a>/gi, '');

  const $ = cheerio.load(cleaned, { decodeEntities: true });
  const blocks = [];
  const topLevel = $('body').children();

  for (let i = 0; i < topLevel.length; i++) {
    const el = $(topLevel[i]);
    const tagName = topLevel[i].tagName?.toLowerCase();
    if (!tagName) continue;

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const block = processInlineElement($, el, tagName);
      if (block && block.children.length > 0) blocks.push(block);
    } else if (tagName === 'p') {
      const imgs = el.find('img');
      if (imgs.length > 0 && el.text().trim() === '') {
        for (let j = 0; j < imgs.length; j++) {
          const imgBlock = await processImage($, $(imgs[j]), client);
          if (imgBlock) blocks.push(imgBlock);
        }
      } else {
        const block = processInlineElement($, el, 'normal');
        if (block && block.children.length > 0 && block.children.some((c) => c.text.trim())) {
          blocks.push(block);
        }
      }
    } else if (tagName === 'ul') {
      el.find('> li').each((_, li) => {
        const block = processInlineElement($, $(li), 'normal');
        if (block) { block.listItem = 'bullet'; block.level = 1; blocks.push(block); }
      });
    } else if (tagName === 'ol') {
      el.find('> li').each((_, li) => {
        const block = processInlineElement($, $(li), 'normal');
        if (block) { block.listItem = 'number'; block.level = 1; blocks.push(block); }
      });
    } else if (tagName === 'blockquote') {
      const innerP = el.find('p');
      if (innerP.length > 0) {
        innerP.each((_, p) => {
          const block = processInlineElement($, $(p), 'blockquote');
          if (block) blocks.push(block);
        });
      } else {
        const block = processInlineElement($, el, 'blockquote');
        if (block) blocks.push(block);
      }
    } else if (tagName === 'img') {
      const imgBlock = await processImage($, el, client);
      if (imgBlock) blocks.push(imgBlock);
    } else if (tagName === 'table') {
      const tableBlocks = processTable($, el);
      if (tableBlocks.length > 0) blocks.push(...tableBlocks);
    } else if (tagName === 'hr') {
      // Skip horizontal rules - they don't add value in Portable Text
    } else {
      const text = el.text().trim();
      if (text) {
        blocks.push({
          _type: 'block', _key: generateKey(), style: 'normal', markDefs: [],
          children: [{ _type: 'span', _key: generateKey(), text, marks: [] }],
        });
      }
    }
  }
  return blocks;
}

function processInlineElement($, el, style) {
  const markDefs = [];
  const children = [];

  function walkChildren(node, currentMarks) {
    $(node).contents().each((_, child) => {
      if (child.type === 'text') {
        const text = $(child).text();
        if (text) children.push({ _type: 'span', _key: generateKey(), text, marks: [...currentMarks] });
      } else if (child.type === 'tag') {
        const tag = child.tagName.toLowerCase();
        const newMarks = [...currentMarks];
        if (tag === 'strong' || tag === 'b') { newMarks.push('strong'); walkChildren(child, newMarks); }
        else if (tag === 'em' || tag === 'i') { newMarks.push('em'); walkChildren(child, newMarks); }
        else if (tag === 'a') {
          const href = $(child).attr('href');
          if (href) { const k = generateKey(); markDefs.push({ _type: 'link', _key: k, href }); newMarks.push(k); }
          walkChildren(child, newMarks);
        } else if (tag === 'br') {
          children.push({ _type: 'span', _key: generateKey(), text: '\n', marks: [] });
        } else { walkChildren(child, currentMarks); }
      }
    });
  }

  walkChildren(el[0], []);
  if (children.length === 0) return null;
  return { _type: 'block', _key: generateKey(), style, markDefs, children };
}

async function processImage($, imgEl, client) {
  const src = imgEl.attr('src');
  if (!src) return null;
  const alt = imgEl.attr('alt') || '';
  const assetId = await downloadAndUploadImage(client, src);
  if (!assetId) return null;
  return { _type: 'image', _key: generateKey(), asset: { _type: 'reference', _ref: assetId }, alt };
}

function processTable($, tableEl) {
  const blocks = [];
  tableEl.find('tr').each((_, row) => {
    const cells = [];
    $(row).find('th, td').each((_, cell) => cells.push($(cell).text().trim()));
    if (cells.some((t) => t)) {
      blocks.push({
        _type: 'block', _key: generateKey(), style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: generateKey(), text: cells.join(' | '), marks: [] }],
      });
    }
  });
  return blocks;
}

// ─── Extract short summary from excerpt or content ─────────────────────────

function extractSummary(excerpt, content) {
  // Try excerpt first (WordPress stores it as plain text or light HTML)
  if (excerpt && excerpt.trim()) {
    const text = excerpt.replace(/<[^>]*>/g, '').trim();
    if (text.length > 10) {
      // Truncate to ~200 chars at a sentence boundary
      if (text.length <= 200) return text;
      const truncated = text.substring(0, 200);
      const lastSentence = truncated.lastIndexOf('.');
      return lastSentence > 100 ? truncated.substring(0, lastSentence + 1) : truncated + '...';
    }
  }

  // Fall back to first paragraph of content
  if (content) {
    const $ = cheerio.load(content);
    const firstP = $('p').first().text().trim();
    if (firstP) {
      if (firstP.length <= 200) return firstP;
      const truncated = firstP.substring(0, 200);
      const lastSentence = truncated.lastIndexOf('.');
      return lastSentence > 100 ? truncated.substring(0, lastSentence + 1) : truncated + '...';
    }
  }

  return '';
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Mutomorro Courses Import                        ║');
  console.log('║  27 sessions → Sanity courses (with images)      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Check CSV exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✗ CSV not found at: ${CSV_PATH}`);
    console.error('');
    console.error('Export your sessions from WordPress:');
    console.error('  WP Admin → All Export → Sessions');
    console.error('  Save the CSV to wp-export/ with the name above');
    process.exit(1);
  }

  const token = await getToken();
  if (!token) { console.error('No token provided.'); process.exit(1); }

  const client = createClient({
    projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION, token, useCdn: false,
  });

  try {
    await client.fetch('*[_type == "course"][0]._id');
    console.log('✓ Connected to Sanity\n');
  } catch (err) {
    console.error('✗ Failed to connect:', err.message);
    process.exit(1);
  }

  fs.mkdirSync(IMAGE_BACKUP_DIR, { recursive: true });

  // Read CSV
  console.log('Reading CSV...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true, bom: true, relax_quotes: true, relax_column_count: true,
  });
  const published = records.filter((r) => r.Status?.trim() === 'publish');
  console.log(`Found ${records.length} total records, ${published.length} published\n`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < published.length; i++) {
    const session = published[i];
    const title = session.Title?.trim();
    const slug = session.Slug?.trim();

    if (!slug) { console.log(`⚠ Skipping "${title}" - no slug`); failed++; continue; }

    console.log(`\n[${i + 1}/${published.length}] ${title}`);
    console.log(`  slug: ${slug}`);

    try {
      // Category - map WordPress dimension theme to Sanity category
      const theme = session['Key Themes']?.trim();
      // Handle multiple themes (comma or pipe separated) - take the first one
      const firstTheme = theme?.split(/[,|]/).map(t => t.trim())[0];
      const category = THEME_TO_CATEGORY[firstTheme] || 'change';
      console.log(`  theme: "${theme}" → category: ${category}`);

      // Hero image
      let heroImageRef = null;
      const heroUrls = session['Image URL']?.split('|').map((u) => u.trim()).filter(Boolean);
      if (heroUrls && heroUrls.length > 0) {
        const assetId = await downloadAndUploadImage(client, heroUrls[0]);
        if (assetId) {
          heroImageRef = {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
            alt: session['Image Alt Text'] || title,
          };
        }
      }

      // Body content - convert HTML to Portable Text
      console.log('  Converting body content...');
      const bodyBlocks = await htmlToPortableText(session.Content || '', client);
      console.log(`  ${bodyBlocks.length} blocks created`);

      // Short summary from excerpt or first paragraph
      const shortSummary = extractSummary(session.Excerpt, session.Content);

      // Build course document
      const doc = {
        _id: `course-${slug}`,
        _type: 'course',
        title,
        slug: { _type: 'slug', current: slug },
        category,
        shortSummary,
        body: bodyBlocks,
      };

      if (heroImageRef) doc.heroImage = heroImageRef;

      // Create in Sanity
      console.log('  Creating document in Sanity...');
      await client.createOrReplace(doc);
      console.log('  ✓ Done');
      success++;
    } catch (err) {
      console.log(`  ✗ FAILED: ${err.message}`);
      errors.push({ title, slug, error: err.message });
      failed++;
    }

    await sleep(DELAY_BETWEEN_COURSES);
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`\nImport complete!`);
  console.log(`  ✓ Success: ${success}`);
  console.log(`  ✗ Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\nFailed courses:');
    for (const err of errors) console.log(`  - ${err.title} (${err.slug}): ${err.error}`);
  }

  console.log(`\nImage backups saved to: ${IMAGE_BACKUP_DIR}`);
  console.log('Next: check courses in Sanity Studio at /studio');
  console.log('      then verify at /courses on the live site');
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });