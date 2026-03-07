// scripts/service-helpers.js
// Shared helpers for generating Sanity service documents

let keyCounter = 0
const k = () => `k${(++keyCounter).toString().padStart(4, '0')}`

const block = (text) => ({
  _type: 'block', _key: k(), style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: k(), text, marks: [] }],
})

const blocks = (...texts) => texts.map(block)

const stg = (num, title, summary, heading, body, practice, out) => ({
  _key: k(), stageNumber: num, stageTitle: title, stageSummary: summary,
  stageHeading: heading, stageBody: body.map(block),
  stageInPractice: practice, stageOutcome: out,
})

const st = (v, l, s) => ({ _key: k(), statValue: v, statLabel: l, statSource: s })
const oc = (t, d) => ({ _key: k(), outcomeTitle: t, outcomeDescription: d })
const ri = (t) => ({ _key: k(), text: t })

function svc(id, d) {
  return {
    _type: 'service', _id: id,
    title: d.title,
    slug: { _type: 'slug', current: d.slug },
    category: d.category, categoryLabel: d.categoryLabel, order: d.order,
    heroHeading: d.heroHeading, heroTagline: d.heroTagline,
    contextHeading: d.contextHeading,
    contextBody: blocks(...d.contextBody),
    propositionCaption: d.propositionCaption,
    recognitionHeading: d.whyHeading,
    recognitionIntro: d.whyIntro,
    recognitionItems: d.whyItems.map(ri),
    recognitionBridge: blocks(...d.whyBridge),
    stats: d.stats.map(s => st(s[0], s[1], s[2])),
    perspectiveHeading: d.perspHeading,
    perspectiveBody: blocks(...d.perspBody),
    perspectiveLinkLabel: 'Learn about our Intentional Ecosystems approach',
    perspectiveLinkUrl: '/philosophy',
    approachIntro: blocks(...d.approachIntro),
    stages: d.stages.map(s => stg(s.num, s.title, s.summary, s.heading, s.body, s.practice, s.outcome)),
    outcomesHeading: d.outcomesHeading,
    outcomesIntro: d.outcomesIntro,
    outcomes: d.outcomes.map(o => oc(o[0], o[1])),
    outcomesClosing: d.outcomesClosing,
    showLogoStrip: true, logoStripPosition: 'after-recognition',
    primaryKeyword: d.primaryKeyword,
    secondaryKeywords: d.secondaryKeywords,
    seoTitle: d.seoTitle, seoDescription: d.seoDescription,
  }
}

module.exports = { svc, block, blocks, stg, st, oc, ri, k }
