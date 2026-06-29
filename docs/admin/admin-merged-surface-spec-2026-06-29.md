# Admin merged-surface spec - Contacts × Engagement × Pipeline (29 Jun 2026)

**Status (29 Jun):** Phases **0-3 built & lint-clean in the working tree**, DB migration applied
live, **not yet committed/deployed**. Phase 0 (export), Phase 1 (score column + merged surface),
Phase 2 (Pipeline retired), Phase 3 (Engagement page → 301 to Contacts) all done. **Phase 4
(nurture) and the cohesive single-list rebuild remain.** James's sequencing call (29 Jun): finish the
retirements first (done), then the cohesive pass; where Phase 4 sits relative to that is open.

A key realisation landed during Phase 1 (see the chat of 29 Jun): the three layers — lens
(scored/algorithmic), segment chips (saved quick-filters), dropdowns (ad-hoc filter builder) — feel
like isolated modes rather than one drill-down because they are **mutually exclusive (two query
paths)**, not **stackable facets on one list**. The materialised `engagement_score` column is the
unlock: once score is a real column, the lens definitions can be expressed as composable filters on
the single browse query, collapsing to one cohesive surface (the Airtable/CRM "view" model). That is
the real substance of the cohesive pass (was "Phase 5 UX review").

**Context for this decision** lives in the chat thread of 29 Jun: deals moved out to Baserow
(`https://baserow.io/database/466656/table/1048724/2058332`); the slow-burn nurture layer stays in
/admin with Claude as the drafting/Gmail labour; and the realisation that Contacts, Engagement and
Pipeline are three rooms of one funnel that do not talk to each other.

---

## 1. What each section does today (exact)

### Contacts - `/admin/contacts` + `/api/admin/contacts`
The **action host**. Everything you can *do* to a person already lives here.

- **Data:** direct paginated `contacts` query (20/page, server-side `count: exact`). Returns raw
  columns + latest signal detail joined in.
- **Filters:** free-text search (name/email/org), tier, source, newsletter status, ZeroBounce
  deliverability, tag, sector, scope (in/out). Plus **working-segment chips** (All, UK, Needs
  company, Decision-makers, Active 30d, Enriched) fed by `/api/admin/contacts/segments`.
- **Sort:** name / email / org / tier / date, toggle asc-desc.
- **Per-row detail panel** (`ContactDetail`): full info; **Edit details** (name, email, org, role,
  seniority, location, country); downloaded items; tags; **sector + scope curation**; add tag; add
  note; **Log interaction** (email-sent / email-received / meeting / note / call → `interactions`
  table, `contact_id`); two-step **Delete**. Right column = **Signals + Interactions timeline**.
- **Bulk bar** (on selection): Enrich via Apollo, Add tag, Set sector, Out of scope / In scope.
- **Writes:** PATCH (allow-listed, secure), DELETE (FK-aware), POST (bulk sector/scope).
- **Does NOT have:** the engagement score, the weighted ranking, the funnel presets
  (`uk_target` etc.), the "reasons" chips.

### Engagement - `/admin/engagement` + `/api/admin/engagement`
The **read-mostly intelligence**. Everything that *ranks and explains* a person lives here, and
almost nothing you can do to them.

- **People tab:** server-side ranked via `get_engaged_contacts` RPC (weighted score; 9 weights,
  adjustable via sliders, saved to `localStorage`; returns top **150**, no pagination). Preset
  filters: Golden ticket, Engaged, Most engaged, UK-based, Recently active, Decision-makers, Repeat
  downloaders, Clicked, Enquired. **Plus deep-link-only presets** from the Overview funnel:
  `uk_subscribed`, `uk_engaged`, `uk_target`, `uk_notsub`, `uk_target_audience`, `uk_optedout`
  (shown as a clearable pill).
- **Each person row:** name, role, org, **"reasons" chips** (UK, decision-maker, N enquiries, N
  clicks, active 30/90d, downloads, opens, personal email), mailto, **big score number**.
- **Actions available:** select → **bulk-tag** (the tag then becomes a Contacts filter), Export CSV.
  That is the entire action set. **No detail panel, no edit, no log-interaction, no note, no delete.**
- **Organisations tab:** `get_engaged_organisations` (domain rollup: people, opens, clicks,
  decision-makers, score), expandable to the people at that domain, mailto, Export CSV.

### Pipeline - `/admin/pipeline` + `/api/admin/pipeline`
**Retiring.** Deals now live in Baserow. 16 orgs, kanban by status (new → researching → contacted →
in-conversation → opportunity → client), per-org detail (contacts matched by *name string*,
interactions by `organisation_id`), log interaction, status select. Carries two defects we will not
fix because we are deleting it: a mass-assignment PATCH hole and a `parked`-status row that
mis-renders into the "New" column.

### The Overview funnel (the glue, `app/admin/page.js`)
The two-arm UK-pool funnel deep-links **into Engagement**:
`base = '/admin/engagement?tab=people&filter=' + <preset>`. So every funnel box lands you on the
**read-only** view - you arrive at exactly the right people and can do nothing to them. That is the
core friction in one line.

---

## 2. The diagnosis

Contacts and Engagement are **two views of the same `contacts` table**, split down the middle:

| | Contacts | Engagement |
|---|---|---|
| Action toolkit (edit, log touch, note, delete, bulk) | ✅ | ✗ |
| Sector / scope curation, deliverability, raw browse | ✅ | ✗ |
| Pagination over the full ~5,200 | ✅ | ✗ (top-150) |
| Engagement **score** + ranking | ✗ | ✅ |
| Commercial **presets** (uk_target, target_audience…) | ✗ | ✅ |
| "Reasons" chips (why this person scores) | ✗ | ✅ |
| Funnel deep-link target | ✗ | ✅ |

The view that is already narrowed to the people who matter (Engagement) is the one you cannot act
from; the view with all the actions (Contacts) makes you re-find them by hand. **That is the whole
inefficiency.** The fix is not new capability - it is putting the two halves back together and
deleting the third room.

**Important shape fact that makes the merge easy:** the commercial presets resolve to *small* sets
(uk_target ≈ 27, target_audience ≈ 36). You rank-and-act on tens of people, not thousands. The big
paginated browse (all 5,200) is a *different job* (curation/admin) where the score barely matters.
So the two existing data paths are not a problem to reconcile away - they map cleanly onto two real
modes.

---

## 3. The merged surface

**One section. Contacts is the host** (it owns the expensive half - the action machinery).
Engagement's brains fold in as facets. Pipeline is deleted.

### 3.1 Two modes on one page, chosen by the active facet
- **Browse mode** (default, or any raw filter active): the existing paginated `contacts` query +
  full toolkit. Sort by name/date/tier. This is curation/admin over the whole base.
- **Targeted mode** (a commercial preset or "engaged" facet active): fetch the ranked set from
  `get_engaged_contacts` (already returns score + reasons), render those rows **with the same action
  toolkit** (detail panel, log touch, edit, tag, bulk). Small sets, so no pagination needed.

One row component, normalised to a common shape, so both data paths render identically. This is the
main implementation subtlety and it is contained.

### 3.2 What folds in
- **Commercial presets** become first-class filters on the surface: Golden, Engaged, the six
  `uk_*` funnel drill-downs. (They already exist in the engagement route - reuse it.)
- **Engagement score** becomes a column + a sort option (shown in targeted mode).
- **"Reasons" chips** render on the row in targeted mode (the "why" you currently lose in Contacts).
- **Organisations tab** survives as a secondary lens on the same surface (domain rollup is genuinely
  separate analytics; leave it as an "Orgs" tab). No per-contact actions needed there.
- **Adjustable scoring weights**: keep, but demote to an "Adjust scoring" disclosure - it is a power
  toy, not part of the day-to-day action loop.

### 3.3 The nurture layer lands here too (converges with this work)
The per-contact "Log interaction" already exists in the Contacts detail panel. The slow-burn nurture
layer needs only two small additions on top of the merged surface:
- a **`next_nudge_date`** field per contact (+ "set a nudge" in the detail panel), and
- a **"Due for a touch"** filter/sort (nudge date in the past, or warm-and-untouched-in-N-weeks).

So consolidation and the nurture layer are the *same* project, not two. Claude remains the
drafting/Gmail/summary labour on top (per the 29 Jun thread); /admin stays the system of record.

### 3.4 Overview rewiring
Change the funnel `base` in `app/admin/page.js` from `/admin/engagement?...filter=` to the unified
surface (`/admin/contacts?preset=`). Now the loop closes: see funnel → click a box → land on those
exact people → act, without leaving. The presets must be readable from the URL on the Contacts page
(it already honours `?tag=`; same pattern).

---

## 4. What gets deleted / rewired (concrete)

- **Delete:** `app/admin/pipeline/page.js`, `app/api/admin/pipeline/route.js`. Remove the Pipeline
  nav item (`AdminShell.js`). Decide fate of the `organisations` + org-linked `interactions` rows
  (export the 16, move Plunkett to Baserow, drop or keep-archived).
- **Fold in / retire the page:** `/admin/engagement` page is absorbed into Contacts. The
  **engagement route survives** (the unified surface calls `get_engaged_contacts` /
  `get_engaged_organisations`). Either delete the engagement page and 301 `/admin/engagement` →
  `/admin/contacts`, or keep it until the merge is proven.
- **Overview:** repoint the funnel `base`; remove the "active pipeline" count
  (`app/api/admin/overview/route.js:80`, `organisations.status != 'new'`) and the org status pull
  (`:76`) now that deals are in Baserow.
- **Nav:** Contacts (possibly renamed - see decisions), Engagement gone, Pipeline gone. Three nav
  items become one.

---

## 5. Decisions (LOCKED 29 Jun)

1. **Name:** keep **Contacts**.
2. **Score:** two-data-path, **and materialise a real `engagement_score` column as a priority** -
   so the canonical default score is filterable/sortable in the plain paginated query (browse mode
   gets it too), and targeted mode ranks off the same stored value. The adjustable-weights slider
   stays as a client-only exploration toy; the column is the canonical default-weighted score.
3. **Engagement page:** **301** `/admin/engagement` → `/admin/contacts` on merge. (Route survives;
   the merged surface still calls `get_engaged_contacts` / `get_engaged_organisations`.)
4. **Nurture fields:** **included** in this build - `next_nudge_date` + "Due for a touch".
5. **Old pipeline data:** export the 16 orgs (status, sector, notes, matched contacts, full
   interaction history) to a **downloadable Markdown file** James keeps and decides on. No
   auto-migration into Baserow or an archive table.

---

## 6. Build plan (decisions baked in)

Each phase is independently shippable and reversible. Order is dependency-driven.

### Phase 0 - safety export (do first, touches nothing)
- Generate `docs/admin/pipeline-export-2026-06-29.md`: the 16 orgs with status, sector, notes,
  matched contacts (by `organisation_name`), and full interaction history (type / summary /
  next_action / date). Pure read + write-a-doc. Makes the later Pipeline deletion safe and fulfils
  decision 5.

### Phase 1 - the score column (priority) + merge the read surface
- **Migration `_engagement-score-column`:** add `contacts.engagement_score numeric`; a
  `refresh_engagement_scores()` SQL function applying the DEFAULT weights from the engagement route
  (`wClick 8, wOpen 1, wDownload 1.5, wRecent30 20, wRecent90 10, wSignal 15, wDm 12, wOrg 6,
  wUk 18`, with the same 5/20/10 caps), bulk-updating the column. Run it once to backfill.
- **Keep it fresh:** daily recompute (mirror the existing daily-cron pattern) + call it after the
  Apollo enrich action so a freshly-enriched contact re-scores immediately.
- **Contacts route:** add `engagement_score` to the SELECT; allow `sort=engagement_score`; add the
  commercial presets as filters - reuse the engagement predicates (the six `uk_*`, Golden, Engaged).
  Targeted-mode (preset active) returns the ranked small set; browse-mode unchanged + score column.
- **Contacts page:** score column + sort; "reasons" chips on the row when a preset is active
  (derive from columns already returned); preset filter chips alongside the existing segment chips;
  honour `?preset=` from the URL (same pattern as the existing `?tag=`).
- **Overview:** repoint the funnel `base` from `/admin/engagement?...filter=` to
  `/admin/contacts?preset=`. Loop closes.

### Phase 2 - retire Pipeline
- Delete `app/admin/pipeline/page.js` + `app/api/admin/pipeline/route.js`; remove the nav item in
  `AdminShell.js`.
- Remove the Overview "active pipeline" count + org status pull (`app/api/admin/overview/route.js`
  ~`:76` and `:80`).
- Leave the `organisations` / org-linked `interactions` rows in the DB (already exported in Phase 0);
  James decides disposal separately.

### Phase 3 - retire the Engagement page
- 301 `/admin/engagement` → `/admin/contacts` (preserve `?tab=people&filter=*` → `?preset=*` mapping
  if any external bookmarks exist - internal only, so a flat redirect is fine). Remove the nav item.
- The engagement **route stays** (the merged surface and the Orgs lens still call it).

### Phase 4 - nurture layer
- **Migration `_nurture-fields`:** `contacts.next_nudge_date date`.
- **Detail panel:** "Set a nudge" date control next to Log interaction.
- **Surface:** a "Due for a touch" preset (nudge date ≤ today, or warm + fit + no interaction in
  N weeks) and a sort by nudge date.
- **Optional heartbeat:** a weekly scheduled Claude task that surfaces who is due, with the signal
  that makes each worth a note (per the 29 Jun nurture thread). Claude stays the drafting/Gmail
  labour; /admin stays the system of record.

**Phase 1 alone closes the funnel → action loop**, which is most of the felt value.

### Phase 5 (deferred by design) - Contacts UX/IA review
Once the plumbing lands, Contacts becomes the **primary source of truth and key working dashboard**.
James has flagged (29 Jun) that it will need a **fresh UX/IA review at that point** - layout, the
order and prominence of the facets, how browse-mode vs targeted-mode present, the detail panel, and
the nurture loop - reviewed as a working surface rather than bolted on. Deliberately held until
Phases 1-4 are in place so the review reacts to the real thing, not a sketch.
</content>
</invoke>
