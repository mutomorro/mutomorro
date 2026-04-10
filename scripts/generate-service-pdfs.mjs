import { createClient } from '@sanity/client'
import puppeteer from 'puppeteer'
import { mkdir, readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'downloads')
const HEROES_DIR = path.join(ROOT_DIR, 'components', 'heroes')
const LOGO_DIR = path.join(ROOT_DIR, 'design-reference', 'logo')

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const ALL_SLUGS = [
  'change-management-consultancy',
  'culture-change-consultancy',
  'customer-experience-consultancy',
  'post-merger-integration-consultancy',
  'employee-experience-consultancy',
  'organisational-purpose-consultancy',
  'organisational-restructuring-consultancy',
  'service-design-consultancy',
  'operational-effectiveness-consultancy',
  'organisational-capacity-building',
  'scaling-operations-consultancy',
  'strategic-alignment-consultancy',
  'organisational-design-consultancy',
  'organisational-development-consultancy',
]

const HERO_FILE_MAP = {
  'change-management-consultancy': 'ChangeManagementHero.js',
  'culture-change-consultancy': 'CultureChangeHero.js',
  'customer-experience-consultancy': 'CustomerExperienceHero.js',
  'post-merger-integration-consultancy': 'PostMergerHero.js',
  'employee-experience-consultancy': 'EmployeeExperienceHero.js',
  'organisational-purpose-consultancy': 'OrgPurposeHero.js',
  'organisational-restructuring-consultancy': 'OrgRestructuringHero.js',
  'service-design-consultancy': 'ServiceDesignHero.js',
  'operational-effectiveness-consultancy': 'OperationalEffectivenessHero.js',
  'organisational-capacity-building': 'OrgCapacityBuildingHero.js',
  'scaling-operations-consultancy': 'ScalingOperationsHero.js',
  'strategic-alignment-consultancy': 'StrategicAlignmentHero.js',
  'organisational-design-consultancy': 'OrgDesignHero.js',
  'organisational-development-consultancy': 'OrgDevelopmentHero.js',
}

const CATEGORIES = [
  { key: 'purpose-direction', label: 'Purpose & Direction' },
  { key: 'structure-operations', label: 'Structure & Operations' },
  { key: 'people-capability', label: 'People & Capability' },
  { key: 'service-experience', label: 'Service & Experience' },
]

const QUERY = `*[_type == "service" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  category,
  categoryLabel,
  heroHeading,
  heroTagline,
  contextHeading,
  "contextText": contextBody[].children[0].text,
  recognitionHeading,
  recognitionIntro,
  "recognitionItems": recognitionItems[].text,
  perspectiveHeading,
  "perspectiveText": perspectiveBody[].children[0].text,
  "approachIntroText": approachIntro[].children[0].text,
  "stages": stages[]{
    stageNumber,
    stageTitle,
    stageSummary,
    stageHeading,
    "stageBodyText": stageBody[].children[0].text,
    stageOutcome,
    stageInPractice,
    "stageImageUrl": stageImage.asset->url
  },
  "outcomes": outcomes[]{outcomeTitle, outcomeDescription},
  outcomesHeading,
  outcomesIntro,
  outcomesClosing,
  "stats": stats[]{statValue, statLabel, statSource},
  "propositionImageUrl": propositionImage.asset->url,
  propositionCaption
}`

async function renderLogoPngs(browser) {
  const results = {}
  for (const [file, key] of [['Mutomorro Logo - Black.svg', 'black'], ['Mutomorro Logo - White.svg', 'white']]) {
    const svg = await readFile(path.join(LOGO_DIR, file), 'utf-8')
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
    await page.setContent(`<html><body style="margin:0;background:transparent;">${svg}</body></html>`, { waitUntil: 'networkidle0' })
    const bounds = await page.evaluate(() => {
      const s = document.querySelector('svg')
      const b = s.getBBox()
      return { x: b.x, y: b.y, width: b.width, height: b.height }
    })
    const pad = 10
    const buf = await page.screenshot({
      clip: { x: bounds.x - pad, y: bounds.y - pad, width: bounds.width + pad * 2, height: bounds.height + pad * 2 },
      omitBackground: true,
      type: 'png',
    })
    results[key] = buf.toString('base64')
    await page.close()
  }
  return results
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// Hero canvas snapshot
// ---------------------------------------------------------------------------

function extractCanvasCode(heroSource) {
  // Strip the React wrapper, extract the useEffect body
  // All hero files follow the pattern: useEffect(() => { ...code... }, [])
  const effectMatch = heroSource.match(/useEffect\(\(\)\s*=>\s*\{([\s\S]+)\},\s*\[\]\s*\)/)
  if (!effectMatch) return null

  let code = effectMatch[1]

  // Replace canvasRef.current with our canvas element
  code = code.replace(/canvasRef\.current/g, "document.getElementById('heroCanvas')")

  // Remove the cleanup return statement at the end
  code = code.replace(/return\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*$/, '')

  // Remove ResizeObserver usage (we handle sizing manually)
  code = code.replace(/const\s+ro\s*=\s*new\s+ResizeObserver.*?\n/g, '')
  code = code.replace(/ro\.observe\(.*?\)\s*;?\n?/g, '')
  code = code.replace(/ro\.disconnect\(\)\s*;?\n?/g, '')

  // Remove requestAnimationFrame calls - we'll render one frame
  code = code.replace(/animId\s*=\s*requestAnimationFrame\(\w+\)\s*;?/g, '')
  code = code.replace(/cancelAnimationFrame\(\w+\)\s*;?/g, '')

  // Remove window event listeners
  code = code.replace(/window\.addEventListener\(.*?\)\s*;?\n?/g, '')
  code = code.replace(/window\.removeEventListener\(.*?\)\s*;?\n?/g, '')
  code = code.replace(/canvas\.addEventListener\(.*?\)\s*;?\n?/g, '')
  code = code.replace(/canvas\.removeEventListener\(.*?\)\s*;?\n?/g, '')

  // Remove the reduced motion check
  code = code.replace(/const\s+prefersReduced[\s\S]*?(?=\n\s*\n|\n\s*\/\/|\s*$)/g, '')
  code = code.replace(/if\s*\(window\.matchMedia[\s\S]*?\{[\s\S]*?\}[\s\S]*?\{[\s\S]*?\}/g, '')
  code = code.replace(/if\s*\(prefersReduced[\s\S]*?\{[\s\S]*?\}/g, '')

  return code
}

async function renderHeroSnapshot(browser, slug) {
  const heroFile = HERO_FILE_MAP[slug]
  if (!heroFile) return null

  let heroSource
  try {
    heroSource = await readFile(path.join(HEROES_DIR, heroFile), 'utf-8')
  } catch {
    console.log(`  Hero file not found: ${heroFile}`)
    return null
  }

  const canvasCode = extractCanvasCode(heroSource)
  if (!canvasCode) {
    console.log(`  Could not extract canvas code from ${heroFile}`)
    return null
  }

  // Render at a size that will look good on the cover
  const W = 600
  const H = 900

  const heroHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; }
  body { background: #221C2B; overflow: hidden; }
  #wrapper { width: ${W}px; height: ${H}px; position: relative; }
  #heroCanvas { display: block; width: ${W}px; height: ${H}px; }
</style>
</head>
<body>
<div id="wrapper">
  <canvas id="heroCanvas"></canvas>
</div>
<script>
(function() {
  // The extracted hero code declares its own canvas, ctx, etc.
  ${canvasCode}

  // Render one frame (animation loop was stripped)
  if (typeof tick === 'function') tick(20000);
  else if (typeof animate === 'function') animate(20000);
})();
</script>
</body>
</html>`

  const page = await browser.newPage()
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
  await page.setContent(heroHtml, { waitUntil: 'networkidle0' })

  // Wait for fonts then re-render
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    if (typeof tick === 'function') tick(20000)
    else if (typeof animate === 'function') animate(20000)
  }).catch(() => {}) // Functions may not be in global scope

  // Get the canvas as a data URL
  const dataUrl = await page.evaluate(() => {
    const canvas = document.getElementById('heroCanvas')
    return canvas ? canvas.toDataURL('image/png') : null
  })

  await page.close()
  return dataUrl
}

// ---------------------------------------------------------------------------
// PDF HTML template
// ---------------------------------------------------------------------------

function buildHtml(service, heroDataUrl, logos) {
  const s = service
  const contextParas = (s.contextText || []).slice(0, 2)
  const perspectiveParas = (s.perspectiveText || []).slice(0, 1)
  const approachParas = (s.approachIntroText || []).slice(0, 1)
  const stages = s.stages || []
  const outcomes = s.outcomes || []
  const stats = s.stats || []
  const recognitionItems = (s.recognitionItems || []).slice(0, 4)

  const logoBlackSrc = `data:image/png;base64,${logos.black}`
  const logoWhiteSrc = `data:image/png;base64,${logos.white}`

  const recognitionCards = recognitionItems.map(item => {
    const parts = item.split('||')
    const situation = escapeHtml(parts[0]?.trim())
    const capability = parts[1] ? escapeHtml(parts[1].trim()) : ''
    return `<div class="recognition-card">
      <p class="recognition-situation">${situation}</p>
      ${capability ? `<p class="recognition-capability">${capability}</p>` : ''}
    </div>`
  }).join('')

  const stageCards = stages.map(stage => {
    const bodyText = stage.stageBodyText?.[0] || stage.stageSummary || ''
    return `<div class="stage-card">
      ${stage.stageImageUrl ? `<img class="stage-image" src="${escapeHtml(stage.stageImageUrl)}" alt="" />` : ''}
      <div class="stage-text">
        <span class="stage-number">${escapeHtml(String(stage.stageNumber || '').padStart(2, '0'))}</span>
        <h4 class="stage-title">${escapeHtml(stage.stageTitle)}</h4>
        <p class="stage-body">${escapeHtml(bodyText)}</p>
        ${stage.stageOutcome ? `<p class="stage-outcome">${escapeHtml(stage.stageOutcome)}</p>` : ''}
      </div>
    </div>`
  }).join('')

  const statItems = stats.slice(0, 4).map(stat => `
    <div class="stat-item">
      <span class="stat-value">${escapeHtml(stat.statValue)}</span>
      <span class="stat-label">${escapeHtml(stat.statLabel)}</span>
      ${stat.statSource ? `<span class="stat-source">${escapeHtml(stat.statSource)}</span>` : ''}
    </div>
  `).join('')

  const outcomeItems = outcomes.map(o => `
    <div class="outcome-item">
      <h4 class="outcome-title">${escapeHtml(o.outcomeTitle)}</h4>
      <p class="outcome-desc">${escapeHtml(o.outcomeDescription)}</p>
    </div>
  `).join('')

  // Category strip for cover
  const categoryStrip = CATEGORIES.map(cat => {
    const isActive = cat.key === s.category
    return `<div class="cat-pill${isActive ? ' cat-pill-active' : ''}">${escapeHtml(cat.label)}</div>`
  }).join('')

  // Stage image for page 2
  const stageImageUrl = stages[0]?.stageImageUrl || stages[1]?.stageImageUrl || null

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; border-radius: 0 !important; }
  html, body { font-family: 'Source Sans 3', 'Source Sans Pro', sans-serif; font-weight: 300; color: #444; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; }
  .page:last-child { page-break-after: auto; }

  /* ===== PAGE 1 – COVER ===== */
  .cover { display: flex; flex-direction: column; }
  .cover-dark {
    flex: 1;
    background: #221C2B;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 36mm 20mm 20mm;
    overflow: hidden;
  }
  .cover-hero-image {
    position: absolute;
    bottom: -10%;
    right: -25%;
    width: 80%;
    height: 70%;
    object-fit: cover;
    object-position: center bottom;
    opacity: 1;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.9) 15%, transparent 70%), linear-gradient(to bottom, transparent, rgba(0,0,0,1) 30%);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.9) 15%, transparent 70%), linear-gradient(to bottom, transparent, rgba(0,0,0,1) 30%);
    mask-composite: intersect;
    -webkit-mask-composite: source-in;
  }
  .cover-content { position: relative; z-index: 1; }
  .cover-category { font-size: 11px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; color: #9B51E0; margin-bottom: 14px; }
  .cover-title { font-size: 40px; font-weight: 400; color: #FAF6F1; line-height: 1.15; margin-bottom: 16px; max-width: 70%; }
  .cover-tagline { font-size: 17px; font-weight: 300; color: #B0A8B8; line-height: 1.55; max-width: 70%; }
  .cover-logo-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 20mm;
    z-index: 1;
  }
  .cover-logo-img { height: 22px; width: auto; }
  .cover-warm {
    background: #FAF6F1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 20mm;
  }
  .cat-strip { display: flex; align-items: center; width: 100%; justify-content: space-between; }
  .cat-pill {
    font-size: 8px;
    font-weight: 400;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #999;
    padding: 6px 14px;
    background: #EDE8E3;
    flex: 1;
    text-align: center;
  }
  .cat-pill + .cat-pill { margin-left: 8px; }
  .cat-pill-active {
    background: #9B51E0;
    color: #FFF;
  }

  /* ===== PAGE FOOTER (pages 2 & 3) ===== */
  .page-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 20mm 18mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .page-footer-logo { height: 14px; width: auto; opacity: 0.6; }
  .page-footer-title { font-size: 9px; font-weight: 300; color: #AAA; }

  /* ===== PAGE 2 – CONTEXT / RECOGNITION / PERSPECTIVE ===== */
  .page-2 { background: #FFFFFF; padding: 20mm 20mm 36mm; display: flex; flex-direction: column; }
  .section-label { font-size: 10px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; color: #9B51E0; margin-bottom: 10px; }
  .context-heading { font-size: 24px; font-weight: 400; color: #221C2B; line-height: 1.3; margin-bottom: 14px; }
  .context-body { font-size: 13px; line-height: 1.7; color: #444; margin-bottom: 12px; }

  .recognition { margin-top: auto; }
  .recognition-heading { font-size: 18px; font-weight: 400; color: #221C2B; margin-bottom: 6px; }
  .recognition-intro { font-size: 12px; color: #666; margin-bottom: 14px; line-height: 1.5; }
  .recognition-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .recognition-card { background: #FAF6F1; padding: 16px; }
  .recognition-situation { font-size: 12px; font-weight: 400; color: #221C2B; line-height: 1.45; margin-bottom: 6px; }
  .recognition-capability { font-size: 11px; font-weight: 300; color: #666; line-height: 1.45; }

  .perspective { margin-top: auto; display: flex; gap: 20px; align-items: flex-start; }
  .perspective-text { flex: 1; }
  .perspective-heading {
    font-size: 17px; font-weight: 400; color: #221C2B; line-height: 1.4;
    border-left: 3px solid #9B51E0;
    padding-left: 16px;
    margin-bottom: 10px;
  }
  .perspective-body { font-size: 12px; line-height: 1.65; color: #444; padding-left: 19px; }
  .perspective-image { width: 140px; height: 105px; object-fit: cover; flex-shrink: 0; }

  /* ===== PAGE 3 – APPROACH & STAGES ===== */
  .page-3 { background: #FFFFFF; padding: 20mm 20mm 36mm; display: flex; flex-direction: column; }
  .approach-heading { font-size: 24px; font-weight: 400; color: #221C2B; margin-bottom: 10px; }
  .approach-intro { font-size: 13px; line-height: 1.65; color: #444; margin-bottom: 20px; }

  .stages-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: 1; }
  .stage-card { background: #FAF6F1; padding: 14px; display: flex; flex-direction: column; }
  .stage-image { width: 100%; height: 90px; object-fit: cover; margin-bottom: 10px; }
  .stage-number { font-size: 22px; font-weight: 400; color: #9B51E0; }
  .stage-title { font-size: 15px; font-weight: 400; color: #221C2B; margin: 4px 0 6px; }
  .stage-body { font-size: 11px; line-height: 1.55; color: #444; flex: 1; }
  .stage-outcome { font-size: 10.5px; font-style: italic; color: #888; margin-top: 8px; line-height: 1.4; }

  .stats-bar {
    display: grid;
    grid-template-columns: repeat(${stats.length || 4}, 1fr);
    background: #221C2B;
    padding: 18px 20px;
    margin-top: 16px;
  }
  .stat-item { text-align: center; }
  .stat-value { display: block; font-size: 22px; font-weight: 400; color: #9B51E0; }
  .stat-label { display: block; font-size: 10px; color: #B0A8B8; margin-top: 3px; }
  .stat-source { display: block; font-size: 8px; color: #666; margin-top: 2px; }

  /* ===== PAGE 4 – OUTCOMES & CTA ===== */
  .page-4 { background: #FFFFFF; display: flex; flex-direction: column; }
  .outcomes-section { padding: 20mm 20mm 10mm; }
  .outcomes-heading { font-size: 26px; font-weight: 400; color: #221C2B; margin-bottom: 10px; }
  .outcomes-intro { font-size: 13px; line-height: 1.6; color: #444; margin-bottom: 22px; }
  .outcome-item { padding: 14px 16px; background: #FAF6F1; margin-bottom: 10px; display: flex; gap: 16px; align-items: baseline; }
  .outcome-title { font-size: 13px; font-weight: 400; color: #221C2B; white-space: nowrap; flex-shrink: 0; }
  .outcome-desc { font-size: 12px; line-height: 1.5; color: #666; }
  .outcomes-closing {
    font-size: 16px;
    font-style: italic;
    font-weight: 300;
    color: #444;
    margin-top: 22px;
    line-height: 1.55;
    border-left: 3px solid #9B51E0;
    padding-left: 18px;
  }

  .cta {
    background: #221C2B;
    padding: 30mm 20mm 24mm;
    margin-top: auto;
  }
  .cta-prompt { font-size: 20px; font-weight: 400; color: #FAF6F1; margin-bottom: 28px; line-height: 1.35; }
  .cta-footer { display: flex; gap: 40px; flex-wrap: wrap; align-items: flex-start; }
  .cta-col { }
  .cta-logo-img { height: 22px; width: auto; margin-bottom: 12px; display: block; }
  .cta-detail { font-size: 10.5px; color: #B0A8B8; line-height: 1.8; }
  .cta-detail a { color: #9B51E0; text-decoration: none; }
  .cta-linkedin { display: inline-flex; align-items: center; gap: 6px; color: #B0A8B8; text-decoration: none; font-size: 10.5px; }
  .cta-linkedin svg { width: 16px; height: 16px; fill: #B0A8B8; }
</style>
</head>
<body>

<!-- PAGE 1 – COVER -->
<div class="page cover">
  <div class="cover-dark">
    ${heroDataUrl ? `<img class="cover-hero-image" src="${heroDataUrl}" alt="" />` : ''}
    <div class="cover-content">
      <div class="cover-category">${escapeHtml(s.categoryLabel)}</div>
      <h1 class="cover-title">${escapeHtml(s.heroHeading || s.title)}</h1>
      <p class="cover-tagline">${escapeHtml(s.heroTagline)}</p>
    </div>
    <div class="cover-logo-bar">
      <img class="cover-logo-img" src="${logoWhiteSrc}" alt="Mutomorro" />
    </div>
  </div>
  <div class="cover-warm">
    <div class="cat-strip">${categoryStrip}</div>
  </div>
</div>

<!-- PAGE 2 – CONTEXT / RECOGNITION / PERSPECTIVE -->
<div class="page page-2">
  <div class="context">
    <div class="section-label">Context</div>
    <h2 class="context-heading">${escapeHtml(s.contextHeading)}</h2>
    ${contextParas.map(p => `<p class="context-body">${escapeHtml(p)}</p>`).join('')}
  </div>

  <div class="recognition">
    <h3 class="recognition-heading">${escapeHtml(s.recognitionHeading)}</h3>
    ${s.recognitionIntro ? `<p class="recognition-intro">${escapeHtml(s.recognitionIntro)}</p>` : ''}
    <div class="recognition-grid">${recognitionCards}</div>
  </div>

  <div class="perspective">
    <div class="perspective-text">
      <h3 class="perspective-heading">${escapeHtml(s.perspectiveHeading)}</h3>
      ${perspectiveParas.map(p => `<p class="perspective-body">${escapeHtml(p)}</p>`).join('')}
    </div>
    ${stageImageUrl ? `<img class="perspective-image" src="${escapeHtml(stageImageUrl)}" alt="" />` : ''}
  </div>
  <div class="page-footer">
    <img class="page-footer-logo" src="${logoBlackSrc}" alt="Mutomorro" />
    <span class="page-footer-title">${escapeHtml(s.heroHeading || s.title)}</span>
  </div>
</div>

<!-- PAGE 3 – APPROACH & STAGES -->
<div class="page page-3">
  <div class="section-label">Our approach</div>
  <h2 class="approach-heading">Four connected areas of work</h2>
  ${approachParas.length ? `<p class="approach-intro">${escapeHtml(approachParas[0])}</p>` : ''}
  <div class="stages-grid">${stageCards}</div>
  ${stats.length ? `<div class="stats-bar">${statItems}</div>` : ''}
  <div class="page-footer">
    <img class="page-footer-logo" src="${logoBlackSrc}" alt="Mutomorro" />
    <span class="page-footer-title">${escapeHtml(s.heroHeading || s.title)}</span>
  </div>
</div>

<!-- PAGE 4 – OUTCOMES & CTA -->
<div class="page page-4">
  <div class="outcomes-section">
    <div class="section-label">Outcomes</div>
    <h2 class="outcomes-heading">What becomes possible</h2>
    ${s.outcomesIntro ? `<p class="outcomes-intro">${escapeHtml(s.outcomesIntro)}</p>` : ''}
    ${outcomeItems}
    ${s.outcomesClosing ? `<p class="outcomes-closing">${escapeHtml(s.outcomesClosing)}</p>` : ''}
  </div>
  <div class="cta">
    <p class="cta-prompt">Ready to explore what this could look like for your organisation?</p>
    <div class="cta-footer">
      <div class="cta-col">
        <img class="cta-logo-img" src="${logoWhiteSrc}" alt="Mutomorro" />
        <div class="cta-detail"><a href="mailto:hello@mutomorro.com">hello@mutomorro.com</a><br /><a href="https://mutomorro.com">mutomorro.com</a></div>
      </div>
      <div class="cta-col">
        <div class="cta-detail"><strong style="color:#FAF6F1;font-weight:400;">London</strong><br />86-90 Paul Street<br />London EC2A 4NE</div>
      </div>
      <div class="cta-col">
        <div class="cta-detail"><strong style="color:#FAF6F1;font-weight:400;">Glasgow</strong><br />15 Candleriggs Square<br />Glasgow G1 1TQ</div>
      </div>
      <div class="cta-col">
        <a class="cta-linkedin" href="https://linkedin.com/company/mutomorro"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>
      </div>
    </div>
  </div>
</div>

</body>
</html>`
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------

async function generatePdf(slug, browser, logos) {
  console.log(`Generating PDF for: ${slug}...`)

  const service = await client.fetch(QUERY, { slug })
  if (!service) {
    console.error(`  No service found for slug: ${slug}`)
    return
  }
  console.log(`  Fetched: ${service.title}`)

  // Render hero animation as static snapshot
  console.log(`  Rendering hero snapshot...`)
  const heroDataUrl = await renderHeroSnapshot(browser, slug)
  if (heroDataUrl) {
    console.log(`  Hero snapshot captured (${Math.round(heroDataUrl.length / 1024)}KB)`)
  } else {
    console.log(`  No hero snapshot — using plain cover`)
  }

  const html = buildHtml(service, heroDataUrl, logos)
  const page = await browser.newPage()
  await page.setViewport({ width: 794, height: 1123 })
  await page.setContent(html, { waitUntil: 'networkidle0' })

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready)

  const filename = `${service.heroHeading || service.title} - Mutomorro.pdf`
  const outputPath = path.join(OUTPUT_DIR, filename)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  await page.close()
  console.log(`  Saved: public/downloads/${filename}`)
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const browser = await puppeteer.launch({ headless: true })

  // Render logos to cropped PNGs (avoids SVG viewBox clipping issues)
  console.log('Rendering logos...')
  const logos = await renderLogoPngs(browser)

  const requestedSlug = process.argv[2]
  const slugs = requestedSlug ? [requestedSlug] : ALL_SLUGS

  for (const slug of slugs) {
    await generatePdf(slug, browser, logos)
  }

  await browser.close()
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
