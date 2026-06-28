# Stable Image URLs - Phase 1 Delivery Spec (corrected)

**Date:** 28 June 2026
**Status:** Drop-in patch for the Phase 1 build brief. This is the section that reconciles the brief against the binding decisions (the design-session "three names" principle + Strategic Change Log row 5's `Content-Disposition` mitigation). Once this is in, reconcile the brief against it properly - don't patch the brief ad hoc.
**Scope:** Phase 1 = the main image ("overview") per page, hero-bearing types. Body images (`step-n`) and sub-variants (`-x`) are explicitly Phase 2 and out of scope here.

---

## The principle: one image, three names

One image carries three independent names, each tuned for its own job, none compromising the others:

| Name | Form | Job | Source |
|---|---|---|---|
| **URL** | terse, lowercase, machine-legal | the stable address Google indexes + everything links to | `slug.current` + role word |
| **Alt text** | readable human + Google phrase | the on-page SEO lever | existing `heroImage.alt` field (untouched by the proxy) |
| **Download filename** | rich, Capitalised, real `.png` | a clean file when saved/shared | page **title**, derived server-side |

The proxy owns the URL and the filename; alt stays a page-render attribute. They never collide because the canonical URL serves a **true PNG**, so the `.png` filename is honest (no AVIF-labelled-as-PNG).

---

## 1. URL scheme - flattened, slug-named, one canonical path

```
/img/<type>/<slug>-<role>
```

- **Flattened** - the descriptive name lives in the final segment; the slug is not duplicated as its own path segment. e.g. `/img/tool/pestle-analysis-overview`, `/img/service/customer-experience-training-overview`.
- **`<slug>`** = the document's existing `slug.current` (already title-derived and machine-legal, and the value the resolver looks up). Not a freshly re-derived title→slug, which could diverge from the routing slug and break resolution.
- **`<role>`** = `overview` (the main image) for Phase 1. Reserved for Phase 2: `stage-n` (resolves cleanly), `step-n` (gated - see §4).
- **One canonical path.** og-crop and the AVIF render skin are **query-param variants of this same path**, never separate addresses - so all SEO signal consolidates on one URL.

**Segment parse (route side):** strip a recognised trailing role from the last segment to recover slug + role:
```
/^(?<slug>.+)-(?<role>overview|stage-\d+|step-\d+)$/
```
Role is matched against a fixed allow-list, so a slug that happens to contain a hyphen is safe (the role is only ever the recognised suffix).

---

## 2. The three deliveries

All three are the same canonical path; the query params select the rendition. **The canonical (param-less) URL is the PNG** - it is the JSON-LD image, the sitemap image, the `<picture>` fallback, and the deliberate "I want a PNG" download/share asset. The page renders AVIF (the invisible skin). og is a cropped PNG card.

| Delivery | URL (params on the canonical path) | Format | `Content-Disposition` | Used by |
|---|---|---|---|---|
| **Canonical PNG** | `…/<slug>-overview` (param-less) | true PNG, full-res | `inline; filename="<Title>-Diagram.png"` | JSON-LD `image`, sitemap `<image:image>`, `<picture>` `<img>` fallback, deliberate PNG download/share |
| **og-crop PNG** | `…/<slug>-overview?w=1200&h=630&fit=crop` | true PNG, 1200×630 card | `inline; filename="<Title>-Diagram.png"` | `og:image` (honest 1200×630 declaration) |
| **AVIF/WebP render skin** | `…/<slug>-overview?fmt=avif&w=<dpr widths>` (+ a `fmt=webp` twin) | AVIF / WebP | `inline; filename="<Title>-Diagram.avif"` (ext matched) | `<picture><source>` — the visible on-page render |

Notes:
- **`inline`, never `attachment`** on every delivery. `inline` renders normally (og previews and on-page display both work) while still giving a rich filename on save. `attachment` is reserved for a dedicated download-only URL if one is ever added.
- **A browser saves the format it displays.** AVIF-capable browsers render — and therefore right-click-save / copy-address / open-in-new-tab — the AVIF `<source>`, not the `<img>` PNG fallback. So the filename is **format-matched** (`…-Diagram.avif` on the AVIF, `…-Diagram.png` on the canonical), keeping every save honest. The canonical PNG is the **deliberate** path (direct URL, or an optional visible "Download PNG" link), not what a casual on-page save yields. (Design decision 28 Jun: AVIF on-page for speed/SEO; PNG as the deliberate download. Earlier drafts wrongly assumed the `<img>` PNG fallback was the save target — a browser saves the displayed source, so it is not.)

---

## 3. Route handler contract (`app/img/[...slug]/route.js`, Edge)

**Input:** `/img/<type>/<segment>` → `[type, segment]`; parse `segment` → `{ slug, role }` (§1).

**Resolve:** one GROQ by `(type→_type, slug)` returning **both** the asset URL **and the title**:
```
*[_type == $t && slug.current == $s && !(_id in path("drafts.**"))][0]{
  "url": <field>.asset->url,   // <field> from the resolution table, §4
  title
}
```
(`<field>` is a fixed allow-list value, never user input - safe to interpolate. The title is fetched here specifically to build the download filename.)

**Format logic (by URL param, not by `Accept`):**
- `?fmt=avif` → request Sanity with `auto=format` + a fixed `Accept: image/avif,…` → AVIF.
- `?fmt=webp` → `auto=format` + `Accept: image/webp,…` → WebP.
- default (no `fmt`) → `fm=png` → **true PNG**.

**Rendition params:** `w` (clamped ≤ 2000 for skin requests; the param-less canonical serves full-res), `h` + `fit=crop` for the og card. Width/quality mirror the old loader (`q=82`).

**Response headers:**
- `Content-Type` from the negotiated format.
- `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800` - **not `immutable`** (a slug-keyed URL's bytes change on intentional re-upload; immutable would pin stale for a year).
- `Content-Disposition: inline; filename="<Title>-Diagram.png"` **on PNG responses only** (filename sanitised; title-derived per §7).
- **No `Vary: Accept`** - format is chosen by URL param, so the cache key already separates formats. (This deletes the `Accept`-forwarding + `Vary` machinery from the earlier draft.)

**Errors:** unknown type/role or unparseable segment → `404`; slug not found → `404`; Sanity/upstream failure → `502`. A broken proxy must never take down image rendering.

---

## 4. Resolution table (`role` → Sanity field)

`role` is decoupled from the field name (the field is `heroImage`; the role word is `overview`).

| URL `<type>` | Sanity `_type` | `overview` → | `stage-n` (Phase 2-adjacent) | `step-n` (Phase 2) |
|---|---|---|---|---|
| `tool` | `tool` | `heroImage` | - | reserved, **unsolved** |
| `article` | `article` | `heroImage` | - | - |
| `project` | `project` | `heroImage` | - | - |
| `service` | `service` | `heroImage` (OG falls back to `propositionImage`) | `stages[n-1].stageImage` | - |
| `training` | `course` | `heroImage` | - | - |
| `develop` | `capabilityService` | `heroImage` | - | - |
| `sectors` | `sectorLandingPage` | `seoImage` | - | - |
| `resources` | `resource` | `previewImage` | - | - |

- **`overview` is the universal main-image word**, even where it's semantically loose (an article/project lead photo isn't an "overview"). Accepted deliberately for consistency - decided, not drifted.
- **`stage-n` resolves cleanly** to the ordered `stages[]` array (`stage-2` → `stages[1].stageImage`). Available when service stage images are wired.
- **`step-n` is reserved but unsolved.** Tool body diagrams live positionally in Portable Text `body[]` with no stable ordinal - `step-3` → "the 3rd body image" silently re-points if the body is reordered (a *wrong* image at a *stable* URL, worse than a reset). It is gated on the Phase 2 `_key`-vs-stored-map decision. **Do not spec or build `step-n` resolution now.**
- **The `-x` sub-suffix is undefined** and out of scope until Phase 2 keying is decided. Do not build around it.

---

## 5. The `<picture>` render block (hand-rolled, replaces `next/image` for the hero)

AVIF is the visible render; the canonical PNG is the `<img>` fallback for non-AVIF/WebP clients (rare) and the JSON-LD/sitemap/deliberate-download asset. AVIF-capable browsers fetch only the AVIF `<source>` (no double-download, page stays light) and that is also what a casual save/copy targets — hence the format-matched filename in §2/§3. The clean PNG is the **deliberate** download path, not the casual on-page save.

```jsx
<picture>
  <source type="image/avif" srcSet={avifSrcSet} sizes={SIZES} />
  <source type="image/webp" srcSet={webpSrcSet} sizes={SIZES} />
  <img
    src={canonicalPngUrl}            /* …/<slug>-overview  (param-less PNG) */
    alt={doc.heroImage?.alt || doc.title || ''}
    width={900} height={636}
    loading="eager" fetchPriority="high"   /* hand-managed: this is the LCP hero */
  />
</picture>
```

- `avifSrcSet` / `webpSrcSet` are built from the device-width set, e.g. `…/<slug>-overview?fmt=avif&w=640 640w, …?fmt=avif&w=1080 1080w, …`.
- **Accepted cost:** srcset / `sizes` / lazy / priority are hand-managed here, once per hero-bearing template, inherited by all images in that context. `next/image` is bypassed for the hero, so the earlier loader tweak (forwarding `?w` to `/img/`) is **not needed in Phase 1** and is reverted.
- Render the `<picture>` **only when the proxy is enabled** for that doc (staged rollout); otherwise keep the existing `next/image` + CDN render untouched.

---

## 6. Emitter wiring (per hero-bearing route)

| Surface | Emits |
|---|---|
| `og:image` (via `buildMetadata`) | absolute og-crop PNG: `https://mutomorro.com/img/<type>/<slug>-overview?w=1200&h=630&fit=crop` |
| JSON-LD `image` | absolute canonical PNG: `…/<slug>-overview` |
| inline hero | the `<picture>` block (§5); `<img src>` = relative canonical PNG |
| `sitemap.js` `<image:image>` | absolute canonical PNG: `…/<slug>-overview` |

All gated by the same per-slug rollout switch; a non-enabled doc emits its current CDN URL unchanged.

---

## 7. Naming transforms

- **URL slug-segment** = `slug.current` verbatim (already lowercase, hyphenated, machine-legal). No re-derivation.
- **Download filename** = from **title**: keep case, collapse runs of non-alphanumerics to single hyphens, trim, append `-Diagram.png`. Examples:
  - `Customer Experience Training` → `Customer-Experience-Training-Diagram.png`
  - `PESTLE Analysis` → `PESTLE-Analysis-Diagram.png`
  - `CEDAR™ Feedback Model` → `CEDAR-Feedback-Model-Diagram.png`
  - `5 Whys` → `5-Whys-Diagram.png`
- Sanitise before placing in the header (strip anything outside `[A-Za-z0-9._-]`).

---

## 8. What this deletes from the earlier draft / pilot

- `hero` as the URL role word → **`overview`**.
- `Accept`-forwarding + `Vary: Accept` → **deleted**; format chosen by `?fmt`.
- `?dl=png` **attachment** download endpoint → **removed**; the canonical PNG URL *is* the clean download (inline, rich filename), so no separate attachment URL is needed.
- `next/image` hero → **hand-rolled `<picture>`**; the `/img/` loader tweak → reverted.

---

## 9. Deferred (named so coverage stays honest)

- `step-n` (tool body diagrams) - gated on the Phase 2 `_key`-vs-stored-map decision.
- `-x` sub-variants - undefined, out of scope.
- The other hero-bearing templates (articles, projects, services, training, develop, sectors, resources) and the hardcoded `Nav.js` / `about.js` URLs - the Phase 1 expansion, after the pilot proves out.
- PDFs - separate surface (web ranking), separate phase.

---

## 10. Pilot

`tool:process-mapping` only (a reset-cohort, low-traffic tool). All of the above is applied to it and nothing else; every other doc is unchanged. Rollout = add slugs to the enable list.
