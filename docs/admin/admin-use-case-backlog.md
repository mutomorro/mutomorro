# Admin use-case backlog

**Method (James, 29 Jun 2026):** real use cases drive the build - "I want to find X / log Y / keep
track of Z." Each entry = a felt need → diagnosis (grounded in real records) → the capability it
implies → priority/status. Add new cases as they surface; this is the engine for the fine-tuning
stage that follows the cohesive rebuild (`admin-cohesive-surface-spec-2026-06-29.md`).

---

## UC-1 — A high-intent non-subscriber is invisible  ·  HIGH  ·  steps 1-2 SHIPPED (fit-from-role + Hot/Unworked); step 3 (signal backfill) open
**Felt need:** "A fit Director downloads a real product PDF but doesn't subscribe - I only find her
if I happen to remember her."
**Evidence:** Vicki Carruthers (Director of People, Home Group, housing, UK), score 45.5.
**Diagnosis (three separate gaps):**
1. `seniority` is NULL despite the role text "Director of People" → fit undetected (+0, not +12);
   invisible to the Fit facet and every lens that needs it.
2. Her product (States-of-Vitality) download created **no signal** - just `download_count` + a tag -
   so +0 instead of the +15 a high-strength `resource-download` signal gives. The mechanism exists
   (resource-download = high; 11 of them) but didn't fire for her.
3. "Engaged" leans on newsletter behaviour, so a non-subscriber's buying intent doesn't register.
**Capability:**
- Infer "fit" from **role text** (Director/Head/Chief/VP/Partner/Owner…) when the seniority enum is
  null (or backfill seniority from role), then re-score.
- Audit + close the **signal-capture gap** so every gated product/resource download reliably writes a
  high-strength signal (and backfill the misses).
- A **"Hot / high-intent" lens**: anyone with a high-strength signal (enquiry OR product download) in
  the last N days, regardless of subscription, + an **"unworked"** toggle (no interaction logged).
> Highest leverage: the fit + capture fixes lift *everyone* like her, not one record.

## UC-2 — Account-level signal is scattered  ·  MEDIUM-HIGH  ·  open
**Felt need:** "Multiple people from one org are engaging, but they're lost in the data."
**Evidence:** SNG - Hannah Gibson (People Director, fit, never subscribed, no activity, score 36) +
Alexa Stillwell (Internal Comms, active subscriber, 1 download, score 28.5). Same org, neither lands
in Target (Hannah not engaged, Alexa not fit).
**Diagnosis:** no account/org layer (the merge dropped the old Orgs rollup); person-scoring scatters a
fit-but-cold director and an engaged-but-junior subscriber, so the *account* signal is invisible.
**Capability:** an **Organisations lens** - target-sector orgs with 2+ fit/engaged people, drill into
the people. Reuse `get_engaged_organisations`.

## UC-3 — The most valuable leads live in a different system  ·  HIGH value, own project  ·  open
**Felt need:** "statesofvitality.com captures downloads + quote-requests, but they never reach the
cockpit."
**Evidence:** separate Supabase project `sqzqkzhoqmhfhqqvbydt`, table `leads`
(name/email/organisation/headcount/message/source/nonprofit); `source` ∈ {`pdf_download`,
`quote_request`}. A `quote_request` is a pricing enquiry = highest intent. Current: 1 real lead
(Juilliard, pdf_download, 29 Jun) + 2 test rows. Power-users (jphillips) are already in mutomorro
under a different org; **SoV-only leads are invisible.**
**Capability:** a scheduled **ingestion** pulling SoV `leads` → mutomorro contacts + high-strength
signals (`pdf_download`→resource-download, `quote_request`→inbound-enquiry), dedup by email, tag
`source:states-of-vitality`. Needs the SoV project's service key in the mutomorro env. Later: ingest
assessment completions (`respondents`/`scored_responses`) as even-higher-intent signals.
> Sequence after UC-1 so the leads land into a corrected scoring model. Its own piece of work.

## UC-4 — A search came back empty because a leftover filter was silently on  ·  HIGH  ·  SHIPPED (main 664c34a, live)
**Felt need:** "I searched jphillips@juilliard.edu and got nothing."
**Evidence (Supabase API logs):** every query carried `sector=eq.Housing association` (set earlier
while working housing); jphillips is Corporate/private → excluded. User error + a UX that didn't
surface the active constraint.
**Decision (James, 29 Jun):** **compose-but-visible** - search keeps narrowing within active facets
(global search would defeat the filters); make the constraint legible instead.
**Capability:** an always-visible **active-filter pill stack** (each facet/filter a removable chip) +
when results = 0 with filters active, a "0 matches — N filters active · Clear all" hint. (This is the
pill stack deferred from the cohesive spec - UC-4 is the case that justifies it.)

---

## Cross-cutting themes
- **Intent ≠ engagement** - decouple buying intent from newsletter behaviour. (UC-1, UC-3)
- **Fit detection is brittle** - enum-only; use role text. (UC-1)
- **Capture is leaky / fragmented** - mutomorro product downloads + SoV both under-capture intent. (UC-1, UC-3)
- **Discovery is "if I remember"** - needs proactive surfacing (Hot lens, an Overview card). (UC-1)
- **State legibility** - what's constraining the list right now must be unmissable. (UC-4)

## Recommended sequence
1. **UC-4** - pill stack + 0-results hint. Small, live papercut, immediate clarity. *(quick win)*
2. **UC-1** - fit-from-role + signal-capture fix + re-score, then the Hot/unworked lens. *(highest leverage)*
3. **UC-2** - Organisations lens.
4. **UC-3** - SoV ingestion. *(own project; needs the SoV service key)*

Each ships independently and is verified the same way (predicate counts + lint + preview build).
</content>
