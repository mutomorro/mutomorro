# Newsletter deliverability audit — 25 Jun 2026

Scope: mutomorro.com monthly newsletter via Resend (Amazon SES). Trigger: one test recipient (`james@photekton.com`) landed in spam; full-list send (~3,800) is ~2 weeks out. DNS verified first-hand with `dig`; templates/send code read in repo; current Resend/SES/DMARC guidance checked.

## Executive summary

- **Authentication is genuinely sound.** Both DKIM and SPF align to the From domain and DMARC PASSES for these sends (DKIM `d=mutomorro.com` is identifier-aligned; envelope `send.mutomorro.com` aligns to From under relaxed SPF). This is the part you do *not* need to panic about before the full send.
- **The photekton spam landing is almost certainly a weak/false signal, not a systemic fault.** `photekton.com` runs on Google Workspace (`dig MX` → `smtp.google.com`), so it was Gmail's filter. Gmail leans heavily on *domain reputation + per-recipient engagement*; a near-dead catch-all test inbox with zero prior opens is exactly the kind of address Gmail spam-files on thin reputation. One such address is not evidence of a list-wide problem.
- **Nothing here is a hard blocker** for the ~3,800 send — auth passes, plain text is auto-generated, one-click unsubscribe and a postal address are present, link tracking is first-party (no misaligned tracking domain). **SUPERSEDED — see "Update" below:** the original audit cleared the send to proceed, but Google Postmaster data on a real send (Drift = 1.03% spam) added one genuine pre-send action — trim the never-engaged.
- **Two things are worth doing before the send as cheap insurance:** (1) check the domain's current standing in Resend Deliverability Insights + Google Postmaster Tools, and (2) confirm the ~3,800 audience is genuinely opt-in/engaged (a young low-volume sender blasting a large cold-ish list in one month is the single biggest reputation risk here — far bigger than any template detail).
- **Recommended hardening (not blockers):** upgrade DKIM 1024→2048-bit (it is 1024 today, verified) and move DMARC `p=none → p=quarantine` after a couple of clean sends.

---

## Update — the decisive finding: engagement, not auth (25 Jun, supersedes "no hard blocker")

The audit below stands on the technicals (auth passes, content clean). But correlating Google Postmaster spam data against real sends changed the headline. **There IS a pre-full-list-send action: trim the never-engaged.**

**The evidence — real send data points:**
- **Drift "Slow enough to miss" (28 May, 3,885 delivered, ~1,714 Gmail): Postmaster user-reported spam = 1.03%** — 3.4× Gmail's 0.3% policy line, on a *clean, no-duplicate, opt-in* send with a Gmail denominator large enough to be meaningful. So the spam is NOT residual April warm-up duplicate fatigue ([[project_postmaster_spam_blips]]) — a clean full-list send still draws ~1%.
- **Promo "Introducing Moresapien" (10 Jun, 562, smaller subset): Postmaster spam = 0.00%** — consistent (smaller/cleaner = clean), but the Gmail denominator (~250) is too small to be decisive on its own.
- **Fixes That Fail (25 Jun, 3,833): Postmaster lags ~8 days; figure expected ~3 July** — the tie-breaker, and it lands before the full-list send (~2 weeks out), so the cut can be decided on data, not a guess.

**Root cause — list provenance, not the engine/auth/content.** The sendable audience is a lead-magnet list, not a newsletter list:
- 3,778 sendable (`active`/`confirmed`); **84% (3,175) first-sourced from `template-download`**, only 6 from `newsletter-signup`.
- **34% (1,273) have never opened or clicked any send.** People who downloaded a template months ago don't recall consenting to a newsletter, so a fraction hit "report spam" instead of unsubscribe.

**The Gmail asymmetry makes it self-perpetuating.** Resend has shown 0 complaints throughout because **Gmail does not relay individual spam reports** to senders (only aggregate Postmaster data); Microsoft/Outlook also no longer reliably relay. The complaint→unsubscribe webhook ([webhooks/resend/route.js:109](app/api/webhooks/resend/route.js)) *does* auto-unsubscribe on `email.complained` — but it never fires for Gmail, so **Gmail complainers are never removed and keep receiving (and re-reporting) every send.** The list cannot self-clean on the side that's actually complaining; only a proactive engagement-based cut reaches them.

**The cut: by engagement, NOT by Gmail.** Gmail looks like the culprit only because it's the one provider that lets us see the complaints — but Gmail addresses on this list engage *better* (69% open/click vs 64% for non-Gmail). Cutting "all Gmail" would bin ~1,161 engaged readers. The clean lever is the never-engaged, in priority order:

| Cut tier | Count (cumulative) | Rationale |
|---|---|---|
| Gmail never-engaged | 520 | zero value + low B2B + the only segment that complains *invisibly* — cut first |
| + other free-webmail never-engaged | 718 | same low-B2B-value logic (yahoo/hotmail/outlook.com/icloud/etc.) |
| + cold business addresses | 1,273 | cold but possible prospects — consider re-permission over a hard cut |

**The engaged core is strong, so the cut costs little.** Last 3 sends: **click rate 4.4–5.9% (~2× the B2B average)**, click-to-open up to 21%, open rate 28–37% on the full list — projecting to **~45–55% once the dead weight is removed** (top-quartile B2B). Trimming makes the metrics reflect reality *and* protects deliverability for everyone (engagement is the dominant reputation signal; non-openers actively drag the domain).

**Decision status:** cut agreed in principle; depth pending the 25 Jun Postmaster figure (~3 July). If still ≥ ~0.5%, cut the never-engaged (start with the 520 Gmail-cold); if < 0.3%, hold and keep monitoring. Reversible (suppress, don't delete — they stay in the CRM for sales/nurture). Tracked as task #4. Going forward, a standing "no opens/clicks in ~6 months → suppress" sunset rule keeps the list clean.

**Also surfaced:** the promo template doesn't route links through the click-tracker (0 clicks on the 10 Jun promo despite 33.8% opens) — fix before the next promo so promo engagement isn't blind.

---

## 1. Authentication (SPF / DKIM / DMARC) as configured for Resend

All records verified live via `dig` on 25 Jun 2026.

### SPF alignment — ALIGNED & PASSING (relaxed)
- Envelope/MailFrom domain is `send.mutomorro.com` (SES return-path subdomain): its TXT is `v=spf1 include:amazonses.com ~all` and it has `MX 10 feedback-smtp.eu-west-1.amazonses.com` — so SES is the bounce/MailFrom domain and SPF authenticates against `amazonses.com`. **SPF authentication = PASS.**
- DMARC SPF *alignment*: From header is `hello@mutomorro.com`. Envelope org-domain `mutomorro.com` == From org-domain `mutomorro.com`. DMARC's `aspf=r` (relaxed) only requires the organisational domains to match, which they do (`send.mutomorro.com` → `mutomorro.com`). **SPF is aligned.**
- Note: the *root* `mutomorro.com` SPF (`v=spf1 include:_spf.google.com +a +mx ~all`) does **not** list SES/Resend — and that is fine. The root SPF governs mail sent *from* `@mutomorro.com` as the MailFrom (Google Workspace), not the newsletter, whose MailFrom is `send.mutomorro.com`. Do not "fix" the root SPF by adding `include:amazonses.com` — it is unnecessary and would dilute it.

### DKIM alignment — ALIGNED & PASSING
- `resend._domainkey.mutomorro.com` TXT exists with a valid RSA public key. Signing domain `d=mutomorro.com` == From org-domain → **DKIM is identifier-aligned** (`adkim=r`, would even pass strict). **DKIM = PASS + aligned.**
- **Key size: 1024-bit (verified).** Decoding the published `p=` through `openssl rsa -pubin -text` returns `Public-Key: (1024 bit)`. It works and validates, but NIST recommends 2048-bit; a 1024-bit key is the modern weak spot. Because the `resend` selector is SES-managed via Resend, upgrading is a *Resend dashboard re-verify*, not a manual DNS edit (see fix table).

### DMARC — PASSES, but policy is monitor-only
- `_dmarc.mutomorro.com`: `v=DMARC1; p=none; sp=none; pct=100; rua=...; ruf=...; aspf=r; adkim=r; fo=1`.
- Because at least one of SPF/DKIM is aligned+passing (both are), **DMARC evaluates to PASS** for these sends.
- `p=none` meets the Google/Yahoo/Microsoft bulk-sender *baseline* (a DMARC record at minimum `p=none` has been required since Jun 2024), but it tells receivers to take **no action** on failures — no enforcement, and it offers no anti-spoofing protection for the brand. Industry direction is an active progression `none → quarantine → reject`. RUA is already aggregating to Postmark's analytics + webmaster@, so you have the reporting feedback loop to do this safely.

### The failing test domain
- `dig MX photekton.com` → `1 smtp.google.com.` and its TXT carries `v=spf1 include:_spf.google.com` → **Google Workspace.** So the spam placement happened inside Gmail's filter, which is dominated by domain reputation and recipient-level engagement history. A low/zero-engagement catch-all address is the textbook case where a thin-reputation sender gets spam-filed regardless of perfect auth. This shapes the whole diagnosis: it points at *reputation/engagement*, not at *authentication* (which passes) or *content* (which is clean).

### Recommendations (auth)
- **Hardening:** DKIM 1024 → 2048-bit (Resend dashboard), then DMARC `p=none → p=quarantine` (later `p=reject`) once a couple of full sends show clean aligned DMARC in the Postmark/RUA reports.
- **Optional:** BIMI (needs a registered trademark + VMC and only renders once you're at `p=quarantine`+) — nice-to-have brand signal, not deliverability-critical. Defer.

---

## 2. Sending-domain reputation

Context: mutomorro.com is a young, low-volume sender on Resend's **shared SES IPs** (default for anyone under ~50k/mo; shared IPs are the *correct* choice at this volume — they ride the pooled reputation, and a dedicated IP would actually hurt you at <50k/mo because it never accumulates enough volume to stay warm). So the lever is **domain reputation + engagement**, which in 2026 outweighs IP reputation for Gmail.

What's already good here:
- **List hygiene is in place and enforced.** `app/api/admin/newsletter/send/route.js` has a hard **10%-stale gate** (`STALE_DAYS = 30`): if >10% of the audience has stale/missing `zb_verified_at`, the send is *refused* (`stalePct > 10` → 400, tells the operator to run `/api/cron/zerobounce-verify`). ZeroBounce runs daily as the source of truth; inline ZB was removed after the Drift-v1 timeout. `BLOCKED_STATUSES` zb_status rows are skipped per-recipient. This gate runs in the same route for both legacy and paced (`NEWSLETTER_SEND_MODE`) paths, so it guards the full-list send too.
- **Complaint/bounce handling exists.** Tags (`newsletter_send_id`, `type`) are attached; post-send reconciliation (`reconcileSend` in `lib/newsletter-drain.js`) anchors on the durable `resend_id` and alerts on dupes/misses. Complained/bounced statuses are excluded from re-sends.
- **Pacing is deliberately gentle.** The paced drain (`lib/newsletter-drain.js`, `DRAIN_CONFIG`) sends `WAVE_SIZE = 200` per tick in two 100-msg `batch.send` calls spaced ≥600 ms, one wave/minute — i.e. ~200/min, ~3,800 over ~19 minutes. That spread-out cadence is friendlier to spam filters than a single burst.

The real risks for *this* sender:
- **A large single send from a young domain is the dominant risk.** Going from recent sends of ~560 (first promo, 10 Jun) to ~3,800 in one shot is a ~7x volume step on a domain still building reputation. The biggest deliverability determinant won't be the template — it'll be **how engaged that 3,800 actually is.** If a meaningful slice is cold/low-intent, low opens + any spam-complaints will dent domain reputation for *everyone* on the list.
- **Engagement signals matter more than anything in section 3.** Keep the complaint rate under 0.3% (Gmail/Yahoo threshold). One-click unsub is correctly set (see §3), which protects against "report spam" being the only exit.

Blocklist / monitoring (you can't query RBLs from here, and shouldn't guess):
- I can't reliably query RBLs/DNSBLs from this environment, and even if I could, a shared-IP sender's blocklist status reflects the *pool*, not just mutomorro.com — so it's low-signal. Use these instead:
  - **Resend → Deliverability Insights** (GA, free for all users in 2026) — the authoritative view for *this* account/domain.
  - **Google Postmaster Tools** — register `mutomorro.com`; this is the single best read on Gmail-side domain reputation + spam-rate (directly relevant given photekton is Gmail).
  - **mxtoolbox.com** blacklist check + **Microsoft SNDS / JMRP** if Outlook/Hotmail recipients are material.

### Recommendations (reputation)
- **Before the full send:** glance at Resend Deliverability Insights and (if registered) Google Postmaster Tools for any existing spam-rate/reputation flag. Confirm the 3,800 is genuinely opt-in and reasonably recent — if any chunk is cold, consider seeding the list (sending to the most-engaged segment first) rather than the whole list at once. The ZB gate already protects *validity*; it does not measure *engagement*.
- **Ongoing:** keep monthly cadence consistent (Gmail rewards regularity), watch complaint rate < 0.3%, and prune chronic non-openers over time.

---

## 3. Content & structure

Read: `components/emails/newsletter-template.jsx`, `components/emails/promo-template.jsx`, `lib/newsletter-render.js`, plus the send payloads in `lib/newsletter-drain.js` and `app/api/admin/newsletter/send/route.js`.

### Plain-text alternative — PRESENT (auto-generated). NOT a gap.
- Both send paths pass only `html`, never a `text` field:
  - `lib/newsletter-drain.js` payload: `from`, `to`, `subject`, `html: r.html`, `headers`, `tags` — no `text`.
  - `app/api/admin/newsletter/send/route.js` (line ~604): `html: e.html` — no `text`.
- Resend's documented behaviour: *"Resend will automatically generate a plain text version of your email from either the `html` or `react` parameter, whichever is provided"*, and you opt out by setting `text` to an empty string. Since these calls pass `html` (already-rendered, not the React `react` prop) and omit `text`, **a multipart text/plain alternative IS generated.** This is the big spam factor people usually miss — and it's fine here. (Hardening option: render an intentional plain-text via `@react-email`'s `render(..., { plainText: true })` so the text part reads well rather than being machine-stripped, but this is polish, not a fix.)

### Text-to-image ratio — fine
- Both templates are overwhelmingly live HTML text. Images are: a logo (masthead + footer, `mutomorro-logo.png`), an optional hero image, optional inline editorial images, and a 1×1 tracking pixel. The editorial body (the `observationBody`, index, content blocks) is all real text. No "one big image" email. Good — this is the opposite of the classic image-only spam pattern.

### Image alt text — mostly good, one weak spot
- Logo `alt="Mutomorro"`, editorial hero uses `heroImageAlt`, inline images use `section.alt`, tracking pixel `alt=""` (correct for a spacer). 
- **Promo hero uses the headline as alt text:** `promo-template.jsx` line ~72 `alt={headline}`. Functional, but if `headline` is long/marketing-y the alt becomes an odd image description. Minor; low priority.

### Hosted vs inline images — hosted on the From domain. Good.
- All images are absolute `https://mutomorro.com/...` (or Supabase storage for hero art). Served from the brand domain, not a third party. No CID/inline attachments (which can trip filters). Fine.

### Link-tracking domain / alignment — first-party, NO misalignment. Good.
- Links are rewritten through `https://mutomorro.com/api/newsletter/track?...` — i.e. the **same domain as From**, governed by the `TRACKABLE_HOSTS` allowlist in `lib/newsletter-tracking.js` (exact-hostname match, so `mutomorro.com.attacker.tld` is never wrapped → no open-redirect). 
- **Resend's own open/click tracking is not configured** anywhere in the send code (no tracking-domain settings referenced), so there is **no separate `*.resend-tracking` / click-domain** being injected that could misalign or look like a redirector. The only redirector is on your own aligned domain. This is the right setup.
- One nuance: every CTA/link resolves to a `mutomorro.com/api/newsletter/track` redirect. That's single-domain (consistent, low "many shady domains" risk) but it does mean filters see a redirect on every link — acceptable and standard, just noting it's not a raw destination link.

### Footer / CAN-SPAM + UK PECR — COMPLIANT
- Physical postal address present in **all three** footers: `86-90 Paul Street, London EC2A 4NE` (newsletter edition footer line ~336, legacy footer ~982, promo footer ~239).
- **Unsubscribe is visible** in every footer (`Unsubscribe · View in browser · LinkedIn · mutomorro.com`), and the signed per-recipient unsubscribe URL is generated via HMAC in `lib/newsletter-render.js` (`generateUnsubscribeUrl`).
- **One-Click unsubscribe headers are set** on every message: `List-Unsubscribe: <url>` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (both send paths). This is a Gmail/Yahoo bulk-sender requirement and it's correctly implemented.
- Footer link colours are low-contrast (`rgba(0,0,0,0.3)`), but the unsubscribe is still a real, present link — not a deliverability issue (and one-click in-client unsub covers it regardless).

### Subject / preview text — clean, low spam-trigger
- Sample subjects ("Slow enough to miss", "See your organisation differently") and preview text are plain, lowercase, no `!!!`, no ALL CAPS, no "FREE!!! / $$$ / ACT NOW" trigger words. Preview text is wired via `<Preview>` (good — avoids the client pulling the unsubscribe footer into the snippet). House voice is plain-English. No concern.
- Body content uses `dangerouslySetInnerHTML` for inline links (`wrapLinks`) — content-injection-safe here because it's your own authored editorial, not user input, but worth remembering it's authored copy only.

### Excessive punctuation / caps — none
- No spammy `!`, no shouting case, no hidden white-on-white text, no giant font-size declarations used as content. Kicker uppercase labels ("OBSERVATION", "LONG READ") are short styled eyebrows, not body shouting — fine.

### Content summary
Content & structure are in good shape and contain **no deliverability blockers.** The only items are polish (intentional plain-text rendering, promo hero alt). The earlier worry — "is there even a plain-text part?" — is resolved: yes, auto-generated.

---

## Prioritized fix list

**Top priority — added 25 Jun after Postmaster data (see Update); these supersede "the send can proceed":**

| # | Fix | Area | Impact | Effort | Where | Blocker? |
|---|-----|------|--------|--------|-------|----------|
| 0 | **Trim the never-engaged** (suppress, don't delete; by engagement not domain — start with the 520 Gmail-cold, up to all 1,273 cold) before the full-list send | Reputation | **Critical** | Low–Med | new `newsletter_audiences` filter (`newsletter_opens>0 OR newsletter_clicks>0`) | **Pre-send (pending 25 Jun figure ~3 July)** |
| 0b | Standing **sunset rule** — auto-suppress contacts with no open/click in ~6 months | Reputation | High | Med | cron / audience definition | Ongoing |
| 0c | Fix **promo template click-tracking** (links not routed through `/api/newsletter/track`; 0 clicks on 10 Jun) | Measurement | Med | Low | `components/emails/promo-template.jsx` | Before next promo |

Legend — **Blocker?** = needed before the ~3,800 full-list send. Impact = effect on deliverability.

| # | Fix | Area | Impact | Effort | Where | Blocker? |
|---|-----|------|--------|--------|-------|----------|
| 1 | Check Resend **Deliverability Insights** + **Google Postmaster Tools** for any current spam-rate/reputation flag on mutomorro.com before sending | Reputation | High | Low (15 min) | Resend dashboard / Postmaster Tools (register domain if not already) | **Pre-send** |
| 2 | Confirm the ~3,800 audience is genuinely opt-in/engaged; if any chunk is cold, send to the most-engaged segment first rather than the whole list in one shot | Reputation | High | Low–Med | Audience review / `newsletter_audiences` | **Pre-send (recommended)** |
| 3 | Send a real test to a **monitored Gmail + Outlook inbox you actually read** (not a dead catch-all like photekton) and confirm inbox placement + that DKIM/SPF/DMARC show `pass` in the raw headers | Auth/Content | Med | Low | Manual test-send | **Pre-send (recommended)** |
| 4 | Upgrade DKIM **1024 → 2048-bit** (re-verify the domain in Resend so SES republishes a 2048-bit `resend` selector) | Auth | Med | Low | Resend dashboard → Domains → re-verify (publishes new DNS) | Later hardening |
| 5 | Move DMARC **`p=none` → `p=quarantine`** (then `p=reject`) after 1–2 clean sends, watching the existing Postmark RUA reports | Auth | Med | Low | DNS provider (`_dmarc.mutomorro.com` TXT) | Later hardening |
| 6 | Render an intentional **plain-text part** via `@react-email` `render(..., { plainText: true })` instead of relying on Resend's auto-strip (better-reading text/plain) | Content | Low | Med | `lib/newsletter-render.js` + payloads in `newsletter-drain.js` / `send/route.js` | Later hardening |
| 7 | Give the **promo hero image** a purpose-written `alt` instead of reusing `headline` | Content | Low | Low | `components/emails/promo-template.jsx` (~line 72) | Later hardening |
| 8 | (Optional) BIMI/VMC for the brand checkmark — only after `p=quarantine`+ and a registered trademark | Auth/Brand | Low | High | DNS + VMC vendor | Defer |

### Bottom line
Authentication passes and the content is clean — so *technically* the send isn't blocked. But real Postmaster data (see Update) shows a clean, opt-in, no-duplicate full-list send still drew **1.03% Gmail spam** (3.4× the policy line), driven by a 34% never-engaged tail on a lead-magnet-sourced list — and Gmail complainers can't self-remove (no feedback loop). **The pre-full-list-send action is to trim the never-engaged** (engagement-based, not Gmail-based; the engaged core clicks at ~2× the B2B average and is worth protecting). Spend pre-send effort there, not on the template. Final cut depth pends the 25 Jun Postmaster figure (~3 July).

---
*Sources: live `dig` + `openssl` verification (25 Jun 2026); Resend docs (automatic plain-text emails, batch send, dedicated/shared IPs, deliverability insights); Google/Yahoo/Microsoft 2024–2026 bulk-sender requirements (dmarcian, Mailgun, redsift, powerdmarc); NIST DKIM 2048-bit guidance.*
