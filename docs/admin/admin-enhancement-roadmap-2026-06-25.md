# Admin "Command Centre" — enhancement roadmap

_Generated 25 Jun 2026 from a 15-agent audit of every admin section + live profiling of all 21 Supabase tables. The goal James set: much greater **insight** and **functionality** — see more, do more, one consolidated cockpit, with a commercial lean toward finding leads/revenue._

## The through-line

The Command Centre is a competent set of CRUD screens sitting on top of an unusually rich dataset, and **the gap between the two is the whole opportunity.** The data already holds per-contact newsletter engagement, intent signals, deliverability verdicts, tender scoring-vs-James-labels, 404 hit-weighting and follow-up due-dates — almost none of which is surfaced. Meanwhile several stored counters the dashboards *trust* are provably wrong (`total_delivered = 0` on all 49 sends; `total_opened` off by 2.2× on the biggest send).

Every screen shows static, current-state counts with no trends, no drill-downs, no cross-table joins and no bulk actions — so James can see **where** things are but never **who** is warm, **what** is overdue, or **how** anything is moving.

### Operational truths the audit surfaced (worth knowing today)
- **Newsletter auto-send cron has been PAUSED since 17 Apr 2026** (`newsletter_config.enabled = false`) with a 2-month-old duplicate-incident reason; `domain_exclusions` is also OFF. _(This aligns with the known intentional warm-up pause — but the admin gives zero visibility into it, which is the point.)_
- **All 15 `contact_submissions` are `responded = false`** — the warmest leads in the CRM, currently unworked and unlinked to their contact records.
- **16 calendar items are overdue** and invisible (null/past `scheduled_date` items vanish from the grid).
- **Newsletter counters are wrong**: `total_delivered = 0` on every send; opens undercount ~2.2×.
- **~18 tenders** form the genuine action queue (open, `status='new'`, `total_score >= 80`, unrated) out of 7,964 — buried. 64 open tenders close within 7 days.
- **2,287 `newsletter_recipients` rows stuck in `queued`** from aborted drains, inflating counts.
- **18 of 45 monitoring-active watchlist orgs have never been checked.**
- **`active visitors` on the dashboard is hardcoded to 0** — dead UI.

---

## Themes (full)

Impact/Effort tags: impact = high/medium/low; effort = S/M/L. `kind` = insight | functionality | both.

### 1. Newsletter performance from the truth, not the broken counters
The dashboards read `newsletter_sends.total_*` counters that are demonstrably wrong. The trustworthy event timestamps live in the 15,614-row `newsletter_recipients` table and are never surfaced.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Recompute per-issue stats from `newsletter_recipients` via RPC | insight | high/M | Every metric card + send-history recomputed from event timestamps; reconciliation card lists every drifted send with one-click recompute. |
| Collapse retry rows under one `issue_key` | both | medium/M | Retries (drift-v1 = 3 rows, fixes-that-fail = 4) shown as one issue with combined stats + expander. |
| Per-subscriber engagement profile + segments | both | high/L | Join recipients→contacts for lifetime opens/clicks/last-open; segment cards: Loyal openers (776 with 3+ opens), Ever-clicked (488), Dead weight (1,658 never-opened), Ever-bounced (158). |
| Recipient drill-through per send | functionality | high/M | From any send, a searchable/exportable per-recipient list (delivered/opened/clicked/bounced + timestamps). |
| Engagement & list-growth trend lines | insight | high/M | Open/click/bounce rate across all 49 sends + net list-growth curve + per-issue churn attribution. |
| Best-time-to-send analysis | insight | medium/M | Time-to-open distribution (median ~17 min, 61% within 1h) + opens-by-hour to pick the send slot. |

### 2. Send-engine safety & operational truth
The paced-send config, dedup health and remaining-pool gauge are fully built server-side but have **no UI**.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Send Health banner + config panel | both | high/S | Loud "Auto-send PAUSED since 17 Apr" banner + real settings panel wired to existing `newsletter-config` PATCH (enabled, batch_size, daily_cap, bounce threshold, domain_exclusions). |
| Pre-send eligibility/dedup dry-run | both | high/M | Before committing: eligible vs deduped-by-issue_key vs blocked-status vs domain-excluded vs ZB-stale, with a one-click "trigger ZB cron". Guards the April duplicate incident. |
| Stuck-recipient cleanup widget | functionality | medium/M | Surface + requeue the 2,287 `queued`/null-resend_id leftovers. |
| Sent-history + resume-progress in Send section | functionality | medium/M | Re-open an in-flight paced drain after navigating away; reach prior outcomes. |
| Live audience explorer with resolved counts | both | medium/M | Resolve the 5 audiences' `filter_definition` to live counts (replace stale hand-typed numbers) + per-audience last-send performance + "send to this audience". |

### 3. Unified contact intelligence & warm-lead surfacing
Contacts is a 30-column table shown as ~8 columns. The richest cross-table joins in the estate are never made.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| **Warm-leads-right-now table** | insight | high/M | Ranked contacts with a high-strength signal (31 'high') or a download in last 30d (159 recent downloaders), showing download history, newsletter opens/clicks, seniority, domain. The single highest-leverage CRM view. |
| Inbound-enquiry inbox (`contact_submissions`) | both | high/S | The 15 unworked enquiries as a "needs action today" inbox, matched to existing contact records, with Mark-responded. |
| Header KPIs: tier / newsletter / deliverability | insight | high/S | Server-side GROUP BY: tier (t1 1,549 / t2 1,390 / t3 1,382 / t4 2,535), newsletter funnel (active 3,705 / never 2,789 / bounced 575…), deliverability strip. |
| Repeat-downloader & decision-maker shortlists | insight | high/M | 68 contacts with ≥3 downloads; 487 senior decision-makers — cross-filterable, exportable to Apollo. |
| Contact detail: engagement + send history + org link | both | medium/M | Render the rich columns already fetched (`select *`) + per-issue newsletter history + org link. |
| Sortable columns + tag filter + bulk actions | functionality | high/M | Wire the existing-but-unused sort param to headers; tag filter (API already supports); multi-select bulk tag / tier / newsletter_status / add-to-audience. |
| Opt-in & deliverability cleanup queue | both | medium/M | 137 stale pending_confirmation, 129 opted-in-not-added, 30 needs_enrichment + active-but-invalid risk piles with bulk actions. |
| Follow-up tasks due (`interactions`) | insight | medium/S | `next_action` (21/25) + `next_action_date` (19/25) — a built-in task system no dashboard surfaces. Overdue/upcoming follow-up queue. |

### 4. Account/company layer derived from contacts
`organisations` has 16 rows while 2,398 contacts carry an `organisation_name`; the FK is filled on only 9 of 7,584. The real company signal is the email domain.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Company/account view from email domains | insight | high/M | Aggregate contacts by domain/org name to surface companies with multiple engaged people (e.g. nhs.net 52 contacts). |
| Fix `contact_count` + name-join in Pipeline | functionality | medium/M | `contact_count` is a list capped at 10 (under-reports); replace with head/count, unify the card vs detail join, backfill `organisation_id`. |
| Pipeline momentum: stale-deal + next-actions + signals | insight | medium/M | "Next actions due" panel + stale-deal flag + recent intent signals per org. |
| Promote a contact/enquiry/signal into pipeline | functionality | medium/M | Turn an engaged contact / inbound submission / high signal into a tracked org; inline-edit org fields (PATCH exists, no UI). |

### 5. Tenders as a real triage workspace
7,964 tenders, but ~18 form the genuine action queue. The honest signal is `total_score` (every 'yes' James rated scored 80+); `ai_score` is dead.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Action Queue + Closing-Soon cards | insight | high/S | The ~18-row real queue + closing-soon (64 within 7d, 124 within 14d) sorted by score, with title + `ai_summary` + deadline. |
| Bulk triage actions | functionality | high/M | Multi-select bulk rate / status / archive to clear a day's ~280–300 intake fast; sector + notice_type filters; saved presets. |
| Score-vs-rating calibration + threshold control | insight | high/M | Score-band bars coloured by `james_rating`, live precision-at-threshold, tunable alert threshold (replaces dead `ai_score`). |
| Market-demand keyword chart | insight | medium/M | Rank `keywords_matched` (change management 301, leadership dev 155…) + trend — informs content/lead-magnet strategy. |
| Feed productivity & monitoring health | insight | medium/M | Rank 340 feeds by yield to retire dead ones; surface 18 never-checked watchlist orgs. |
| Won-work roster + tender→CRM link | both | medium/M | 14 `won_work` orgs as a credibility roster; flag when a watched/known org posts a tender (warm intro). |

### 6. Lead/funnel insight tying traffic to outcomes
Analytics is PostHog-only and reads nothing from first-party Supabase.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| First-party conversion funnel | insight | high/L | pageview → diagnostic_responses → contact_submissions → contacts → interactions, with rates + source attribution. |
| Period-over-period deltas + date-range control | both | high/M | 7/30/90/custom selector + compare-to-previous on every metric; shared with Overview. |
| Per-tool download leaderboard | insight | medium/M | tool_download by slug (PESTLE 1,268, Iceberg 959, ADKAR 858…); unpack `top_pages` jsonb into a ranked leaderboard. |
| Coherent Outreach funnel + crossover scoring | both | medium/M | Fix the incoherent headline; per-sequence funnel; rank crossovers by confidence + enrich with CRM engagement. |
| Diagnostic-response insight panel | insight | medium/M | Aggregate the 18-statement `responses` jsonb to reveal what buyers flag; flag that only 2/7 captured an email (form-design gap). |

### 7. Operational hygiene: 404s, redirects, snapshots, handoffs
Small, cheap, high-relief wins.

| Item | Kind | I/E | What it adds |
|---|---|---|---|
| 404 triage queue + broken-internal-links | both | high/S | Sort `missed_redirects` by hit_count (bot-noise filtered); top is `/articles/fixes-that-fail3` (36 hits, surged 25 Jun — looks like a broken link in the latest push). One-click Resolve writes a `slug_redirects` row. |
| Encoded-slug bug alert | insight | medium/S | Counter flagging base64-ish 404 paths that decode to real slugs (a link-generation bug). |
| Snapshot-health indicator + reliable capture | both | medium/M | Fix the non-atomic delete-insert that runs on every page load + fabricated zero writes; move to cron; "data as of" badge. |
| Handoff aging board + edit/attach | both | medium/M | Days-open/SLA badges, cycle-time, inline edit, contact/org typeahead, fix Reopen to clear timestamps. |

### 8. Editorial calendar that connects to performance
| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Summary bar + overdue lane + backlog view | insight | high/S | Counts by type/status, Overdue lane (16 items), Agenda + unscheduled-backlog view. |
| Filter/search + expose due_date/url + full status cycle | functionality | medium/S | Type/status/platform/tag filter + search; expose `due_date`/`url`; all 6 status states + stamp `completed_at`. |
| Link calendar items to their sends | both | medium/M | Populate `newsletter_sends.calendar_item_id` so a published item shows its real open/click rate — closes plan→execution→performance loop. |
| Cadence/throughput trend | insight | low/M | Items published per week/channel + lead-time metric. |

### 9. Overview as a true triage cockpit
| Item | Kind | I/E | What it adds |
|---|---|---|---|
| Needs-attention action inbox | both | high/M | One consolidated panel: unresponded submissions, new diagnostics, hot/closing tenders, stale handoffs, top 404s, Send-Health banner — each with a one-click action. |
| Trend sparklines on every metric card | insight | medium/M | Direction/sparkline on visitors/subscribers/contacts/pipeline; render the computed-then-dropped `contactsBySource` breakdown. |
| Drill-down rows + refresh/last-updated | functionality | medium/S | Every row deep-links to the specific record; manual Refresh + "last updated"; remove dead `activeVisitors`. |

---

## Recommended sequencing

### Quick wins (high impact / low effort — start here)
1. **Send Health banner + config panel** — surface the paused cron + wire existing PATCH.
2. **Inbound-enquiry inbox** — all 15 submissions are unworked; warmest leads in the CRM.
3. **Contacts header KPIs** (tier / newsletter / deliverability) via cheap RPC counts.
4. **Tenders Action Queue + Closing-Soon** cards (~18-row real queue + 64 closing in 7d).
5. **404 triage queue** sorted by hit_count + broken-internal-links report.
6. **Calendar summary bar + Overdue lane** (16 overdue items currently invisible).
7. **Contacts sortable columns + tag filter** (API already supports both).
8. **Recompute newsletter stats from recipients** (kills the `total_delivered=0` bug class).

### Bigger bets
- Per-subscriber engagement profile + segments (the highest-value unsurfaced asset).
- First-party conversion funnel (traffic → leads → engaged contacts).
- Account/company layer from email-domain aggregation.
- Tender scoring-calibration loop.
- Recipient-level drill-through + pre-send eligibility dry-run.

### Cross-cutting upgrades (build as shared infrastructure)
- **Close the 1,000-row PostgREST hazard** everywhere aggregation feeds JS (rpc/count, `fetchAllPaginated` + `.order('id')` for exports). _Per CLAUDE.md._
- Universal CSV export (Contacts, Tenders, Newsletter, Pipeline, Handoffs) via one shared paginated-export helper.
- Global date-range + compare-to-previous control (Overview + Analytics).
- Shared bulk multi-select + bulk-action component (Contacts, Tenders, Calendar, Handoffs).
- Drill-down deep-linking convention for list rows everywhere.
- Replace stale/fabricated stored aggregates with computed-from-source-of-truth.
- **Security:** constrain mass-assignment PATCH routes (contacts, organisations, tenders, calendar_items, handoffs all spread arbitrary body into `.update()`) to column allow-lists; sanitise raw-interpolated `ilike .or()` search strings.
- Manual Refresh + "data as of" + non-swallowed error states on read-once dashboards.

## Open questions for James
1. **Org FK backfill** — backfill `contacts.organisation_id` from domain/name match (accepting some fuzzy-match error) so Pipeline/account views stop relying on the brittle name string?
2. **Newsletter cron** — is the pause still intentional, or is re-enabling it (with dedup + ORDER BY fixes now in place) a goal? Decides whether the config panel is informational or operational.
3. **Suppression workflow** — for the 1,658 never-openers + 137 stale pending: built-in suppress/clean that writes `newsletter_status`, or just a flagged export to action elsewhere?
4. **Tenders `ai_score`** — retire the dead AI-score UI and lean on `total_score` + `ai_summary`, or invest in re-scoring? Want a captured bid-outcome loop to feed calibration?
5. **Act vs observe on external systems** — should the admin enrol/pause Apollo sequences and trigger the ZB-verify cron, or stay read-only there?
6. **`slug_redirects`** — wire a "Resolve 404" action to write managed redirect rows, or retire that table?
7. **Priority among the three data-truth fixes** — newsletter counters vs account layer vs tender calibration: which business question is most pressing now?
8. **Export targeting** — generic CSV, or tuned for Apollo/mail-merge? Should saved segments reuse the `newsletter_audiences` mechanism?
