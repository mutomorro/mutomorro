# PostHog Instrumentation Audit - Findings

**Date:** 27 June 2026
**Scope:** Full sweep of PostHog tracking across the whole site, verified against both the code and 7-120 days of live data.
**Status:** Audit and report only. No tracking code was changed. Proposed fixes are listed at the end for your sign-off.

---

## The one-paragraph version

The foundations are sound: pageviews, downloads, enquiries and newsletter signups are all firing correctly and from the right place. But **scroll tracking is effectively broken on the pages that matter most** - not because it was left off some templates (it's actually on every page), but because of a timing bug that stops it starting on any page a visitor *lands* on directly from Google. It only works after someone clicks around inside the site. Separately, the two **States of Vitality events you were worried about aren't "low conversion" - they were deliberately deleted three weeks ago**, so that page now has no conversion tracking at all. A handful of smaller events are either brand new and unverified, or are old test events that should be ignored. None of the "healthy" events hide a coverage gap, with one exception: free (ungated) downloads fire nothing.

---

## 1. Summary table - every custom event

Coverage key: ✅ full / ⚠️ partial or needs a look / ❌ broken or dead

| Event | Where it fires (from the code) | Coverage | One-line verdict |
|---|---|---|---|
| `$pageview` | Manual, on every page + every in-site navigation ([PostHogPageView.js](app/PostHogPageView.js)) | ✅ | Healthy. Not double-firing (checked). |
| `tool_download` | The PDF form on every `/tools/*/template` page ([ToolDownloadForm.js:125](components/ToolDownloadForm.js#L125)) | ✅ | Healthy (504 in 120d). Fires only on server-confirmed success. |
| `contact_form_submitted` | The enquiry form, used on **both** `/contact` and `/enquiry` ([ContactForm.js:45](components/ContactForm.js#L45)) | ✅ | Healthy. Server-confirmed. Captures the source page. |
| `newsletter_signup` | Every newsletter form - footer, inline, homepage ([NewsletterSignup.js:64](components/NewsletterSignup.js#L64)) | ✅ | Healthy. Captures source page + "already subscribed". |
| `service_cta_click` | The two-button CTA + the PDF offer on service pages ([ServiceTripleCta.js:19](components/ServiceTripleCta.js#L19), [ApproachPdfOffer.js:22](components/services/ApproachPdfOffer.js#L22)) | ✅ | Healthy for its scope. Captures which CTA, which service, which position. |
| `resource_download` | The **gated** download form on `/resources/[slug]` ([ResourceDownloadForm.js:98](components/ResourceDownloadForm.js#L98)) | ⚠️ | Works - but **only gated resources**. Free/ungated downloads fire nothing (see Issue C). |
| `form_started` | First keystroke in 4 forms: contact, newsletter, resource, tool ([analytics.js:33](lib/analytics.js#L33)) | ⚠️ | New (25 Jun), looks correct. **Not** wired to the drift audit. Gives you a started-vs-submitted funnel for those 4. |
| `scroll_depth` | Mounted globally for every page in [LayoutShell.js:70](components/LayoutShell.js#L70) | ❌ | **Broken in practice** - a timing bug stops it on direct-landing pages. This is the headline issue (Section 2). |
| `drift_audit_started` | "Start" button, Drift Audit ([DriftAudit.js:422](components/DriftAudit.js#L422)) | ✅ | Fires correctly. |
| `drift_audit_completed` | After the final (12th) question ([DriftAudit.js:306](components/DriftAudit.js#L306)) | ✅ | Fires correctly. The 10→3 drop is real behaviour, not a gap (Section 3). |
| `drift_audit_link_copied`, `drift_audit_opened_from_share` | Share buttons, Drift Audit | ✅ | Minor, fire correctly. (Not in your original inventory.) |
| `cta_click` | The "Talk to us" button in the top nav ([Nav.js:354](components/Nav.js#L354)) | ⚠️ | **0 events in 120 days.** New (25 Jun). Probably just low clicks, but needs a 2-minute confirm (Issue D). |
| `$identify` (via `identifyLead`) | On all 4 form submits - links a lead's email to their history ([analytics.js:22](lib/analytics.js#L22)) | ✅ | Working (hashed email, privacy-safe). See Identity note. |
| `sov_overview_download` | **Nowhere - deleted 11 Jun** | ❌ | Dead. The 3 events are historical. (Section 4 / Issue B.) |
| `sov_quote_request` | **Nowhere - deleted 11 Jun** | ❌ | Dead. The 1 event is historical. |
| `diagnostic_completed` + 3 siblings | **Nowhere - removed/renamed** | ❌ | Orphaned. All 32 events came from **one person** over 1-5 May (your own testing), before the tool was re-instrumented as `drift_audit_*`. Ignore. |
| `_rotation_test` | **Nowhere** | ❌ | A single test event from 21 Apr. Ignore. |

---

## 2. The scroll coverage map (the priority)

### What the data shows

In the last 7 days, scroll fired on `/`, `/about`, `/tools` and `/tools/*` - and **nowhere else**. This is not a small-sample fluke for the big sections:

| Section | Pageviews (7d) | Scroll events (7d) |
|---|---:|---:|
| tools (incl. /template) | 1,668 | 60 |
| "other" (utility + misc pages) | 1,692 | 0 |
| articles | 669 | 0 |
| services | 601 | 0 |
| states-of-vitality | 595 | 0 |
| home | 35 | 7 |
| projects | 33 | 0 |
| emergent-framework | 27 | 0 |
| about | 16 | 3 |
| develop | 3 | 0 |

601 service pageviews and 669 article pageviews with *exactly zero* scrolls is a coverage gap, not chance. And it isn't bots: bot/AI-crawler traffic is only ~1.2% of pageviews (64 of 5,338), so those service and article pageviews are real people.

### The root cause (and why the brief's hypothesis was close but not quite right)

The brief guessed scroll tracking "was added to some templates but not others." **It's actually on every page** - it lives in `LayoutShell`, which wraps the entire site. So the gap has a different, subtler cause:

**It's a start-up timing bug.** The scroll tracker ([ScrollDepth.js:19](components/ScrollDepth.js#L19)) checks "is PostHog loaded yet?" the instant the page mounts, and if not, it gives up and never attaches its scroll listeners. PostHog is started up by a component that sits *above* it in the page, and React runs the inner component first - so on any **fresh page load, the tracker checks before PostHog has finished starting, sees "not ready", and silently switches itself off for that page.** It only re-arms when you navigate to another page *inside* the site (a click that doesn't reload the browser).

That single mechanism explains the whole pattern:

- **Tools** is a browse-y section - people land on `/tools`, then click tool → tool → template *inside the site*. Those in-site clicks re-arm the tracker, so scroll fires. ✅
- **Service / article / SoV / emergent pages** are mostly **destination landings from Google**. The visitor arrives directly (a fresh load → tracker off), reads, and leaves or converts without an in-site click. So scroll never arms. ❌
- The data backs this up directly: scroll events overwhelmingly happen on **non-entry** pages (58 events) rather than the page a session started on (12, and those are return-visits to the entry path).

So the gap lands almost perfectly on your commercial pages - the exact ones a site review most needs scroll data for.

**Confidence:** High. It's provable from the code (the load-order is fixed by how React works) and it matches every cut of the data. I deliberately did **not** run a live browser test, because doing so would have injected fake scroll events into the very pages we're auditing on audit day. A 2-minute local test would confirm it if you want belt-and-braces before fixing.

### What "depth" means (so you read it correctly)

- It's **fixed thresholds: 25 / 50 / 75 / 100**, not a continuous "how far did they get" number. (Confirmed in code.)
- A single visitor who reads to the bottom emits **up to 4 events** (one as they cross each threshold). So to answer "how many people scrolled past halfway", count **distinct people with depth ≥ 50**, never count events.
- `depth = 100` is **ambiguous**: it means *either* "scrolled to the bottom" *or* "the page was short enough to fit on screen with no scrolling needed". The short-page case carries an extra flag `full_page: true`, so you can tell them apart - but only if you check for it.

### `$pathname` vs `source_page`

Good news: on every scroll event in the data, these two **agree exactly** - the "they don't always agree" worry didn't show up. `source_page` is just a hand-set copy of the path. Recommendation: **standardise on `$pathname`** for any analysis, because PostHog attaches it to *every* event automatically (including pageviews and autocapture), whereas `source_page` only exists on our custom events. `source_page` is harmless but redundant.

---

## 3. Drift audit: is the 10→3 drop real?

**Yes, it's real behaviour, not a tracking gap.** `drift_audit_completed` only fires once a visitor has answered **all 12 questions** and clicked past the last one ([DriftAudit.js:306](components/DriftAudit.js#L306)). A ~30% completion rate on a 12-question self-assessment is entirely normal. Both ends fire correctly; the drop-off is genuine.

---

## 4. States of Vitality: not low conversion - deliberately switched off

This is the most important correction to the brief's assumptions.

`sov_overview_download` (3 events) and `sov_quote_request` (1 event) **do not exist anywhere in the current code.** They were:

- **Added** 28 April (a lead-capture version of the SoV page).
- **Removed** 11 June, in commit `1dae22c` *"chore: remove orphaned SoV quote/overview lead-capture code"*.
- Their last-ever events are 1 June - before the removal. They will **never fire again.**

The page today ([SovExploreCta.js](components/states-of-vitality/SovExploreCta.js)) is a **bridge page**: its only action is one button, *"Explore States of Vitality →"*, which sends people to the separate `statesofvitality.com` product site. **That outbound click is not tracked at all.**

So for your upcoming SoV investigation: the question isn't "is the download button broken?" - there is no download button. The real finding is that **`/states-of-vitality` currently has zero conversion tracking**, and the one thing it's trying to do (hand visitors off to the product site) is invisible. If measuring that handoff matters, we'd need to add an outbound-click event (see Proposed fixes).

---

## 5. Other confirmed issues (ranked by impact on the planned review)

**A. Scroll tracking broken on commercial pages** - *highest impact.* Covered in Section 2. Without this, the review's "engagement depth" signal is missing on services, articles, SoV, projects, emergent and develop.

**B. SoV page has no conversion tracking** - *high impact for the SoV investigation.* Covered in Section 4.

**C. Free (ungated) downloads fire nothing** - *medium.* The gated download form fires `resource_download`, but the ungated "No sign-up, no email" download is a plain link with no event ([resources/[slug]/page.js:428](app/resources/[slug]/page.js#L428)). So any free resource - including the monthly newsletter PDF - is downloaded invisibly. This is *why* `resource_download` looks tiny (8): it only ever counts gated resources. It's not broken, but it under-counts real download activity.

**D. `cta_click` has never fired** - *low, but verify.* The top-nav "Talk to us" button is wired to emit `cta_click`, but there are 0 events in 120 days. It's new (25 June) and uses the same code as `form_started` (which works), so it's most likely just rarely clicked - but worth one manual click to confirm it's not silently failing, since the review will want CTA data.

**E. Enquiries lose their "which service" context** - *low/medium attribution gap.* When someone clicks "Talk to us" on a service page, we record `service_cta_click` *with* the service name - but the link sends them to `/enquiry` **without** carrying the service through ([ServiceTripleCta.js:27](components/ServiceTripleCta.js#L27)). So the resulting `contact_form_submitted` has no service attached. You can still join the two via the session, but it's not direct. Easy to fix later by passing `?service=` on that link.

**F. "Dead click" tracking is on, though the code tries to switch it off** - *cosmetic / noise.* The config asks to disable dead-click capture, but the setting is nested in the wrong place ([providers.js:36-38](app/providers.js#L36)), so it has no effect - PostHog is recording ~4,370 `$dead_click` events a week. Harmless, but it's noise and not what the code intends.

---

## 6. Interpretation notes (things to know to read the data correctly)

- **Pageviews are NOT double-firing.** Only 0.26% of pageviews (14 of 5,338) are rapid same-page repeats. The App Router setup (manual pageview, autocapture's own pageview turned off) is the recommended pattern and is behaving.
- **Trailing slashes are a non-issue.** Only 7 of 12,359 pageviews over 30 days hit a `/path/` variant (0.06%). The site's redirects already consolidate them. Worth knowing, not worth acting on.
- **Bots are negligible** (~1.2% of pageviews), so you don't need to mentally discount traffic for crawlers.
- **What's switched on:** autocapture (raw clicks) ✅, web vitals ✅, page-leave ✅, dead clicks ✅ (unintentionally - see F). **Session recording is OFF.** If you want recordings for the SoV investigation, that's a deliberate switch to flip (with a consent consideration), not something already capturing.
- **Consent model:** before a visitor accepts cookies, PostHog still captures events but "cookielessly" (no cross-visit memory). If they *decline*, capture stops entirely. This is why returning-visitor and multi-session funnels are thin - it's a privacy choice, not a bug.
- **Events go through a first-party proxy** (`/ingest` → PostHog), which helps them survive ad-blockers.

### Identity (documented, not changed - as instructed)

On every form submit we call `identify` with a **hashed** version of the email (`lead_<hash>`), never the raw address ([analytics.js:22](lib/analytics.js#L22)). This stitches a lead's anonymous browsing to a stable ID without putting personal data in PostHog. It means the review *can* connect "this person downloaded X then enquired" - but reliably only for visitors who accepted cookies (otherwise the ID isn't remembered between visits). Only 7 identifies in 120 days, consistent with the low number of conversions. **No changes made** - flagging only, per the brief, because anything here has privacy implications worth a proper decision.

---

## 7. Proposed fixes (for your approval - nothing applied yet)

### Obvious + safe (low risk, clear benefit)

| # | Fix | Effort | Risk | Notes |
|---|---|---|---|---|
| 1 | **Fix the scroll-tracker timing bug** so it works on direct landings too. The tracker is already on every page; we just need it to wait for PostHog to be ready instead of giving up. ~5 lines in [ScrollDepth.js](components/ScrollDepth.js). | Small | Low | This single change fixes coverage everywhere at once - services, articles, SoV, emergent, develop, projects all start reporting. Recommend a quick local test after. |
| 2 | **Track the SoV outbound click** - add one event when someone clicks "Explore States of Vitality →". | Tiny | Low | Gives the SoV investigation the one signal that page actually has. |
| 3 | **Track free/ungated downloads** - add a `resource_download` (or similar) to the free-download link. | Tiny | Low | Makes the newsletter PDF and other free resources visible. |
| 4 | **Pass `?service=` from service-page CTAs to `/enquiry`** so enquiries keep their service context. | Tiny | Low | Direct service→enquiry attribution for the review. |

### Worth doing, but tidy-up rather than urgent

| # | Fix | Effort | Risk | Notes |
|---|---|---|---|---|
| 5 | **Move the dead-click setting** to where it takes effect (or decide to keep dead clicks on). | Tiny | Low | Removes ~4,370 noise events/week. |
| 6 | **Confirm `cta_click` fires** with one manual nav click; only investigate if it stays at zero. | Tiny | None | Likely just low usage. |

### Needs a decision (don't do without discussion)

| # | Topic | Why it needs a decision |
|---|---|---|
| 7 | **Standardise on `$pathname`, retire `source_page`** | A cleanup with a small migration cost; affects how existing saved insights are built. Document now, change deliberately later. |
| 8 | **Turn on session recording** for the SoV investigation | Genuinely useful, but has consent/privacy implications - your call, not a silent flip. |
| 9 | **Add `form_started` to the drift audit** | Would complete the started→completed funnel for that tool, but it already has its own `drift_audit_started`; decide whether you want both for consistency. |
| 10 | **Identity behaviour** | No change recommended without a privacy conversation (per the brief). Documented above. |

---

## Appendix: a data-trust note for next time

While auditing I hit a real gotcha worth recording: the PostHog connector **silently reverted to its default project (moresapien) mid-session**, and several queries quietly returned *that* site's data (only ~600 events, no custom events) instead of mutomorro's. The numbers looked wrong, which is the only reason I caught it. **Every figure in this report was re-run after explicitly pinning the project to mutomorro (149097).** For the bi-weekly review tooling, we should pin the project id on every query rather than trusting the "active" project - otherwise a review could one day silently report the wrong site's numbers.
