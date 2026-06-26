# Admin session brief — UK pool funnel, sector taxonomy, enquiry triage (26 Jun 2026)

Continuation of the admin Command Centre commercial-intelligence work. Everything below is
**committed to `main`** and all DB migrations are **applied to the live Supabase project**
(`hzgnlxxnpvidnntiilcf`). Reads on from `docs/admin/admin-centre-continuation-brief-2026-06-26.md`.

## What shipped

### 1. Overview hero rebuilt as a two-arm UK pool funnel
Replaced the linear "real market" funnel with James's branching model, anchored on the **UK pool**
(the database total and newsletter total are noise):

```
Total UK ─┬─ Subscribed → Engaged → Target        (reachable: nurture & convert)
          └─ Not subscribed → Target Audience      (acquire)
```

- **Target** = subscribed + engaged + fit-seniority. **Target Audience** = not-subscribed + fit +
  contactable (drops bounced + opted-out; opted-out/bounced kept as drillable figures).
- Every box deep-links to its exact people in `/admin/engagement` (new subscription-aware filter
  presets: `uk_subscribed|uk_engaged|uk_target|uk_notsub|uk_target_audience|uk_optedout`, shown as a
  clearable "deep-link pill").
- A coverage caveat line: location known on ~33%, seniority ~17%, free-email ~50% — every cut is a
  **floor, not a total** (the UK count is undercounted because free-email + unenriched-country rows
  are invisible to `is_uk_contact`).
- RPC: `get_overview_pool_stats()` (one-row aggregate). Route maps it to `data.funnel`.

### 2. "Fit" widened to manager & above (James's call)
`is_decision_maker_seniority` now = `manager|director|head|vp|c_suite|founder|partner|owner` (was
director+). Ripples through the engagement score + golden/segment counts by design. Roughly tripled
the actionable pools (Target 9→27, Target Audience 19→36).

### 3. Custom sector taxonomy + HE-noise scrub
- New columns `contacts.sector` + `contacts.out_of_scope`. `infer_sector(email, org)` = high-confidence
  UK public-sector TLDs → org-name keywords (housing prioritised + widened) → Corporate/private catch-all.
- **HE-noise scrubbed**: 267 students/juniors (`sector='Higher education' AND NOT fit`) flagged
  `out_of_scope` and excluded from the funnel + engagement (kept in the CRM, reversible). The 15 HE
  *staff* stay. Funnel **Total UK 707 → 552** (Target/Target-Audience unchanged — only noise removed).
- `get_overview_pool_stats` + `get_engaged_contacts` exclude `out_of_scope` (like the owner exclusion).
- `get_uk_sector_breakdown()` RPC (sector × people/fit/subscribed/engaged/target/target-audience).
- Biggest in-scope sector = **Corporate/private (286, 111 fit)** — backs James's private-sector-push
  instinct. Housing only auto-detects ~10-13 (the rest need manual curation).

### 4. Sector curation in /admin/contacts
Sector + scope filters, a sector badge + out-of-scope marker per row, a per-contact sector dropdown +
scope toggle, and bulk "Set sector / Out of scope / In scope". Workflow: filter Charity/Corporate/No-sector,
tick the real housing associations, bulk Set sector → Housing association.

### 5. Contact edit + delete
- "Edit details" form in the detail panel (name/email/org/role/location/country/seniority).
- Two-step "Delete contact" (hard delete; interactions + newsletter_recipients cascade, signals +
  diagnostics null out, a linked handoff blocks with a clear message).

### 6. Enquiry triage (/admin/enquiries)
- `contact_submissions.status` disposition: `new|lead|responded|dismissed|spam` (DB check constraint;
  `responded` kept in sync). Per-card disposition buttons + filter chips with counts (default New).
- Delete with an optional **"also remove the contact"** checkbox (ask-each-time, default keep).
- Overview "needs attention" now counts `status='new'` (untriaged), not just unreplied.

### 7. Security fixes (bonus)
Contacts + Enquiries `PATCH` routes now use column allow-lists (were spreading the raw body into
`.update()` — the mass-assignment hole flagged in the prior brief). Contacts route also gained a bulk
`POST` and a `DELETE`; both validated.

## Migrations (scripts/migrations/, all applied)
`2026-06-26_overview-real-numbers`, `_engaged-filter-preset`, `_uk-pool-funnel`, `_sector-taxonomy`,
`_sector-wire-into-insight`, `_widen-housing-inference`, `_enquiry-disposition`.

**One-off data ops run via execute_sql (not in a migration file):**
```sql
-- sector backfill (NULL-only, manual edits safe)
UPDATE contacts SET sector = infer_sector(signup_email, organisation_name)
WHERE sector IS NULL AND coalesce(organisation_name,'') !~* 'mutomorro'
  AND lower(split_part(signup_email,'@',2)) <> 'mutomorro.com';
-- HE-noise scrub
UPDATE contacts SET out_of_scope = true
WHERE sector = 'Higher education' AND NOT is_decision_maker_seniority(seniority) AND out_of_scope = false;
```

## Open threads / next steps
1. **Sector card on the Overview** (consume `get_uk_sector_breakdown`) + show sector on engagement rows — deferred.
2. **Manual housing curation** — inference caps at ~10-13; James to reclassify the rest via the curation view.
3. **Private-sector push** — 286 corporate contacts / 111 fit, barely worked; a real growth direction.
4. **Enquiry bulk sweep** — per-card actions only for now; a multi-select bulk-dismiss/delete could speed clearing spam.
5. Other roadmap bigger-bets unchanged (per-subscriber segments, first-party funnel, account layer).

## Parked for a proper look (raised by James 26 Jun — deliberately NOT built)
- **Enquiry "Lead" → Pipeline bridge.** Marking an enquiry `status='lead'` is currently JUST a
  flag/filter in /admin/enquiries — it does **not** create or link anything in /admin/pipeline. The
  contact + a high-intent signal already exist from the original submission, but there is no deal record.
- **Pipeline (`organisations`) needs its own review FIRST.** James's pain: it **over-collects** (auto-adds
  orgs he wouldn't class as leads) and there's **no way to remove / retire deals that were lost or have
  gone quiet** (no lost / dormant / archived lifecycle). Decide the pipeline lifecycle — qualify-in vs
  auto-add, won/lost/dormant states, archive — *before* wiring enquiries (or engaged contacts) into it.
  Don't build the Lead→Pipeline promotion until this is sorted, or it amplifies the over-collection.

## Gotchas reconfirmed this session
- The dev server (Turbopack) served **stale page compiles all session** — API routes recompile on hit, but
  page changes need a browser refresh. Verified via the API layer + lint throughout; do not assume the
  rendered page is current without a refresh.
- `FilterSelect` (contacts page) takes **array** labels indexed by position, not value-keyed objects.
- Never `git add -A` (unrelated untracked docs in the tree); migration `.sql` files ARE tracked.
