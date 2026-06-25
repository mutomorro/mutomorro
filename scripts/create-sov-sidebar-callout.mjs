// Creates (or updates) the site-wide "States of Vitality" sidebar callout.
// Idempotent: fixed _id, so re-running edits the same document rather than
// creating duplicates. Published directly (createOrReplace).
//
// Run: node scripts/create-sov-sidebar-callout.mjs
//
// Behaviour once live (per the sidebar model): a Secondary callout pins just
// above the page's primary CTA where there's room, and scrolls where another
// promo already holds the single pinned slot (e.g. a tool with a training
// signpost). displayOrder 100 keeps it below contextual promos so they win
// the slot.

import dotenv from 'dotenv'
import { createClient } from 'next-sanity'

dotenv.config({ path: '.env.local' })

const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('Missing SANITY_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const doc = {
  _id: 'sov-sidebar-nudge',
  _type: 'pageCallout',
  title: 'States of Vitality - site-wide sidebar nudge',
  heading: 'See your organisation clearly',
  body: [
    {
      _type: 'block',
      _key: 'sovbody',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'sovspan',
          marks: [],
          text: 'States of Vitality is our managed diagnostic of organisational health across eight dimensions - the whole picture, the story beneath the scores, and where to focus next.',
        },
      ],
    },
  ],
  linkUrl: '/states-of-vitality',
  linkLabel: 'Explore States of Vitality',
  placement: 'sidebar',
  role: 'secondary',
  displayOrder: 100,
  showOnPageTypes: ['tools', 'articles', 'caseStudies', 'develop', 'courses', 'serviceSubPages'],
  isActive: true,
}

const res = await client.createOrReplace(doc)
console.log('SoV sidebar callout published:', res._id)
