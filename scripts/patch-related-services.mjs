// patch-related-services.mjs
// Run from your project root: node patch-related-services.mjs
// Requires: SANITY_TOKEN environment variable (or edit the token below)
// Get a token from: https://www.sanity.io/manage/project/c6pg4t4h/api#tokens

const PROJECT_ID = 'c6pg4t4h';
const DATASET = 'production';
const API_VERSION = '2024-01-01';
const TOKEN = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Set it with: export SANITY_TOKEN=your_token_here');
  console.error('Get a token from: https://www.sanity.io/manage/project/c6pg4t4h/api#tokens');
  process.exit(1);
}

// Service ID lookup
const SVC = {
  CAP:  'service-organisational-capacity-building',
  CHG:  'service-change-management-consultancy',
  CUL:  'service-culture-change-consultancy',
  CX:   'service-customer-experience-consultancy',
  EX:   'service-employee-experience-consultancy',
  OPS:  'service-operational-effectiveness-consultancy',
  OD:   'service-organisational-design-consultancy',
  ODEV: 'service-organisational-development-consultancy',
  PUR:  'service-organisational-purpose-consultancy',
  REST: 'service-organisational-restructuring-consultancy',
  PMI:  'service-post-merger-integration-consultancy',
  SCAL: 'service-scaling-operations-consultancy',
  SD:   'service-service-design-consultancy',
  STRAT:'service-strategic-alignment-consultancy',
};

function ref(svcKey, idx) {
  return { _type: 'reference', _ref: SVC[svcKey], _key: `rs${String(idx).padStart(2, '0')}` };
}

function refs(...keys) {
  return keys.map((k, i) => ref(k, i + 1));
}

// ============================================================
// ALL MAPPINGS
// ============================================================

const patches = [

  // --- ARTICLES (22 untagged - 3 already done) ---
  // Already tagged: article-addressing-change-fatigue, article-change-management-to-change-leadership, article-a-guide-to-change-readiness
  // Already patched in this session: article-adaptive-organisational-architectures, article-building-anti-fragile-organisations,
  //   article-building-organisational-resilience, article-need-for-change, article-developing-future-literacy,
  //   article-developing-organisational-culture, article-psychological-safety-guide, article-emotional-intelligence-in-leadership

  // Remaining articles not yet patched:
  { id: 'article-governance-the-enables-innovation', services: refs('OD', 'OPS') },
  { id: 'article-guide-to-adaptive-leadership', services: refs('CHG', 'CAP') },
  { id: 'article-build-impact-measurement-framework', services: refs('STRAT', 'PUR') },
  { id: 'article-leadership-vulnerability-in-storytelling-drives-performance', services: refs('PUR', 'CUL', 'CAP') },
  { id: 'article-storytelling-for-social-change', services: refs('PUR', 'CHG') },
  { id: 'article-storytelling-with-data', services: refs('STRAT', 'OPS') },
  { id: 'article-strategic-planning-as-culture-development', services: refs('STRAT', 'CUL') },
  { id: 'article-sustainability-as-an-innovation-driver', services: refs('PUR', 'STRAT') },
  { id: 'article-the-economics-of-authentic-purpose', services: refs('PUR', 'STRAT') },
  { id: 'article-the-friction-audit', services: refs('OPS', 'SD', 'CX') },
  { id: 'article-translating-purpose-from-boardroom-to-breakroom', services: refs('PUR', 'CUL') },
  { id: 'article-charity-technology-guide', services: refs('ODEV', 'OPS') },
  { id: 'article-why-design-thinking-must-embed-in-business-strategy', services: refs('SD', 'STRAT') },
  { id: 'article-writing-a-mission-statement', services: refs('PUR') },

  // --- TOOLS (59 items, all untagged) ---
  { id: 'tool-2x2-scenario-matrix', services: refs('STRAT') },
  { id: 'tool-4-stages-of-psychological-safety', services: refs('CUL', 'EX', 'CAP') },
  { id: 'tool-5-conflict-styles', services: refs('EX', 'CUL') },
  { id: 'tool-5-whys', services: refs('OPS', 'SD') },
  { id: 'tool-5ds-of-appreciative-inquiry', services: refs('CHG', 'ODEV') },
  { id: 'tool-6-team-conditions-for-team-effectiveness', services: refs('CAP', 'EX') },
  { id: 'tool-8-wastes-of-lean', services: refs('OPS', 'SCAL') },
  { id: 'tool-adkar-model', services: refs('CHG') },
  { id: 'tool-audience-personas', services: refs('CX', 'SD') },
  { id: 'tool-bpm-lifecycle', services: refs('OPS', 'SCAL') },
  { id: 'tool-belbins-team-roles', services: refs('CAP', 'EX') },
  { id: 'tool-bridges-transition-model', services: refs('CHG', 'PMI') },
  { id: 'tool-burke-litwin-change-model', services: refs('CHG', 'ODEV') },
  { id: 'tool-cedar-feedback-model', services: refs('EX', 'CAP') },
  { id: 'tool-change-curve', services: refs('CHG', 'PMI') },
  { id: 'tool-competing-values-framework', services: refs('CUL', 'OD') },
  { id: 'tool-contextual-inquiry', services: refs('SD', 'CX') },
  { id: 'tool-cultural-web', services: refs('CUL', 'OD') },
  { id: 'tool-cynefin-framework', services: refs('STRAT', 'ODEV') },
  { id: 'tool-daci-framework', services: refs('OD', 'OPS') },
  { id: 'tool-dmaic', services: refs('OPS', 'SCAL') },
  { id: 'tool-disc-styles', services: refs('EX', 'CAP') },
  { id: 'tool-edgar-scheins-culture-model', services: refs('CUL') },
  { id: 'tool-eisenhower-matrix', services: refs('OPS') },
  { id: 'tool-empathy-map', services: refs('CX', 'SD') },
  { id: 'tool-five-dysfunctions-of-a-team', services: refs('CAP', 'EX') },
  { id: 'tool-galbraith-star-model', services: refs('OD', 'REST') },
  { id: 'tool-gemba-walk', services: refs('OPS', 'SD') },
  { id: 'tool-heart-of-business', services: refs('PUR', 'STRAT') },
  { id: 'tool-iceberg-model', services: refs('CUL', 'ODEV') },
  { id: 'tool-kaizen-cycle', services: refs('OPS', 'SCAL') },
  { id: 'tool-kotters-8-step-change-model', services: refs('CHG') },
  { id: 'tool-lewins-change-model', services: refs('CHG') },
  { id: 'tool-logframe-logical-framework', services: refs('STRAT', 'CAP') },
  { id: 'tool-mckinsey-7-s-model', services: refs('OD', 'STRAT') },
  { id: 'tool-mendelow-power-interest-matrix', services: refs('CHG', 'STRAT') },
  { id: 'tool-narrative-strategy', services: refs('PUR', 'CUL') },
  { id: 'tool-nonprofit-business-model-canvas', services: refs('STRAT', 'PUR') },
  { id: 'tool-ooda-loop', services: refs('STRAT', 'OPS') },
  { id: 'tool-orca', services: refs('CHG', 'ODEV') },
  { id: 'tool-organisational-maturity-model', services: refs('ODEV', 'SCAL') },
  { id: 'tool-pdca-cycle', services: refs('OPS', 'SCAL') },
  { id: 'tool-pestle-analysis', services: refs('STRAT') },
  { id: 'tool-polism-canvas', services: refs('SD', 'CX') },
  { id: 'tool-problem-statement', services: refs('OPS', 'SD') },
  { id: 'tool-process-mapping', services: refs('OPS', 'SD', 'SCAL') },
  { id: 'tool-project-aristotle-effective-teams', services: refs('CAP', 'EX') },
  { id: 'tool-project-oxygen', services: refs('CAP', 'EX') },
  { id: 'tool-rasci-framework', services: refs('OD', 'OPS') },
  { id: 'tool-satir-change-model', services: refs('CHG', 'EX') },
  { id: 'tool-service-blueprints', services: refs('SD', 'CX') },
  { id: 'tool-six-thinking-hats', services: refs('CAP', 'STRAT') },
  { id: 'tool-t7-model-for-teams', services: refs('CAP', 'EX') },
  { id: 'tool-tesi-model', services: refs('CAP', 'EX') },
  { id: 'tool-the-heros-journey', services: refs('PUR', 'CUL') },
  { id: 'tool-the-star-method', services: refs('EX', 'CAP') },
  { id: 'tool-theory-of-change', services: refs('STRAT', 'PUR') },
  { id: 'tool-vuca-prime', services: refs('STRAT', 'CHG') },
  { id: 'tool-wicked-problems', services: refs('STRAT', 'ODEV') },

  // --- CASE STUDIES (11 items, all untagged) ---
  { id: 'project-change-management-training-case-study', services: refs('CHG', 'CAP') },
  { id: 'project-charity-culture-change-case-study', services: refs('CUL', 'CHG') },
  { id: 'project-charity-organisational-design', services: refs('OD', 'REST') },
  { id: 'project-culture-change-in-social-housing', services: refs('CUL', 'CHG', 'EX') },
  { id: 'project-customer-experience-in-social-housing', services: refs('CX', 'SD') },
  { id: 'project-employee-experience-strategy-case-study', services: refs('EX', 'CUL') },
  { id: 'project-housing-association-merger-integration', services: refs('PMI', 'CUL', 'REST') },
  { id: 'project-housing-association-service-improvement', services: refs('SD', 'CX', 'OPS') },
  { id: 'project-public-sector-change-management-case-study', services: refs('CHG', 'ODEV') },
  { id: 'project-public-sector-service-design-case-study', services: refs('SD', 'CX') },
  { id: 'project-social-purpose-strategy-case-study', services: refs('PUR', 'STRAT') },

  // --- COURSES (26 items missing tags) ---
  { id: 'course-effective-change-sponsor', services: refs('CHG') },
  { id: 'course-enhancing-employee-well-being-and-work-life-balance', services: refs('EX') },
  { id: 'course-building-and-managing-high-performing-teams', services: refs('CAP', 'EX') },
  { id: 'course-building-a-theory-of-change', services: refs('STRAT', 'PUR') },
  { id: 'course-creating-a-culture-of-recognition-and-appreciation', services: refs('CUL', 'EX') },
  { id: 'course-building-the-case-for-change', services: refs('CHG', 'STRAT') },
  { id: 'course-change-management-fundamentals', services: refs('CHG') },
  { id: 'course-combatting-burnout-culture', services: refs('EX', 'CUL') },
  { id: 'course-data-driven-storytelling', services: refs('STRAT', 'OPS') },
  { id: 'course-aligning-organisational-purpose', services: refs('PUR') },
  { id: 'course-defining-leveraging-value-workshop', services: refs('STRAT', 'OPS') },
  { id: 'course-culture-of-collaboration', services: refs('CUL', 'CAP') },
  { id: 'course-driving-organisational-change', services: refs('CHG', 'ODEV') },
  { id: 'course-effective-collaboration-in-the-workplace', services: refs('CAP', 'EX') },
  { id: 'course-best-practice-in-organisational-culture-change', services: refs('CUL') },
  { id: 'course-introduction-to-system-archetypes-workshop', services: refs('ODEV', 'STRAT') },
  { id: 'course-introduction-to-systems-thinking-workshop', services: refs('ODEV', 'STRAT') },
  { id: 'course-leading-a-team-through-change', services: refs('CHG', 'CAP') },
  { id: 'course-leading-your-team-through-change', services: refs('CHG', 'CAP') },
  { id: 'course-reducing-customer-effort-workshop', services: refs('SD', 'CX', 'OPS') },
  { id: 'course-story-foundations-for-leaders', services: refs('PUR', 'CAP') },
  { id: 'course-storytelling-for-change-management', services: refs('CHG', 'PUR') },
  { id: 'course-scenario-planning-for-leaders', services: refs('STRAT') },
  { id: 'course-systems-thinking-for-organisational-change', services: refs('CHG', 'ODEV') },
  { id: 'course-building-shared-purpose-teams', services: refs('PUR', 'CAP', 'EX') },
  { id: 'course-user-journey-mapping-workshop', services: refs('SD', 'CX') },
];

// ============================================================
// EXECUTION
// ============================================================

async function patchDocument(id, services) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  
  const body = {
    mutations: [
      {
        createOrReplace: undefined,
        patch: {
          id: id,
          set: { relatedServices: services }
        }
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to patch ${id}: ${res.status} ${text}`);
  }

  return res.json();
}

async function run() {
  console.log(`\nPatching ${patches.length} documents with relatedServices...\n`);
  
  let success = 0;
  let failed = 0;
  const errors = [];

  for (const patch of patches) {
    try {
      await patchDocument(patch.id, patch.services);
      success++;
      const serviceNames = patch.services.map(s => {
        const entry = Object.entries(SVC).find(([_, v]) => v === s._ref);
        return entry ? entry[0] : '?';
      });
      console.log(`  ✓ ${patch.id} → ${serviceNames.join(', ')}`);
    } catch (err) {
      failed++;
      errors.push({ id: patch.id, error: err.message });
      console.log(`  ✗ ${patch.id} → ${err.message}`);
    }
  }

  console.log(`\n--- Done ---`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);
  
  if (errors.length > 0) {
    console.log(`\nFailed documents:`);
    errors.forEach(e => console.log(`  ${e.id}: ${e.error}`));
  }

  console.log(`\nNote: Patches that fail on tools/projects/courses likely need the relatedServices`);
  console.log(`field added to their Sanity schema first. See the Claude Code brief.`);
}

run();
