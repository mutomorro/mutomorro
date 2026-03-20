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

const outputDir = path.join(__dirname, '..', 'public', 'images', 'stage-interfaces');
fs.mkdirSync(outputDir, { recursive: true });

const stages = [
  {
    index: 0,
    file: 'culture-change-understand-v2.html',
    filename: 'culture-change-understand-interface.png',
    alt: 'Culture diagnostic dashboard showing health profile across decision-making, collaboration, trust and leadership',
  },
  {
    index: 1,
    file: 'culture-change-codesign-v1.html',
    filename: 'culture-change-codesign-interface.png',
    alt: 'Culture change plan showing prioritised interventions mapped by impact and effort with workstreams',
  },
  {
    index: 2,
    file: 'culture-change-implement-v1.html',
    filename: 'culture-change-implement-interface.png',
    alt: 'Implementation tracker showing workstream progress, leading indicators and team adoption',
  },
  {
    index: 3,
    file: 'culture-change-capability-v1.html',
    filename: 'culture-change-capability-interface.png',
    alt: 'Capability handover view showing maturity levels, internal facilitators and sustainability indicators',
  },
];

(async () => {
  // 1. Screenshot each HTML file
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const stage of stages) {
    const htmlPath = path.join(require('os').homedir(), 'Downloads', stage.file);
    if (!fs.existsSync(htmlPath)) {
      console.error(`File not found: ${htmlPath}`);
      process.exit(1);
    }

    console.log(`Screenshotting ${stage.file}...`);
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

    // Wait for Google Fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1500));

    const outputPath = path.join(outputDir, stage.filename);
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    console.log(`  Saved: ${outputPath}`);
  }

  await browser.close();

  // 2. Find the culture-change service document
  const doc = await sanity.fetch(
    `*[_type == "service" && slug.current == "culture-change-consultancy"][0]{ _id, stages }`
  );

  if (!doc) {
    console.error('Could not find culture-change-consultancy service document');
    process.exit(1);
  }

  console.log(`\nFound service document: ${doc._id}`);
  console.log(`Stages in document: ${doc.stages?.length || 0}`);

  // 3. Upload each image and patch the stage
  for (const stage of stages) {
    const pngPath = path.join(outputDir, stage.filename);
    console.log(`\nUploading ${stage.filename}...`);

    const imageAsset = await sanity.assets.upload(
      'image',
      fs.createReadStream(pngPath),
      { filename: stage.filename }
    );
    console.log(`  Asset ID: ${imageAsset._id}`);

    // Patch the stage image using the array index
    await sanity
      .patch(doc._id)
      .set({
        [`stages[${stage.index}].stageImage`]: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id },
          alt: stage.alt,
        },
      })
      .commit();

    console.log(`  Patched stages[${stage.index}].stageImage`);
  }

  console.log('\nDone! All stage images uploaded and linked.');
})();
