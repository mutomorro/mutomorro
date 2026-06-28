# Stable Image URLs - summary & roadmap

**Date:** 28 June 2026
**Status:** Phase 1 (tool heroes) **and** Phase 2 (tool body images) **both shipped to production and verified** (28 Jun) - the full tool image set for the 37 reset-cohort tools is now on stable URLs. The 22 remain on CDN (rebrand-and-enable). Estate-wide application is a logged backlog task.
**Paper trail:** Strategic Change Log row 5 (Baserow 1049655) · investigation report `stable-image-urls-investigation-2026-06-28.md` · delivery spec `stable-image-urls-phase1-delivery-spec-2026-06-28.md` · Craft "Tool Development" wiki · GitHub PR #5 (merged, prod commit `b5f0b88`).

This is the single-page paper trail for a big shift. Detail lives in the linked docs; this ties the arc together.

---

## The problem (verified, not assumed)

Sanity serves every image from a **content-hashed CDN URL** (`cdn.sanity.io/.../<hash>-WxH.png`). The hash is derived from the bytes, so **re-uploading a diagram mints a new URL, and Google treats it as a brand-new image - resetting that image's search ranking from zero.** Image search is ~half the site's search traffic (tool pages = 93% of image clicks / 94% of impressions), so this is a first-order concern.

This is not theoretical. Our own GSC image-search history shows the **7 March 2026 migration** (which changed every image URL at once) cut weekly image clicks **~65% for two months**. The **21 May - 24 June** hero re-uploads did the same to 37 tools (heroes *and* their body diagrams, uploaded in the same session).

## The fix

Serve each image from a **stable URL we own** - `/img/tool/<slug>-overview` - that resolves to whatever the current Sanity asset is and **streams the bytes** (a true same-origin proxy, HTTP 200, never a redirect). The public URL never moves, so the image behind it can be improved freely without a reset.

### As-built design (how it shipped, vs the pre-build plan)

- **URL (flattened):** `/img/tool/<slug>-overview` (the slug names the thing; not a separate `/overview` segment).
- **One canonical path, param-variants per surface:** canonical (param-less) = **true PNG** (save / share / Google / sitemap / `<picture>` fallback); `?w=1200&h=630&fit=crop` = PNG og card; `?fmt=avif|webp` = the invisible `<picture>` render skin.
- **Render = hand-rolled `<picture>`** (AVIF/WebP `<source>`, canonical PNG `<img>`). AVIF is the on-page skin for speed/SEO; the PNG is the deliberate download. Format chosen by **URL param** (`?fmt`), so no `Accept`/`Vary` and no cache fragmentation.
- **Download filename:** `Content-Disposition: inline` (never `attachment`, so og/inline rendering isn't broken), **title-derived** (`Process-Mapping-Diagram.png`), with the **extension matched to the format actually served** (so a casual save of the on-page AVIF lands as `...-Diagram.avif`, honest).
- **Cache:** `s-maxage` + `stale-while-revalidate` - deliberately **not `immutable`** (a slug URL's bytes change on intentional re-upload; immutable would pin stale for a year). Verified `MISS → HIT` on Vercel's edge in production.
- **Body images (Phase 2):** served from `/img/tool/<slug>/body/<descriptor>-<_key>` - a human-readable **descriptor** (from alt) for relevance, plus the Portable Text block **`_key`** as the stable, reorder-safe **resolution anchor** (not an ordinal `step-n`). Download filenames match the descriptor. The route resolves by the trailing `_key` and ignores the descriptor, so old key-only URLs still work; the one cost is that editing a body image's alt changes its URL (a soft re-eval, never the wrong image).
- **Staged rollout:** an enable-list gates which docs emit proxy URLs; the route resolves any slug, so widening is data, not code.

## Phase 1 - shipped (tool heroes)

Live for the **37 reset-cohort tools** (heroes re-uploaded 21 May - 24 Jun; already reset, so zero-loss to move and now immunised). The **22 untouched best-rankers** (7 Mar migration cohort: PESTLE, Kotter's, ADKAR, Change Curve, Edgar Schein, Burke-Litwin, …) are **deliberately excluded**.

**Verified on production:** all 37 emit proxy URLs across og / inline `<picture>` / JSON-LD / **sitemap (exactly 37 proxy entries)**; the 22 stay on `cdn.sanity.io`; deliveries correct with honest filenames; **edge cache MISS → HIT** (the cost model observed, not modelled - measured Sanity bandwidth peaks ~32 GB/mo, ~3% of the Vercel plan); zero runtime errors.

## The 22 - "rebrand-and-enable together"

The 22 are getting re-branded anyway (old-brand images + PDFs need refreshing, one at a time over a longer period), so **a reset is coming for each regardless.** So we don't pre-reset them. Instead: **when a tool is re-branded, enable its proxy slug in the same change** - the rebrand reset *is* the proxy move, one combined reset, the last that tool ever takes. Spreads the resets over the natural cadence, wastes none, preserves the best-rankers' current traffic until each is actually touched.

**Hard rule:** never upload a new brand image to a 22-tool without enabling its proxy slug in the same deploy (image-first, proxy-later = two resets). And once Phase 2 exists, sweep **hero + body together** per tool. (The PDF is a separate, un-proxied surface - it still resets on rebrand; a PDF proxy is its own later decision.)

**End state:** when all 59 are enabled, swap the slug list for `ENABLED_TYPES = ['tool']`.

## Phase 2 - tool body images (SHIPPED 28 Jun, PR #6, prod commit `07b2d928`)

The 37's body diagrams were reset in the same session as their heroes (confirmed), so they were zero-loss to move now, and doing them sets up the clean hero+body sweep for the 22. As built: route `body/<_key>` branch (reuses all existing delivery); the tool Portable Text image renderer emits the gated `<picture>` (`loading="lazy"`); the sitemap's body images carry their `_key` and point at the proxy. The same enable-list gates body, so the 37 picked it up automatically. **Verified live:** 209 body + 37 hero proxy entries in the sitemap, correct per-key resolution, honest filenames, edge cache MISS->HIT, zero errors; the 22 stay on CDN. Editorial rule: swap an image inside its existing block; never delete-and-re-add a block (new block = new key = a reset); reordering is safe. **Refinement (same day, merge `d907f12`, pushed direct to main):** body URLs now carry a readable descriptor from alt (`…/body/<descriptor>-<_key>`, e.g. `…-highlighting-the-assumed-flow-33a15bf215c9`) and filenames match - restoring the original convention's readable-variant intent while keeping the `_key` anchor. Added editorial note: editing a body image's alt changes its URL (finalise alt before it matters).

## Estate-wide application (logged backlog task)

Lower priority, wanted soon-ish: extend the proxy across **all** image-bearing content types (articles, projects, services, training, develop, sectors, dimensions, frameworks - heroes + body), plus migrating the hardcoded `cdn.sanity.io` URLs in `Nav.js`/`about.js` (or moving those to `/public`). The resolver table already scaffolds the other types; this is mostly per-template renderer wiring + enabling. Sequence zero-loss / low-value first.

## Monitoring note

`check-asset-baseline.mjs` stays valid - the proxy is a presentation-layer change; the underlying Sanity `asset->url`s are untouched, so it still catches future re-uploads. Worth adding a small "does the live `og:image` start with `mutomorro.com/img/`" check so a silently-unwired proxy is caught.
