const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@sanity/client');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const sanity = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const SOURCE_DIR = path.join(__dirname, '..', 'design-reference', 'stage-interfaces');
const SCREENSHOT_DIR = path.join(SOURCE_DIR, 'screenshots');
const MAPPING_FILE = path.join(SOURCE_DIR, 'stage-interface-mapping.json');

// Culture Change files already processed - skip these
const SKIP_FILES = [
  'culture-change-understand-v2.html',
  'culture-change-codesign-v1.html',
  'culture-change-implement-v1.html',
  'culture-change-capability-v1.html',
];

const STAGE_NAMES = ['Understand', 'Co-design', 'Implement', 'Build Capability'];

(async () => {
  // Load mapping
  const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  const entries = mapping.filter(e => !SKIP_FILES.includes(e.file));

  console.log(`Found ${entries.length} entries to process (${mapping.length - entries.length} skipped)\n`);

  // Create screenshots directory
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const htmlPath = path.join(SOURCE_DIR, entry.file);
    const pngName = entry.file.replace('.html', '.png');
    const pngPath = path.join(SCREENSHOT_DIR, pngName);

    console.log(`[${i + 1}/${entries.length}] ${entry.file}`);
    console.log(`  Service: ${entry.slug} | Stage: ${STAGE_NAMES[entry.stageIndex]} (${entry.stageIndex})`);

    try {
      // Check HTML file exists
      if (!fs.existsSync(htmlPath)) {
        throw new Error(`HTML file not found: ${htmlPath}`);
      }

      // 1. Screenshot
      console.log('  Screenshotting...');
      await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await new Promise(r => setTimeout(r, 1500));

      await page.screenshot({
        path: pngPath,
        clip: { x: 0, y: 0, width: 1920, height: 1080 },
      });
      console.log(`  Screenshot saved: ${pngName}`);

      // 2. Upload to Sanity
      console.log('  Uploading to Sanity...');
      const imageAsset = await sanity.assets.upload(
        'image',
        fs.createReadStream(pngPath),
        { filename: pngName }
      );
      console.log(`  Asset ID: ${imageAsset._id}`);

      // 3. Fetch service document
      const doc = await sanity.fetch(
        `*[_type == "service" && slug.current == "${entry.slug}"][0]{ _id, title, stages }`
      );

      if (!doc) {
        throw new Error(`Service document not found for slug: ${entry.slug}`);
      }

      if (!doc.stages || doc.stages.length <= entry.stageIndex) {
        throw new Error(`Stage index ${entry.stageIndex} out of range (document has ${doc.stages?.length || 0} stages)`);
      }

      // 4. Patch stage image
      console.log(`  Patching ${doc._id} stages[${entry.stageIndex}]...`);
      await sanity
        .patch(doc._id)
        .set({
          [`stages[${entry.stageIndex}].stageImage`]: {
            _type: 'image',
            asset: { _type: 'reference', _ref: imageAsset._id },
          },
        })
        .commit();

      console.log(`  OK - patched ${doc.title}\n`);
      successCount++;
      results.push({ file: entry.file, slug: entry.slug, stageIndex: entry.stageIndex, docId: doc._id, status: 'success' });

    } catch (err) {
      console.error(`  FAILED: ${err.message}\n`);
      failCount++;
      results.push({ file: entry.file, slug: entry.slug, stageIndex: entry.stageIndex, docId: null, status: 'failed', error: err.message });
    }
  }

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total: ${entries.length} | Success: ${successCount} | Failed: ${failCount}\n`);

  // Group by service
  const byService = {};
  for (const r of results) {
    if (!byService[r.slug]) byService[r.slug] = [];
    byService[r.slug].push(r);
  }

  for (const [slug, stages] of Object.entries(byService)) {
    const docId = stages.find(s => s.docId)?.docId || 'unknown';
    console.log(`${slug} (${docId})`);
    for (const s of stages) {
      const icon = s.status === 'success' ? 'OK' : 'FAIL';
      console.log(`  [${icon}] Stage ${s.stageIndex} (${STAGE_NAMES[s.stageIndex]}): ${s.file}${s.error ? ' - ' + s.error : ''}`);
    }
    console.log();
  }
})();
