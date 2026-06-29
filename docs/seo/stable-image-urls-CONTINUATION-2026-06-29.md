# Stable Image URLs - continuation brief (for a fresh chat)

**Date:** 29 June 2026
**Purpose:** Hand the stable-image-URL work to a new session with full context. Read this top to bottom; it is self-contained.

---

## START HERE - the immediate next task

**Build the "permalink field" migration for tool images** (agreed, not yet started). Decision made by James; the new chat should write a tight plan, get James's go, then execute.

**Why:** today the body-image URL descriptor is derived from **alt text**, so editing alt churns the URL, and the URL still carries an opaque hex `_key` (`…/body/patterns-and-trends-9f7857fed6b7`). The fix: a **dedicated permanent field** on images (its own "slug", like a document's slug is decoupled from its title) that:
- is set once and never changes (a true permalink),
- frees alt and the image itself to be edited/replaced without touching the URL,
- lets us **drop the hex key** for clean URLs: `…/body/patterns-and-trends`.

**What James chose:** do the **clean version now** (resolve by the new field, drop the key). Rationale (his, and correct): changing the URL is a one-time reset, and the 37's body URLs went live only hours ago so Google has barely indexed them - so the move is essentially free **now** and gets costlier every day. Doing it now rounds the 37 off on their **final** address with no future re-move.

**Two caveats that come with dropping the key (must be in the plan):**
1. **The slug becomes load-bearing.** With no key in the URL, the route resolves *by the slug* - so it's a true permalink: rename it and the old URL 404s. New editorial rule: "the image slug is set once, never changed" (same family as "never delete-and-re-add a block").
2. **Uniqueness required** within a page's body (two images can't share a slug) - enforce via the backfill + a Studio validation rule.

**This is the most consequential step in the whole effort:** a **Sanity schema change + a data migration** (add a permalink field to the tool image types; backfill ~530 existing tool images with unique slugs seeded from their alts), not just app code. **Do NOT touch the Sanity schema or write to the dataset without spec-ing it precisely and getting James's explicit go first.**

**Open design points for the plan:** field name (e.g. `imageSlug`); exact slug derivation + de-dup from alt; resolve-by-slug route change (replace the `body/<descriptor>-<_key>` parse with `body/<imageSlug>` → `body[imageSlug == $s][0]`); Studio uniqueness validation; an **idempotent** backfill script (stable, re-runnable); how *new* images get a slug going forward (auto-default from alt at creation vs manual, then frozen by convention); whether to also move **heroes** onto the same field for consistency (heroes are already readable `<slug>-overview`, so lower priority - decide explicitly). Design the field generically so the **estate-wide phase** just extends it to the other content types. Roll out via the same prove-on-preview-then-prod flow, scoped to the 37 tools.

> Note: the *decoupling alone* (keep the `<descriptor>-<key>` format, just source the descriptor from the new field, backfilled to match today's URLs) would be **zero-reset and not time-sensitive**. The *clean-URL* upgrade (dropping the key) is the URL change, and is the part the "do it now while free" logic applies to. James wants the clean version.

---

## Where we are (all SHIPPED + verified live on production)

The site handed Google a Sanity content-hashed image URL on every surface; re-uploading any image minted a new URL and **reset that image's Google ranking** (image search ≈ half the site's search traffic). Proven in GSC: the 7 Mar 2026 migration cut weekly image clicks ~65% for ~2 months. Fix = a **same-origin proxy** at `mutomorro.com/img/...` that resolves to the current asset and streams the bytes, so the public URL never moves.

**Live for the 37 reset-cohort tools** (heroes re-uploaded 21 May-24 Jun as `*-hero-master.png`; already reset, so zero-loss to move + now immunised). The **22 untouched best-rankers** (7 Mar migration cohort - PESTLE, Kotter's, ADKAR, Change Curve, Edgar Schein, Burke-Litwin, …) are **deliberately excluded**.

- **Phase 1 - tool heroes:** PR #5, prod commit `b5f0b88`.
- **Phase 2 - tool body images:** PR #6, prod commit `07b2d928`.
- **Body-URL descriptor refinement:** merge `d907f12` (pushed direct to main).
- **Summary doc:** `7346bd9`. All on `main`, verified live (deliveries, sitemap, edge cache `MISS→HIT`, zero runtime errors).

### URL schemes currently live
- **Hero:** `/img/tool/<slug>-overview` (param-less = true PNG; `?w=1200&h=630&fit=crop` = og card; `?fmt=avif|webp&w=<n>` = render skin).
- **Body:** `/img/tool/<slug>/body/<descriptor>-<_key>` (descriptor from alt; route resolves by the **trailing `_key`** and ignores the descriptor, so old key-only URLs still resolve). ← this is what the next task replaces with a clean `…/body/<imageSlug>`.

### Design (as built)
- **One canonical URL** per image; query-param variants per surface. Param-less = **true PNG** (the save/share/Google/sitemap/`<img>` address). `?fmt=avif|webp` = the invisible `<picture>` render skin. Format chosen by **URL param** (no `Accept`/`Vary`).
- **Render = hand-rolled `<picture>`** (AVIF/WebP `<source>` + canonical PNG `<img>`). Heroes `loading="eager" fetchPriority="high"`; body `loading="lazy"`.
- **Filenames:** `Content-Disposition: inline` (never `attachment`), title-derived for heroes (`Process-Mapping-Diagram.png`), **descriptor-derived** for body (`Process-Mapping-Diagram-Highlighting-The-Assumed-Flow.png`), extension matched to the **format actually served** (Sanity `auto=format` can return webp for an avif request).
- **Cache:** `public, s-maxage=86400, stale-while-revalidate=604800` - deliberately **NOT `immutable`** (a slug URL's bytes change on re-upload). Edge `MISS→HIT` confirmed in prod.
- **Staged rollout:** `ENABLED_SLUGS` (the 37) / `ENABLED_TYPES` gate which docs *emit* proxy URLs; the route resolves any slug, so widening is data, not code.

### Files
- `lib/image-proxy.js` - single source of truth: resolver table (`RESOLVE`), the `ENABLED_SLUGS`/`REUPLOADED_37` rollout, URL builders (hero + body), `altToDescriptor`/`descriptorToName`, filename helper.
- `app/img/[...slug]/route.js` - the Edge proxy (hero 2-segment path + body 4-segment `body/<…>` path; `?fmt` format; format-matched inline filename; `s-maxage`+`swr`).
- `app/tools/[slug]/page.js` - hero `<picture>` + body Portable Text image renderer `<picture>` (both gated); OG + JSON-LD.
- `app/sitemap.js` - hero + body images → proxy (gated).

---

## The 22 - "rebrand-and-enable together" (the plan for later)

The 22 are getting re-branded anyway (old-brand images/PDFs), so a reset is coming for each regardless. **When a tool is re-branded, enable its proxy slug in the SAME change** - the rebrand reset *is* the proxy move (one combined reset, the last). One at a time over a longer period. Hard rules (in the Craft wiki): never image-first-then-proxy (= 2 resets); never delete-and-re-add a body block (new `_key` = a reset; swap in place; reorder is safe). PDFs are a separate, un-proxied surface (their reset on rebrand is accepted; a PDF proxy is a later call). End state: when all 59 are enabled, swap the slug list for `ENABLED_TYPES = ['tool']`.

---

## Roadmap

1. **NOW:** the permalink-field migration (clean URLs) - see START HERE.
2. **The 22:** rebrand-and-enable, one at a time (Craft wiki has the procedure).
3. **~6 Sep 2026:** the measure-back - watch the 37 in GSC Image search to confirm recovery. (Strategic Change Log measure-back date.)
4. **Estate-wide (backlog, lower priority):** extend the proxy + the new permalink field to all image-bearing types (articles, projects, services, training, develop, sectors, dimensions, frameworks - heroes + body) + migrate the hardcoded `cdn.sanity.io` URLs in `Nav.js`/`about.js` (or move to `/public`). The resolver table already scaffolds the 8 types.

---

## Where everything lives

- **Code:** the four files above, on `main`.
- **Docs (`docs/seo/`):** `stable-image-urls-investigation-2026-06-28.md` (findings), `stable-image-urls-phase1-delivery-spec-2026-06-28.md` (the contract), `stable-image-urls-summary-2026-06-28.md` (the arc), and this brief.
- **Strategic Change Log (Baserow db 466656 / table 1049655):** row 5 (Phase 1, `Actioned`), row 38 (Phase 2, `Actioned`; Outcome notes the descriptor refinement), row 39 (estate-wide, `Parked`). Fields include the "four-before" set (The field knows / What this could affect / How we'd undo it / We already know) - keep filling them forwards for the permalink migration (add a new row for it).
- **Craft wiki:** "Updating tool images without resetting Google rankings" in the **Tool Development** folder - the operational procedure + rules for whoever does the 22.
- **Memory:** `project_stable_image_urls.md` (auto-loaded).

---

## Conventions / gotchas (read before doing anything)

- **James commits/pushes**, and is now OK with **direct-to-main pushes for this work** (did `d907f12`, `7346bd9` directly). BUT for the **schema change + Sanity data migration**, get explicit go before writing to the dataset.
- **Scoped commits only - never `git add -A`** (the tree has many unrelated untracked files). Stage explicit paths.
- **Don't manage James's dev server** (clears `.next` on Turbopack corruption; he runs `npm run dev` himself).
- **Preview-verify flow:** push branch → Vercel auto-builds a preview → it's behind Vercel SSO, so use the Vercel MCP `get_access_to_vercel_url` for a 23-hr bypass, set a cookie jar, then curl deliveries / `x-vercel-cache` / page `og:image` / sitemap. Confirm zero `get_runtime_logs` errors. Then merge/push to main (prod) and re-verify on `mutomorro.com` (public, no bypass).
- **Vercel:** project `prj_5F1wMdmIJFgsN04UUfmz05klwv9q`, team `team_D7qBrlOk5CN0TlsKNrQxuTj9`. Pushing to `main` triggers prod; a branch push triggers a preview.
- **Sanity:** project `c6pg4t4h` / dataset `production`. `SANITY_TOKEN` in `.env.local` has **write** access. After a Sanity write, `rm -rf .next`. MCP: pass `workspaceName: "mutomorro"`. Backfill scripts should be **idempotent** (gitignored `scripts/` convention; run with `npx tsx`).
- **Editorial rules now in force:** swap an image inside its existing block (never delete-and-re-add); finalise alt before it matters; (after the migration) the image slug is a permalink - never rename it.
- Merged branches `feat/stable-image-urls-phase1` / `phase2` / `body-image-descriptors` are safe to delete.
