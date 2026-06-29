# Cohesive Contacts surface - build spec (29 Jun 2026)

**Status:** for-review, pre-build. The successor to the merged-surface work (Phases 0-3, shipped
`61a6111`). This is the "cohesive pass" + Phase 4 (nurture) folded in.

## 1. North star

Today the Contacts surface has **two modes** (browse = paginated raw filters; targeted = ranked
RPC), and they're mutually exclusive - pick a lens and the filters vanish. That seam is why the three
layers (lens / segment chips / dropdowns) feel like separate tools.

The goal is the **Airtable/CRM "view" model**: **one list**, where every control is a **stackable
facet** that narrows the same rows, the **columns are constant**, **sort always works**, and the
"lens" is just a **named starting filter-set you can then refine**. One query path, not two.

```
Big bucket (all contacts)
   │  ← facets stack (AND): UK · decision-maker · subscribed · engaged · sector · tier ·
   │     deliverability · source · tag · scope · score-range · due-for-a-touch · search
   ▼
The rows you're looking at  (always: same columns, score, reasons, sortable, paginated)
   │
   └─ a "lens" (Golden / Target / Target Audience …) = a preset that POPULATES those facets,
      which you then add to or peel back. Not a separate mode.
```

## 2. The core move: collapse to one query path

The blocker to one query path is that the commercial presets use a computed predicate the plain
`contacts` query can't express: **engaged** = `clicks>0 OR downloaded-in-90d OR high-strength-signals>0`
(the signal count needs the `signals` table). Everything else is already a plain column filter:

| Facet | Already a column filter? |
|---|---|
| UK | yes - `.or(country…, signup_email.ilike %.uk)` (the existing `segment=uk`) |
| Decision-maker | yes - `.in('seniority', [...])` (matches `is_decision_maker_seniority`) |
| Subscribed | yes - `.in('newsletter_status', ['active','confirmed'])` |
| Sector / tier / deliverability / source / tag / scope | yes - already in the browse query |
| Score range / sort | yes - `engagement_score` column (shipped Phase 1) |
| **Engaged** | **no - needs the signal count** |

So the **only** new materialisation needed is the signal count. Add **one column**:

- `contacts.high_signals_count int` - set by the existing `refresh_engagement_scores()` (rename →
  `refresh_contact_scoring()`), refreshed in the same daily cron + on-enrich path, indexed.

Then **engaged** becomes a plain `.or('newsletter_clicks.gt.0,last_download_date.gte.<90d>,high_signals_count.gt.0')`,
**enquirers** becomes `.gt('high_signals_count', 0)`, and **every facet is now a PostgREST filter on
one paginated, sortable query.** The two-mode split, the targeted-mode RPC call for the list, and the
client-side-sort workaround all disappear.

> Decision A — materialisation depth. Minimal (recommended): materialise only `high_signals_count`;
> derive UK / decision-maker / subscribed query-time (deterministic from existing columns, zero
> staleness). Alternative: materialise all four ICP flags as booleans for uniform `.eq(flag,true)`
> filters - simpler query strings, but more columns to keep fresh. *Recommend minimal.*

## 3. Data layer (migration `_contact-scoring-flags`)

- `ALTER TABLE contacts ADD COLUMN high_signals_count int;`
- Extend the scoring function to also set it (one pass over the same `sig` CTE it already builds);
  keep the score formula byte-identical. Rename to `refresh_contact_scoring(p_ids)`, keep a thin
  `refresh_engagement_scores` alias so the cron/enrich callers don't break mid-migration.
- Index `high_signals_count`. Backfill. Service-role only (same lockdown as the score).
- Phase 4: `ALTER TABLE contacts ADD COLUMN next_nudge_date date;` (no compute - user-set).

## 4. The unified route (`/api/admin/contacts` GET)

One code path. Accept every facet as an independent query param (all optional, all AND-composed):
`uk, dm, subscribed, engaged, enquired, sector, tier, zb, source, tag, scope, score_min, score_max,
due (nudge ≤ today), search`, plus `sort` (any column incl `engagement_score`, default
`-engagement_score`) and `page`. Build one `contacts` query, apply each present facet as a filter,
order, paginate, return rows + total + the active-facet echo. **Retire** the targeted-mode branch and
the `get_engaged_contacts` call from this route.

**Lenses are facet-sets, resolved in the UI, not the route.** The route only knows facets. A lens
just sets several facet params at once. Mapping (the funnel `?preset=` contract is preserved by
translating preset → facet-set on load):

| Lens / preset | Facet-set |
|---|---|
| Golden | `uk + dm` |
| Engaged (warm) | `uk + dm + engaged` |
| Target | `uk + dm + subscribed + engaged` |
| Target Audience | `uk + dm + not-subscribed + contactable` |
| UK pool / Subscribed / Not-subscribed / Opted-out | the matching subset |

Counts stay consistent with the Overview funnel because both now express the *same predicates* (worth
a verify pass: list totals vs `get_overview_pool_stats`).

## 5. The surface (`/admin/contacts` page)

- **One list, constant columns:** select · Name (+role/level) · Org (+sector) · Email · Tier ·
  **Score** · last activity · NL status. Reasons chips render **always** (derived from the row's own
  columns, now incl `high_signals_count`), not only under a lens.
- **Facet bar** replaces the mode split: lens presets (populate facets) + the working facets as
  chips/toggles/selects, all live together. Picking a lens fills the facets; you then add a sector,
  peel off "subscribed", etc. - it all stacks.
- **Active-filter pill stack** (the "view you're looking at"): every applied facet shows as a
  removable pill, always visible, so the full query is legible and adjustable - the thing that makes
  it feel like one cohesive surface instead of modes.
- **Sort** on any column, server-side, always (no more inert headers / client-sort hack).
- Everything paginated server-side (uniform for 27 or 5,200).
- Bulk bar (enrich / tag / sector / scope) unchanged; the detail panel unchanged.

## 6. Phase 4 - nurture, as a facet

- `next_nudge_date` column (§3). Detail panel gains a **"Set a nudge"** date control next to Log
  interaction.
- **"Due for a touch"** is just another facet: `due=1` → `next_nudge_date ≤ today` (optionally OR
  warm-and-untouched-N-weeks). Sortable by nudge date.
- Optional later: a weekly scheduled Claude run that surfaces who's due with the signal that makes
  each worth a note (per the 29 Jun nurture thread). /admin stays system of record; Claude = labour.

## 7. What gets retired / simplified

- The browse-vs-targeted split, the targeted-mode mapping in the contacts route, the client-side
  `sortRows` hack, the `targeted` state.
- `get_engaged_contacts` is no longer the **list** source. Keep it only if still wanted for the
  **Orgs** rollup path; the **Orgs lens** (`get_engaged_organisations`) stays as a separate analytic
  view/tab (domain rollup has no per-contact equivalent).
- The adjustable **weights slider**: with a materialised score it can't re-rank the paginated server
  query without a recompute. *Decision B:* drop it from the surface (the column is the canonical
  default-weighted score), or move it to a separate "scoring settings" that triggers a recompute.
  *Recommend drop.*
- `/api/admin/engagement` POST (bulk-tag) **stays** - the surface still uses it.

## 8. Build phases (within the cohesive pass)

- **CP-1** migration: `high_signals_count` + extend/rename the scoring fn + index + backfill (+ the
  `next_nudge_date` column).
- **CP-2** unified route: facet params → one composable query; retire the targeted branch. Verify
  list totals match the funnel.
- **CP-3** unified page: one list, constant columns, always-on reasons, the facet bar + active-filter
  pill stack, server sort on every column.
- **CP-4** nurture facet: nudge date control + "Due for a touch".
- **CP-5** cleanup: delete the dead two-mode code, weights slider decision, the Contacts UX polish
  that was deferred here (KPI-row asymmetry on the Overview, etc.).

Each phase ships independently; CP-1+CP-2 are invisible until CP-3 wires the UI.

## 9. Decisions for James

- **A. Materialisation depth** - minimal (`high_signals_count` only, recommended) vs all-flags.
- **B. Weights slider** - drop (recommended) vs keep as separate scoring-settings.
- **C. Lens behaviour** - "populate-and-refine" (recommended - the cohesion point) vs locked named
  views.
- **D. "Due for a touch" definition** - nudge-date-only, or also "warm + fit + no touch in N weeks".
- **E. Pagination** - uniform server-side (recommended) vs keep small sets fully client-loaded.

## 10. Risks

- **Predicate drift:** the facet filters must match `get_overview_pool_stats` exactly or the funnel
  and the list disagree. Mitigate with a verify pass (CP-2) comparing counts.
- **Staleness:** `high_signals_count` (and the score) are daily snapshots; a brand-new high-signal
  contact isn't "engaged" in the list until the next refresh or an enrich. Acceptable; a manual
  "refresh scoring" button is a cheap safety valve.
- **Scope:** CP-3 is a real rebuild of the surface's controls. It's contained (one page, one route),
  but it's the biggest single piece since Phase 1.
