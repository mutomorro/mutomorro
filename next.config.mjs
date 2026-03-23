/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async redirects() {
    return [

      // =========================================================
      // INTERNAL SERVICE URL FLATTENING (existing)
      // /services/[category]/[slug] → /services/[slug]
      // These must come BEFORE the catch-all patterns below
      // =========================================================

      { source: '/services/purpose-direction', destination: '/services', permanent: true },
      { source: '/services/structure-operations', destination: '/services', permanent: true },
      { source: '/services/people-capability', destination: '/services', permanent: true },
      { source: '/services/service-experience', destination: '/services', permanent: true },
      { source: '/services/purpose-direction/:slug', destination: '/services/:slug', permanent: true },
      { source: '/services/structure-operations/:slug', destination: '/services/:slug', permanent: true },
      { source: '/services/people-capability/:slug', destination: '/services/:slug', permanent: true },
      { source: '/services/service-experience/:slug', destination: '/services/:slug', permanent: true },


      // =========================================================
      // PATTERN REDIRECTS - whole sections
      // Slug stays the same, just the path prefix changes
      // =========================================================

      // Articles: /article/[slug] → /articles/[slug]
      { source: '/article/:slug', destination: '/articles/:slug', permanent: true },
      { source: '/article', destination: '/articles', permanent: true },

      // Projects: /project/[slug] → /projects/[slug]
      { source: '/project/:slug', destination: '/projects/:slug', permanent: true },
      { source: '/project', destination: '/projects', permanent: true },

      // Sessions → Courses: /sessions/[slug] → /courses/[slug]
      { source: '/sessions/:slug', destination: '/courses/:slug', permanent: true },
      { source: '/sessions', destination: '/courses', permanent: true },

      // Training → Courses: /training/[slug] → /courses/[slug]
      { source: '/training/:slug', destination: '/courses/:slug', permanent: true },
      { source: '/training', destination: '/courses', permanent: true },

      // Guides → Articles: /guides/[slug] → /articles/[slug]
      { source: '/guides/:slug', destination: '/articles/:slug', permanent: true },
      { source: '/guides', destination: '/articles', permanent: true },


      // =========================================================
      // CORE PAGES
      // =========================================================

      { source: '/approach', destination: '/philosophy', permanent: true },
      { source: '/approach/:path*', destination: '/philosophy', permanent: true },
      { source: '/consultancy', destination: '/services', permanent: true },
      { source: '/dimensions', destination: '/emergent-framework', permanent: true },
      { source: '/dimensions/:path*', destination: '/emergent-framework', permanent: true },
      { source: '/transformation', destination: '/services', permanent: true },
      { source: '/transformation/:path*', destination: '/services', permanent: true },
      { source: '/ecosystem-design', destination: '/services', permanent: true },
      { source: '/application', destination: '/services', permanent: true },
      { source: '/resources', destination: '/tools', permanent: true },
      { source: '/services-old', destination: '/services', permanent: true },
      { source: '/checkout', destination: '/contact', permanent: true },
      { source: '/checkout-2', destination: '/contact', permanent: true },
      { source: '/enquiry', destination: '/contact', permanent: true },
      { source: '/contact/enquiry', destination: '/contact', permanent: true },


      // =========================================================
      // STATES OF VITALITY
      // =========================================================

      { source: '/states-of-vitality/snapshot-assessment', destination: '/states-of-vitality', permanent: true },
      { source: '/signs-of-vitality-test', destination: '/states-of-vitality', permanent: true },
      { source: '/signs-of-vitality-test/:path*', destination: '/states-of-vitality', permanent: true },


      // =========================================================
      // SERVICE PAGES - old areas/ paths → new /services/
      // =========================================================

      { source: '/areas', destination: '/services', permanent: true },
      { source: '/services-index', destination: '/services', permanent: true },
      { source: '/areas/organisational-purpose-consultancy', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/areas/organisational-strategy-consultancy', destination: '/services/strategic-alignment-consultancy', permanent: true },
      { source: '/areas/culture-change-consultancy', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/areas/change-management-consultancy', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/areas/operational-effectiveness-consultancy', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/areas/service-innovation-consultancy', destination: '/services/service-design-consultancy', permanent: true },
      { source: '/areas/capacity-development-consultancy', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/areas/design-thinking', destination: '/services/service-design-consultancy', permanent: true },
      { source: '/areas/culture-change', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/areas/change-management', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/areas/strategy-and-futures', destination: '/services/strategic-alignment-consultancy', permanent: true },
      { source: '/areas/operational-effectiveness', destination: '/services/operational-effectiveness-consultancy', permanent: true },


      // =========================================================
      // SERVICE PAGES - old consultancy/ paths → new /services/
      // =========================================================

      { source: '/consultancy/service-design-consultancy', destination: '/services/service-design-consultancy', permanent: true },
      { source: '/consultancy/scaling-operations-consultancy', destination: '/services/scaling-operations-consultancy', permanent: true },
      { source: '/consultancy/employee-experience-consultancy', destination: '/services/employee-experience-consultancy', permanent: true },
      { source: '/consultancy/customer-experience-consultancy', destination: '/services/customer-experience-consultancy', permanent: true },
      { source: '/consultancy/organisational-restructuring-consultancy', destination: '/services/organisational-restructuring-consultancy', permanent: true },
      { source: '/consultancy/organisational-culture-change', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/consultancy/culture-change-programmes', destination: '/services/culture-change-consultancy/culture-change-programmes', permanent: true },
      { source: '/consultancy/:slug', destination: '/services', permanent: true },


      // =========================================================
      // SERVICE PAGES - old application/ paths → new /services/
      // =========================================================

      { source: '/application/change-management', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/application/culture-change-programmes', destination: '/services/culture-change-consultancy/culture-change-programmes', permanent: true },
      { source: '/application/systems-thinking', destination: '/services/organisational-development-consultancy', permanent: true },
      { source: '/application/process-improvement', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/application/continuous-improvement-consultancy', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/application/team-development', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/application/employee-experience-consultancy', destination: '/services/employee-experience-consultancy', permanent: true },
      { source: '/application/target-culture', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/application/purpose-driven-change', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/application/:slug', destination: '/services', permanent: true },


      // =========================================================
      // SERVICE PAGES - old service-areas/ paths
      // =========================================================

      { source: '/service-areas/purpose-and-impact', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/service-areas/purpose-and-impact/:path*', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/service-areas/purpose-mission', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/service-areas/purpose-mission/:path*', destination: '/services/organisational-purpose-consultancy', permanent: true },
      { source: '/service-areas/strategy-and-futures', destination: '/services/strategic-alignment-consultancy', permanent: true },
      { source: '/service-areas/strategy-and-futures/:path*', destination: '/services/strategic-alignment-consultancy', permanent: true },
      { source: '/service-areas/storytelling-and-engagement', destination: '/emergent-framework/narrative-connections', permanent: true },
      { source: '/service-areas/storytelling-and-engagement/:path*', destination: '/emergent-framework/narrative-connections', permanent: true },
      { source: '/service-areas/capacity-building', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/service-areas/capacity-building/:path*', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/service-areas/:slug', destination: '/services', permanent: true },


      // =========================================================
      // SERVICE PAGES - other old paths
      // =========================================================

      { source: '/services/evaluation-diagnostics', destination: '/states-of-vitality', permanent: true },
      { source: '/services/evaluation-diagnostics/:path*', destination: '/states-of-vitality', permanent: true },
      { source: '/services/implementation-support', destination: '/services', permanent: true },
      { source: '/services/implementation-support/:path*', destination: '/services', permanent: true },
      { source: '/services/people-leadership', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/services/people-leadership-development', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/services/learning-evaluation-insight', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/services/learning-evaluation-insight/:path*', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/services/service-improvement', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/services/purpose-driven-change', destination: '/services/organisational-purpose-consultancy', permanent: true },

      // Top-level old service paths
      { source: '/service-design', destination: '/services/service-design-consultancy', permanent: true },
      { source: '/service-design/:path*', destination: '/services/service-design-consultancy', permanent: true },
      { source: '/change-management-consultancy', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/change-management-consultancy/:path*', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/system-thinking', destination: '/services/organisational-development-consultancy', permanent: true },
      { source: '/system-thinking/:path*', destination: '/services/organisational-development-consultancy', permanent: true },
      { source: '/process-improvement', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/team-development', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/employee-experience', destination: '/services/employee-experience-consultancy', permanent: true },
      { source: '/employee-experience/:path*', destination: '/services/employee-experience-consultancy', permanent: true },
      { source: '/freelance-change-management', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/organisational-change-management', destination: '/services/change-management-consultancy', permanent: true },
      { source: '/organisational-improvement', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/organisational-improvement/:path*', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/team-effectiveness', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/team-effectiveness/:path*', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/executive-coaching', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/individual-growth', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/personal-development', destination: '/services/organisational-capacity-building', permanent: true },

      // Build capacity
      { source: '/build-capacity/executive-coaching', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/build-capacity/bespoke-training', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/build-capacity/:slug', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/coaching/executive-coaching', destination: '/services/organisational-capacity-building', permanent: true },
      { source: '/coaching/:slug', destination: '/services/organisational-capacity-building', permanent: true },


      // =========================================================
      // EMERGENT FRAMEWORK - old key-themes and dimensions
      // =========================================================

      { source: '/themes', destination: '/emergent-framework', permanent: true },
      { source: '/themes/:path*', destination: '/emergent-framework', permanent: true },
      // key-themes wildcards consolidated in 404 log cleanup section below

      { source: '/dimensions/organisational-knowledge-consultancy', destination: '/emergent-framework/narrative-connections', permanent: true },
      { source: '/dimensions/organisational-knowledge-consultancy/:path*', destination: '/emergent-framework/narrative-connections', permanent: true },

      // Old change-focus taxonomy
      { source: '/change-focus/culture', destination: '/emergent-framework/enacted-culture', permanent: true },
      { source: '/change-focus/culture/:path*', destination: '/emergent-framework/enacted-culture', permanent: true },
      { source: '/change-focus/team', destination: '/emergent-framework/generative-capacity', permanent: true },
      { source: '/change-focus/team/:path*', destination: '/emergent-framework/generative-capacity', permanent: true },
      { source: '/change-focus/organisation', destination: '/emergent-framework/momentum-through-work', permanent: true },
      { source: '/change-focus/organisation/:path*', destination: '/emergent-framework/momentum-through-work', permanent: true },
      { source: '/change-focus/management', destination: '/emergent-framework/tuned-to-change', permanent: true },
      { source: '/change-focus/management/:path*', destination: '/emergent-framework/tuned-to-change', permanent: true },
      { source: '/change-focus/individuals', destination: '/services', permanent: true },
      { source: '/change-focus/individuals/:path*', destination: '/services', permanent: true },
      { source: '/change-focus/problem-solving', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/change-focus/system-thinking', destination: '/services/organisational-development-consultancy', permanent: true },
      { source: '/change-focus/systems-thinking', destination: '/services/organisational-development-consultancy', permanent: true },
      { source: '/change-focus/process-improvement', destination: '/services/operational-effectiveness-consultancy', permanent: true },
      { source: '/change-focus/:slug', destination: '/services', permanent: true },


      // =========================================================
      // TOOLKIT → TOOLS (individual - every slug differs)
      // =========================================================

      { source: '/toolkit/free-adkar-template', destination: '/tools/adkar-model', permanent: true },
      { source: '/toolkit/adkar-toolkit', destination: '/tools/adkar-model', permanent: true },
      { source: '/toolkit/free-change-curve-template', destination: '/tools/change-curve', permanent: true },
      { source: '/toolkit/change-curve-template', destination: '/tools/change-curve', permanent: true },
      { source: '/toolkit/free-dmaic-process', destination: '/tools/dmaic', permanent: true },
      { source: '/toolkit/free-8-wastes-of-lean-template', destination: '/tools/8-wastes-of-lean', permanent: true },
      { source: '/toolkit/8-wastes-of-lean-template', destination: '/tools/8-wastes-of-lean', permanent: true },
      { source: '/toolkit/free-ooda-loop-template', destination: '/tools/ooda-loop', permanent: true },
      { source: '/toolkit/free-eisenhower-matrix-template', destination: '/tools/eisenhower-matrix', permanent: true },
      { source: '/toolkit/eisenhower-matrix', destination: '/tools/eisenhower-matrix', permanent: true },
      { source: '/toolkit/free-satir-change-model-template', destination: '/tools/satir-change-model', permanent: true },
      { source: '/toolkit/satir-change-model-template', destination: '/tools/satir-change-model', permanent: true },
      { source: '/toolkit/free-kaizen-cycle-template', destination: '/tools/kaizen-cycle', permanent: true },
      { source: '/toolkit/free-4-stages-of-psychological-safety-template', destination: '/tools/4-stages-of-psychological-safety', permanent: true },
      { source: '/toolkit/free-five-dysfunctions-of-a-team-template', destination: '/tools/five-dysfunctions-of-a-team', permanent: true },
      { source: '/toolkit/five-dysfunctions-of-a-team-template', destination: '/tools/five-dysfunctions-of-a-team', permanent: true },
      { source: '/toolkit/free-lewins-change-model-template', destination: '/tools/lewins-change-model', permanent: true },
      { source: '/toolkit/free-mckinsey-7-s-model-template', destination: '/tools/mckinsey-7-s-model', permanent: true },
      { source: '/toolkit/mckinsey-7-s-model-template', destination: '/tools/mckinsey-7-s-model', permanent: true },
      { source: '/toolkit/free-bridges-transition-model-template', destination: '/tools/bridges-transition-model', permanent: true },
      { source: '/toolkit/bridges-transition-model-template', destination: '/tools/bridges-transition-model', permanent: true },
      { source: '/toolkit/free-cynefin-framework-template', destination: '/tools/cynefin-framework', permanent: true },
      { source: '/toolkit/free-6-team-conditions-template', destination: '/tools/6-team-conditions-for-team-effectiveness', permanent: true },
      { source: '/toolkit/free-burke-litwin-change-model', destination: '/tools/burke-litwin-change-model', permanent: true },
      { source: '/toolkit/free-5-conflict-styles-template', destination: '/tools/5-conflict-styles', permanent: true },
      { source: '/toolkit/free-tesi-model-template', destination: '/tools/tesi-model', permanent: true },
      { source: '/toolkit/free-six-thinking-hats', destination: '/tools/six-thinking-hats', permanent: true },
      { source: '/toolkit/six-thinking-hats', destination: '/tools/six-thinking-hats', permanent: true },
      { source: '/toolkit/free-5ds-of-appreciative-inquiry-template', destination: '/tools/5ds-of-appreciative-inquiry', permanent: true },
      { source: '/toolkit/free-competing-values-template', destination: '/tools/competing-values-framework', permanent: true },
      { source: '/toolkit/free-vuca-prime-template', destination: '/tools/vuca-prime', permanent: true },
      { source: '/toolkit/free-belbins-team-roles-template', destination: '/tools/belbins-team-roles', permanent: true },
      { source: '/toolkit/free-iceberg-model-template', destination: '/tools/iceberg-model', permanent: true },
      { source: '/toolkit/free-edgar-scheins-culture-model-template', destination: '/tools/edgar-scheins-culture-model', permanent: true },
      { source: '/toolkit/edgar-scheins-culture-model-template', destination: '/tools/edgar-scheins-culture-model', permanent: true },
      { source: '/toolkit/free-t7-model-for-teams-template', destination: '/tools/t7-model-for-teams', permanent: true },
      { source: '/toolkit/t7-model-for-teams-template', destination: '/tools/t7-model-for-teams', permanent: true },
      { source: '/toolkit/free-culture-web-template', destination: '/tools/cultural-web', permanent: true },
      { source: '/toolkit/free-project-aristotle-template', destination: '/tools/project-aristotle-effective-teams', permanent: true },
      { source: '/toolkit/free-googles-project-oxygen-template', destination: '/tools/project-oxygen', permanent: true },
      { source: '/toolkit/free-kotters-8-stage-change-model-template', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/toolkit/8-step-change-model-slide-deck', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/toolkit/8-step-change-model-kick-off-kit', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/toolkit/free-problem-statement-template', destination: '/tools/problem-statement', permanent: true },
      { source: '/toolkit/free-5-whys-template', destination: '/tools/5-whys', permanent: true },
      { source: '/toolkit/free-cedar-feedback-model-template', destination: '/tools/cedar-feedback-model', permanent: true },
      { source: '/toolkit/cedar-feedback-model-template', destination: '/tools/cedar-feedback-model', permanent: true },
      { source: '/toolkit/free-pestle-analysis-template', destination: '/tools/pestle-analysis', permanent: true },
      { source: '/toolkit/free-customer-personas-template', destination: '/tools/audience-personas', permanent: true },
      { source: '/toolkit/theory-of-change-toolkit', destination: '/tools/theory-of-change', permanent: true },
      { source: '/toolkit/theory-of-change-toolkit-2', destination: '/tools/theory-of-change', permanent: true },
      { source: '/toolkit/theory-of-change-template', destination: '/tools/theory-of-change', permanent: true },
      { source: '/toolkit/people-manager-roles-through-change', destination: '/tools', permanent: true },
      { source: '/toolkit/thinking-in-ecosystems', destination: '/tools', permanent: true },
      { source: '/toolkit/7973', destination: '/tools/audience-personas', permanent: true },
      // Catch-all for any other toolkit pages
      { source: '/toolkit/:slug', destination: '/tools', permanent: true },


      // =========================================================
      // PRODUCTS → TOOLS (old paid product pages)
      // =========================================================

      { source: '/products/kotter-s-8-step-change-model-free-pdf-template', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/products/5-conflict-management-styles-free-template', destination: '/tools/5-conflict-styles', permanent: true },
      { source: '/products/4-stages-of-psychological-safety-free-template', destination: '/tools/4-stages-of-psychological-safety', permanent: true },
      { source: '/products/5-whys-template-free-template', destination: '/tools/5-whys', permanent: true },
      { source: '/products/the-change-curve-free-template', destination: '/tools/change-curve', permanent: true },
      { source: '/products/adkar-free-pdf-template', destination: '/tools/adkar-model', permanent: true },
      { source: '/products/cultural-web-free-pdf-template', destination: '/tools/cultural-web', permanent: true },
      { source: '/products/problem-statement-free-template', destination: '/tools/problem-statement', permanent: true },
      { source: '/products/project-aristotle-effective-teams-free-template', destination: '/tools/project-aristotle-effective-teams', permanent: true },
      { source: '/products/adkar-template-kickoff-pack', destination: '/tools/adkar-model', permanent: true },
      { source: '/products/8-step-change-model-slide-deck', destination: '/tools/kotters-8-step-change-model', permanent: true },
      // Catch-all for any other product pages
      { source: '/products/:slug', destination: '/tools', permanent: true },


      // =========================================================
      // ARTICLE SLUG CHANGES (old slug → new slug)
      // The pattern redirect handles /article/ → /articles/ prefix
      // These handle where the slug itself changed
      // =========================================================

      { source: '/articles/change-readiness', destination: '/articles/a-guide-to-change-readiness', permanent: true },
      { source: '/articles/the-change-readiness-imperative', destination: '/articles/addressing-change-fatigue', permanent: true },
      { source: '/articles/building-greater-organisational-resilience', destination: '/articles/building-organisational-resilience', permanent: true },
      { source: '/articles/writing-a-meaningful-mission-statement', destination: '/articles/writing-a-mission-statement', permanent: true },
      { source: '/articles/developing-a-need-for-change', destination: '/articles/need-for-change', permanent: true },
      { source: '/articles/developing-organisational-culture-the-basics', destination: '/articles/developing-organisational-culture', permanent: true },
      { source: '/articles/adaptive-leadership', destination: '/articles/guide-to-adaptive-leadership', permanent: true },
      { source: '/articles/nonprofit-mission-statement-guide', destination: '/articles/writing-a-mission-statement', permanent: true },
      { source: '/articles/emotional-intelligence-in-leadership-guide', destination: '/articles/emotional-intelligence-in-leadership', permanent: true },
      { source: '/articles/nonprofit-resilience-guide', destination: '/articles/building-organisational-resilience', permanent: true },
      { source: '/articles/impact-measurement-framework-guide', destination: '/articles/build-impact-measurement-framework', permanent: true },
      { source: '/articles/designing-adaptive-organisational-architectures', destination: '/articles/adaptive-organisational-architectures', permanent: true },
      { source: '/articles/building-psychological-safety-a-guide-for-organisations', destination: '/articles/psychological-safety-guide', permanent: true },
      { source: '/articles/organisational-culture-models', destination: '/articles/developing-organisational-culture', permanent: true },
      { source: '/articles/organisational-culture-guide', destination: '/articles/developing-organisational-culture', permanent: true },
      { source: '/articles/defining-the-need-for-change', destination: '/articles/need-for-change', permanent: true },
      { source: '/articles/a-guide-to-change-readiness', destination: '/articles/change-readiness-assessment', permanent: true },
      { source: '/articles/addressing-change-fatigue', destination: '/articles/change-fatigue-in-the-workplace', permanent: true },


      // =========================================================
      // COURSES - slug changes from rewrite project
      // =========================================================

      // Batch 1
      { source: '/courses/change-management-fundamentals', destination: '/courses/change-management-training', permanent: true },
      { source: '/courses/leading-your-team-through-change', destination: '/courses/leading-a-team-through-change', permanent: true },

      // Batch 2
      { source: '/courses/story-foundations-for-leaders', destination: '/courses/storytelling-for-leaders-training', permanent: true },
      { source: '/courses/data-driven-storytelling', destination: '/courses/data-storytelling-training', permanent: true },
      { source: '/courses/building-and-managing-high-performing-teams', destination: '/courses/high-performing-teams-training', permanent: true },
      { source: '/courses/effective-collaboration-in-the-workplace', destination: '/courses/workplace-collaboration-training', permanent: true },

      // Batch 3
      { source: '/courses/best-practice-in-organisational-culture-change', destination: '/courses/organisational-culture-change-training', permanent: true },
      { source: '/courses/combatting-burnout-culture', destination: '/courses/preventing-burnout-at-work', permanent: true },
      { source: '/courses/culture-of-collaboration', destination: '/courses/building-a-collaborative-culture', permanent: true },
      { source: '/courses/creating-a-culture-of-recognition-and-appreciation', destination: '/courses/employee-recognition-training', permanent: true },
      { source: '/courses/enhancing-employee-well-being-and-work-life-balance', destination: '/courses/employee-wellbeing-training', permanent: true },

      // Batch 4
      { source: '/courses/introduction-to-process-mapping-workshop', destination: '/courses/process-mapping-training', permanent: true },
      { source: '/courses/simple-lean-process-design-workshop', destination: '/courses/lean-process-design-training', permanent: true },
      { source: '/courses/workflow-optimisation-workshop', destination: '/courses/workflow-optimisation-training', permanent: true },
      { source: '/courses/continuous-improvement-training-for-teams', destination: '/courses/continuous-improvement-training', permanent: true },
      { source: '/courses/introduction-to-design-thinking-workshop', destination: '/courses/design-thinking-training', permanent: true },

      // Batch 5
      { source: '/courses/user-journey-mapping-workshop', destination: '/courses/user-journey-mapping-training', permanent: true },
      { source: '/courses/reducing-customer-effort-workshop', destination: '/courses/reducing-customer-effort', permanent: true },
      { source: '/courses/aligning-organisational-purpose', destination: '/courses/defining-organisational-purpose', permanent: true },
      { source: '/courses/building-shared-purpose-teams', destination: '/courses/building-shared-purpose-in-teams', permanent: true },
      { source: '/courses/defining-leveraging-value-workshop', destination: '/courses/defining-value-in-service-delivery', permanent: true },

      // Batch 6
      { source: '/courses/introduction-to-systems-thinking-workshop', destination: '/courses/systems-thinking-training', permanent: true },
      { source: '/courses/introduction-to-system-archetypes-workshop', destination: '/courses/system-archetypes-training', permanent: true },

      // Old session-to-session redirects (already existed in WP)
      { source: '/courses/process-analysis-techniques-workshop', destination: '/courses/workflow-optimisation-training', permanent: true },
      { source: '/courses/project-oxygen-manager-training', destination: '/courses/high-performing-teams-training', permanent: true },
      { source: '/courses/introduction-to-service-design-workshop', destination: '/courses/design-thinking-training', permanent: true },
      { source: '/courses/meaningful-work-motivating-teams-with-purpose', destination: '/courses/building-shared-purpose-in-teams', permanent: true },
      { source: '/courses/agile-user-journey-mapping-workshop', destination: '/courses/user-journey-mapping-training', permanent: true },
      { source: '/courses/agile-customer-journey-mapping-workshop', destination: '/courses/user-journey-mapping-training', permanent: true },
      { source: '/courses/shared-organisational-purpose', destination: '/courses/defining-organisational-purpose', permanent: true },
      { source: '/courses/customer-value-to-drive-improvement', destination: '/courses/defining-value-in-service-delivery', permanent: true },
      { source: '/courses/reconnect-with-a-shared-organisational-purpose', destination: '/courses/defining-organisational-purpose', permanent: true },
      { source: '/courses/using-customer-value-to-drive-improvement-workshop', destination: '/courses/defining-value-in-service-delivery', permanent: true },
      { source: '/courses/creating-a-culture-of-collaboration', destination: '/courses/building-a-collaborative-culture', permanent: true },


      // =========================================================
      // ROOT-LEVEL TOOL PAGES → /tools/
      // Old WordPress had tools at root. New site uses /tools/ prefix.
      // =========================================================

      { source: '/2x2-scenario-matrix', destination: '/tools/2x2-scenario-matrix', permanent: true },
      { source: '/4-stages-of-psychological-safety', destination: '/tools/4-stages-of-psychological-safety', permanent: true },
      { source: '/5-conflict-styles', destination: '/tools/5-conflict-styles', permanent: true },
      { source: '/5-whys', destination: '/tools/5-whys', permanent: true },
      { source: '/5ds-of-appreciative-inquiry', destination: '/tools/5ds-of-appreciative-inquiry', permanent: true },
      { source: '/6-team-conditions-for-team-effectiveness', destination: '/tools/6-team-conditions-for-team-effectiveness', permanent: true },
      { source: '/adkar-model', destination: '/tools/adkar-model', permanent: true },
      { source: '/belbins-team-roles', destination: '/tools/belbins-team-roles', permanent: true },
      { source: '/bpm-lifecycle', destination: '/tools/bpm-lifecycle', permanent: true },
      { source: '/bridges-transition-model', destination: '/tools/bridges-transition-model', permanent: true },
      { source: '/burke-litwin-change-model', destination: '/tools/burke-litwin-change-model', permanent: true },
      { source: '/cedar-feedback-model', destination: '/tools/cedar-feedback-model', permanent: true },
      { source: '/change-curve', destination: '/tools/change-curve', permanent: true },
      { source: '/competing-values-framework', destination: '/tools/competing-values-framework', permanent: true },
      { source: '/contextual-inquiry', destination: '/tools/contextual-inquiry', permanent: true },
      { source: '/cultural-web', destination: '/tools/cultural-web', permanent: true },
      { source: '/cynefin-framework', destination: '/tools/cynefin-framework', permanent: true },
      { source: '/daci-framework', destination: '/tools/daci-framework', permanent: true },
      { source: '/disc-styles', destination: '/tools/disc-styles', permanent: true },
      { source: '/dmaic', destination: '/tools/dmaic', permanent: true },
      { source: '/edgar-scheins-culture-model', destination: '/tools/edgar-scheins-culture-model', permanent: true },
      { source: '/eisenhower-matrix', destination: '/tools/eisenhower-matrix', permanent: true },
      { source: '/empathy-map', destination: '/tools/empathy-map', permanent: true },
      { source: '/five-dysfunctions-of-a-team', destination: '/tools/five-dysfunctions-of-a-team', permanent: true },
      { source: '/galbraith-star-model', destination: '/tools/galbraith-star-model', permanent: true },
      { source: '/gemba-walk', destination: '/tools/gemba-walk', permanent: true },
      { source: '/heart-of-business', destination: '/tools/heart-of-business', permanent: true },
      { source: '/iceberg-model', destination: '/tools/iceberg-model', permanent: true },
      { source: '/kaizen-cycle', destination: '/tools/kaizen-cycle', permanent: true },
      { source: '/kotters-8-step-change-model', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/lewins-change-model', destination: '/tools/lewins-change-model', permanent: true },
      { source: '/logframe-logical-framework', destination: '/tools/logframe-logical-framework', permanent: true },
      { source: '/mckinsey-7-s-model', destination: '/tools/mckinsey-7-s-model', permanent: true },
      { source: '/mendelow-power-interest-matrix', destination: '/tools/mendelow-power-interest-matrix', permanent: true },
      { source: '/narrative-strategy', destination: '/tools/narrative-strategy', permanent: true },
      { source: '/nonprofit-business-model-canvas', destination: '/tools/nonprofit-business-model-canvas', permanent: true },
      { source: '/ooda-loop', destination: '/tools/ooda-loop', permanent: true },
      { source: '/orca', destination: '/tools/orca', permanent: true },
      { source: '/organisational-maturity-model', destination: '/tools/organisational-maturity-model', permanent: true },
      { source: '/pdca-cycle', destination: '/tools/pdca-cycle', permanent: true },
      { source: '/pestle-analysis', destination: '/tools/pestle-analysis', permanent: true },
      { source: '/polism-canvas', destination: '/tools/polism-canvas', permanent: true },
      { source: '/problem-statement', destination: '/tools/problem-statement', permanent: true },
      { source: '/process-mapping', destination: '/tools/process-mapping', permanent: true },
      { source: '/project-oxygen', destination: '/tools/project-oxygen', permanent: true },
      { source: '/rasci-framework', destination: '/tools/rasci-framework', permanent: true },
      { source: '/satir-change-model', destination: '/tools/satir-change-model', permanent: true },
      { source: '/service-blueprints', destination: '/tools/service-blueprints', permanent: true },
      { source: '/six-thinking-hats', destination: '/tools/six-thinking-hats', permanent: true },
      { source: '/t7-model-for-teams', destination: '/tools/t7-model-for-teams', permanent: true },
      { source: '/tesi-model', destination: '/tools/tesi-model', permanent: true },
      { source: '/the-heros-journey', destination: '/tools/the-heros-journey', permanent: true },
      { source: '/the-star-method', destination: '/tools/the-star-method', permanent: true },
      { source: '/theory-of-change', destination: '/tools/theory-of-change', permanent: true },
      { source: '/vuca-prime', destination: '/tools/vuca-prime', permanent: true },
      { source: '/wicked-problems', destination: '/tools/wicked-problems', permanent: true },


      // =========================================================
      // MISCELLANEOUS
      // =========================================================

      // Old /implement/ pages (WordPress AI-generated content)
      { source: '/implement/:slug', destination: '/services', permanent: true },
      { source: '/implement', destination: '/services', permanent: true },

      // Old /developing-leaders/ pages - consolidated in 404 log cleanup section below

      // Old one-off pages
      { source: '/purpose-led-organisations', destination: '/philosophy', permanent: true },
      { source: '/hoko-test', destination: '/', permanent: true },
      { source: '/services/culture-change', destination: '/services/culture-change-consultancy', permanent: true },

      // Old /buy/ e-commerce pages
      { source: '/buy/8-step-change-model-slide-deck', destination: '/tools/kotters-8-step-change-model', permanent: true },
      { source: '/buy/:slug', destination: '/tools', permanent: true },

      // Old /how-we-help/ navigation structure
      { source: '/how-we-help/structure-and-operations', destination: '/services', permanent: true },
      { source: '/how-we-help/purpose-and-direction', destination: '/services', permanent: true },
      { source: '/how-we-help/people-and-capability', destination: '/services', permanent: true },
      { source: '/how-we-help/service-and-experience', destination: '/services', permanent: true },
      { source: '/how-we-help/:slug', destination: '/services', permanent: true },
      { source: '/how-we-help', destination: '/services', permanent: true },

      // Old top-level paths
      { source: '/customer-personas', destination: '/tools/audience-personas', permanent: true },
      { source: '/audience-personas', destination: '/tools/audience-personas', permanent: true },
      { source: '/project-aristotle-for-effective-team-coaching', destination: '/tools/project-aristotle-effective-teams', permanent: true },
      { source: '/project-aristotle-effective-teams', destination: '/tools/project-aristotle-effective-teams', permanent: true },
      { source: '/resource-hub', destination: '/tools', permanent: true },
      { source: '/specialisms', destination: '/services', permanent: true },
      { source: '/specialisms/:slug', destination: '/services', permanent: true },
      { source: '/why-are-you-reading-the-url', destination: '/', permanent: true },
      { source: '/a-warm-welcome', destination: '/', permanent: true },

      // Old tool renames
      { source: '/tools/5-conflict-management-styles', destination: '/tools/5-conflict-styles', permanent: true },
      { source: '/tools/executive-function', destination: '/tools', permanent: true },

      // Old school taxonomy
      { source: '/school/change-management', destination: '/courses', permanent: true },
      { source: '/school/change-management/:path*', destination: '/courses', permanent: true },
      { source: '/school/catalysing-change', destination: '/courses', permanent: true },
      { source: '/school/catalysing-change/:path*', destination: '/courses', permanent: true },
      { source: '/school/organisational-effectiveness', destination: '/courses', permanent: true },
      { source: '/school/organisational-effectiveness/:path*', destination: '/courses', permanent: true },
      { source: '/school/team-effectiveness', destination: '/courses', permanent: true },
      { source: '/school/team-effectiveness/:path*', destination: '/courses', permanent: true },
      { source: '/school/:slug', destination: '/courses', permanent: true },

      // Training areas
      { source: '/training-area/employee-experience', destination: '/courses', permanent: true },
      { source: '/training-area/employee-experience/:path*', destination: '/courses', permanent: true },
      { source: '/training-area/capacity-development-training', destination: '/courses', permanent: true },
      { source: '/training-area/systems-thinking', destination: '/courses', permanent: true },
      { source: '/training-area/strategy-futures-training', destination: '/courses', permanent: true },
      { source: '/training-area/service-design', destination: '/courses', permanent: true },
      { source: '/training-area/design-thinking-innovation-training', destination: '/courses', permanent: true },
      { source: '/training-area/continuous-improvement', destination: '/courses', permanent: true },
      { source: '/training-area/operational-effectiveness-training', destination: '/courses', permanent: true },
      { source: '/training-area/organisational-change', destination: '/courses', permanent: true },
      { source: '/training-area/change-management-training', destination: '/courses', permanent: true },
      { source: '/training-area/customer-experience', destination: '/courses', permanent: true },
      { source: '/training-area/customer-experience-training', destination: '/courses', permanent: true },
      { source: '/training-area/culture-change', destination: '/courses', permanent: true },
      { source: '/training-area/culture-change-training', destination: '/courses', permanent: true },
      { source: '/training-area/process-improvement', destination: '/courses', permanent: true },
      { source: '/training-area/process-improvement-training', destination: '/courses', permanent: true },
      { source: '/training-area/:slug', destination: '/courses', permanent: true },

      // Old taxonomies (catch-alls)
      { source: '/tool-use/:slug', destination: '/tools', permanent: true },
      { source: '/use/:slug', destination: '/tools', permanent: true },
      { source: '/topic/:slug', destination: '/articles', permanent: true },
      { source: '/sector/:slug', destination: '/projects', permanent: true },
      { source: '/event/:slug', destination: '/courses', permanent: true },
      { source: '/event-type/:slug', destination: '/courses', permanent: true },
      { source: '/training-platform/:slug', destination: '/courses', permanent: true },
      { source: '/workshop/:slug', destination: '/courses', permanent: true },
      { source: '/service/:slug', destination: '/services', permanent: true },

      // Old project renames
      { source: '/projects/customer-focused-culture-change-in-housing', destination: '/projects/housing-association-merger-integration', permanent: true },
      { source: '/projects/better-regulation-framework-for-political-parties', destination: '/projects/public-sector-service-design-case-study', permanent: true },
      { source: '/projects/educational-learning-design-tool', destination: '/projects/public-sector-change-management-case-study', permanent: true },
      { source: '/projects/social-enterprise-culture-change', destination: '/projects/social-purpose-strategy-case-study', permanent: true },
      { source: '/projects/developing-culture-for-a-charity-trust', destination: '/projects/charity-culture-change-case-study', permanent: true },

      // Ecosystem design sub-pages
      { source: '/ecosystem-design/organisational-assessments', destination: '/states-of-vitality', permanent: true },
      { source: '/ecosystem-design/co-design', destination: '/services', permanent: true },
      { source: '/ecosystem-design/:slug', destination: '/services', permanent: true },

      // Culture change sub-pages
      { source: '/culture-change/culture-change-programmes', destination: '/services/culture-change-consultancy/culture-change-programmes', permanent: true },
      { source: '/culture-change/culture-change-programmes/:path*', destination: '/services/culture-change-consultancy/culture-change-programmes', permanent: true },
      { source: '/culture-change/organisational-culture-vision', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/culture-change/organisational-culture-vision/:path*', destination: '/services/culture-change-consultancy', permanent: true },
      { source: '/culture-change/:slug', destination: '/services/culture-change-consultancy', permanent: true },

// Old assessments section → States of Vitality
{ source: '/assessments/:slug', destination: '/states-of-vitality', permanent: true },

{ source: '/articles/change-management-to-change-leadership', destination: '/articles/change-management-vs-change-leadership', permanent: true },


      // =========================================================
      // 404 LOG CLEANUP - 23 March 2026
      // =========================================================

      // Old taxonomy pagination (operational-effectiveness had paginated pages)
      { source: '/key-themes/operational-effectiveness/:path*', destination: '/services/operational-effectiveness-consultancy', permanent: true },

      // Catch-all for any other key-themes paths that slip through
      { source: '/key-themes/:path*', destination: '/emergent-framework', permanent: true },

      // Old capability page - Deeper Ground programme
      { source: '/developing-leaders/:path*', destination: '/develop/leadership-programme', permanent: true },

      // Old coaching service URL (crawler traffic)
      { source: '/purpose-led-leadership-coaching', destination: '/develop/executive-coaching', permanent: true },

      // Old systems thinking page
      { source: '/systems-thinking', destination: '/emergent-framework', permanent: true },
      { source: '/systems-thinking/', destination: '/emergent-framework', permanent: true },

    ]
  },
};

export default nextConfig;
