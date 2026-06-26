# Admin Command Centre — continuation brief (26 Jun 2026)

**Purpose:** a complete paper trail so a fresh chat can resume the admin-centre work at full strength. Read this first, then the linked docs. Everything described is **committed and pushed to `main`** (latest commit `70578d6`) and all DB migrations are **applied to the live Supabase project**.

- **Project:** Mutomorro — internal admin "Command Centre" (Next.js 16, app router) for a **UK solo change-management consultancy** (James Freeman-Gray, james@mutomorro.com).
- **DB:** Supabase project `hzgnlxxnpvidnntiilcf` ("mutomorro_website"), `public` schema. Use the Supabase MCP `execute_sql` / `apply_migration` with that project id.
- **Admin auth:** password-gated via `middleware.js`. For local smoke tests, POST `ADMIN_PASSWORD` (from `.env.local`) to `/api/admin/auth` to get a session cookie; the live site deploys from `main` via Vercel.
- **Styling:** all admin pages use inline styles via `useAdminTheme()` (`lib/admin-theme.js`). **Never hardcode colours** — use theme tokens.

---

## 1. The arc of the journey

1. **Brief:** "enhance the admin to give greater insight and functionality." Ran a 15-agent audit → prioritised roadmap (`docs/admin/admin-enhancement-roadmap-2026-06-25.md`, 9 themes).
2. **8 quick wins** shipped: newsletter counter-integrity, Send-Health panel, Contacts KPIs, Contacts sort/filter, Tenders action queue, Calendar overdue lane, new **Enquiries** inbox, new **404s** triage.
3. **Engagement intelligence layer** (the headline, and the piece James wanted all along): a new `/admin/engagement` that ranks **who** and **which orgs** are actually engaging, with a transparent, tunable score.
4. **Apollo enrichment** to fill company/title/seniority on contacts.
5. **UK / ICP "golden ticket"** — UK is the biggest identifying factor; wired it into the score + filters.
6. **The denominator-illusion realisation** (see §4) — the strategic heart of the whole exercise.
7. **Enrichment data-quality fix** — Apollo's stale-employer problem; added a guard + cleaned history.

---

## 2. Current state of the admin

**Nav (`app/admin/AdminShell.js`):** Overview · Contacts · Engagement · Enquiries · Pipeline · Newsletter · Outreach · Calendar · Handoffs · Analytics · Tenders · 404s.

**New / reworked in this journey:**
- **Engagement** (`/admin/engagement`) — NEW. **People** tab (ranked by weighted score; filter chips incl. **★ Golden ticket** and **UK**; **Adjust scoring** sliders incl. UK weight; UK badge + sector on rows; multi-select → **Enrich via Apollo**, **Add tag**, **Export CSV**). **Organisations** tab (accounts by work-email domain, ranked, UK marker, expandable to people, CSV export).
- **Contacts** — reworked. Header is now **clickable working-filter chips** (All / UK / Needs company / Decision-makers / Active 30d / Enriched) backed by `get_contact_segments()`; **tier demoted** to a quiet column; **multi-select** with bulk **Enrich**/**Tag**; **org column falls back to the email domain** when there's no verified company; detail panel surfaces seniority/level, industry, location, opens/clicks, last download, enrichment status, downloaded items.
- **Enquiries** (`/admin/enquiries`) — NEW. `contact_submissions` inbox, matched to existing contacts, Mark-responded.
- **404s** (`/admin/redirects`) — NEW. Hit-weighted `missed_redirects` triage, bot-noise filter, broken-internal-link flag, Resolve (records target; live redirect still needs `next.config`).
- **Newsletter** — Counter-integrity panel + one-click backfill; **Send-Health banner + settings panel** (cron paused since 17 Apr is now visible); **List health** section (newsletter funnel + deliverability, moved here from Contacts).
- **Calendar** — summary bar + Overdue lane (16) + Unscheduled backlog.
- **Tenders** — Action Queue (~18) + Closing-Soon cards + inline rating.
- **Overview** — **NOT yet reworked** — still shows vanity totals. This is the agreed next job (see §5).

---

## 3. The machinery (DB functions & files)

**RPCs (all `SECURITY DEFINER`, service-role only):**
- `get_engaged_contacts(p_limit, p_filter, w_click, w_open, w_download, w_recent30, w_recent90, w_signal, w_dm, w_org, w_uk)` — the engagement score. Returns is_uk/country/industry. Filters: `all|recent|decision_makers|repeat|clickers|enquirers|uk|golden`. Default weights: click 8, open 1, download 1.5, recent30 20, recent90 10, signal 15, dm 12, org 6, **uk 18** (biggest factor). Score caps clicks≤5, opens≤20, downloads≤10 before weighting.
- `get_engaged_organisations(p_limit)` — org ranking by work-email domain + `is_uk` marker/boost.
- `is_uk_contact(country, email)` — country UK-ish **OR** email domain ends `.uk` (778 contacts).
- `is_decision_maker_seniority(seniority)` — director/c_suite/head/vp/founder/partner/owner (~523).
- `is_free_email_domain(domain)` — ~110 free providers (widened to fix intl leakage).
- `get_contact_segments()` — total / no_company / needs_company_workmail / decision_makers / active_30d / enriched / **uk**.
- `get_contact_kpis()` — tier / newsletter / deliverability (now on the Newsletter List-health section).
- `add_tag_to_contacts(ids, tag)` — bulk tagging.
- `get_contacts_needing_org_enrichment(limit, after_id)` — Apollo backfill queue.
- `get_newsletter_send_stats_full()` / reconcile helpers; pre-existing `get_newsletter_issue_stats` / `get_newsletter_send_stats`.

**Migrations** (`scripts/migrations/`, all applied): `2026-06-25_newsletter-counter-backfill`, `_contact-kpi-counts`, `_engagement-scoring`, `_engagement-tunable-weights`, `2026-06-26_enrichment-helpers`, `_uk-icp-scoring`, `_expand-free-email-domains`.

**Key code files:** `app/admin/engagement/page.js` + `app/api/admin/engagement/route.js`; `app/admin/contacts/page.js` + `app/api/admin/contacts/{route,stats,segments,enrich,[id]}`; `app/admin/{enquiries,redirects}/`; `app/admin/newsletter/page.js` + `…/reconcile`; **`lib/apollo-enrich.mjs`** (enrichment + `matchIsTrustworthy`). **Gitignored operational scripts** (one-offs, not in repo): `scripts/enrich-missing-orgs.mjs`, `scripts/cleanup-enrich-mismatches.mjs`.

---

## 4. The strategic heart — the denominator illusion

The most important output of the whole exercise. The big list is misleading: it **feels** like 7,585 contacts / 3,769 active subscribers, so "why are enquiries rare?" felt like a failure. It isn't.

**Qualification funnel (cumulative):**
`7,585 total → 7,186 deliverable → 3,769 active subscribers → 1,695 work-email → 302 UK → 63 UK decision-makers → 11 engaged` (0.15% of the list). The two killer cuts: free-email (−2,074) and UK (−1,393).

- **Real warm pool ≈ 11–17** engaged UK decision-makers, inside a **golden 110** (UK decision-makers, mostly still cold).
- **Diffuse, no whales:** ~681 UK work-email contacts span 580 domains, **88% singletons**; biggest "account" is 5 people.
- **Enquiry maths:** a once-a-decade purchase × a ~17-person warm pool ⇒ **~0.3–1.5 enquiries/year is on-model**, not a leak.
- **ICP / "golden ticket" = UK + decision-maker + seniority + sector + engaged.**
- **Housing associations are the sweet spot** — now a `housing-association` tag (18 contacts; 5 golden incl. **Caledonia Housing** & **Platform Housing Group** at C-suite).

**Strategic shifts James agreed to:** (1) track the engaged-pool (~11–17) + golden-110, not vanity totals; (2) the lever is **intake quality, not list size**; (3) work it as **broad low-frequency nurture**, not account-based plays; (4) **redefine "good"** — 1–2 enquiries/yr is normal at this scale; (5) to raise enquiries, **grow the qualified-engaged pool** or **shorten the buying cycle**.

(Full analysis: the `addressable-pool-reality` workflow run; numbers reproduced above.)

---

## 5. Open threads & next steps (priority order)

1. **AGREED NEXT — Overview real-numbers rework.** Replace the vanity totals (7,585 / 3,769) on `/admin` with the numbers that matter: **engaged UK decision-makers (~11–17)** and the **golden 110** as headline cards, plus a "needs-attention" inbox (unworked enquiries, hot/closing tenders, stale handoffs, top 404s, Send-Health pause). Theme 9 of the roadmap.
2. **Roadmap bigger bets:** per-subscriber newsletter engagement segments; first-party conversion funnel (traffic→leads); account/company layer; tender score-calibration; recipient drill-through + pre-send dedup dry-run.
3. **Cross-cutting:** universal CSV-export helper; global date-range control; shared bulk-action component; **security — lock down the mass-assignment PATCH routes** (contacts/organisations/tenders/calendar/handoffs spread raw body into `.update()`); 1000-row pagination audit.
4. **Smaller / follow-ups:** find a better enrichment source than Apollo for this audience (low match + stale employers); expand the housing-association segment; the minor Leeds-vs-Leeds-Beckett enrichment residual.

---

## 6. Hard-won lessons / gotchas

- **Apollo is a poor enrichment fit for this audience:** ~11% match rate **and** ~70% stale-employer mismatch in the UK pool. The guard (`matchIsTrustworthy`) now rejects any company whose domain disagrees with the contact's email domain — but treat Apollo data cautiously.
- **Supabase 1,000-row PostgREST cap** (see `CLAUDE.md`): aggregate via RPC/`count`/`fetchAllPaginated`, never iterate big tables in JS.
- **Libs imported by scripts must be `.mjs`** (project isn't `type: module`); the app imports them with the explicit `.mjs` extension.
- **Commits must be scoped** — the working tree has ~50 unrelated untracked docs + a pre-existing `D docs/seo-audit-25-may-2026.md`. **Never `git add -A`**; stage explicit paths. Operational scripts under `scripts/` are gitignored by convention.
- House style: **no em dashes** (use spaced hyphens); don't run `sanity deploy`; don't manage James's dev server (he runs `npm run dev` on :3000).
- **Apollo credits:** started ~2,065; ~350 spent this journey (backfill + cleanup); ~1,700 remaining.

---

## 7. How to resume

Read, in order: **this brief** → `MEMORY.md` entry `project_admin_command_centre_enhancements.md` → `docs/admin/admin-enhancement-roadmap-2026-06-25.md`. Then pick up at §5 item 1 (Overview real-numbers rework) unless James redirects. All code is on `main`; verify the live site reflects the latest deploy before assuming UI state.
