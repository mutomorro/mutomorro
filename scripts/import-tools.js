/**
 * import-tools.js
 *
 * Imports all 59 published tools into Sanity from the WordPress CSV export.
 * Does everything in one go:
 *   1. Reads the CSV + summaries + taxonomy mapping
 *   2. Downloads hero images from WordPress
 *   3. Uploads images to Sanity
 *   4. Converts HTML body content to Portable Text (with inline images)
 *   5. Creates tool documents in Sanity
 *
 * Prerequisites:
 *   npm install cheerio csv-parse
 *   (You already have @sanity/client from the project)
 *
 * Usage:
 *   SANITY_TOKEN=your-token-here node scripts/import-tools.js
 *
 * Or it will prompt you for the token if not set.
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

// Paths - adjust if running from a different location
const CSV_PATH = path.join(__dirname, '..', 'wp-export', 'Tools-Export-2026-March-07-1634.csv');
const SUMMARIES_PATH = path.join(__dirname, 'tool-data', 'summaries.json');
const IMAGE_BACKUP_DIR = path.join(__dirname, '..', 'wp-export', 'images', 'tools');

// Rate limiting
const DELAY_BETWEEN_TOOLS = 1000; // 1 second between tools
const DELAY_BETWEEN_IMAGES = 500; // 0.5 seconds between image uploads

// ─── Taxonomy mapping ───────────────────────────────────────────────────────

const DIM_TO_EMERGENT = {
  'Cultural Vitality': { title: 'Energy from Culture', value: 'energy-from-culture' },
  'Living Strategy': { title: 'Embedded Strategy', value: 'embedded-strategy' },
  'Unifying Purpose': { title: 'Resonant Purpose', value: 'resonant-purpose' },
  'Operational Flow': { title: 'Momentum through Work', value: 'momentum-through-work' },
  'Collective Capacity': { title: 'Generative Capacity', value: 'generative-capacity' },
  'Change Fluency': { title: 'Tuned to Change', value: 'tuned-to-change' },
  'Narrative Connections': { title: 'Narrative Connections', value: 'narrative-connections' },
  'Service Innovation': { title: 'Service Innovation', value: 'service-innovation' },
};

const EMERGENT_TO_CATEGORY = {
  'resonant-purpose': 'purpose-direction',
  'embedded-strategy': 'purpose-direction',
  'energy-from-culture': 'purpose-direction',
  'momentum-through-work': 'structure-operations',
  'tuned-to-change': 'people-capability',
  'generative-capacity': 'people-capability',
  'narrative-connections': 'people-capability',
  'service-innovation': 'service-experience',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateKey() {
  return crypto.randomBytes(6).toString('hex');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getToken() {
  if (process.env.SANITY_TOKEN) {
    return process.env.SANITY_TOKEN;
  }
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
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (err) {
    console.log(`    ⚠ Error downloading ${url}: ${err.message}`);
    return null;
  }
}

async function uploadImageToSanity(client, imageBuffer, filename) {
  try {
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
    });
    return asset._id;
  } catch (err) {
    console.log(`    ⚠ Error uploading ${filename}: ${err.message}`);
    return null;
  }
}

async function downloadAndUploadImage(client, url) {
  if (!url || !url.startsWith('http')) return null;

  const filename = url.split('/').pop().split('?')[0];

  // Save local backup
  const backupPath = path.join(IMAGE_BACKUP_DIR, filename);
  let buffer;

  // Check if we already downloaded it (resume support)
  if (fs.existsSync(backupPath)) {
    console.log(`    ↻ Using cached: ${filename}`);
    buffer = fs.readFileSync(backupPath);
  } else {
    console.log(`    ↓ Downloading: ${filename}`);
    buffer = await downloadImage(url);
    if (!buffer) return null;
    fs.writeFileSync(backupPath, buffer);
  }

  // Upload to Sanity
  console.log(`    ↑ Uploading to Sanity: ${filename}`);
  const assetId = await uploadImageToSanity(client, buffer, filename);
  await sleep(DELAY_BETWEEN_IMAGES);

  return assetId;
}

// ─── HTML to Portable Text converter ────────────────────────────────────────

/**
 * Converts WordPress HTML content to Sanity Portable Text blocks.
 * Handles: paragraphs, headings, lists, bold, italic, links, images, blockquotes.
 * Downloads and uploads inline images to Sanity along the way.
 */
async function htmlToPortableText(html, client) {
  if (!html) return [];

  // Strip WordPress/Gutenberg block comments
  let cleaned = html.replace(/<!--\s*\/?wp:[^>]*-->/g, '');

  // Strip Gutenberg wrapper divs (uagb containers, wp-block wrappers)
  // We keep the content inside them
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*(?:uagb-|wp-block-|entry-content)[^"]*"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/div>/gi, '');

  // Strip figure wrappers but keep their content
  cleaned = cleaned.replace(/<figure[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/figure>/gi, '');
  cleaned = cleaned.replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, '');

  // Strip download button sections (these will be handled differently on new site)
  cleaned = cleaned.replace(/<a[^>]*class="[^"]*uagb-buttons[^"]*"[^>]*>.*?<\/a>/gi, '');

  const $ = cheerio.load(cleaned, { decodeEntities: true });
  const blocks = [];

  // Process top-level elements
  const topLevel = $('body').children();

  for (let i = 0; i < topLevel.length; i++) {
    const el = $(topLevel[i]);
    const tagName = topLevel[i].tagName?.toLowerCase();

    if (!tagName) continue;

    // Headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const block = processInlineElement($, el, tagName);
      if (block && block.children.length > 0) {
        blocks.push(block);
      }
    }
    // Paragraphs
    else if (tagName === 'p') {
      // Check if paragraph only contains an image
      const imgs = el.find('img');
      if (imgs.length > 0 && el.text().trim() === '') {
        // Image-only paragraph - create image block
        for (let j = 0; j < imgs.length; j++) {
          const imgBlock = await processImage($, $(imgs[j]), client);
          if (imgBlock) blocks.push(imgBlock);
        }
      } else {
        const block = processInlineElement($, el, 'normal');
        if (block && block.children.length > 0 && block.children.some(c => c.text.trim())) {
          blocks.push(block);
        }
      }
    }
    // Unordered lists
    else if (tagName === 'ul') {
      const items = el.find('> li');
      items.each((_, li) => {
        const block = processInlineElement($, $(li), 'normal');
        if (block) {
          block.listItem = 'bullet';
          block.level = 1;
          blocks.push(block);
        }
      });
    }
    // Ordered lists
    else if (tagName === 'ol') {
      const items = el.find('> li');
      items.each((_, li) => {
        const block = processInlineElement($, $(li), 'normal');
        if (block) {
          block.listItem = 'number';
          block.level = 1;
          blocks.push(block);
        }
      });
    }
    // Blockquotes
    else if (tagName === 'blockquote') {
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
    }
    // Standalone images
    else if (tagName === 'img') {
      const imgBlock = await processImage($, el, client);
      if (imgBlock) blocks.push(imgBlock);
    }
    // Tables - convert to a simple text representation
    else if (tagName === 'table') {
      const tableBlock = processTable($, el);
      if (tableBlock.length > 0) {
        blocks.push(...tableBlock);
      }
    }
    // Anything else with text content - treat as paragraph
    else {
      const text = el.text().trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: generateKey(), text: text, marks: [] }],
        });
      }
    }
  }

  return blocks;
}

/**
 * Process an element that may contain inline formatting (bold, italic, links)
 */
function processInlineElement($, el, style) {
  const markDefs = [];
  const children = [];

  function walkChildren(node, currentMarks) {
    const contents = $(node).contents();
    contents.each((_, child) => {
      if (child.type === 'text') {
        const text = $(child).text();
        if (text) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text,
            marks: [...currentMarks],
          });
        }
      } else if (child.type === 'tag') {
        const tag = child.tagName.toLowerCase();
        const newMarks = [...currentMarks];

        if (tag === 'strong' || tag === 'b') {
          newMarks.push('strong');
          walkChildren(child, newMarks);
        } else if (tag === 'em' || tag === 'i') {
          newMarks.push('em');
          walkChildren(child, newMarks);
        } else if (tag === 'a') {
          const href = $(child).attr('href');
          if (href) {
            const linkKey = generateKey();
            markDefs.push({
              _type: 'link',
              _key: linkKey,
              href: href,
            });
            newMarks.push(linkKey);
          }
          walkChildren(child, newMarks);
        } else if (tag === 'br') {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: '\n',
            marks: [],
          });
        } else {
          // For other inline elements, just process their children
          walkChildren(child, currentMarks);
        }
      }
    });
  }

  walkChildren(el[0], []);

  if (children.length === 0) return null;

  return {
    _type: 'block',
    _key: generateKey(),
    style: style,
    markDefs: markDefs,
    children: children,
  };
}

/**
 * Process an image element - download from WP, upload to Sanity
 */
async function processImage($, imgEl, client) {
  const src = imgEl.attr('src');
  const alt = imgEl.attr('alt') || '';

  if (!src) return null;

  const assetId = await downloadAndUploadImage(client, src);
  if (!assetId) return null;

  return {
    _type: 'image',
    _key: generateKey(),
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt: alt,
  };
}

/**
 * Convert a table to simple text blocks (tables aren't natively supported in basic Portable Text)
 */
function processTable($, tableEl) {
  const blocks = [];
  const rows = tableEl.find('tr');
  rows.each((_, row) => {
    const cells = $(row).find('th, td');
    const cellTexts = [];
    cells.each((_, cell) => {
      cellTexts.push($(cell).text().trim());
    });
    if (cellTexts.some((t) => t)) {
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: cellTexts.join(' | '),
            marks: [],
          },
        ],
      });
    }
  });
  return blocks;
}

// ─── Taxonomy mapper ────────────────────────────────────────────────────────

function mapTaxonomy(themesRaw, topicsRaw) {
  const themes = themesRaw ? themesRaw.split('|').map((t) => t.trim()).filter(Boolean) : [];
  const topics = topicsRaw ? topicsRaw.split('|').map((t) => t.trim()).filter(Boolean) : [];

  // Map old theme names to EMERGENT dimensions
  const emergentDimensions = [];
  for (const theme of themes) {
    if (DIM_TO_EMERGENT[theme]) {
      emergentDimensions.push(DIM_TO_EMERGENT[theme].value);
    }
  }

  // Derive service categories from EMERGENT dimensions
  const categorySet = new Set();
  for (const dim of emergentDimensions) {
    if (EMERGENT_TO_CATEGORY[dim]) {
      categorySet.add(EMERGENT_TO_CATEGORY[dim]);
    }
  }

  return {
    emergentDimensions: [...new Set(emergentDimensions)],
    serviceCategories: [...categorySet],
    topics: topics,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Mutomorro Tools Import                         ║');
  console.log('║  59 tools → Sanity (with images)                ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Get Sanity token
  const token = await getToken();
  if (!token) {
    console.error('No token provided. Exiting.');
    process.exit(1);
  }

  // Create Sanity client
  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: token,
    useCdn: false,
  });

  // Test connection
  try {
    await client.fetch('*[_type == "tool"][0]._id');
    console.log('✓ Connected to Sanity\n');
  } catch (err) {
    console.error('✗ Failed to connect to Sanity:', err.message);
    process.exit(1);
  }

  // Create image backup directory
  fs.mkdirSync(IMAGE_BACKUP_DIR, { recursive: true });

  // Read CSV
  console.log('Reading CSV...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  const published = records.filter((r) => r.Status?.trim() === 'publish');
  console.log(`Found ${published.length} published tools\n`);

  // Read summaries
  console.log('Reading summaries...');
  const summaries = JSON.parse(fs.readFileSync(SUMMARIES_PATH, 'utf-8'));
  console.log(`Loaded ${Object.keys(summaries).length} summaries\n`);

  // Track results
  let success = 0;
  let failed = 0;
  const errors = [];

  // Process each tool
  for (let i = 0; i < published.length; i++) {
    const tool = published[i];
    const title = tool.Title?.trim();
    const slug = tool.Slug?.trim();

    if (!slug) {
      console.log(`⚠ Skipping "${title}" - no slug`);
      failed++;
      continue;
    }

    console.log(`\n[${i + 1}/${published.length}] ${title}`);
    console.log(`  slug: ${slug}`);

    try {
      // ── Taxonomy ──
      const taxonomy = mapTaxonomy(tool['Key Themes'], tool['Topics']);
      console.log(`  categories: ${taxonomy.serviceCategories.join(', ')}`);
      console.log(`  dimensions: ${taxonomy.emergentDimensions.join(', ')}`);

      // ── Hero image ──
      let heroImageRef = null;
      const heroUrls = tool['Image URL']?.split('|').map((u) => u.trim()).filter(Boolean);
      if (heroUrls && heroUrls.length > 0) {
        const heroUrl = heroUrls[0]; // Take first if multiple
        const assetId = await downloadAndUploadImage(client, heroUrl);
        if (assetId) {
          heroImageRef = {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
            alt: tool['Image Alt Text'] || title,
          };
        }
      }

      // ── Body content (HTML to Portable Text) ──
      console.log('  Converting body content...');
      const bodyBlocks = await htmlToPortableText(tool.Content || '', client);
      console.log(`  ${bodyBlocks.length} blocks created`);

      // ── Summary ──
      const shortSummary = summaries[slug] || tool.summary_explainer || '';

      // ── SEO ──
      const seoKeyword = tool.rank_math_focus_keyword || '';
      const seoTitle = tool.rank_math_title || '';
      const seoDescription = tool.rank_math_description || '';

      // ── Build document ──
      const doc = {
        _id: `tool-${slug}`,
        _type: 'tool',
        title: title,
        slug: { _type: 'slug', current: slug },
        shortSummary: shortSummary,
        serviceCategories: taxonomy.serviceCategories,
        emergentDimensions: taxonomy.emergentDimensions,
        topics: taxonomy.topics,
        body: bodyBlocks,
        hasToolkit: false, // Can be updated manually in Studio
        seoTitle: seoTitle,
        seoDescription: seoDescription || shortSummary,
        seoKeyword: seoKeyword,
      };

      // Add hero image if we got one
      if (heroImageRef) {
        doc.heroImage = heroImageRef;
      }

      // ── Create in Sanity ──
      console.log('  Creating document in Sanity...');
      await client.createOrReplace(doc);
      console.log(`  ✓ Done`);
      success++;
    } catch (err) {
      console.log(`  ✗ FAILED: ${err.message}`);
      errors.push({ title, slug, error: err.message });
      failed++;
    }

    await sleep(DELAY_BETWEEN_TOOLS);
  }

  // ── Summary ──
  console.log('\n' + '═'.repeat(50));
  console.log(`\nImport complete!`);
  console.log(`  ✓ Success: ${success}`);
  console.log(`  ✗ Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\nFailed tools:');
    for (const err of errors) {
      console.log(`  - ${err.title} (${err.slug}): ${err.error}`);
    }
  }

  console.log(`\nImage backups saved to: ${IMAGE_BACKUP_DIR}`);
  console.log(`\nNext: check tools in Sanity Studio → localhost:3000/studio`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
