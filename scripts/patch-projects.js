// scripts/patch-projects.js
// Patches case study documents and image assets with missing metadata
// from the original WordPress export.
//
// WHAT IT DOES:
//   1. Adds SEO titles and descriptions to all 11 case study documents
//   2. Replaces generic hero image alt text with descriptive WordPress alt text
//   3. Adds subtitle field (secondary subheader) to all documents
//   4. Patches image asset metadata (title, altText) on all case study assets
//   5. Deletes the duplicate draft for Customer Experience in Social Housing
//
// SETUP:
//   1. Ensure SANITY_TOKEN is set in .env.local
//   2. Run: node scripts/patch-projects.js
//
// Safe to re-run — all operations are idempotent patches.

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// ─── PROJECT DOCUMENT PATCHES ──────────────────────────────────────────────────
// Each entry patches one case study document with SEO data, hero alt text,
// and the subtitle (secondary subheader from WordPress).

const PROJECT_PATCHES = [
  {
    _id: 'project-change-management-training-case-study',
    seoTitle: 'Change Management Training Case Study | Mutomorro',
    seoDescription: 'Change management training for a housing association: practical programmes that built real capability for organisational change.',
    focusKeyword: 'change management training',
    heroAlt: 'Change Management Training - transformation team change management training',
    subtitle: 'Practical, usable training that built internal capability for organisational change across a housing association',
  },
  {
    _id: 'project-charity-culture-change-case-study',
    seoTitle: 'Charity Culture Change Case Study | Mutomorro',
    seoDescription: 'Charity culture change case study: how Westway Trust redesigned service delivery, operational systems and team capability to make brand values a lived experience.',
    focusKeyword: 'charity culture change, service delivery, customer experience, service design',
    heroAlt: 'Charity culture change - turning culture to organisational action',
    subtitle: 'Turning brand values into practical, everyday actions through co-designed tools and team workshops',
  },
  {
    _id: 'project-charity-organisational-design',
    seoTitle: 'Charity Organisational Design Case Study | Mutomorro',
    seoDescription: 'Charity organisational design case study: how three separate teams were unified through collaborative operating model and business model design.',
    focusKeyword: 'Charity organisational design, organisational design',
    heroAlt: 'Charity organisational design - operating model for charities',
    subtitle: 'Unifying three separate teams through collaborative operating model and business model design',
  },
  {
    _id: 'project-culture-change-in-social-housing',
    seoTitle: 'Culture Change in Social Housing Case Study | Mutomorro',
    seoDescription: 'Culture change in social housing case study: how practical systems and service design drove lasting change after a housing association merger.',
    focusKeyword: 'culture change in social housing',
    heroAlt: 'Culture Change in Social Housing - culture change for a housing association',
    subtitle: 'How practical systems and service design drove lasting change after a housing association merger',
  },
  {
    _id: 'project-customer-experience-in-social-housing',
    seoTitle: 'Customer Experience in Social Housing Case Study | Mutomorro',
    seoDescription: 'Customer experience in social housing case study: how front-line teams were empowered to deliver consistent, high-quality services through practical tools.',
    focusKeyword: 'customer experience in social housing',
    heroAlt: 'Customer experience in social housing - empowering front line staff',
    subtitle: 'Empowering front-line teams to deliver consistent, high-quality services across a housing association',
  },
  {
    _id: 'project-employee-experience-strategy-case-study',
    seoTitle: 'Employee Experience Strategy Case Study | Mutomorro',
    seoDescription: 'Employee experience strategy case study: how a multi-level discovery approach uncovered what really shapes employee experience across an organisation.',
    focusKeyword: 'Employee Experience Strategy',
    heroAlt: 'Employee Experience Strategy - improving employee experience',
    subtitle: 'Starting with listening - a multi-level discovery approach to understanding and improving employee experience',
  },
  {
    _id: 'project-housing-association-merger-integration',
    seoTitle: 'Housing Association Merger Integration Case Study | Mutomorro',
    seoDescription: 'Housing association merger integration case study: how two organisations built a unified culture, consistent services, and shared identity after merger.',
    focusKeyword: 'Housing Association Merger Integration',
    heroAlt: 'Housing association merger integration - merger housing associations',
    subtitle: 'Building a unified culture and consistent customer experience after merging two housing associations',
  },
  {
    _id: 'project-housing-association-service-improvement',
    seoTitle: 'Housing Association Service Improvement | Mutomorro',
    seoDescription: 'Housing association service improvement case study: how systems thinking redesigned services and embedded lasting change across a growing organisation.',
    focusKeyword: 'Housing association service improvement, Service improvement',
    heroAlt: 'Housing association service improvement - improving services in housing associations',
    subtitle: 'Using systems thinking to redesign services and embed lasting improvements across a growing housing association',
  },
  {
    _id: 'project-public-sector-change-management-case-study',
    seoTitle: 'Public Sector Change Management Case Study | Mutomorro',
    seoDescription: 'Public sector change management case study: how change tools made the Water Framework Directive accessible to diverse audiences across Europe.',
    focusKeyword: 'public sector change management, change management',
    heroAlt: 'Public sector change management - change strategy, frameworks and tools',
    subtitle: 'Designing change tools that made complex EU regulation understandable - from farmers to hydrogeologists',
  },
  {
    _id: 'project-public-sector-service-design-case-study',
    seoTitle: 'Public Sector Service Design Case Study | Mutomorro',
    seoDescription: 'Public sector service design case study: how user research and information architecture transformed regulatory guidance around users.',
    focusKeyword: 'Public sector service design',
    heroAlt: 'Public sector service design - case study regulatory service design',
    subtitle: 'Redesigning regulatory guidance around users - not legislation - through information architecture and user research',
  },
  {
    _id: 'project-social-purpose-strategy-case-study',
    seoTitle: 'Social Purpose Strategy Case Study | Mutomorro',
    seoDescription: 'Social purpose strategy case study: how a social enterprise discovered its organisational purpose and built it into positioning, engagement and services.',
    focusKeyword: 'Social purpose strategy',
    heroAlt: 'Social purpose strategy - embedding social purpose into strategy',
    subtitle: 'Uncovering organisational purpose and building it into positioning, engagement and services',
  },
]

// ─── IMAGE ASSET METADATA ──────────────────────────────────────────────────────
// Maps asset IDs to human-readable title and alt text.
// Derived from WordPress image titles and alt text where available,
// falling back to cleaned-up filenames.

function filenameToTitle(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, '')  // remove extension
    .replace(/-\d+x\d+$/, '')                     // remove dimensions
    .replace(/-scaled$/, '')                       // remove -scaled
    .replace(/-\d+$/, '')                          // remove trailing numbers
    .replace(/-/g, ' ')                            // hyphens to spaces
    .replace(/\b\w/g, c => c.toUpperCase())        // title case
    .trim()
}

// Case study hero images — use the WordPress alt text directly
const HERO_IMAGE_PATCHES = {
  'image-1991d38f4f90aeb9b64e9d408d40847b11a19c7c-1300x731-webp': {
    title: 'Change Management Training - transformational change management training',
    altText: 'Change Management Training - transformation team change management training',
  },
  'image-acac42aae47105ccb652e53ece1cad95b525474f-2560x1438-png': {
    title: 'Charity culture change - turning culture to organisational action',
    altText: 'Charity culture change - turning culture to organisational action',
  },
  'image-df8034e0a60567c09557ccd4144ba716fc227915-1300x731-png': {
    title: 'Charity organisational design - operating model for charities',
    altText: 'Charity organisational design - operating model for charities',
  },
  'image-eee1b0a52d83d3f1dbb3ee50aac6506779adf4a7-1300x731-png': {
    title: 'Culture Change in Social Housing - culture change for housing association',
    altText: 'Culture Change in Social Housing - culture change for a housing association',
  },
  'image-2de17346ef30c6b75e1293f0345ea750fab1ec2a-1300x731-png': {
    title: 'Customer experience in social housing - empowering front line teams',
    altText: 'Customer experience in social housing - empowering front line staff',
  },
  'image-75d3bf8c78ed69e38dfba78d978bed94809deab4-1300x731-png': {
    title: 'Employee Experience Strategy - improving employee experience strategy',
    altText: 'Employee Experience Strategy - improving employee experience',
  },
  'image-ba610839ed6ead7a504fbdfbdbeaecf41ac24f6b-1300x731-png': {
    title: 'Housing association merger integration - merger housing association culture',
    altText: 'Housing association merger integration - merger housing associations',
  },
  'image-86876d0425a5f37db29fef2c0f52909ae3314a6b-1300x731-png': {
    title: 'Housing association service improvement - improving services in housing associations',
    altText: 'Housing association service improvement - improving services in housing associations',
  },
  'image-cfdbc62d412ccf9cd67bb41d31f9eb8dbd99d1b0-1300x731-png': {
    title: 'Public sector change management - change strategy, frameworks and tools',
    altText: 'Public sector change management - change strategy, frameworks and tools',
  },
  'image-024c7f6fd0f707c0259a5b9c2b2fe5cc0b0ea0a2-1300x731-png': {
    title: 'Public sector service design - regulatory service design',
    altText: 'Public sector service design - case study regulatory service design',
  },
  'image-bfc38e8a0a1a38679e42a782ca22362c02abd3d8-1300x731-png': {
    title: 'Social purpose strategy - embedding social purpose into strategy',
    altText: 'Social purpose strategy - embedding social purpose into strategy',
  },
}

// Case study inline images — use WordPress alt text where available
const INLINE_IMAGE_PATCHES = {
  // Change Management Training
  'image-cd56e183bedb56be163eb10d78b7d48d9cf784aa-1024x795-png': {
    title: 'Change Management Training - change journey and experience',
    altText: 'Change Management Training for a Housing Association - change journey and experience',
  },
  'image-e9119325195c41613dc4eb8b6912505d6fcb17bc-1024x998-png': {
    title: 'Change Management Training - developing engagement plans',
    altText: 'Change Management Training for a Housing Association - developing engagement plans',
  },
  'image-c282e69f0045027a3342fb243e3abfbb31301162-1024x802-png': {
    title: 'Change Management Training - structured approach to change',
    altText: 'Change Management Training for a Housing Association - structured approach to change',
  },
  // Employee Experience Strategy
  'image-a5d20f1772045f2436ee275a69f6498a6e980a5a-1024x568-png': {
    title: 'Employee Experience Strategy - discovery and application of themes',
    altText: 'Employee Experience Strategy - discovery and application of themes',
  },
  'image-7863c33d419cc4757ee76bc010ddfe457d1f1dac-1024x621-png': {
    title: 'Employee Experience Strategy - key themes',
    altText: 'Employee Experience Strategy - key themes',
  },
  'image-40f786a0d179bcc79898f2c615bbee7e0deb039b-1024x524-png': {
    title: 'Employee Experience Strategy - building engagement through an organisation',
    altText: 'Employee Experience Strategy - building engagement through an organisation',
  },
  // Housing Association Service Improvement
  'image-f42cab28da4ccbe096dfeb6112a24327028a70f5-1024x671-png': {
    title: 'Housing association service improvement - embedding service improvements',
    altText: 'Housing association service improvement - embedding service improvements',
  },
  'image-9b7dee962d72fdd96db0caa57215605ae02f6f2c-1024x646-png': {
    title: 'Housing association service improvement - staff tools and engagement',
    altText: 'Housing association service improvement - staff tools and engagement',
  },
  'image-58f7881619e5e1ba870766e720a89240added269-1024x622-png': {
    title: 'Housing association service improvement - complex vs complicated system design',
    altText: 'Housing association service improvement - complex vs complicated system design',
  },
  // Charity Organisational Design
  'image-7b1ac95d85edea3192ffe45f4c9af4e5c8d52ac2-1165x854-png': {
    title: 'Charity organisational design - charity business model canvas',
    altText: 'Charity organisational design - charity business model canvas',
  },
  'image-c82b36627b77ab2522708846d550779be802e3d5-1173x819-png': {
    title: 'Charity organisational design - from current to future state',
    altText: 'Charity organisational design - from current to future state',
  },
  'image-b15dee8de9fffb42a33b6eab0cd096cac740f6bd-1172x780-png': {
    title: 'Charity organisational design - five dimensions of organisational design',
    altText: 'Charity organisational design - five dimensions of organisational design',
  },
  // Charity Culture Change
  'image-0d0da4e8a0822dd8e9612f75531115d6bc392ef7-1024x696-png': {
    title: 'Charity culture change - how culture is experienced',
    altText: 'Charity culture change - How culture is experienced',
  },
  // Public Sector Change Management
  'image-8179d498eb7e37e0cedc4e846dc5ff0a31b7dfb5-1024x725-png': {
    title: 'Public sector change management - stakeholder deliverables',
    altText: 'Public sector change management - stakeholder deliverables',
  },
  'image-52d275e709211f54aafa1c6b966dfeb32366cef8-1024x677-png': {
    title: 'Public sector change management - change management approach',
    altText: 'Public sector change management - change management approach',
  },
  // Social Purpose Strategy
  'image-51e8fab883dd73edca0bae696fa69e0f6aac9d8c-1024x717-png': {
    title: 'Social purpose strategy - strategy approach and process',
    altText: 'Social purpose strategy - strategy approach and process',
  },
  'image-abbacd2deed7f84cfb0f43529c92821cd3205b83-1024x717-png': {
    title: 'Social purpose strategy - belief-purpose-intent framework',
    altText: 'Social purpose strategy - belief-purpose-intent framework',
  },
  // Public Sector Service Design
  'image-a7c4dd40f76d30d488faa6150a0ded2ddb24b47f-1024x644-png': {
    title: 'Public sector service design - accessible user guidance and wayfinding',
    altText: 'Public sector service design - accessible user guidance and wayfinding',
  },
  'image-9fcdabe3c63833c6bfdde81947f30e1ccd4181f3-1024x728-png': {
    title: 'Public sector service design - audience and user requirements for guidance',
    altText: 'Public sector service design - audience and user requirements for guidance',
  },
  'image-4858b05bdf48cdf831c2889d8a477955a6703fba-1024x768-png': {
    title: 'Public sector service design - regulatory guidance',
    altText: 'Public sector service design - regulatory guidance',
  },
  // Culture Change in Social Housing
  'image-62e0ee6290b0bcfb062bf0bc097f096a2283cd24-1024x576-png': {
    title: 'Culture Change in Social Housing - customer experience scorecard for teams',
    altText: 'Culture Change in Social Housing - customer experience scorecard for teams',
  },
  'image-a81ef998e951db8cda4568f11a506169e70bee43-1024x584-png': {
    title: 'Culture Change in Social Housing - leadership development',
    altText: 'Culture Change in Social Housing - leadership development',
  },
  'image-1189924d7d1c08c42924fe136a5b3edba4aa3f95-1024x581-png': {
    title: 'Culture Change in Social Housing - customer experience maturity model',
    altText: 'Culture Change in Social Housing - customer experience maturity model',
  },
  'image-8f2da39a467f5ff12caccf59cb4e00b5eec83bc3-1213x715-png': {
    title: 'Culture Change in Social Housing - guiding principles for culture change',
    altText: 'Culture Change in Social Housing - guiding principles for culture change',
  },
  'image-12de5a0952dbd2f2faec200e66ad9ae6121fdc6d-1024x610-png': {
    title: 'Culture Change in Social Housing - culture change programme',
    altText: 'Culture Change in Social Housing - culture change programme',
  },
  // Customer Experience in Social Housing
  'image-4ba4d0c9096487f533b16b60d3320a7ebfe60f13-1292x727-png': {
    title: 'Customer experience in social housing - process for building customer experience',
    altText: 'Customer experience in social housing - process for building customer experience',
  },
  'image-a856071793bdd21fc3f6c743ec8d047ec41a9b5a-1291x726-png': {
    title: 'Customer experience in social housing - every interaction shapes customer experience',
    altText: 'Customer experience in social housing - every interaction shapes customer experience',
  },
  // Housing Association Merger Integration inline images
  'image-34308562d50e3c00751e0b7e36427c954ac9c543-1024x746-webp': {
    title: 'Housing association merger integration - integration diagnostics',
    altText: 'Housing association merger integration - integration diagnostics',
  },
  'image-f97c61f2b4f1dfbe36a701f43ca024ce6327a02b-1860x1240-webp': {
    title: 'Housing association merger integration - staff engagement',
    altText: 'Housing association merger integration - staff engagement',
  },
  'image-a92ccff560c5a120e35d04ebd3f9e6715e786b27-1860x1240-webp': {
    title: 'Housing association merger integration - guiding operational principles',
    altText: 'Housing association merger integration - guiding operational principles',
  },
  'image-f0721ff7fd91085d10f0a0fabda9548804b453c3-1860x1240-webp': {
    title: 'Housing association merger integration - key tools, resources and employee development',
    altText: 'Housing association merger integration - key tools, resources and employee development',
  },
}

// Combine all image patches
const ALL_IMAGE_PATCHES = { ...HERO_IMAGE_PATCHES, ...INLINE_IMAGE_PATCHES }

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Case Study Metadata Patch Script')
  console.log('─'.repeat(50))

  // ── Step 1: Patch project documents ──────────────────────────────────────
  console.log('\n📄 Step 1: Patching project documents...\n')

  let docPatched = 0
  for (const patch of PROJECT_PATCHES) {
    const { _id, seoTitle, seoDescription, focusKeyword, heroAlt, subtitle } = patch
    console.log(`  → ${_id}`)

    try {
      await client
        .patch(_id)
        .set({
          seoTitle,
          seoDescription,
          focusKeyword,
          subtitle,
          'heroImage.alt': heroAlt,
        })
        .commit()
      console.log('    ✓ SEO title, description, focus keyword, subtitle, hero alt')
      docPatched++
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`)
    }

    await sleep(300)
  }

  // ── Step 2: Patch image assets ───────────────────────────────────────────
  console.log('\n🖼️  Step 2: Patching image asset metadata...\n')

  let assetPatched = 0
  const assetIds = Object.keys(ALL_IMAGE_PATCHES)

  for (const assetId of assetIds) {
    const { title, altText } = ALL_IMAGE_PATCHES[assetId]
    const shortName = assetId.split('-').slice(1, 3).join('-').substring(0, 12) + '...'
    console.log(`  → ${shortName} → "${title.substring(0, 60)}..."`)

    try {
      await client
        .patch(assetId)
        .set({ title, altText })
        .commit()
      console.log('    ✓ title + altText')
      assetPatched++
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`)
    }

    await sleep(200)
  }

  // ── Step 3: Delete duplicate draft ───────────────────────────────────────
  console.log('\n🗑️  Step 3: Removing duplicate draft...\n')

  try {
    await client.delete('drafts.project-customer-experience-in-social-housing')
    console.log('  ✓ Deleted: drafts.project-customer-experience-in-social-housing')
  } catch (err) {
    if (err.statusCode === 404) {
      console.log('  ○ Already gone — nothing to delete')
    } else {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log(`Done.`)
  console.log(`  Documents patched: ${docPatched}/${PROJECT_PATCHES.length}`)
  console.log(`  Image assets patched: ${assetPatched}/${assetIds.length}`)
  console.log(`  Duplicate draft removed: ✓`)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
