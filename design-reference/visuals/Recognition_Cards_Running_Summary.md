# Recognition Card Animations - Running Summary

**Created:** 8 March 2026
**Updated:** 11 March 2026, 09:15 GMT
**Session:** Batch build of all 52 recognition card animations for services 2-14. Rebuilt 11 March for 16:9 landscape format.

---

## What we built

52 unique HTML canvas animations for the "Why it matters" recognition card sections across 13 service pages (Culture Change cards were already done in an earlier session).

Each card is a standalone HTML file with:
- Canvas animation matching the creative brief from `Service_Page_Visual_Briefs_All_14.md`
- Brand gradient colours (#80388F, #9B51E0, #FF4279, #FFA200)
- Warm background (#FAF6F1)
- `prefers-reduced-motion` support
- Responsive sizing via parent container detection

---

## Files by service

| Service | Card 1 | Card 2 | Card 3 | Card 4 |
|---------|--------|--------|--------|--------|
| Post-Merger Integration | post-merger-1-one-team | post-merger-2-best-of-both | post-merger-3-services-better | post-merger-4-people-stay |
| Change Management | change-mgmt-1-people-carry | change-mgmt-2-resistance-insight | change-mgmt-3-plan-adapts | change-mgmt-4-capability-grows |
| Employee Experience | employee-exp-1-whole-selves | employee-exp-2-development-real | employee-exp-3-good-days | employee-exp-4-recommend |
| Org Restructuring | restructuring-1-roles-sense | restructuring-2-knowledge-survives | restructuring-3-teams-rhythm | restructuring-4-informal-networks |
| Operational Effectiveness | op-effectiveness-1-work-flows | op-effectiveness-2-focus-matters | op-effectiveness-3-problems-solved | op-effectiveness-4-improvement-habit |
| Organisational Design | org-design-1-structure-serves | org-design-2-collaboration-natural | org-design-3-enables-not-constrains | org-design-4-redesign-itself |
| Organisational Purpose | org-purpose-1-monday-morning | org-purpose-2-decisions-compass | org-purpose-3-explain-why-here | org-purpose-4-deepens-not-fades |
| Strategic Alignment | strategic-alignment-1-same-direction | strategic-alignment-2-felt-not-filed | strategic-alignment-3-priorities-clear | strategic-alignment-4-moves-as-one |
| Capacity Building | capacity-1-people-grow | capacity-2-teams-lift | capacity-3-learning-in-work | capacity-4-builds-itself |
| Org Development | org-dev-1-improvements-connect | org-dev-2-keeps-getting-better | org-dev-3-practice-not-project | org-dev-4-less-firefighting |
| Customer Experience | customer-exp-1-starts-inside | customer-exp-2-frontline-equipped | customer-exp-3-complaints-reach-cause | customer-exp-4-designed-not-accidental |
| Service Design | service-design-1-shaped-by-users | service-design-2-journey-system-together | service-design-3-tested-not-assumed | service-design-4-good-design-spreads |
| Scaling Operations | scaling-1-no-growing-pains | scaling-2-culture-deepens | scaling-3-core-protected | scaling-4-next-stage-ready |

---

## Animation techniques used

Each animation is genuinely unique. Here's a summary of the visual approaches:

- **Particle mixing** (Post-Merger: One team) - Two colour palettes gradually blending
- **Staggered arrival** (Post-Merger: Best of both) - Points finding their settled positions at different speeds
- **Stream merging** (Post-Merger: Services better) - Two flow systems converging
- **Flickering to steady** (Post-Merger: People stay) - Unstable lights becoming stable
- **Carried lights** (Change Mgmt: People carry) - Dots each holding their own light, moving at own pace
- **Colour transformation** (Change Mgmt: Resistance insight) - Red pressure points becoming golden understanding
- **Adaptive path** (Change Mgmt: Plan adapts) - Path flowing around appearing obstacles
- **Growing rings** (Change Mgmt: Capability grows) - Concentric rings expanding with node accretion
- **Unique shapes** (Employee Exp: Whole selves) - Differently-shaped particles in shared space
- **Root and stem growth** (Employee Exp: Development real) - Seeds growing both down and up
- **Warm landscape** (Employee Exp: Good days) - Hills with predominantly warm light patches
- **Emanating ripples** (Employee Exp: Recommend) - Waves radiating outward from centre
- **Settling puzzle** (Restructuring: Roles sense) - Organic shapes finding their positions
- **Knowledge threads** (Restructuring: Knowledge survives) - Luminous threads with travelling particles
- **Synchronising orbits** (Restructuring: Teams rhythm) - Groups of particles aligning their speeds
- **Persistent web** (Restructuring: Informal networks) - Connections maintained through structural shift
- **Channel flow** (Op Effectiveness: Work flows) - Smooth particles through a flowing channel
- **Focus dimming** (Op Effectiveness: Focus matters) - Peripheral lights dimming, central brightening
- **Knot untangling** (Op Effectiveness: Problems solved) - Knots in a line releasing over time
- **Tightening spiral** (Op Effectiveness: Improvement habit) - Spiral refining with each rotation
- **Flexing frame** (Org Design: Structure serves) - Framework adapting to activity within it
- **Cluster meeting** (Org Design: Collaboration natural) - Particles from different groups connecting at boundaries
- **Guided channels** (Org Design: Enables not constrains) - Soft guide walls with free-flowing particles
- **Self-adjusting nodes** (Org Design: Redesign itself) - Network making small autonomous adjustments
- **Everyday warmth** (Org Purpose: Monday morning) - Steady light visible among daily task shapes
- **Orienting arrows** (Org Purpose: Decisions compass) - Arrows aligning toward a shared point
- **Connected threads** (Org Purpose: Explain why here) - Individual lights each threaded to centre
- **Deepening rings** (Org Purpose: Deepens not fades) - Rings growing richer in colour over time
- **Flocking alignment** (Strategic: Same direction) - Scattered particles gaining shared momentum
- **Golden thread** (Strategic: Felt not filed) - Visible thread weaving through varied shapes
- **Layered arrows** (Strategic: Priorities clear) - Multiple organisational layers all moving same direction
- **Murmuration** (Strategic: Moves as one) - Full boid-like flocking algorithm
- **Growing stems** (Capacity: People grow) - Upward organic forms supported by base structure
- **Lift network** (Capacity: Teams lift) - Connected nodes where one rising pulls others up
- **Woven threads** (Capacity: Learning in work) - Two-colour threads inseparably interwoven
- **Layer accretion** (Capacity: Builds itself) - Form adding layers from within
- **Overlapping ripples** (Org Dev: Improvements connect) - Multiple ripple sources creating interference patterns
- **Growth spiral** (Org Dev: Keeps getting better) - Expanding spiral viewed from above
- **Breathing pulse** (Org Dev: Practice not project) - Gentle rhythmic circles at different phases
- **Settling sparks** (Org Dev: Less firefighting) - Chaotic particles finding intentional positions
- **Inside-out glow** (Customer Exp: Starts inside) - Inner nodes driving brightness of outer ring
- **Centre-to-edge flow** (Customer Exp: Frontline equipped) - Resources flowing outward from centre
- **Inward signal** (Customer Exp: Complaints reach cause) - Signals travelling from edge to centre
- **Golden spiral arrangement** (Customer Exp: Designed not accidental) - Chaos settling into deliberate pattern
- **Dual shaping** (Service Design: Shaped by users) - Two sides moulding a shared form
- **Overlaid views** (Service Design: Journey and system) - Path and network visible together
- **Deformation testing** (Service Design: Tested not assumed) - Form being squeezed and adjusted
- **Radiating patterns** (Service Design: Good design spreads) - Centre pattern inspiring similar edge patterns
- **Healthy expansion** (Scaling: No growing pains) - Smooth organic form growing without cracks
- **Colour enrichment** (Scaling: Culture deepens) - Form getting richer colour as it expands
- **Stable core** (Scaling: Core protected) - Warm centre persisting through outer expansion
- **Warm doorway** (Scaling: Next stage ready) - Glowing doorway with clear space beyond

---

## What's next

These 52 cards plus the 4 existing Culture Change cards = 56 total recognition card animations.

Still remaining from the visual briefs:
- ~~13 context/proposition diagram images (static, Python/pycairo)~~ DONE - 14 proposition diagrams built as static HTML/CSS at 1920x1080 (bold shapes, short labels, gradient + constellation backgrounds)
- ~~52 stage infographic images (static, HTML/CSS)~~ DONE - 52 stage infographics rebuilt with bold treatment (visible glows, thick borders, denser network bg, inner detail dots, warm gradient). 11 March 2026.
- ~~1 ecosystem visual component (parameterised centre label)~~ DONE

**ALL VISUAL ASSETS COMPLETE.** 137 total files across 5 asset types. Tweaks pending on individual files.

---

## Review notes

Each card should be opened in a browser and reviewed for:
1. Does the animation match the brief's intent?
2. Is it evocative rather than explanatory?
3. Does it feel organic and on-brand?
4. Is the colour palette correct?
5. Is reduced-motion respected?
6. Does it look good at card-sized dimensions (not just fullscreen)?

Cards may need adjustment once placed in their actual page context - what looks right fullscreen may need tuning at card size.

### Known amendments
- **scaling-4-next-stage-ready** - DONE. Reworked from doorway frame to path with organic tree forms. Now shows a warm path heading into the distance with trees either side.
- All 52 cards rebuilt for 16:9 landscape format (11 March 2026). Key changes: circular elements sized off H not W, horizontal spread increased, vertical compositions adjusted.

---

*Running summary for recognition card animation batch. 8 March 2026.*
