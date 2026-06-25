# Project: Paced Send Rebuild - Charter

**Status: COMPLETE & LIVE - 25 Jun 2026.** All 8 PRs merged to main (90ccc96), deployed to prod, and `NEWSLETTER_SEND_MODE=paced` flipped on - the paced engine is now the live send path. **Validated end-to-end in production:** (1) load proof - the receipt path the incident blamed now costs 0.134ms/open, DB does 7,460 opens/sec (vs a real ~3-4/sec), so the storm is a non-event; (2) a real send via the drain cron (6 addresses, exactly-once, delivered, reconciled); (3) a real send via the admin UI create-queue path (paced, inline-drained, exactly-once, reconciled); (4) live open-tracking confirmed working. Test data cleaned up. **Done.**

**Post-launch follow-ups (25 Jun, working toward two follow-up sends then the ~3,800 full-list send):**
- **Calendar publish-on-drain - DONE.** Migration 09 adds `calendar_item_id` to `newsletter_sends` (FK, ON DELETE SET NULL); create-queue stamps it for editorial sends; the drain's `finalize()` marks the calendar item 'published' on completion (the paced equivalent of legacy `runSend` step 14). Regression test S7 added (harness 23/23). Applied to prod.
- **Deliverability pass - DONE, then escalated by real data** (`deliverability-audit-2026-06-25.md`). Auth is sound (SPF aligned via `send.mutomorro.com`, DKIM `d=mutomorro.com` aligned, **DMARC PASSES**). BUT Postmaster data on real sends supersedes the initial "no blocker": **Drift (28 May, clean full-list send) drew 1.03% Gmail spam** - 3.4x the 0.3% policy line - because the list is 84% lead-magnet (`template-download`) leads with a 34% never-engaged tail, and Gmail complainers can't self-remove (no feedback loop; the webhook only auto-unsubscribes providers that relay, which Gmail/Outlook don't). **Pre-full-list-send action: trim the never-engaged** (by engagement, not Gmail - Gmail engages better here; tiers: 520 Gmail-cold → 718 freemail-cold → 1,273 all cold). Engaged core is strong (clicks ~2x B2B avg). Decision pending the 25 Jun Postmaster figure (~3 July, ~8-day lag) - tracked as task #4. Also: promo template click-tracking is broken (fix before next promo). Later hardening: DKIM 1024→2048, DMARC p=none→p=quarantine.
- **Retire legacy `runSend` + `NEWSLETTER_SEND_MODE` flag - STILL DEFERRED.** Gate not yet met: exactly-once is proven (25 Jun real send: 3,800 distinct, 0 dupes) but NO real newsletter has drained to completion via the cron *and reconciled clean* (25 Jun was 3 failed batches + ~2,287 orphaned `queued` rows, `reconciled_at` null everywhere - the drain cron wasn't running continuously during cutover). Keep the legacy burst as the rollback lever through the two follow-ups; retire after follow-up #1 drains clean + reconciles.
**Owners:** James + Claude. **Origin:** the [25 Jun send incident](incident-2026-06-25-send-gateway-overload.md).

> **To continue in a new chat:** say *"continue the paced-send rebuild"*. Claude reads this charter + `rebuild-audit.md` + `rebuild-test-scenarios.md` and resumes at the current phase. Update the Status line and Phase tracker at the end of each working session.

## Why we're doing this
The monthly newsletter send is a synchronous burst that floods its own database with the ~40,000-query storm of delivery/open receipts it generates, exhausting the Disk IO budget and stalling itself (full story: [incident](incident-2026-06-25-send-gateway-overload.md)). We evaluated build-vs-buy ([review](system-review-and-build-vs-buy-2026-06-25.md)); **decision (25 Jun): build a paced self-draining send rather than pay $40/mo for Resend Broadcasts.** Pacing the send spreads the same receipt traffic from minutes to ~an hour (~11 queries/sec), comfortably under budget - and because the duplicates were an *overload symptom*, removing the overload removes them too. Broadcasts stays a fallback if the list outgrows this or we want out of running email infrastructure.

## Goal & success criteria
1. **Zero duplicates** - a contact is emailed exactly once per issue, provably.
2. **Zero missed** - everyone owed the issue gets it.
3. **Unattended** - sends run start-to-finish with no human babysitting.
4. **No live-site impact** - the database stays under its Disk IO / connection budget throughout.
5. **Headroom to 5,000 -> 10,000+** subscribers.
6. **No recurring subscription fee.**
7. **Never blind to a duplicate again** - we can always reconcile our records against Resend's send log.

## Approach (one line)
Replace the one big burst with a **paced, self-draining scheduled job**: each tick claims and sends the next small wave to whoever is still owed the issue, records them idempotently, then exits - repeating until the list is drained. Reuses the proven resume-from-remainder logic we ran by hand 4x on 25 Jun.

## Phases
| # | Phase | Status |
|---|---|---|
| 0 | Charter & scope | **DONE** (this doc) |
| 1 | Current-state audit | **DONE** (`rebuild-audit.md`; verify file:line at build) |
| 2 | Design / build spec | **DONE** (`rebuild-design-spec.md`) |
| 3 | Build (reviewable increments) | **DONE** - PR-1..PR-8 + admin cleanup, merged to main (90ccc96), deployed |
| 4 | Test - run the what-if catalogue | **DONE** - harness 20/20 (`scripts/test-paced-drain.js`); D2/D3 load proof: receipt path 0.134ms/open, DB 7,460 opens/sec, no live-site impact (`scripts/test-receipt-storm.js`) |
| 5 | Cutover - first paced live send, monitored, then default on | **DONE** - flag `NEWSLETTER_SEND_MODE=paced` ON; two real exactly-once sends validated (cron path + admin-UI create-queue path); test data cleaned up |

## Defaults - APPROVED 25 Jun (build to these)
- **Wave size** ~150-250/tick; **tick** ~1 min -> 5,000 drains in ~25-35 min.
- **State** lives in the existing `newsletter_recipients` rows (status `queued` -> `claimed` -> `sent`), keyed by issue - no new state store.
- **Render per wave** (not all upfront), killing the render spike.
- **Idempotency:** atomically *claim* a wave's rows (status flip to `claimed` returning their ids) *before* calling Resend; store `resend_id` immediately; never re-pick a claimed/sent row. A crashed tick's `claimed`-but-unconfirmed rows are reclaimed after a timeout.
- **Reconciliation:** after completion, compare our `resend_id` set (or Resend's export) against recipients to assert one-send-per-contact and surface any dupes.
- **Webhook:** fix/remove the missing `increment_field` RPC; collapse the 5-11 queries/event; consider async/batched receipt writes.
- **Test harness:** a Supabase **branch** (via MCP) seeded with synthetic contacts + Resend test/sandbox mode + deliberate fault injection. Never touch prod data.

## Guardrails to preserve (do not regress)
`issue_key` dedup (delivered-bucket only) · auto-recovery of stuck sends · the `(send_id, contact_id)` unique constraint · the 10%-stale ZB gate · domain exclusions · unique per-recipient unsubscribe URLs · the public archive at `/newsletter/<key>`.

## Decisions log
- **25 Jun:** paced-drain rebuild chosen over Resend Broadcasts ($40/mo marketing add-on, billed by contacts). Rationale: duration is irrelevant to James; only dupes/failures matter; pacing fixes both for no recurring fee. Revisit Broadcasts if list/cadence grows or we want to exit email-infra ownership.
- **25 Jun:** James approved the defaults above (wave size/cadence, state in recipient rows, claim-before-send idempotency, single drain code path, test on a Supabase branch). Phase 2 builds to them - no need to re-confirm.

## Links
- Incident: [`incident-2026-06-25-send-gateway-overload.md`](incident-2026-06-25-send-gateway-overload.md)
- Build-vs-buy: [`system-review-and-build-vs-buy-2026-06-25.md`](system-review-and-build-vs-buy-2026-06-25.md)
- Audit: [`rebuild-audit.md`](rebuild-audit.md)
- Test scenarios: [`rebuild-test-scenarios.md`](rebuild-test-scenarios.md)
- **Design / build spec (Phase 2): [`rebuild-design-spec.md`](rebuild-design-spec.md)**
