#!/usr/bin/env node

/**
 * Mutomorro - Batch Cross-Reference Population Script
 *
 * Populates relatedArticles, relatedTools, and emergentDimensions on all tools,
 * and relatedArticles, relatedTools, and relatedDimensions on all courses.
 *
 * Patches are applied as DRAFTS. Review in Sanity Studio, then publish.
 *
 * Usage:
 *   cd ~/Projects/mutomorro
 *   SANITY_TOKEN=your-editor-token node batch-cross-references.js
 *
 * To do a dry run first (no changes):
 *   SANITY_TOKEN=your-editor-token node batch-cross-references.js --dry-run
 */

const { createClient } = require('@sanity/client');

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// ─── Helper: build a Sanity reference ───
function ref(id) {
  return { _type: 'reference', _ref: id, _key: id.slice(-12) };
}

// ─── Dimension IDs (for course relatedDimensions) ───
const DIM = {
  'resonant-purpose':    '2d9ca110-0da5-4b9a-aa07-d2e0132aa3d1',
  'embedded-strategy':   'a79d8795-50f7-47ae-9b62-b6e3579a63ad',
  'enacted-culture':     'fe87aaff-55b2-4fa4-88ad-bf3a8111ca23',
  'momentum-through-work': 'd32f10ac-baa2-412d-835a-09a70e88d938',
  'generative-capacity': '78f1b92a-9bf7-4ee2-95d9-f21e36d6af66',
  'tuned-to-change':     '16f61b81-5927-4172-90b8-2d8a3a0e4673',
  'narrative-connections':'e1d258ac-f4bf-4517-9ce6-577157be48d8',
  'evolving-service':    'cddb5e29-3752-41f6-aac5-e5d1aa9b23e5',
};

// ═══════════════════════════════════════════════════════════════
// TOOL MAPPINGS
// ═══════════════════════════════════════════════════════════════

const toolMappings = [
  // ── Change Management cluster ──
  {
    id: 'tool-adkar-model',
    relatedTools: ['tool-kotters-8-step-change-model', 'tool-bridges-transition-model', 'tool-change-curve'],
    relatedArticles: ['article-a-guide-to-change-readiness', 'article-need-for-change', 'article-change-management-to-change-leadership'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-kotters-8-step-change-model',
    relatedTools: ['tool-adkar-model', 'tool-lewins-change-model', 'tool-mendelow-power-interest-matrix'],
    relatedArticles: ['article-need-for-change', 'article-change-management-to-change-leadership'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-lewins-change-model',
    relatedTools: ['tool-kotters-8-step-change-model', 'tool-satir-change-model', 'tool-bridges-transition-model'],
    relatedArticles: ['article-change-management-to-change-leadership', 'article-addressing-change-fatigue'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-bridges-transition-model',
    relatedTools: ['tool-change-curve', 'tool-satir-change-model', 'tool-adkar-model'],
    relatedArticles: ['article-addressing-change-fatigue', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-burke-litwin-change-model',
    relatedTools: ['tool-mckinsey-7-s-model', 'tool-iceberg-model', 'tool-kotters-8-step-change-model'],
    relatedArticles: ['article-building-organisational-resilience', 'article-change-management-to-change-leadership'],
    dimensions: ['tuned-to-change', 'embedded-strategy'],
  },
  {
    id: 'tool-change-curve',
    relatedTools: ['tool-bridges-transition-model', 'tool-satir-change-model', 'tool-adkar-model'],
    relatedArticles: ['article-addressing-change-fatigue', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-satir-change-model',
    relatedTools: ['tool-change-curve', 'tool-bridges-transition-model', 'tool-lewins-change-model'],
    relatedArticles: ['article-addressing-change-fatigue', 'article-psychological-safety-guide'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-orca',
    relatedTools: ['tool-adkar-model', 'tool-mendelow-power-interest-matrix'],
    relatedArticles: ['article-a-guide-to-change-readiness', 'article-need-for-change'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'tool-mendelow-power-interest-matrix',
    relatedTools: ['tool-orca', 'tool-adkar-model', 'tool-kotters-8-step-change-model'],
    relatedArticles: ['article-need-for-change', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change', 'embedded-strategy'],
  },
  {
    id: 'tool-vuca-prime',
    relatedTools: ['tool-cynefin-framework', 'tool-2x2-scenario-matrix', 'tool-pestle-analysis'],
    relatedArticles: ['article-building-organisational-resilience', 'article-guide-to-adaptive-leadership'],
    dimensions: ['tuned-to-change', 'embedded-strategy'],
  },
  {
    id: 'tool-5ds-of-appreciative-inquiry',
    relatedTools: ['tool-iceberg-model', 'tool-kotters-8-step-change-model'],
    relatedArticles: ['article-developing-organisational-culture', 'article-building-organisational-resilience'],
    dimensions: ['tuned-to-change', 'enacted-culture'],
  },

  // ── Culture cluster ──
  {
    id: 'tool-cultural-web',
    relatedTools: ['tool-edgar-scheins-culture-model', 'tool-competing-values-framework', 'tool-iceberg-model'],
    relatedArticles: ['article-developing-organisational-culture', 'article-strategic-planning-as-culture-development'],
    dimensions: ['enacted-culture'],
  },
  {
    id: 'tool-edgar-scheins-culture-model',
    relatedTools: ['tool-cultural-web', 'tool-competing-values-framework', 'tool-iceberg-model'],
    relatedArticles: ['article-developing-organisational-culture', 'article-psychological-safety-guide'],
    dimensions: ['enacted-culture'],
  },
  {
    id: 'tool-competing-values-framework',
    relatedTools: ['tool-cultural-web', 'tool-edgar-scheins-culture-model', 'tool-mckinsey-7-s-model'],
    relatedArticles: ['article-developing-organisational-culture', 'article-strategic-planning-as-culture-development'],
    dimensions: ['enacted-culture', 'embedded-strategy'],
  },
  {
    id: 'tool-4-stages-of-psychological-safety',
    relatedTools: ['tool-project-aristotle-effective-teams', 'tool-five-dysfunctions-of-a-team', 'tool-5-conflict-styles'],
    relatedArticles: ['article-psychological-safety-guide', 'article-emotional-intelligence-in-leadership'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },
  {
    id: 'tool-5-conflict-styles',
    relatedTools: ['tool-4-stages-of-psychological-safety', 'tool-five-dysfunctions-of-a-team'],
    relatedArticles: ['article-psychological-safety-guide', 'article-developing-organisational-culture'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },
  {
    id: 'tool-iceberg-model',
    relatedTools: ['tool-cultural-web', 'tool-cynefin-framework', 'tool-edgar-scheins-culture-model'],
    relatedArticles: ['article-developing-organisational-culture', 'article-building-organisational-resilience'],
    dimensions: ['enacted-culture', 'embedded-strategy', 'tuned-to-change'],
  },

  // ── Purpose & Strategy cluster ──
  {
    id: 'tool-theory-of-change',
    relatedTools: ['tool-logframe-logical-framework', 'tool-nonprofit-business-model-canvas'],
    relatedArticles: ['article-translating-purpose-from-boardroom-to-breakroom', 'article-the-economics-of-authentic-purpose'],
    dimensions: ['resonant-purpose', 'embedded-strategy'],
  },
  {
    id: 'tool-logframe-logical-framework',
    relatedTools: ['tool-theory-of-change', 'tool-nonprofit-business-model-canvas'],
    relatedArticles: ['article-build-impact-measurement-framework', 'article-translating-purpose-from-boardroom-to-breakroom'],
    dimensions: ['resonant-purpose', 'embedded-strategy'],
  },
  {
    id: 'tool-heart-of-business',
    relatedTools: ['tool-nonprofit-business-model-canvas', 'tool-theory-of-change'],
    relatedArticles: ['article-the-economics-of-authentic-purpose', 'article-writing-a-mission-statement'],
    dimensions: ['resonant-purpose'],
  },
  {
    id: 'tool-nonprofit-business-model-canvas',
    relatedTools: ['tool-heart-of-business', 'tool-logframe-logical-framework', 'tool-theory-of-change'],
    relatedArticles: ['article-the-economics-of-authentic-purpose', 'article-build-impact-measurement-framework'],
    dimensions: ['resonant-purpose', 'embedded-strategy'],
  },
  {
    id: 'tool-2x2-scenario-matrix',
    relatedTools: ['tool-pestle-analysis', 'tool-vuca-prime', 'tool-cynefin-framework'],
    relatedArticles: ['article-developing-future-literacy', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'tool-pestle-analysis',
    relatedTools: ['tool-2x2-scenario-matrix', 'tool-cynefin-framework'],
    relatedArticles: ['article-developing-future-literacy', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'tool-cynefin-framework',
    relatedTools: ['tool-wicked-problems', 'tool-iceberg-model', 'tool-vuca-prime'],
    relatedArticles: ['article-guide-to-adaptive-leadership', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy', 'tuned-to-change'],
  },
  {
    id: 'tool-ooda-loop',
    relatedTools: ['tool-cynefin-framework', 'tool-pestle-analysis', 'tool-pdca-cycle'],
    relatedArticles: ['article-building-organisational-resilience', 'article-guide-to-adaptive-leadership'],
    dimensions: ['embedded-strategy', 'momentum-through-work'],
  },
  {
    id: 'tool-wicked-problems',
    relatedTools: ['tool-cynefin-framework', 'tool-iceberg-model', 'tool-2x2-scenario-matrix'],
    relatedArticles: ['article-guide-to-adaptive-leadership', 'article-building-anti-fragile-organisations'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'tool-mckinsey-7-s-model',
    relatedTools: ['tool-galbraith-star-model', 'tool-competing-values-framework', 'tool-burke-litwin-change-model'],
    relatedArticles: ['article-adaptive-organisational-architectures', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy', 'enacted-culture'],
  },
  {
    id: 'tool-six-thinking-hats',
    relatedTools: ['tool-daci-framework', 'tool-five-dysfunctions-of-a-team'],
    relatedArticles: ['article-governance-the-enables-innovation', 'article-psychological-safety-guide'],
    dimensions: ['generative-capacity', 'embedded-strategy'],
  },

  // ── Operations & Process cluster ──
  {
    id: 'tool-5-whys',
    relatedTools: ['tool-dmaic', 'tool-8-wastes-of-lean', 'tool-process-mapping'],
    relatedArticles: ['article-the-friction-audit', 'article-build-impact-measurement-framework'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-8-wastes-of-lean',
    relatedTools: ['tool-kaizen-cycle', 'tool-pdca-cycle', 'tool-gemba-walk'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-bpm-lifecycle',
    relatedTools: ['tool-process-mapping', 'tool-pdca-cycle'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-dmaic',
    relatedTools: ['tool-5-whys', 'tool-pdca-cycle', 'tool-8-wastes-of-lean'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-kaizen-cycle',
    relatedTools: ['tool-pdca-cycle', 'tool-8-wastes-of-lean', 'tool-gemba-walk'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-pdca-cycle',
    relatedTools: ['tool-kaizen-cycle', 'tool-dmaic', 'tool-bpm-lifecycle'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-process-mapping',
    relatedTools: ['tool-bpm-lifecycle', 'tool-5-whys', 'tool-8-wastes-of-lean'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work', 'evolving-service'],
  },
  {
    id: 'tool-eisenhower-matrix',
    relatedTools: ['tool-rasci-framework', 'tool-daci-framework'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-gemba-walk',
    relatedTools: ['tool-8-wastes-of-lean', 'tool-kaizen-cycle', 'tool-process-mapping'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'tool-problem-statement',
    relatedTools: ['tool-5-whys', 'tool-dmaic', 'tool-empathy-map'],
    relatedArticles: ['article-the-friction-audit', 'article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['momentum-through-work', 'evolving-service'],
  },

  // ── Org Design & Structure cluster ──
  {
    id: 'tool-galbraith-star-model',
    relatedTools: ['tool-mckinsey-7-s-model', 'tool-rasci-framework', 'tool-polism-canvas'],
    relatedArticles: ['article-adaptive-organisational-architectures', 'article-governance-the-enables-innovation'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'tool-daci-framework',
    relatedTools: ['tool-rasci-framework', 'tool-six-thinking-hats'],
    relatedArticles: ['article-governance-the-enables-innovation', 'article-adaptive-organisational-architectures'],
    dimensions: ['embedded-strategy', 'momentum-through-work'],
  },
  {
    id: 'tool-rasci-framework',
    relatedTools: ['tool-daci-framework', 'tool-galbraith-star-model'],
    relatedArticles: ['article-adaptive-organisational-architectures', 'article-governance-the-enables-innovation'],
    dimensions: ['embedded-strategy', 'momentum-through-work'],
  },
  {
    id: 'tool-polism-canvas',
    relatedTools: ['tool-galbraith-star-model', 'tool-mckinsey-7-s-model', 'tool-service-blueprints'],
    relatedArticles: ['article-adaptive-organisational-architectures', 'article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['embedded-strategy', 'evolving-service'],
  },
  {
    id: 'tool-organisational-maturity-model',
    relatedTools: ['tool-mckinsey-7-s-model', 'tool-galbraith-star-model'],
    relatedArticles: ['article-building-organisational-resilience', 'article-building-anti-fragile-organisations'],
    dimensions: ['embedded-strategy', 'generative-capacity'],
  },

  // ── People, Teams & EX cluster ──
  {
    id: 'tool-belbins-team-roles',
    relatedTools: ['tool-t7-model-for-teams', 'tool-project-aristotle-effective-teams', 'tool-disc-styles'],
    relatedArticles: ['article-psychological-safety-guide', 'article-emotional-intelligence-in-leadership'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-disc-styles',
    relatedTools: ['tool-belbins-team-roles', 'tool-cedar-feedback-model'],
    relatedArticles: ['article-emotional-intelligence-in-leadership', 'article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-cedar-feedback-model',
    relatedTools: ['tool-disc-styles', 'tool-the-star-method', 'tool-project-oxygen'],
    relatedArticles: ['article-emotional-intelligence-in-leadership', 'article-psychological-safety-guide'],
    dimensions: ['generative-capacity', 'narrative-connections'],
  },
  {
    id: 'tool-five-dysfunctions-of-a-team',
    relatedTools: ['tool-project-aristotle-effective-teams', 'tool-4-stages-of-psychological-safety', 'tool-t7-model-for-teams'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-project-aristotle-effective-teams',
    relatedTools: ['tool-five-dysfunctions-of-a-team', 'tool-6-team-conditions-for-team-effectiveness', 'tool-4-stages-of-psychological-safety'],
    relatedArticles: ['article-psychological-safety-guide', 'article-emotional-intelligence-in-leadership'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-project-oxygen',
    relatedTools: ['tool-cedar-feedback-model', 'tool-project-aristotle-effective-teams'],
    relatedArticles: ['article-emotional-intelligence-in-leadership', 'article-guide-to-adaptive-leadership'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-t7-model-for-teams',
    relatedTools: ['tool-belbins-team-roles', 'tool-project-aristotle-effective-teams', 'tool-6-team-conditions-for-team-effectiveness'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-6-team-conditions-for-team-effectiveness',
    relatedTools: ['tool-t7-model-for-teams', 'tool-project-aristotle-effective-teams', 'tool-five-dysfunctions-of-a-team'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'tool-tesi-model',
    relatedTools: ['tool-4-stages-of-psychological-safety', 'tool-five-dysfunctions-of-a-team'],
    relatedArticles: ['article-emotional-intelligence-in-leadership', 'article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },

  // ── Service Design & CX cluster ──
  {
    id: 'tool-empathy-map',
    relatedTools: ['tool-audience-personas', 'tool-contextual-inquiry', 'tool-service-blueprints'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy', 'article-the-friction-audit'],
    dimensions: ['evolving-service'],
  },
  {
    id: 'tool-service-blueprints',
    relatedTools: ['tool-empathy-map', 'tool-process-mapping'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy', 'article-the-friction-audit'],
    dimensions: ['evolving-service'],
  },
  {
    id: 'tool-contextual-inquiry',
    relatedTools: ['tool-empathy-map', 'tool-audience-personas'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['evolving-service'],
  },
  {
    id: 'tool-audience-personas',
    relatedTools: ['tool-empathy-map', 'tool-contextual-inquiry'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['evolving-service'],
  },

  // ── Storytelling cluster ──
  {
    id: 'tool-narrative-strategy',
    relatedTools: ['tool-the-heros-journey', 'tool-the-star-method'],
    relatedArticles: ['article-storytelling-for-social-change', 'article-leadership-vulnerability-in-storytelling-drives-performance'],
    dimensions: ['narrative-connections', 'resonant-purpose'],
  },
  {
    id: 'tool-the-heros-journey',
    relatedTools: ['tool-narrative-strategy', 'tool-the-star-method'],
    relatedArticles: ['article-storytelling-for-social-change', 'article-leadership-vulnerability-in-storytelling-drives-performance'],
    dimensions: ['narrative-connections', 'resonant-purpose'],
  },
  {
    id: 'tool-the-star-method',
    relatedTools: ['tool-the-heros-journey', 'tool-cedar-feedback-model', 'tool-narrative-strategy'],
    relatedArticles: ['article-storytelling-with-data', 'article-leadership-vulnerability-in-storytelling-drives-performance'],
    dimensions: ['narrative-connections', 'generative-capacity'],
  },
];

// ═══════════════════════════════════════════════════════════════
// COURSE MAPPINGS
// ═══════════════════════════════════════════════════════════════

const courseMappings = [
  // ── Change cluster ──
  {
    id: 'course-change-management-fundamentals',
    relatedTools: ['tool-adkar-model', 'tool-kotters-8-step-change-model', 'tool-change-curve'],
    relatedArticles: ['article-a-guide-to-change-readiness', 'article-change-management-to-change-leadership'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'course-building-the-case-for-change',
    relatedTools: ['tool-kotters-8-step-change-model', 'tool-mendelow-power-interest-matrix'],
    relatedArticles: ['article-need-for-change', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'course-driving-organisational-change',
    relatedTools: ['tool-adkar-model', 'tool-lewins-change-model'],
    relatedArticles: ['article-change-management-to-change-leadership', 'article-need-for-change'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'course-effective-change-sponsor',
    relatedTools: ['tool-adkar-model', 'tool-mendelow-power-interest-matrix'],
    relatedArticles: ['article-need-for-change', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change'],
  },
  {
    id: 'course-leading-a-team-through-change',
    relatedTools: ['tool-change-curve', 'tool-bridges-transition-model', 'tool-satir-change-model'],
    relatedArticles: ['article-addressing-change-fatigue', 'article-change-management-to-change-leadership'],
    dimensions: ['tuned-to-change', 'generative-capacity'],
  },
  {
    id: 'course-leading-your-team-through-change',
    relatedTools: ['tool-adkar-model', 'tool-satir-change-model', 'tool-change-curve'],
    relatedArticles: ['article-addressing-change-fatigue', 'article-a-guide-to-change-readiness'],
    dimensions: ['tuned-to-change', 'generative-capacity'],
  },
  {
    id: 'course-storytelling-for-change-management',
    relatedTools: ['tool-the-heros-journey', 'tool-narrative-strategy'],
    relatedArticles: ['article-change-management-to-change-leadership', 'article-leadership-vulnerability-in-storytelling-drives-performance'],
    dimensions: ['tuned-to-change', 'narrative-connections'],
  },

  // ── Culture cluster ──
  {
    id: 'course-best-practice-in-organisational-culture-change',
    relatedTools: ['tool-cultural-web', 'tool-edgar-scheins-culture-model', 'tool-competing-values-framework'],
    relatedArticles: ['article-developing-organisational-culture', 'article-strategic-planning-as-culture-development'],
    dimensions: ['enacted-culture'],
  },
  {
    id: 'course-culture-of-collaboration',
    relatedTools: ['tool-5-conflict-styles', 'tool-competing-values-framework'],
    relatedArticles: ['article-psychological-safety-guide', 'article-developing-organisational-culture'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },
  {
    id: 'course-creating-a-culture-of-recognition-and-appreciation',
    relatedTools: ['tool-cedar-feedback-model', 'tool-4-stages-of-psychological-safety'],
    relatedArticles: ['article-psychological-safety-guide', 'article-emotional-intelligence-in-leadership'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },
  {
    id: 'course-enhancing-employee-well-being-and-work-life-balance',
    relatedTools: ['tool-4-stages-of-psychological-safety', 'tool-eisenhower-matrix'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },
  {
    id: 'course-combatting-burnout-culture',
    relatedTools: ['tool-eisenhower-matrix', 'tool-4-stages-of-psychological-safety'],
    relatedArticles: ['article-psychological-safety-guide', 'article-addressing-change-fatigue'],
    dimensions: ['enacted-culture', 'generative-capacity'],
  },

  // ── Purpose & Strategy cluster ──
  {
    id: 'course-aligning-organisational-purpose',
    relatedTools: ['tool-heart-of-business', 'tool-theory-of-change'],
    relatedArticles: ['article-writing-a-mission-statement', 'article-translating-purpose-from-boardroom-to-breakroom'],
    dimensions: ['resonant-purpose'],
  },
  {
    id: 'course-building-a-theory-of-change',
    relatedTools: ['tool-theory-of-change', 'tool-logframe-logical-framework'],
    relatedArticles: ['article-build-impact-measurement-framework', 'article-translating-purpose-from-boardroom-to-breakroom'],
    dimensions: ['resonant-purpose', 'embedded-strategy'],
  },
  {
    id: 'course-building-shared-purpose-teams',
    relatedTools: ['tool-narrative-strategy', 'tool-heart-of-business'],
    relatedArticles: ['article-translating-purpose-from-boardroom-to-breakroom', 'article-writing-a-mission-statement'],
    dimensions: ['resonant-purpose', 'generative-capacity'],
  },
  {
    id: 'course-scenario-planning-for-leaders',
    relatedTools: ['tool-2x2-scenario-matrix', 'tool-pestle-analysis'],
    relatedArticles: ['article-developing-future-literacy', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'course-introduction-to-systems-thinking-workshop',
    relatedTools: ['tool-iceberg-model', 'tool-cynefin-framework'],
    relatedArticles: ['article-building-organisational-resilience', 'article-building-anti-fragile-organisations'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'course-introduction-to-system-archetypes-workshop',
    relatedTools: ['tool-iceberg-model', 'tool-cynefin-framework'],
    relatedArticles: ['article-guide-to-adaptive-leadership', 'article-building-organisational-resilience'],
    dimensions: ['embedded-strategy'],
  },
  {
    id: 'course-systems-thinking-for-organisational-change',
    relatedTools: ['tool-iceberg-model', 'tool-cynefin-framework', 'tool-wicked-problems'],
    relatedArticles: ['article-building-organisational-resilience', 'article-guide-to-adaptive-leadership'],
    dimensions: ['embedded-strategy', 'tuned-to-change'],
  },

  // ── Operations cluster ──
  {
    id: 'course-continuous-improvement-training-for-teams',
    relatedTools: ['tool-kaizen-cycle', 'tool-pdca-cycle', 'tool-dmaic'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'course-simple-lean-process-design-workshop',
    relatedTools: ['tool-8-wastes-of-lean', 'tool-kaizen-cycle', 'tool-gemba-walk'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'course-introduction-to-process-mapping-workshop',
    relatedTools: ['tool-process-mapping', 'tool-bpm-lifecycle'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },
  {
    id: 'course-workflow-optimisation-workshop',
    relatedTools: ['tool-8-wastes-of-lean', 'tool-process-mapping', 'tool-eisenhower-matrix'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['momentum-through-work'],
  },

  // ── Teams cluster ──
  {
    id: 'course-building-and-managing-high-performing-teams',
    relatedTools: ['tool-belbins-team-roles', 'tool-project-aristotle-effective-teams', 'tool-t7-model-for-teams'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },
  {
    id: 'course-effective-collaboration-in-the-workplace',
    relatedTools: ['tool-five-dysfunctions-of-a-team', 'tool-6-team-conditions-for-team-effectiveness'],
    relatedArticles: ['article-psychological-safety-guide'],
    dimensions: ['generative-capacity'],
  },

  // ── Service Design & CX cluster ──
  {
    id: 'course-introduction-to-design-thinking-workshop',
    relatedTools: ['tool-empathy-map', 'tool-contextual-inquiry', 'tool-problem-statement'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['evolving-service'],
  },
  {
    id: 'course-defining-leveraging-value-workshop',
    relatedTools: ['tool-service-blueprints', 'tool-audience-personas'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy', 'article-the-friction-audit'],
    dimensions: ['evolving-service'],
  },
  {
    id: 'course-reducing-customer-effort-workshop',
    relatedTools: ['tool-empathy-map', 'tool-process-mapping'],
    relatedArticles: ['article-the-friction-audit'],
    dimensions: ['evolving-service', 'momentum-through-work'],
  },
  {
    id: 'course-user-journey-mapping-workshop',
    relatedTools: ['tool-empathy-map', 'tool-service-blueprints', 'tool-audience-personas'],
    relatedArticles: ['article-why-design-thinking-must-embed-in-business-strategy'],
    dimensions: ['evolving-service'],
  },

  // ── Storytelling cluster ──
  {
    id: 'course-data-driven-storytelling',
    relatedTools: ['tool-the-star-method'],
    relatedArticles: ['article-storytelling-with-data', 'article-leadership-vulnerability-in-storytelling-drives-performance'],
    dimensions: ['narrative-connections'],
  },
  {
    id: 'course-story-foundations-for-leaders',
    relatedTools: ['tool-narrative-strategy', 'tool-the-heros-journey', 'tool-the-star-method'],
    relatedArticles: ['article-leadership-vulnerability-in-storytelling-drives-performance', 'article-storytelling-for-social-change'],
    dimensions: ['narrative-connections', 'resonant-purpose'],
  },
];

// ═══════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════

async function patchTool(mapping) {
  const patch = {};

  if (mapping.relatedArticles?.length) {
    patch.relatedArticles = mapping.relatedArticles.map(id => ref(id));
  }
  if (mapping.relatedTools?.length) {
    patch.relatedTools = mapping.relatedTools.map(id => ref(id));
  }
  if (mapping.dimensions?.length) {
    patch.emergentDimensions = mapping.dimensions;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would patch ${mapping.id}:`, JSON.stringify(patch, null, 2).slice(0, 200) + '...');
    return;
  }

  await client
    .patch(mapping.id)
    .set(patch)
    .commit({ autoGenerateArrayKeys: true });
  console.log(`  Patched: ${mapping.id}`);
}

async function patchCourse(mapping) {
  const patch = {};

  if (mapping.relatedArticles?.length) {
    patch.relatedArticles = mapping.relatedArticles.map(id => ref(id));
  }
  if (mapping.relatedTools?.length) {
    patch.relatedTools = mapping.relatedTools.map(id => ref(id));
  }
  if (mapping.dimensions?.length) {
    patch.relatedDimensions = mapping.dimensions.map(slug => ref(DIM[slug]));
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would patch ${mapping.id}:`, JSON.stringify(patch, null, 2).slice(0, 200) + '...');
    return;
  }

  await client
    .patch(mapping.id)
    .set(patch)
    .commit({ autoGenerateArrayKeys: true });
  console.log(`  Patched: ${mapping.id}`);
}

async function main() {
  console.log(`Mutomorro Batch Cross-Reference Script`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log('');

  if (!process.env.SANITY_TOKEN) {
    console.error('Error: SANITY_TOKEN environment variable is required.');
    console.error('Get your token from: https://www.sanity.io/manage/project/c6pg4t4h/api#tokens');
    process.exit(1);
  }

  // Patch tools
  console.log(`Patching ${toolMappings.length} tools...`);
  for (const mapping of toolMappings) {
    try {
      await patchTool(mapping);
    } catch (err) {
      console.error(`  ERROR on ${mapping.id}: ${err.message}`);
    }
  }

  console.log('');

  // Patch courses
  console.log(`Patching ${courseMappings.length} courses...`);
  for (const mapping of courseMappings) {
    try {
      await patchCourse(mapping);
    } catch (err) {
      console.error(`  ERROR on ${mapping.id}: ${err.message}`);
    }
  }

  console.log('');
  console.log(`Done! ${toolMappings.length} tools + ${courseMappings.length} courses = ${toolMappings.length + courseMappings.length} documents patched.`);
  if (!DRY_RUN) {
    console.log('Review the changes in Sanity Studio, then publish when happy.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
