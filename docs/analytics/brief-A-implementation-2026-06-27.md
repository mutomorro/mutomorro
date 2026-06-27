# Brief A - Scoreboard Bundle: Implementation Note

**Date:** 27 June 2026
**Project:** mutomorro.com (PostHog 149097)
**Status:** Built and committed to `main`. Two items need you before they're fully live (privacy copy, and re-pointing two saved insights). Runtime click-tests are listed per fix - they can only be done once this deploys.

---

## Plain-language summary

All eight items are handled. Six are done in code and shipped. One (session recording) is wired and safe but deliberately not switched fully on yet - it needs a short privacy-page note from you first, and a toggle in PostHog, so we don't record before we've disclosed it. One (`source_page` cleanup) I held back on purpose, because two of your saved scoreboard insights rely on it and I didn't want to break them silently.

I verified every changed file parses cleanly. I did **not** run a live browser test or your dev server (per your standing preference), so the "did the event actually land" checks are listed for after this deploys.

---

## Fix-by-fix

| # | Fix | Status | Commit |
|---|---|---|---|
| 1 | Scroll-tracker timing bug | ✅ Done | `a13ae7d` |
| 2 | SoV handoff event + UTM tags | ✅ Done | `2b6aa6d` |
| 3 | Free/ungated download tracking | ✅ Done | `59f94ac` |
| 4 | Service → enquiry attribution | ✅ Done | `a4ec781` |
| 5 | `cookie_consent` event | ✅ Done | `fc91243` |
| 6 | Session recording (consent-gated) | ⚠️ Code done; **needs you** (privacy copy + PostHog toggle) | `fc91243` |
| 7a | Dead-click config tidy | ✅ Done | `fc91243` |
| 7b | Confirm `cta_click` fires | ⏳ Needs a manual click after deploy | - |
| 8 | Retire `source_page` | ⛔ **Held - needs a decision** (2 insights depend on it) | - |

### 1. Scroll-tracker timing bug ✅ `a13ae7d`
The tracker no longer gives up when PostHog isn't ready yet on a fresh page load. Listeners attach immediately, the actual send waits until PostHog is ready, and a threshold isn't marked "fired" until it genuinely sends - so the first real scroll after start-up still counts. Short pages are handled by a brief, capped readiness poll. This restores scroll coverage on every page type at once.
**Check after deploy:** confirm `scroll_depth` now appears on a service page, an article, and `/states-of-vitality` (pinned to 149097).

### 2. SoV handoff event + UTM tags ✅ `2b6aa6d`
All five outbound links to statesofvitality.com now go through one new shared component (`SovLink`) - the three buttons and the two inline text links. Each one:
- fires `sov_site_clickthrough` (with `cta_location` = hero / mid / final / inline-light / inline-dark, the link label, and the destination) before the new tab opens;
- carries `utm_source=mutomorro&utm_medium=cta&utm_campaign=sov_handoff&utm_content=<location>`.
The duplicated destination-URL constant is now in one place. Visual styling is unchanged (same classes/variants).
**Check after deploy:** click a link → `sov_site_clickthrough` lands in 149097 with the right `cta_location`; and a UTM-tagged arrival appears in the SoV project 173891 (it'll be the first one - `utm_source` doesn't exist there yet).

### 3. Free/ungated download tracking ✅ `59f94ac`
The free "no sign-up" download now fires `resource_download` with `gated: false`; the gated form fires the same event with `gated: true`. So free and gated downloads are countable together and apart, and the newsletter PDF stops being invisible.
**Check after deploy:** trigger a free download → `resource_download` with `gated:false` in 149097.

### 4. Service → enquiry attribution ✅ `a4ec781`
"Talk to us" on a service page now links to `/enquiry?service=<slug>`. The enquiry form already reads that and puts it on `contact_form_submitted` (and forwards it to the enquiry email), so enquiries are now attributed to the service they came from.
**Check after deploy:** click "Talk to us" from a service page → the service value reaches `contact_form_submitted` in 149097.

### 5. `cookie_consent` event ✅ `fc91243`
Fires on both accept and decline with `decision: accepted | declined`, hooked onto the existing consent handlers. Decline is captured just before tracking is switched off, so both land. No change to the banner. This makes the accept rate measurable - the ceiling on every returning-visitor and multi-session metric.
**Check after deploy:** accept (then, separately, decline) in a clean session → both fire with the right `decision`.

### 6. Session recording - consent-gated ⚠️ code done, needs you
**What's done in code:** recording is gated on the same consent as everything else - it's off for fresh, cookieless, and declined visitors, and only runs for visitors who have accepted. First-time accepters start recording mid-session. Typed input is masked by default.
**What it needs from you before it actually records (two steps, do them together):**
1. **Publish a short privacy-page note** about session recording. Because this is compliance-facing and you publish copy yourself, I've drafted it below for your approval rather than publishing it. The privacy page is hard-coded (`app/privacy/page.js`), so once you're happy with the wording I'll add it.
2. **Flip the PostHog project toggle:** Settings → Session Replay → "Record user sessions" (project 149097). Until this is on, nothing records, even with the code shipped. I deliberately did **not** flip it, so recording can't go live before the disclosure does.
**Check after both:** an accepting session produces a recording; a declining / cookieless one does not.

### 7a. Dead-click config tidy ✅ `fc91243`
`capture_dead_clicks: false` was nested under `autocapture`, where PostHog ignores it - so dead clicks were firing ~4,370/week despite the intent. Moved to the top level (confirmed against PostHog docs that this is the correct place).
**Check after deploy:** `$dead_click` volume should drop to ~0.

### 7b. Confirm `cta_click` fires ⏳
Nothing to change - it just needs one real click on the nav "Talk to us" after deploy to confirm it's firing (it had 0 events, almost certainly just low usage). Only worth investigating if it stays at zero after a genuine click.

### 8. Retire `source_page` ⛔ held - needs a decision
I checked first, as the brief said, and **two saved insights filter/break-down on `source_page`:**
- **"B3 - Conversion scoreboard, real events (180d)"** (id 4718598)
- **"B4 - Enquiry vs Contact submits over time (180d)"** (id 4718826)

If I removed `source_page` now, those two would quietly stop getting new data from the deploy date (new events wouldn't carry the property). That's exactly the "silent orphaning" the brief said to avoid. **So I left `source_page` in the code, untouched.**

**Recommended path:** re-point those two insights from `source_page` to `$pathname` first (they carry identical values - confirmed in the audit), confirm they still read correctly, *then* retire `source_page` in code as a clean follow-up. I can do the re-pointing (the MCP can now edit insights) on your say-so, or you can, and then I'll remove the property. Either way it's a small, deliberate step - not worth rushing into this bundle.

---

## ⚑ For James specifically

### (a) Proposed privacy-page copy for session recording - please approve before I add it

Suggested new section, to slot in after **"What tracking we use and why"** on `/privacy`. Plain English, house style (no em dashes):

> ### Session recording
>
> When you accept cookies, we sometimes record how the site is used - mouse movement, clicks, scrolling, and which pages you move between - so we can see what's working and fix what isn't. Think of it like watching an anonymous screen recording of a visit.
>
> We do not record what you type. Form fields, including your name and email, are hidden automatically before anything is saved. The recording is tied to an anonymous visitor, not to you personally.
>
> This only happens if you accept cookies. If you decline, nothing is recorded, and the site works exactly the same.

I'd also suggest adding one row to the cookie table so it's listed there too:

> | Session recording | Records anonymous, masked playback of how the site is used (only if you accept) | Tied to your cookie choice |

Tell me if you want it softer/shorter or worded differently, and I'll put it in and prepare it for you to publish.

### (b) Two saved insights to re-point before `source_page` is retired
"B3 - Conversion scoreboard" (4718598) and "B4 - Enquiry vs Contact submits" (4718826). They need their `source_page` breakdown/filter swapped to `$pathname`. Want me to do it?

---

## Anything different from the brief?

- **Item 8 (`source_page`) was held**, not done - because of the two dependent insights above. The brief explicitly allowed this ("if the migration risk is non-trivial, flag it... we'll do the re-pointing as a deliberate follow-up").
- **Item 6 (session recording)** is shipped in code but intentionally not capturing yet - it waits on your privacy note + the PostHog project toggle, so we disclose before we record. The brief's verification step can only run once those two are done.
- **Verification is static only so far:** all ten changed files parse cleanly (esbuild). The "event landed" checks need this to deploy first; none could be run without your dev server or production, which I didn't touch.

---

## Wiki updates owed (for you to approve into Craft - not written by me)

- **Infrastructure and Systems** (`cc3515eb`): new events `sov_site_clickthrough`, `cookie_consent`, and the `gated` property on `resource_download`; session recording now consent-gated (pending the project toggle); the scroll timing-bug fix; `?service=` now flows to enquiries; dead-click capture corrected; and the "pin the PostHog project ID on every query" lesson.
- `source_page` retirement is **pending** (blocked on re-pointing insights 4718598 / 4718826 to `$pathname`).
- The SoV site has **no consent mechanism** - to be handled in Brief B.
