const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, '..', 'public', 'images', 'dashboard');
fs.mkdirSync(outputDir, { recursive: true });

const views = [
  { page: 'overview', filename: 'dashboard-overview.png' },
  { page: 'profile', filename: 'dashboard-profile.png' },
  { page: 'hierarchy', filename: 'dashboard-by-level.png' },
  { page: 'strengths', filename: 'dashboard-strengths.png' },
  { page: 'dim-tc', filename: 'dashboard-deep-dive.png' },
  { page: 'trends', filename: 'dashboard-trends.png' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Load the mockup HTML
  const htmlPath = path.join(__dirname, '..', 'mockup-vitality-dashboard-v2-emergent.html');
  if (!fs.existsSync(htmlPath)) {
    // Try Downloads folder as fallback
    const altPath = path.join(require('os').homedir(), 'Downloads', 'mockup-vitality-dashboard-v2-emergent.html');
    if (fs.existsSync(altPath)) {
      console.log('Using file from Downloads folder');
      await page.goto('file://' + altPath, { waitUntil: 'networkidle0' });
    } else {
      console.error('HTML mockup not found at', htmlPath, 'or', altPath);
      process.exit(1);
    }
  } else {
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  }

  // Wait for fonts and icons to load
  await new Promise(r => setTimeout(r, 3000));

  for (const view of views) {
    // Click the nav item to switch view
    await page.click(`[data-page="${view.page}"]`);
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot the main content area only
    const mainEl = await page.$('.main');
    if (mainEl) {
      await mainEl.screenshot({
        path: path.join(outputDir, view.filename),
        type: 'png',
      });
      console.log('Captured:', view.filename);
    } else {
      console.warn('Could not find .main element for', view.page);
    }
  }

  await browser.close();
  console.log('Done - all screenshots saved to', outputDir);
})();
