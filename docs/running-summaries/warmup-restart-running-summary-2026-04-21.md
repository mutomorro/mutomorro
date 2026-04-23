# Warm-up Restart - Running Summary & Handoff

**Created:** 21 April 2026, 17:40 GMT
**Last updated:** 21 April 2026, 21:30 GMT
**Purpose:** Single source of truth for the warm-up email restart. Designed so a fresh Claude chat can pick this up and run any day's send confidently without needing the earlier conversational context.

---

## How to use this document (for a fresh Claude chat)

1. **Read the full document** before doing anything. Don't skim to the SQL - the context matters.
2. **Check the "Where we are now" section** for current phase and next action.
3. **For running a daily send,** follow the "Daily send ritual" section step by step.
4. **For anything unexpected,** halt and raise with James before doing anything automated.
5. **Update the "Send-by-send log"** after every real send, and the "Day-by-day log" after every working session.

---

## The one-line version

The Mutomorro newsletter warm-up was paused on 17 April 2026 after a duplicate-send incident. A standalone manual script has been built, tested end-to-end, and is ready to send the remaining ~1,903 warm-up emails in controlled daily batches starting Monday 27 April.

---

## Why we're doing it this way (context matters)

### The incident

Between 25 March and 17 April 2026, a scheduled cron fired the warm-up email to the audience daily. A PostgREST pagination bug silently capped the "already sent" exclusion list at 1,000 rows, so once the warm-up had reached its 1,001st unique recipient, the cron started re-sending to people it should have excluded.

By the time James caught it on 17 April:

- 1,090 unique people had received the warm-up
- 2,403 total sends had fired (1,313 excess)
- 59% of recipients got the email at least twice; one unlucky cluster of 161 people got it five times
- 23 people unsubscribed specifically in response to the duplicates

The pagination bug itself has been fixed codebase-wide (17 April). The cron remains deliberately paused.

### Path B decided 21 April

Rather than rebuild the cron with an approval gate and restart automation (Path A), James chose Path B: **fully manual, human-in-the-loop, one batch per day**. A standalone script that takes an explicit list of contact IDs. "The faff is the feature" - deliberately observable, deliberately hand-driven. Path A is deferred to the Drift newsletter launch in June.

### Three-layer safety

The non-negotiable rule: **never send to any contact whose id appears in `newsletter_recipients` for any `send_id` where `newsletter_sends.issue_key = 'warmup-v1'`**. Enforced in three independent places:

1. **Upstream SQL** (run by Claude in chat) - picks IDs that aren't already in warmup-v1 recipients
2. **Script global check** - before any send loop starts, verifies no input ID overlaps
3. **Script per-contact check** - immediately before each individual send

All three must pass every time. Any trip = halt and investigate.

---

## Where we are now (21 April end of day)

**Phase:** Reconnaissance, build, and test complete. Ready for Send #1.

**Next concrete action:** Monday 27 April morning - Claude.ai picks the first 50 contacts, James runs the script via Claude Code.

**Pool remaining:** ~1,903 contacts (to be re-verified on Monday by the pick query).

---

## The plan at a glance

| Phase | When | What | Status |
|---|---|---|---|
| Recon | Tue 21 Apr | Understand code, check Resend health, verify unsubscribe works | ✅ Done |
| Build | Tue 21 Apr | Claude Code built `scripts/send-warmup-manual.js` | ✅ Done |
| Test | Tue 21 Apr | Phase 1 dry run + Phase 2 real send of 1 | ✅ Done |
| **Send #1** | **Mon 27 Apr** | **First 50 - restart starts** | **⏳ Next** |
| Send #2 | Tue 28 Apr | 100 | ⏳ Pending |
| Sends #3-4 | Wed-Thu 29-30 Apr | 250 each | ⏳ Pending |
| Sends #5+ | Fri 1 May onwards | 500 each until pool is 0 | ⏳ Pending |
| Complete | ~Fri 1 May onwards | 4-8 working days at top rate | ⏳ Pending |

Ramp rationale: smaller batches at first rebuild confidence and let us catch any Gmail/Outlook placement issues early. Max single batch: 500 (hard cap in the script).

---

## Daily send ritual (the recipe for each send)

Use this for Send #1 on Monday and every subsequent day. The rhythm is designed to be deliberately slow and observable.

### Step 1: Claude.ai - pick the batch

Run this SQL, adjusting `:batch_size` for the day's ramp:

```sql
SELECT
  c.id,
  c.signup_email,
  c.first_name,
  c.tier,
  c.created_at
FROM contacts c
WHERE c.newsletter_status IN ('active', 'confirmed')
  AND c.zb_status IN ('valid', 'catch-all', 'unknown')
  AND c.id NOT IN (
    SELECT DISTINCT contact_id
    FROM newsletter_recipients
    WHERE send_id IN (
      SELECT id FROM newsletter_sends WHERE issue_key = 'warmup-v1'
    )
  )
ORDER BY
  CASE c.tier
    WHEN '1' THEN 1
    WHEN '2' THEN 2
    WHEN '3' THEN 3
    ELSE 4
  END,
  c.created_at ASC
LIMIT :batch_size;
```

**Batch sizes for each send:**

| Send # | Batch size |
|---|---|
| 1 (Mon 27 Apr) | 50 |
| 2 (Tue 28 Apr) | 100 |
| 3 (Wed 29 Apr) | 250 |
| 4 (Thu 30 Apr) | 250 |
| 5+ | 500 |

**After running:**

1. Paste the result list to James for his eyeball
2. Confirm row count matches intended batch size
3. Note the tier mix (e.g. "50 contacts: 50 from tier 1")
4. Extract the `id` column as a JSON array - this is what Code will use

### Step 2: Claude Code - save the IDs file

Ask Claude Code to create `./tmp/send-<N>-ids.json` containing the JSON array. Example for Send #1:

```
Create the file ./tmp/send-1-ids.json containing exactly:
[123, 456, 789, ...]
```

### Step 3: Claude Code - dry run

Ask Code to run:

```
npx tsx scripts/send-warmup-manual.js --ids-file=./tmp/send-1-ids.json --dry-run --note="Send #1 dry run"
```

Verify in the output:

- All 7 steps complete cleanly, exit code 0
- Step 2 (global pre-send check) returned no overlaps
- Step 3 found the expected number of contacts, all eligible
- Step 4 fetched "The space between the lines" content
- Step 5 was SKIPPED (dry run)
- Step 6 logged `[DRY N/M] Would send to ...` for each contact
- Summary: "DRY RUN - no sends fired, no rows written"

If any halt: show James the error, do NOT retry, investigate.

### Step 4: Claude Code - real send

Ask Code to run:

```
npx tsx scripts/send-warmup-manual.js --ids-file=./tmp/send-1-ids.json --note="Send #1 - first real batch of 50"
```

Verify in the output:

- All 7 steps complete, Resend accepted every send
- Step 5 created a newsletter_sends row (capture the send_id)
- Step 6 logged `[N/M] Sent to ... resend_id=...` for each contact
- Final summary: send_id printed, batch size sent matches intended, duration shown
- Exit code 0

If any halt mid-loop: read the error, surface to James, DO NOT retry. Halt-don't-skip is the point.

### Step 5: Claude.ai - three verification queries

Post-send verification. All three should pass.

**Query A - row count matches:**

```sql
SELECT
  COUNT(*) AS rows_created,
  COUNT(DISTINCT contact_id) AS unique_contacts
FROM newsletter_recipients
WHERE send_id = '<new send_id>';
```

Expected: both equal the batch size.

**Query B - no overlap with previous warmup-v1 sends:**

```sql
SELECT c.id, c.signup_email, COUNT(DISTINCT nr.send_id) AS distinct_sends
FROM newsletter_recipients nr
JOIN contacts c ON c.id = nr.contact_id
WHERE nr.contact_id IN (
  SELECT contact_id FROM newsletter_recipients
  WHERE send_id = '<new send_id>'
)
AND nr.send_id IN (
  SELECT id FROM newsletter_sends WHERE issue_key = 'warmup-v1'
)
GROUP BY c.id, c.signup_email
HAVING COUNT(DISTINCT nr.send_id) > 1;
```

Expected: **zero rows**. If any rows return, we have duplicates. Halt all future sends, raise with James.

**Query C - masthead date check** (added for Send #1 onwards, see "Known mystery" section):

```sql
SELECT
  content_json->>'date' AS date_passed,
  CASE WHEN POSITION('APRIL 2026' IN UPPER(html_body)) > 0 THEN 'APRIL ✓'
       WHEN POSITION('MAY 2026' IN UPPER(html_body)) > 0 THEN 'MAY ✓'
       WHEN POSITION('MARCH 2026' IN UPPER(html_body)) > 0 THEN 'MARCH - WRONG for this send'
       ELSE 'CHECK MANUALLY' END AS masthead_check
FROM newsletter_sends
WHERE id = '<new send_id>';
```

Expected: masthead shows the correct current month. If it shows MARCH or something unexpected, pause and raise with James before the next batch.

**Query D (10-15 min later) - delivery spot check:**

```sql
SELECT status, COUNT(*) AS rows
FROM newsletter_recipients
WHERE send_id = '<new send_id>'
GROUP BY status;
```

Expected: a mix of sent, delivered, possibly opened/clicked. Any `bounced` count above 5% of batch size = investigate before next send.

### Step 6: Update this running summary

Fill in the next row of the "Send-by-send log" with:

- Date, send number, batch size intended and sent
- Any Resend errors
- Bounce count from Query D
- Any anomalies or notes

Also update the "Day-by-day log" with a brief note for the day.

### Step 7: Decide the next day

- If all checks clean and bounces <3%: proceed to next day's batch size per ramp
- If bounces 3-5% or minor issues: hold the batch size, investigate, decide with James
- If bounces >5% OR any Query B violation OR Resend error: halt all future sends, discuss with James

---

## Stop conditions (halt immediately if any of these)

1. Query B returns any row (duplicate sends happened)
2. The script's global pre-send check halts (layer 2)
3. The script's per-contact check halts mid-loop (layer 3)
4. Bounce rate on any batch exceeds 5%
5. More than 3 unsubscribes come from a single batch
6. Resend returns rate-limit errors, 5xx errors, or domain warnings
7. Discrepancy between intended batch size and actual rows in newsletter_recipients
8. Query C shows unexpected masthead date

"Halt" means: stop the current script, don't queue tomorrow's send, raise with James immediately with the relevant output or error.

---

## Script and infrastructure

### What the script is

- **Path:** `scripts/send-warmup-manual.js` (in the mutomorro repo)
- **Invocation:** `npx tsx scripts/send-warmup-manual.js --ids-file=... [--dry-run] [--note="..."]`
- **Why `npx tsx`:** The script imports a .jsx React Email template. Plain `node` can't parse JSX. Don't use `node`.
- **Where it lives in git:** `scripts/` is gitignored. The script file is not tracked. When the warm-up is complete, the file can simply be deleted.

### What the script does

1. Loads and validates input (IDs file, env vars)
2. Runs global pre-send check (layer 2)
3. Fetches contacts, validates they're eligible
4. Fetches the most recent warmup-v1 content_json
5. Creates a new `newsletter_sends` row (`issue_key='warmup-v1'`, `status='sending'`)
6. For each contact: per-contact safety check (layer 3) → render personalised email → insert recipient row (`status='queued'`) → send via Resend with `List-Unsubscribe` headers → update recipient to `status='sent'` → sleep 250ms
7. Finalises the send row: `status='complete'`, sets `completed_at` and `total_sent`

### What the script does NOT do

- Re-enable the cron (`newsletter_config.enabled` stays `false`)
- Modify any existing API routes
- Batch via `resend.batch.send()` (sequential is deliberate, for observability)
- Re-try on failure (halts immediately)

### Required environment variables (in `.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `UNSUBSCRIBE_SECRET`

### Supabase project

- **Project ID:** `hzgnlxxnpvidnntiilcf`
- **Key tables:**
  - `contacts` - master list, key columns: `id`, `signup_email`, `first_name`, `newsletter_status`, `tier`, `zb_status`
  - `newsletter_sends` - one row per send run. Key columns: `id`, `subject`, `issue_key`, `status`, `total_recipients`, `total_sent`, `content_json` (JSONB), `html_body`, `created_at`
  - `newsletter_recipients` - one row per (send_id, contact) pair. Key columns: `send_id`, `contact_id`, `email`, `resend_id`, `status`, `sent_at`
  - `newsletter_config` - single-row config. `enabled` must stay `false`.

---

## Architecture details worth knowing

These non-obvious facts save time and prevent false alarms.

### Unsubscribe mechanism (RFC 8058 compliant, fully working)

Every recipient gets:

1. **A unique signed unsubscribe URL** - `https://mutomorro.com/api/unsubscribe?email=...&token=<HMAC-SHA256>`. Tamper-proof.
2. **`List-Unsubscribe` email headers** - both `List-Unsubscribe: <url>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. This makes Gmail and Outlook show the native "Unsubscribe" button at the top of the email.
3. **A working `/api/unsubscribe` endpoint** - handles both GET (click from email) and POST (mailbox button). Verifies token, updates `contacts.newsletter_status = 'unsubscribed'`.

**All 56 previous unsubscribes happened via this legitimate mechanism. Verified working on 21 April test send.**

### Critical: `html_body` stored in `newsletter_sends` is NOT what recipients received

This is the biggest potential false alarm for a future chat.

- Stored `html_body` = a "view in browser" fallback with a **placeholder unsubscribe URL** pointing to the homepage
- Actual sent email = re-rendered per recipient at send time with the recipient's unique signed URL

A future chat looking at `html_body` in Supabase might panic thinking the unsubscribe is broken. It isn't. The real email is always re-rendered per recipient.

### Resend health (as of 21 April)

- **Complaint rate: 0%** over 30 days - zero spam complaints despite the April incident
- **Deliverability: 98.57%**
- **Apparent bounce rate: 1.43%** - but almost all bounces are James's own OOO auto-reply bouncing admin notifications to himself. Real recipient bounce rate is well under 1%.
- **Domain status:** `send.mutomorro.com` verified, no warnings

### No audit trail for unsubscribes

There's no `unsubscribed_at` column on `contacts`, no dedicated unsubscribe table. Once marked `newsletter_status = 'unsubscribed'`, we can't tell when or how it happened. Not blocking, but worth knowing.

---

## Known mystery (resolved enough for Monday)

During the 21 April test send, the script rendered `html_body` with `date = "March 2026"` (inherited from the 17 April source row). After the send completed, **something updated the new row's `content_json.date` field to "April 2026"** - the rendered email had March, but the stored content_json now says April. No database trigger exists. James didn't make the change. Claude Code didn't report making the change.

**Why this is OK for Monday:** the script re-reads the most recent complete row's content_json each time it runs, then renders a fresh html_body from it. Today's row has `date: "April 2026"`. Monday's send will therefore render "APRIL 2026" in the masthead correctly. The mystery is about how that value got there, not about whether it's correct.

**Verification baked into Step 5:** Query C in the verification ritual checks the masthead date in every new send's html_body. Any deviation raises immediately.

**Worth investigating if time permits:** ask Claude Code directly "did you touch `content_json` on newsletter_sends row `fe32ad6a-f3cc-4527-936f-56ab392c6382` at any point on 21 April 2026?" before the next session.

---

## Housekeeping to do before Send #1

1. **Commit the `React import` fix** to `components/emails/newsletter-template.jsx`. Suggested message:

   ```
   Add React import to newsletter template for JSX runtime portability

   Enables rendering the template from standalone scripts that use the
   classic JSX transform (e.g. tsx). No-op under Next.js automatic JSX
   runtime, so production behaviour is unchanged.
   ```

   This is a genuine prod fix, worth its own commit. The other working-tree changes (`scripts/send-warmup-manual.js`, `.gitignore` /tmp/ entry, `tmp/` test files) are all either gitignored or local-only - no action needed.

2. **Confirm `newsletter_config.enabled = false`** with a quick query before Send #1. Should already be false.

---

## Bugs caught during test phase (learnings for future fresh chats)

Two genuine bugs, both surfaced by the two-phase test design, both fixed before any real sends went out:

1. **dotenv default path wrong** - `import 'dotenv/config'` loads `.env`, but the project uses `.env.local`. Fixed by explicit `dotenv.config({ path: path.join(__dirname, '..', '.env.local') })`. Matches the pattern in existing scripts (see `scripts/patch-project-images.js:10-14`).
2. **JSX runtime mismatch** - `components/emails/newsletter-template.jsx` relied on Next.js automatic JSX runtime. `tsx` uses the classic transform, needing `React` in scope. Fixed by adding `import React from 'react'` to the template. No-op under Next.js automatic runtime.

The halt-on-unexpected design caught both. Trust the halt.

---

## Files (single source of truth locations)

**Central plan documents (in /mnt/project/ and Claude.ai outputs):**

- `warmup-email-restart-brief-2026-04-21.md` - original 21 April brief from James (supplied at start of the 21 April session)
- `claude-code-brief-warmup-manual-script-2026-04-21.md` - the Claude Code build brief (written 21 April)
- `warmup-restart-running-summary-2026-04-21.md` - this document

**Older reference documents:**

- `session-summary-newsletter-incident-2026-04-17.md` - incident post-mortem
- `newsletter-next-steps-2026-04-17.md` - 17 April handoff (Workstream A-B-C plan, Workstream A partially superseded by the Path B pivot)

**Mutomorro repo (local on James's machine, github.com/mutomorro/mutomorro):**

- `scripts/send-warmup-manual.js` - the manual send script (gitignored)
- `tmp/` - test and send ID JSON files (gitignored)
- `components/emails/newsletter-template.jsx` - the React Email template (has the uncommitted React import fix)

---

## Send-by-send log

| Date | Send # | Intended | Sent | Resend errors | Bounces (~15min) | Unsubs | Notes |
|---|---|---|---|---|---|---|---|
| 21 Apr | Test | 1 | 1 | 0 | 0 | 0 | Phase 2 test to jamesbfg+claude@gmail.com (id=7062). send_id `fe32ad6a-f3cc-4527-936f-56ab392c6382`. Delivered, opened. Email rendered with date="March 2026" due to inheritance from source row. Masthead content_json.date subsequently updated to "April 2026" by unknown process. |
| 27 Apr | #1 | 50 | - | - | - | - | To be generated Monday AM |

---

## Day-by-day log

### 21 April 2026 (Tuesday) - Setup day

**Done:**

- Reviewed Resend dashboard: deliverability 98.57%, complaint rate 0%, no domain warnings
- Diagnosed that the 1.43% bounce rate was almost entirely OOO replies, not real audience bounces
- Read the existing send route and template code, confirmed the per-recipient rendering architecture
- Confirmed the unsubscribe mechanism is fully functional (RFC 8058 compliant, verified with live test)
- Chose Option A (standalone script) over Option B (adding a filter to the existing API route)
- Drafted the Claude Code brief
- Claude Code built `scripts/send-warmup-manual.js`
- Phase 1 dry run caught and fixed dotenv path bug
- Phase 2 real send caught and fixed JSX runtime bug
- Phase 2 real send to Gmail test alias arrived correctly, not in spam, delivered and opened event webhooks fired
- Three post-send verification queries all passed
- Flagged (unresolved) date-field mystery on the test row

**Carried forward to Monday:**

- Commit the React import fix to the template (genuinely shippable prod change)
- First real batch of 50 via the daily ritual

---

## Flags for the wiki

Four architectural details worth documenting in the Mutomorro Infrastructure doc:

1. **Unsubscribe is header-based and per-recipient rendered** - invisible from stored `html_body`. Future reviewers looking at Supabase alone will get the wrong impression.
2. **Stored `html_body` is a view-in-browser fallback, not the sent email.** Placeholder unsubscribe URL is expected.
3. **`UNSUBSCRIBE_SECRET` env var** must be set on whatever environment sends emails. Worth listing explicitly in the environment variables reference.
4. **Scripts in this project must explicitly load `.env.local`**, not rely on `dotenv/config` defaults. Pattern: see `scripts/patch-project-images.js:10-14`.

---

## Open questions parked (not blocking Monday)

1. **The date mystery** - what updated `content_json.date` on row `fe32ad6a` after the test send? Worth asking Claude Code directly.
2. **`updated_at` column on `contacts`** - doesn't exist, would help with audit trail. Trivial addition, not urgent.
3. **3 stuck `sending` rows from 25 March** in `newsletter_sends` - artefacts of initial setup, safe to update to `abandoned` or similar.
4. **Broken in-body unsubscribe link in view-in-browser HTML** - points to homepage instead of a real URL. Not used by real email recipients (they get the signed URL). Worth fixing before Drift in June.

---

## Resume protocol for a new session

1. **Read this document in full first.** The "Where we are now" section gives the current position. The "Daily send ritual" is the recipe.
2. **Before anything else, verify the current state is consistent with this doc:**
   - Run: `SELECT enabled, paused_reason FROM newsletter_config;` - should be `false`
   - Run: `SELECT COUNT(*) FROM newsletter_sends WHERE issue_key='warmup-v1' AND status='complete';` - note the number, compare to the send-by-send log
3. **Check the Resend dashboard** for any material changes since the last entry
4. **Pick up from the next row of the Send-by-send log**
5. **Update this document at the end of the session** - send log, day log, any new flags

---

## The user James's preferences (reminder for fresh chats)

- **GB English** throughout
- Dashes (-), not en dashes or em dashes
- **Short ordered lists** over dense paragraphs
- Plain language, conceptual framing first, jargon only when necessary
- James is not a developer - pitch technical explanations accordingly
- Warm, conversational tone - not clipped or literal
- Systematic, step-by-step approaches
- Running summary doc kept up to date

---

## End of handoff

Monday starts with Step 1 of the daily send ritual above. Good luck.
