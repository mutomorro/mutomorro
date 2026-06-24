# Sidebar CTA system - design spec

**Created:** 24 June 2026
**Status:** Design spec, pre-build. Directions below are agreed with James; the build brief follows from this.
**Origin:** Started as the "site-wide States of Vitality (SoV) sidebar CTA" investigation. That request surfaced a deeper inconsistency in how the right-hand sidebar is built, and James chose to standardise the system rather than patch a single card in.

---

## 1. Why this exists

We wanted one States of Vitality call-to-action to appear in the right-hand sidebar across the site, above each page's existing CTA, without re-editing every page by hand.

Investigating how to do that cleanly showed the sidebar is fed by **three mechanisms that grew up separately**:

1. the page's `theme` reference, which draws the dark "service" card;
2. `pageCallout` documents, which draw the callout card(s);
3. hardcoded props on the service sub-page template, which draw the enquiry card and the SoV nudge.

Every inconsistency we hit is a symptom of that split: sub-pages bypass the callout system; the "secondary card" pattern only exists on sub-pages; the "only one sticky card" rule is implicit, not chosen; and the callout `displayOrder` numbers look arbitrary because nothing ever defined what they mean.

Rather than add a fourth special case for SoV, this spec sets a single, consistent model for the sidebar and folds SoV in as one ordinary instance of it.

---

## 2. Decisions taken (locked with James)

1. **Scope: the six sidebar templates only.** The sidebar work applies to the page types that actually have a right sidebar: articles, tools, case studies (`projects`), develop, training, and service sub-pages.
2. **`pageCallout` stays dual-surface.** It is not a sidebar-only feature. A `Placement` field switches each callout between a full-width band in the page body, a sidebar card, or both. The full-width band is in live use on pages that have **no sidebar** (parent service pages and sectors), e.g. the "Competence and Conduct" toolkit band. That band is **out of scope** here and must not be broken.
3. **Maximum two sticky cards per sidebar**, subject to the Phase 0 audit below.
4. **Option C - split by role.** A page's primary action is page-owned; promotional callouts are central. See the model.
5. **The primary is derived, not hand-edited.** A page's main CTA rarely changes and is derivable by convention, with an optional per-page override for exceptions.

---

## 3. The target model

### 3.1 Two kinds of sidebar CTA

There are two genuinely different things in the sidebar, and they belong in different places:

- **Primary action (page-owned).** The single main action for *this* page. Always present. Conceptually part of the page. Examples: a develop page's "make an enquiry"; a tool's "explore the relevant service".
- **Promotional callout (central).** Something we choose to promote across a set of pages, curated centrally, and which comes and goes. Examples: the SoV nudge everywhere; the tool-to-training signposts; the case-study-to-enquiry broadcast.

**The rule, in one line:** *is it the page's main action, or a promotion?* Main action becomes the **primary** (derived or overridden, page-owned). A promotion becomes a **callout** (central `pageCallout`), whether it targets one page or many.

Note the rule is about **role, not cardinality.** The tool-to-training signposts each target a single tool, but they are promotions, so they stay callouts.

### 3.2 The primary CTA - derived by convention, with optional override

The primary is set by a per-page-type convention and needs no editing in the normal case:

| Page type | Derived primary |
|---|---|
| Tools | the page's `theme` anchor (its relevant service / training / develop page) |
| Articles | the page's `theme` anchor (service) |
| Case studies (`projects`) | enquiry, or `theme` anchor - see open question |
| Develop | `/enquiry?service=<slug>` |
| Training | `/enquiry?service=<slug>` |
| Service sub-pages | `/enquiry?service=<parent-slug>` (already held on the sub-page document) |

For the rare exception, each sidebar document type gets an **optional primary-CTA override** (heading / label / url). Left blank, the page inherits the convention. This keeps editing self-contained without building a full CTA editor on every document.

**Consequence for the data:** the order-1 "Enquiry - X" sidebar callouts on develop and training pages, and the sub-page hardcoded enquiry card, are all **misplaced primaries**. Once the derived primary lands, they are retired. This is what slims `pageCallout` down to a purely promotional tool.

### 3.3 Promotional callouts - the streamlined `pageCallout`

- **Replace the magic `displayOrder` with a `role` field**: `Secondary` (eligible for a sticky slot) or `In-flow` (scrolls with the body). "Primary" is no longer a callout role - primaries live on the page now.
- **`displayOrder` stays only as a tie-breaker within a role**, default 10. No more guessing whether to type 1, 5 or 20.
- **`Placement` stays** (full-width band remains valid for promotional bands; unchanged).
- **SoV becomes one `Secondary` callout**, placement sidebar, broadcast to the relevant page types, link `/states-of-vitality` (the Mutomorro page, no trailing slash). It is then editable with no deploy.

### 3.4 Sidebar slot structure (target)

Top to bottom, with sticky behaviour made explicit in the component:

1. **Primary CTA** - sticky (slot 1).
2. **Secondary promotional card** - sticky if it fits (slot 2). SoV lands here.
3. **In-flow callouts** - scroll with the body.
4. **Related lists, newsletter, dimension pills** - scroll (unchanged).

**Laptop-fit rule:** at most two sticky cards. The component enforces it - if more than two cards would otherwise be sticky, the extras demote to in-flow rather than overflowing the viewport. The current sticky stack is height-measured and pinned with `top: calc(100vh - height - gap)`, so an unbounded stack clips above the fold on smaller screens. The cap removes that risk by design.

---

## 4. Phase 0 - sticky-element audit (read-only, do first)

Before enforcing "max two sticky," catalogue what each template already forces into the sticky region, because some of it is hardcoded:

For each of the six templates, record:
- what currently sits in the sticky stack (service card, enquiry card, secondary/SoV card, and the tool floating download bar, which widens the gap);
- whether each element is hardcoded in the template or data-driven;
- the worst-case card count and height;
- whether two cards fit on a standard laptop viewport with the floating bar present.

Output: a per-template table plus the confirmed enforcement rule. This de-risks every later phase and is itself another inconsistency worth closing now.

### Phase 0 results (24 June 2026)

Audited all six templates against `ContentSidebar`, the CSS in `app/globals.css`, and the live callout data.

| Template | Enquiry-style | Floating bar | Primary today | Sticky stack (top to bottom) | Worst-case sticky cards |
|---|---|---|---|---|---|
| Articles | no | no | service card (`theme`) | [callout?], service card | 1 (2 on the one MVV-signposted article) |
| Case studies | no | no | service card **and** enquiry callout | enquiry callout, service card | 2 (already at the cap) |
| Tools | no | yes if toolkit | service card (`theme`) | [training signpost?], service card, + 56px floating bar | 2 + bar (tightest) |
| Develop | yes (service = link) | no | enquiry callout (order 1) | enquiry feature card, service link | 1 card + link |
| Training | yes (service = link) | no | enquiry callout (order 5) | enquiry feature card, service link | 1 card + link |
| Sub-pages | yes (service = link) | no | hardcoded enquiry card (doc fields) | enquiry card, [SoV card on 2 pages], service link | 2 cards + link (the 2 SoV pages) |

Key facts:
- The primary CTA renders **twice** on non-enquiry pages: a scroll-away copy in `content-sidebar__top-cta`, and a pinned copy in the sticky stack (`content-sidebar__sticky`, `position: sticky`). On enquiry pages the top copy is omitted and the sticky service is a quiet link, not a card.
- The primary is delivered **three different ways** - service card (`theme`) / enquiry callout / hardcoded prop - which is the core inconsistency this work removes.
- Two sticky cards already ship today (every case study; the two Assess sub-pages), so the "max two" cap matches current reality rather than tightening it.
- Tightest surface is **tools with a toolkit**: service card + training signpost + the 56px floating download bar (gap already widened to 80px). A third sticky card would clip above the fold on a laptop.

Implication for the SoV card under the max-two cap:
- There is room for SoV as a **sticky** Secondary on develop, training, sub-pages, and most articles (one card plus a service link, or a lone service card).
- On **case studies** and **tools-with-toolkit** both sticky slots are already taken, so SoV must drop to **in-flow** there - unless a slot is freed (see the case-study primary decision). The component's max-two enforcement handles this automatically via a priority order, with no per-page editing.

---

## 5. Phased build plan

Each phase ships independently and leaves the site working.

- **Phase 1 - model and schema.** Add the `role` field to `pageCallout`; add the optional primary-CTA override to the six sidebar document types; rebuild the slot logic in `ContentSidebar` (explicit slots, derived primary per type, enforced max-two-sticky).
- **Phase 2 - migrate sub-pages onto the shared model.** Retire the hardcoded `enquiryCard` / `secondaryCard` props, the `SOV_CARD` constant, and the `STATES_OF_VITALITY_URL` hardcode in `app/services/[slug]/[subpage]/page.js`. Sub-pages then behave like every other sidebar page.
- **Phase 3 - migrate the data.** Classify the existing callouts (see mapping), set `role`, and normalise `displayOrder`. Idempotent script with stable `_key`s, matching the existing content-patch script convention in `scripts/`.
- **Phase 4 - add SoV.** Create the single broadcast `Secondary` callout to `/states-of-vitality`.

---

## 6. Data migration mapping (proposed, finalise in Phase 3)

The audit found 71 `pageCallout` documents. Proposed categories:

- **Misplaced primaries - retire from callouts:** the ~13 "Enquiry - X" sidebar callouts on develop and training pages. Their job becomes the derived primary.
- **Promotional secondaries - keep, set `role`:** the ~50 tool-to-training signposts (`order 20`); the "Assess -> diagnostic" signposts; the develop cross-links ("Signpost - X").
- **Broadcasts - keep:** the case-study-to-enquiry broadcast and the housing variant. Decision needed on whether these become the case-study derived primary instead (see open questions).
- **Full-width-only - leave untouched:** callouts with `Placement` page/both that exist for the in-body band (e.g. the Competence and Conduct toolkit). The sidebar work does not touch their band behaviour.

Exact per-document classification is a scripted Phase 3 task, not a hand edit.

---

## 7. Open questions for the build brief

1. **Case studies primary:** derive an enquiry primary for the `caseStudies` type, or keep the existing broadcast callout as their primary? Both are clean; it is a choice about where that content lives.
2. **Override field shape:** a single override object vs flat fields, and whether to add it to all six document types or only where a real override is plausible.
3. **SoV destination and the existing external nudge:** confirm the new card points at `/states-of-vitality` (Mutomorro). The current sub-page SoV card points at the external `statesofvitality.com`. Decide whether that external nudge is retired in favour of the internal page, kept as well, or kept only on sub-pages.
4. **Targeting for the SoV broadcast:** which of the six types carry it, and any pages to exclude (e.g. a page whose own primary already points at SoV).

---

## 8. Out of scope (to prevent sprawl)

- Giving a sidebar to pages that do not have one (home, parent service pages, sectors).
- Any redesign of the full-width callout band.
- Newsletter signup and related-list logic.
- Visual restyling beyond what the two-sticky fit requires.

---

## 9. Schema and wiki notes

- **New:** `role` field on `pageCallout`; optional primary-CTA override on the six sidebar document types.
- **Retired:** the per-page enquiry sidebar callouts; the sub-page `SOV_CARD` constant and `STATES_OF_VITALITY_URL` hardcode.
- **Document in the wiki:** the "primary is page-owned and derived; callout is promotional and central" rule; the dual-surface `Placement` behaviour; the max-two-sticky rule; and the fact that there are two SoV destinations (`/states-of-vitality` on Mutomorro vs the external `statesofvitality.com`), so future work points at the right one.

---

## 10. Confirmed model and decisions (24 June 2026)

Walked through the Phase 0 audit and two sketches with James; the model below is confirmed.

**The model**
- Every sidebar page has exactly one page-owned **primary CTA**, pinned at the **bottom** of the sidebar. Derived by convention - tools and articles point at the related service; develop, training, case studies and sub-pages point at enquiry - with an optional per-page override for exceptions.
- Everything else in the sidebar is a promotional **Page Callout** (central), sitting **above** the primary.
- **At most two cards pin** at once: the primary plus one promo. Further promos scroll with the page.
- When more than one promo competes for the single pinned slot, **Display Order ranks them** - lowest number wins the slot, the rest scroll. This is the one clear job the number now does.
- The "explore the related service" link is **dropped on enquiry pages**. The related service appears only where it is the primary (tools and articles).

**Decisions (answering section 7)**
1. **Case-study primary:** derive enquiry as the primary; no separate service link (consistent with the drop rule); retire the case-study enquiry broadcast callout, since it becomes the derived primary.
2. **Override:** one optional `sidebarPrimary` object (heading / label / url) on the document types whose primary is derived. Blank inherits the convention.
3. **External SoV nudge:** the new card points at `/states-of-vitality`; retire the external `statesofvitality.com` sub-page nudge. Revisit at Phase 4 only if the product site should still be promoted from the two Assess pages.
4. **SoV:** one broadcast Secondary callout to `/states-of-vitality`; the max-two cap auto-places it - pinned where there is room, scrolling where the slot is taken (e.g. a tool that already has a training signpost).

**Build note:** Phase 1 adds a `role` field (Secondary / In-flow) to `pageCallout`; Display Order stays as the tie-breaker that ranks Secondary callouts for the single pinned slot. Work is on branch `sidebar-cta-system`.

---

## 11. Build log

**Phase 1 core - built and verified 24 June 2026 (branch `sidebar-cta-system`, not committed).**

Changed:
- `components/ContentSidebar.js` - rebuilt: one page-owned primary pinned at the bottom; one Secondary promo pins above it, the rest scroll (role-aware; In-flow always scrolls); a promo pointing where the primary points is suppressed (enquiry pages never show two enquiry links); the scroll-away top duplicate is removed; the enquiry-page service link is dropped.
- `sanity/schemas/pageCallout.js` - added the `role` field (Secondary / In-flow).
- `sanity/client.js` - `getSidebarCallouts` now selects `role`.
- `app/services/[slug]/[subpage]/page.js` - sub-pages pass `primaryOverride` from their own CTA fields; the hardcoded external-SoV card and its constants are removed.
- `app/develop/[slug]/page.js`, `app/training/[slug]/page.js` - dropped the now-unused `enquiryPrimary` prop.
- Tools, articles and case studies needed no template change - the component derives their primary from props they already pass.

Verified against the running dev server (read-only): tools show the service-card primary with the training signpost pinned above; develop and case studies show a single enquiry primary (copy preserved from the existing enquiry callout, no doubling) with the service card dropped; sub-pages show the CTA-field enquiry primary with the external SoV card gone from the sidebar. No runtime errors; eslint clean.

Works with the current callout data as-is - no Sanity changes were needed for correctness. The enquiry callouts now act as the source of each enquiry primary's copy.

**Remaining**
- Optional: a `sidebarPrimary` override field on tool/article/project/develop/training doc types (sub-pages already override via their CTA fields). Only needed where a page wants to override the derived primary.
- Phase 3 (cleanup, after deploy): set explicit `role` values on the callouts; optionally move enquiry-callout copy into page overrides and retire those callout docs.
- Phase 4 (the original goal, after deploy): create the SoV broadcast Secondary callout to `/states-of-vitality`. Must follow the deploy - Sanity data is shared, so creating it sooner would surface it on the live (old) sidebar uncontrolled.
