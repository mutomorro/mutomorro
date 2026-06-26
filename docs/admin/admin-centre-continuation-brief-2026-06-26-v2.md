# Admin Command Centre — continuation brief / next-chat kick-off (26 Jun 2026, v2)

**Read this first.** This supersedes `admin-centre-continuation-brief-2026-06-26.md` (the morning
brief — still valid for the earlier journey) by folding in the **afternoon session**: the UK-pool
branching funnel, the custom sector taxonomy, contact edit/delete, and enquiry triage.

Everything below is **committed to `main`** (latest commit `98b7efd`; the big one is `81c0fee`) and all
DB migrations are **applied to the live Supabase project** (`hzgnlxxnpvidnntiilcf`).

Detailed change-log for the latest work: [`docs/admin/admin-session-2026-06-26-funnel-sector-triage.md`](admin-session-2026-06-26-funnel-sector-triage.md).

---

## 1. Project context (unchanged)
- **Project:** Mutomorro — internal admin "Command Centre" (Next.js 16, app router) for a **UK solo
  change-management consultancy** (James Freeman-Gray, james@mutomorro.com).
- **DB:** Supabase `hzgnlxxnpvidnntiilcf`, `public` schema. Use the Supabase MCP `execute_sql` /
  `apply_migration`. RPCs are `SECURITY DEFINER`, service-role only.
- **Admin auth:** password-gated via `middleware.js`. Local smoke test: POST `ADMIN_PASSWORD`
  (`.env.local`) to `/api/admin/auth` for a session cookie. Live site deploys from `main` via Vercel.
- **Styling:** inline styles via `useAdminTheme()` (`lib/admin-theme.js`). **Never hardcode colours** —
  use theme tokens (now includes `warningStrong` / `warningBg` for legible amber).

## 2. The through-line (why this admin exists now)
A commercial-intelligence cockpit, not CRUD. The **denominator illusion**: the big base (7,578 contacts
/ 3,766 subscribers) is vanity. The real addressable market is small and specific. The admin now makes
that first-class and trackable. The lever is **intake quality + reach, not list size**.

## 3. The strategic model — the UK pool funnel (the heart of the Overview)
Anchored on the **UK pool** (the database total and newsletter total are noise). Two arms:

```
Total UK (552 in-scope) ─┬─ Subscribed (265) → Engaged (67) → Target (27)   reachable: nurture & convert
                         └─ Not subscribed (287) → Target Audience (36)       acquire (31 already warm)
```
- **Fit = manager & above** (`is_decision_maker_seniority`, James's call, applied globally).
- **Target** = subscribed + engaged + fit. **Target Audience** = not-subscribed + fit + contactable
  (bounced/opted-out excluded but kept as drillable figures).
- **Every box deep-links** to its people in `/admin/engagement` (filter presets `uk_subscribed|uk_engaged|
  uk_target|uk_notsub|uk_target_audience|uk_optedout`, shown as a clearable pill).
- **Coverage caveat (live on the card):** every cut is a FLOOR — location is known on ~33% of contacts,
  seniority on ~17%, and ~50% use free email (invisible to `is_uk_contact`). The true UK pool is larger.
- Numbers move as data/enrichment changes — the funnel is computed live, never hardcoded.

## 4. Sector taxonomy (built for the ICP, not Apollo's generic industries)
- Columns `contacts.sector` + `contacts.out_of_scope`. `infer_sector(email, org)` = UK public-sector TLDs
  → org-name keywords (housing prioritised + widened) → Corporate/private catch-all.
- 10 sectors; **Housing association is first-class** (Apollo splits it across nonprofit/real-estate).
- **HE-noise scrubbed**: 267 students/juniors `out_of_scope` (Total UK 707→552; targets unchanged).
  The 15 HE *staff* stay. `out_of_scope` is excluded from funnel + engagement, reversible.
- **Biggest in-scope sector = Corporate/private (286, 111 fit)** — the private-sector push James wants.
- Inference caps housing at ~10-13; the rest is **manual curation** in `/admin/contacts` (sector + scope
  filters, per-row badge, detail dropdown, bulk set-sector/scope).
- `get_uk_sector_breakdown()` exists but is **not yet surfaced in the UI** (deferred Overview card).

## 5. Machinery (what to reuse)
**RPCs (live):** `get_overview_pool_stats()` (funnel + coverage, one row); `get_engaged_contacts(...)`
(now subscription-aware + returns `sector`); `get_uk_sector_breakdown()`; `infer_sector(email, org)`;
`is_decision_maker_seniority` (manager+); `is_uk_contact`; `is_free_email_domain`; `get_contact_segments`.
**Migrations:** `scripts/migrations/2026-06-26_{overview-real-numbers, engaged-filter-preset, uk-pool-funnel,
sector-taxonomy, sector-wire-into-insight, widen-housing-inference, enquiry-disposition}.sql`.
**Key files:** `app/admin/page.js` (UkPoolFunnel + needs-attention inbox); `app/admin/contacts/page.js` +
`app/api/admin/contacts/route.js` (curation, edit, delete, bulk, allow-list); `app/admin/enquiries/page.js`
+ route (triage); `app/admin/engagement/{page,route}`; `lib/admin-theme.js`.

## 6. Other features shipped today
- **Contact edit + hard delete** (detail panel). Delete is FK-aware: interactions + newsletter_recipients
  cascade, signals + diagnostics null out, a linked handoff blocks with a clear message.
- **Enquiry triage** (`/admin/enquiries`): `contact_submissions.status` = `new|lead|responded|dismissed|
  spam` (DB check constraint; `responded` kept in sync). Per-card dispositions + filter chips + delete with
  optional "also remove the contact". Overview "needs attention" now counts `status='new'`.
- **Security**: contacts + enquiries `PATCH` routes now use column allow-lists (closed the
  mass-assignment holes). Contacts route gained validated bulk `POST` + `DELETE`.

## 7. Open threads (next-session candidates, rough priority)
1. **Pipeline review (PARKED, but James's biggest stated need)** — `organisations` over-collects
   (auto-adds non-leads) and has **no lost/dormant/archive lifecycle** to retire dead deals. Sort the
   lifecycle (qualify-in vs auto-add; won/lost/dormant; archive) **before** building the enquiry-Lead →
   Pipeline bridge (today "Lead" is JUST a flag — it does NOT touch the Pipeline; building the bridge first
   would amplify the over-collection).
2. **Manual housing curation** — reclassify the housing associations still hiding in Charity/Corporate via
   the curation view (inference caps ~10-13).
3. **Private-sector push** — 286 corporate / 111 fit, barely worked; the data backs it as a growth lane.
4. **Overview sector-breakdown card** (consume `get_uk_sector_breakdown`) + show sector on engagement rows.
5. **Enquiry bulk-sweep** — per-card actions only today; a multi-select bulk dismiss/spam/delete would speed
   clearing spam.
6. Roadmap bigger-bets unchanged: per-subscriber newsletter segments, first-party conversion funnel,
   account/company layer, tender score-calibration.

## 8. Hard-won lessons / gotchas
- **Turbopack served STALE page compiles all session** — API routes recompile on hit, but page changes
  need a browser refresh (or the Vercel deploy). Verify via the API layer + lint; do NOT assume a rendered
  page is current. (Don't manage James's dev server — he runs `npm run dev` on :3000.)
- `FilterSelect` (contacts page) takes **array** labels indexed by position, not value-keyed objects.
- **Supabase 1,000-row PostgREST cap** — aggregate via RPC/`count`/`fetchAllPaginated` (+ stable ORDER BY),
  never iterate big tables in JS. All new funnel/sector counts are server-side aggregates.
- **Never `git add -A`** — the tree has ~50 unrelated untracked docs; stage explicit paths. Migration
  `.sql` files ARE tracked; one-off operational scripts under `scripts/` are gitignored.
- House style: **no em dashes** in copy (spaced hyphens); literal `>`/`}` in JSX *text* is a hard SWC build
  error; don't run `sanity deploy`.

## 9. How to resume
Read, in order: **this brief** → the session change-log (`admin-session-2026-06-26-funnel-sector-triage.md`)
→ MEMORY.md entry `project_admin_command_centre_enhancements.md`. Verify the live site reflects the latest
deploy. Then pick from §7 — the **Pipeline review** is the largest parked piece and the natural next focus.
