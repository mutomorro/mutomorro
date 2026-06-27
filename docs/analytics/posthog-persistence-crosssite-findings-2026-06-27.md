# PostHog Persistence Fix + Cross-Site SoV Tracking - Findings

**Date:** 27 June 2026
**Scope:** The second instrumentation brief (persistence init-race + cross-site SoV handoff).
**Status:** **Investigation only - no code changed yet.** Part 1's fix turns out to be already shipped; Part 2's fixes are designed and waiting for your go-ahead.

---

## TL;DR

- **Part 1 (persistence) is already fixed.** The bug the brief describes was real, but it was fixed two days ago in commit `d650a2d` (25 Jun). The code already reads the consent cookie before starting PostHog and gives returning accepters their stored identity back. Nothing more to build here - **except** the optional "measure the accept rate" event, which is *not* there yet.
- **Part 2 (cross-site SoV) is confirmed broken on both sides, and the referrer is definitely being stripped.** All five outbound links use `rel="noopener noreferrer"`, so every crossing lands in the SoV site's "Direct" bucket invisibly. The SoV side's "Direct" visitors are suspiciously engaged (~19 pageviews each over 90 days), which is the tell-tale of warm crossings, not cold strangers. The fix (an outbound event + UTM tags) is designed below and ready to apply on your say-so.

---

## Part 1: Persistence init-race - already done

### What I found

The brief's diagnosis was correct *for the old code*, but the fix has already landed:

- **Commit `d650a2d` - "Fix PostHog persistence init to honour prior consent" (25 Jun 2026).**
- [app/providers.js](app/providers.js) now reads the `mutomorro_consent` cookie **before** `posthog.init`, and:
  - if `accepted` → starts in `localStorage+cookie` (so the returning visitor's stored `distinct_id` is loaded and their identity carries over);
  - otherwise → stays cookieless (`memory`), unchanged.
- The owner opt-out (`mutomorro_ph_opt_out`) short-circuit is intact.
- `TrackingScripts` still does the in-session upgrade for someone accepting for the first time.

That matches the brief's prescribed fix exactly, and ticks checklist items 1-3.

### What's left

| Item | Status |
|---|---|
| Read consent before init; accepters get `localStorage+cookie` | ✅ Already shipped (`d650a2d`) |
| Owner opt-out still short-circuits | ✅ Intact |
| First-time accepters still upgraded in-session | ✅ Intact (`TrackingScripts`) |
| Returning consented visitor keeps the same `distinct_id` across two sessions | ⏳ Worth a live confirm now that it's deployed (visit → accept → close → return) |
| Optional `cookie_consent` accept/decline event | ❌ **Not built** - recommended (see below) |

### Recommendation: add the `cookie_consent` event

This is the one genuinely-missing piece of Part 1, and it's worth doing. Right now we **can't see what fraction of visitors accept cookies** - and that accept rate is the hard ceiling on the entire returning-visitor / multi-session metric. A one-line event on accept and on decline (`cookie_consent`, with `decision: accepted | declined`) makes that measurable. Trivial and safe. Forward-only, no consent-UX change.

**Caveats (unchanged from the brief):** the persistence fix is forward-only - historical cookieless data is not retro-fixable, and no backfill should be attempted. Compliance is unchanged: persistent storage stays opt-in behind the banner.

---

## Part 2: Cross-site SoV tracking

### Step 0 - how the CTAs are actually built

There are **five** outbound links to `statesofvitality.com` on `/states-of-vitality`, not just the obvious button:

| # | Where | Type | Line |
|---|---|---|---|
| 1 | Hero | `SovExploreCta` button - "Explore States of Vitality →" | [page.js:151](app/states-of-vitality/page.js#L151) |
| 2 | Mid-page | `SovExploreCta` button | [page.js:537](app/states-of-vitality/page.js#L537) |
| 3 | Final "Ready to talk" section | `SovExploreCta` button | [page.js:822](app/states-of-vitality/page.js#L822) |
| 4 | "See the full product at..." | Inline text link - "statesofvitality.com →" | [page.js:755](app/states-of-vitality/page.js#L755) |
| 5 | Final section footnote | Inline text link - "statesofvitality.com →" | [page.js:825](app/states-of-vitality/page.js#L825) |

**Every one of them:**
- Opens in a new tab (`target="_blank"`).
- Carries `rel="noopener noreferrer"` → **the referrer is stripped client-side.** This is the smoking gun: it confirms why the SoV site sees zero referrals from us, regardless of any header on the SoV side.
- Points to the bare root `https://statesofvitality.com` - **no path, no UTM tags.**

Two more notes:
- The destination URL constant is **duplicated** (defined in both [page.js](app/states-of-vitality/page.js#L66) and [SovExploreCta.js](components/states-of-vitality/SovExploreCta.js)). A clean fix should collapse that to one source of truth.
- Because the links open a **new tab**, the mutomorro page does **not** unload when clicked - so firing a tracking event "before navigation" is reliable here (no `sendBeacon` gymnastics needed). This is the easy case.
- The SoV site's own `Referrer-Policy` header is **unknown** (separate repo, no access from here) - but it's moot: `rel="noreferrer"` already strips the referrer before the SoV site is even reached.

### SoV-side baseline (project 173891, last 90 days) - independently confirmed

| Referring domain | Pageviews | People |
|---|---:|---:|
| `$direct` | 698 | 36 |
| `statesofvitality.com` (internal nav) | 165 | 2 |
| `localhost` (your dev testing) | 182 | 2 |
| **mutomorro.com** | **0** | **0** |

- **Zero referrals from mutomorro.com**, and **zero UTM-tagged arrivals** (the `utm_source` property doesn't exist in the SoV project yet). Both confirmed.
- The `$direct` bucket averages **~19 pageviews per person over 90 days** - that's deeply engaged behaviour, not someone cold-typing a URL. It strongly suggests real Mutomorro → SoV crossings are sitting in "Direct" invisibly because the referrer is stripped. (Suggestive, not proof - which is exactly why we need tracking that survives stripping.)

### The proposed fix (two parts, both wanted) - awaiting your go-ahead

**A. `sov_site_clickthrough` event on the Mutomorro side (priority).**
Fire an event when any of the five SoV links is clicked, recording the crossing on *our* project (149097) before the new tab opens. Properties: `cta_location` (hero / mid / final / inline-light / inline-dark), the button label, the source page (`$pathname`, automatic), and the destination URL. Because the links open a new tab, this lands reliably. Event name `sov_site_clickthrough` is clear and doesn't clash (the old `sov_*` events are dead).

**B. UTM tags on the links.**
Append `utm_source=mutomorro&utm_medium=cta&utm_campaign=sov_handoff&utm_content=<location>` to each link's URL. PostHog on the SoV side (173891) captures these automatically - so even with the referrer stripped, SoV arrivals get attributed to us, and `utm_content` tells us which CTA drove them.

**Together:** A says "they crossed" (our side); B says "they arrived and here's what they did next" (SoV side).

**Design recommendation (a small judgement call for you):** route all five links through **one shared client component** (extend the existing `SovExploreCta` into a single `SovLink` that renders either the button or the inline-text style). That gives one source of truth for the URL, the UTM tags, and the event - so the two inline links can't drift out of sync with the buttons, and the duplicate constant goes away. The alternative (patch each link in place) is faster but leaves five copies to keep aligned. One wrinkle to handle: `page.js` is currently a server component, so the click handler needs to live inside the client component (the recommended approach handles this cleanly).

### Cross-domain identity stitching - feasibility only (NOT to be built)

The brief asks whether we could follow a *single person* across both sites as one identity. Short answer: **feasible but not cheap, and consent-sensitive - not worth it as a first step.**

- The two sites are **separate PostHog projects** (149097 vs 173891). PostHog's built-in cross-domain tracking only shares an identity *within one project*; it can't natively join a person across two projects.
- So stitching would need either **(a)** merging both sites into one PostHog project (a big change that disrupts the SoV site's own analytics), or **(b)** passing our `distinct_id` across the link (e.g. a URL param) and having the SoV snippet adopt it - custom work in **both** repos, plus a real consent question (consent given on mutomorro.com does **not** legally carry to statesofvitality.com under UK PECR, so we'd need consent handling on the SoV side too).
- **Verdict:** the UTM + outbound-event approach (A + B) answers ~90% of the question - did they cross, did they arrive, what did they do next - at a fraction of the cost and risk. Recommend shipping A + B now and revisiting full stitching only if single-person journeys become essential.

---

## Overlap with the first brief (flagged, no conflict)

The SoV outbound-click tracking here is the **same fix** I proposed in the first audit report (its fix #2); this brief just specifies it properly (event name + UTM). No file conflict: the scroll work touches only `components/ScrollDepth.js`, while this touches `components/states-of-vitality/SovExploreCta.js` and `app/states-of-vitality/page.js`. They can proceed independently.

---

## What I'd do next, on your word

1. **Part 1:** add the `cookie_consent` accept/decline event (small, safe). Live-confirm returning-visitor continuity post-deploy.
2. **Part 2:** build the shared `SovLink` component → `sov_site_clickthrough` event + UTM on all five links; test that the event lands in 149097 and a tagged click shows up in 173891.
3. **Not** building cross-domain stitching (feasibility noted above) without a separate decision.
