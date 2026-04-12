#!/usr/bin/env node

/**
 * Mutomorro Internal Link Crawler
 * 
 * Crawls mutomorro.com starting from the sitemap, extracts all internal links
 * from every page, and outputs a comprehensive link audit report.
 * 
 * Usage:
 *   cd ~/Projects/mutomorro
 *   node crawl-internal-links.js
 * 
 * Output:
 *   - internal-link-audit.json   (full link graph data)
 *   - internal-link-audit.csv    (flat file for spreadsheet analysis)
 *   - link-audit-summary.txt     (human-readable summary)
 * 
 * Requires: Node.js 18+ (uses native fetch)
 */

const { writeFileSync } = require('fs');
const { JSDOM } = require('jsdom');

// --- Configuration ---
const SITE_URL = 'https://mutomorro.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const CONCURRENCY = 5; // parallel requests
const DELAY_MS = 200; // polite delay between batches
const OUTPUT_DIR = '.'; // current directory

// --- Helpers ---
function normaliseUrl(href, base) {
  try {
    const url = new URL(href, base);
    // Only internal links
    if (url.hostname !== 'mutomorro.com' && url.hostname !== 'www.mutomorro.com') {
      return null;
    }
    // Strip hash and query, keep pathname
    let path = url.pathname;
    // Normalise trailing slash
    if (path !== '/' && !path.endsWith('/')) {
      path = path + '/';
    }
    return path;
  } catch {
    return null;
  }
}

function classifyLinkLocation(element) {
  // Walk up the DOM to figure out where this link sits
  let el = element;
  while (el && el.tagName !== 'BODY') {
    const tag = (el.tagName || '').toLowerCase();
    const cls = (el.className || '').toString().toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();

    if (tag === 'nav' || role === 'navigation' || cls.includes('nav')) return 'navigation';
    if (tag === 'footer' || cls.includes('footer')) return 'footer';
    if (tag === 'header' || cls.includes('header')) return 'header';
    if (cls.includes('sidebar') || cls.includes('aside')) return 'sidebar';
    if (cls.includes('related') || cls.includes('explore')) return 'related-panel';
    if (cls.includes('cta') || cls.includes('call-to-action')) return 'cta';
    if (cls.includes('hero')) return 'hero';

    el = el.parentElement;
  }
  return 'body-content';
}

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MutomorroLinkAudit/1.0',
          'Accept': 'text/html,application/xml',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      return response;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function getSitemapUrls() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const response = await fetchWithRetry(SITEMAP_URL);
  const xml = await response.text();

  // Check if it's a sitemap index
  if (xml.includes('<sitemapindex')) {
    console.log('Found sitemap index, fetching child sitemaps...');
    const indexDom = new JSDOM(xml, { contentType: 'application/xml' });
    const sitemapLocs = [...indexDom.window.document.querySelectorAll('sitemap > loc')];
    
    const allUrls = [];
    for (const loc of sitemapLocs) {
      const childUrl = loc.textContent.trim();
      console.log(`  Fetching child sitemap: ${childUrl}`);
      try {
        const childResponse = await fetchWithRetry(childUrl);
        const childXml = await childResponse.text();
        const childDom = new JSDOM(childXml, { contentType: 'application/xml' });
        const urls = [...childDom.window.document.querySelectorAll('url > loc')]
          .map(el => el.textContent.trim());
        allUrls.push(...urls);
        console.log(`    Found ${urls.length} URLs`);
      } catch (err) {
        console.error(`    Error fetching ${childUrl}: ${err.message}`);
      }
    }
    return allUrls;
  }

  // Regular sitemap
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  const urls = [...dom.window.document.querySelectorAll('url > loc')]
    .map(el => el.textContent.trim());
  console.log(`Found ${urls.length} URLs in sitemap`);
  return urls;
}

async function crawlPage(pageUrl) {
  const path = new URL(pageUrl).pathname;
  console.log(`  Crawling: ${path}`);

  try {
    const response = await fetchWithRetry(pageUrl);
    const status = response.status;
    const finalUrl = response.url;
    const html = await response.text();

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Get page title
    const title = doc.querySelector('title')?.textContent?.trim() || '';
    const h1 = doc.querySelector('h1')?.textContent?.trim() || '';

    // Find all anchor tags
    const anchors = [...doc.querySelectorAll('a[href]')];
    const links = [];

    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      const normalisedPath = normaliseUrl(href, pageUrl);
      if (!normalisedPath) continue; // skip external links
      if (normalisedPath === path || normalisedPath === path.replace(/\/$/, '')) continue; // skip self-links

      const anchorText = anchor.textContent?.trim().substring(0, 100) || '';
      const location = classifyLinkLocation(anchor);
      const ariaLabel = anchor.getAttribute('aria-label') || '';

      links.push({
        destination: normalisedPath,
        anchorText,
        location,
        ariaLabel,
      });
    }

    // Deduplicate links (same destination from same location)
    const uniqueLinks = [];
    const seen = new Set();
    for (const link of links) {
      const key = `${link.destination}|${link.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push(link);
      }
    }

    return {
      url: path,
      status,
      title,
      h1,
      redirectedTo: finalUrl !== pageUrl ? new URL(finalUrl).pathname : null,
      internalLinks: uniqueLinks,
      linkCount: uniqueLinks.length,
      bodyLinks: uniqueLinks.filter(l => l.location === 'body-content').length,
      error: null,
    };
  } catch (err) {
    return {
      url: path,
      status: null,
      title: '',
      h1: '',
      redirectedTo: null,
      internalLinks: [],
      linkCount: 0,
      bodyLinks: 0,
      error: err.message,
    };
  }
}

async function runInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    console.log(`  Progress: ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }
  return results;
}

function buildReport(pages) {
  // Build a set of all known pages
  const knownPaths = new Set(pages.map(p => p.url));

  // Build inbound link counts
  const inboundLinks = {}; // path -> [{from, anchorText, location}]
  for (const page of pages) {
    for (const link of page.internalLinks) {
      if (!inboundLinks[link.destination]) {
        inboundLinks[link.destination] = [];
      }
      inboundLinks[link.destination].push({
        from: page.url,
        anchorText: link.anchorText,
        location: link.location,
      });
    }
  }

  // Find orphan pages (no inbound links, excluding homepage)
  const orphans = pages.filter(p => {
    const path = p.url;
    if (path === '/' || path === '/index/') return false;
    const inbound = inboundLinks[path] || [];
    // Filter out nav/footer links - these don't count as real internal links
    const contentInbound = inbound.filter(l =>
      l.location !== 'navigation' && l.location !== 'footer' && l.location !== 'header'
    );
    return contentInbound.length === 0;
  });

  // Find dead-end pages (no outbound body links)
  const deadEnds = pages.filter(p => p.bodyLinks === 0 && !p.error);

  // Find broken links (links to pages not in sitemap that might 404)
  const allLinkedPaths = new Set();
  for (const page of pages) {
    for (const link of page.internalLinks) {
      allLinkedPaths.add(link.destination);
    }
  }
  const potentialBroken = [...allLinkedPaths].filter(path => !knownPaths.has(path));

  // Anchor text analysis
  const genericAnchors = [];
  for (const page of pages) {
    for (const link of page.internalLinks) {
      const text = link.anchorText.toLowerCase();
      if (['read more', 'click here', 'learn more', 'here', 'link', 'more'].includes(text)) {
        genericAnchors.push({
          page: page.url,
          destination: link.destination,
          anchorText: link.anchorText,
        });
      }
    }
  }

  return {
    summary: {
      totalPages: pages.length,
      totalInternalLinks: pages.reduce((sum, p) => sum + p.linkCount, 0),
      totalBodyLinks: pages.reduce((sum, p) => sum + p.bodyLinks, 0),
      orphanPages: orphans.length,
      deadEndPages: deadEnds.length,
      potentialBrokenLinks: potentialBroken.length,
      genericAnchorTexts: genericAnchors.length,
      pagesWithErrors: pages.filter(p => p.error).length,
    },
    orphans: orphans.map(p => ({ url: p.url, title: p.title })),
    deadEnds: deadEnds.map(p => ({ url: p.url, title: p.title, totalLinks: p.linkCount })),
    potentialBroken,
    genericAnchors,
    pages,
    inboundLinks,
  };
}

function generateCsv(report) {
  const rows = [
    ['Source Page', 'Source Title', 'Destination', 'Anchor Text', 'Link Location', 'Source Body Links', 'Source Total Links'].join(',')
  ];

  for (const page of report.pages) {
    for (const link of page.internalLinks) {
      rows.push([
        `"${page.url}"`,
        `"${(page.title || '').replace(/"/g, '""')}"`,
        `"${link.destination}"`,
        `"${(link.anchorText || '').replace(/"/g, '""')}"`,
        `"${link.location}"`,
        page.bodyLinks,
        page.linkCount,
      ].join(','));
    }
  }

  return rows.join('\n');
}

function generateSummaryText(report) {
  const lines = [];
  lines.push('='.repeat(60));
  lines.push('MUTOMORRO INTERNAL LINK AUDIT');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('='.repeat(60));
  lines.push('');
  lines.push('OVERVIEW');
  lines.push('-'.repeat(40));
  lines.push(`Total pages crawled:      ${report.summary.totalPages}`);
  lines.push(`Total internal links:     ${report.summary.totalInternalLinks}`);
  lines.push(`Body content links:       ${report.summary.totalBodyLinks}`);
  lines.push(`Orphan pages:             ${report.summary.orphanPages}`);
  lines.push(`Dead-end pages:           ${report.summary.deadEndPages}`);
  lines.push(`Potential broken links:   ${report.summary.potentialBrokenLinks}`);
  lines.push(`Generic anchor texts:     ${report.summary.genericAnchorTexts}`);
  lines.push(`Pages with errors:        ${report.summary.pagesWithErrors}`);
  lines.push('');

  if (report.orphans.length > 0) {
    lines.push('ORPHAN PAGES (no content links pointing to them)');
    lines.push('-'.repeat(40));
    for (const o of report.orphans) {
      lines.push(`  ${o.url}  -  ${o.title}`);
    }
    lines.push('');
  }

  if (report.deadEnds.length > 0) {
    lines.push('DEAD-END PAGES (no body content links going out)');
    lines.push('-'.repeat(40));
    for (const d of report.deadEnds.slice(0, 50)) {
      lines.push(`  ${d.url}  -  ${d.title} (${d.totalLinks} nav/footer links only)`);
    }
    if (report.deadEnds.length > 50) {
      lines.push(`  ... and ${report.deadEnds.length - 50} more`);
    }
    lines.push('');
  }

  if (report.potentialBroken.length > 0) {
    lines.push('POTENTIAL BROKEN LINKS (linked to but not in sitemap)');
    lines.push('-'.repeat(40));
    for (const b of report.potentialBroken.slice(0, 30)) {
      lines.push(`  ${b}`);
    }
    if (report.potentialBroken.length > 30) {
      lines.push(`  ... and ${report.potentialBroken.length - 30} more`);
    }
    lines.push('');
  }

  if (report.genericAnchors.length > 0) {
    lines.push('GENERIC ANCHOR TEXTS');
    lines.push('-'.repeat(40));
    for (const g of report.genericAnchors.slice(0, 20)) {
      lines.push(`  "${g.anchorText}" on ${g.page} -> ${g.destination}`);
    }
    if (report.genericAnchors.length > 20) {
      lines.push(`  ... and ${report.genericAnchors.length - 20} more`);
    }
    lines.push('');
  }

  // Top pages by inbound links
  const inboundCounts = {};
  for (const page of report.pages) {
    for (const link of page.internalLinks) {
      inboundCounts[link.destination] = (inboundCounts[link.destination] || 0) + 1;
    }
  }
  const topInbound = Object.entries(inboundCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  lines.push('TOP 20 PAGES BY INBOUND LINKS');
  lines.push('-'.repeat(40));
  for (const [path, count] of topInbound) {
    lines.push(`  ${count.toString().padStart(4)} links -> ${path}`);
  }
  lines.push('');

  // Bottom pages by inbound links (excluding those with 0)
  const bottomInbound = Object.entries(inboundCounts)
    .filter(([, count]) => count <= 2)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 20);

  lines.push('BOTTOM 20 PAGES BY INBOUND LINKS (weakest)');
  lines.push('-'.repeat(40));
  for (const [path, count] of bottomInbound) {
    lines.push(`  ${count.toString().padStart(4)} links -> ${path}`);
  }

  return lines.join('\n');
}

// --- Main ---
async function main() {
  console.log('Mutomorro Internal Link Crawler');
  console.log('================================\n');

  // Check for jsdom
  try {
    require.resolve('jsdom');
  } catch {
    console.error('jsdom not found. Install it first:');
    console.error('  npm install jsdom');
    process.exit(1);
  }

  // Step 1: Get all URLs from sitemap
  const sitemapUrls = await getSitemapUrls();
  console.log(`\nTotal URLs to crawl: ${sitemapUrls.length}\n`);

  // Step 2: Crawl each page
  console.log('Crawling pages...');
  const pages = await runInBatches(sitemapUrls, CONCURRENCY, crawlPage);

  // Step 3: Build report
  console.log('\nBuilding report...');
  const report = buildReport(pages);

  // Step 4: Write output files
  const jsonPath = `${OUTPUT_DIR}/internal-link-audit.json`;
  const csvPath = `${OUTPUT_DIR}/internal-link-audit.csv`;
  const summaryPath = `${OUTPUT_DIR}/link-audit-summary.txt`;

  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(csvPath, generateCsv(report));
  writeFileSync(summaryPath, generateSummaryText(report));

  console.log(`\nDone! Output files:`);
  console.log(`  ${jsonPath}   (full data)`);
  console.log(`  ${csvPath}   (for spreadsheet analysis)`);
  console.log(`  ${summaryPath}  (human-readable summary)`);
  console.log(`\n${generateSummaryText(report)}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
