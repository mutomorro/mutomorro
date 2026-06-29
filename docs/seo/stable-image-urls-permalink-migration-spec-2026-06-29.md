# Stable Image URLs — Permalink-Field Migration (build spec)

**Date:** 29 June 2026
**Status:** DESIGN / BUILD-SHEET. Awaiting James's explicit GO before any Sanity **schema** or **dataset** write. Nothing below has been written.
**Scope now:** the **37 reset-cohort tools**, body images only. Heroes are already clean (`<slug>-overview`) and are untouched. The 22 best-rankers stay excluded.
**Supersedes** the alt-derived body-URL descriptor shipped 28–29 Jun (`d907f12`).

---

## 1. The decision (agreed with James, 29 Jun)

Give each tool **body image** a permanent **`imageSlug`** field, decoupled from alt and from the asset, resolve the route **by it**, drop the hex `_key`, and serve clean **flat, house-pattern** URLs:

```
/img/tool/process-mapping-overview        ← master diagram (= the hero; same asset)
/img/tool/process-mapping-step-1-assumed
/img/tool/process-mapping-step-2-actual
/img/tool/process-mapping-step-3-designed
```

Confirmed decisions:

| # | Decision | Value |
|---|---|---|
| D1 | **Path shape** | **Flat** `/img/tool/<slug>-<imageSlug>` — drop `/body/`. Unifies with the already-flat hero; the 4-segment `/body/…` form survives only as a legacy redirect. |
| D2 | **Role word** | **Uniform `step-N-<name>`** for every variant (mechanical, no per-model judgement). `overview` for the master. |
| D3 | **`overview` consolidation** | Hero and body-master share `/img/tool/<slug>-overview`. They are **byte-identical** (same asset `_ref`, verified on process-mapping / iceberg-model / dmaic / cynefin), so one canonical URL = a consolidation, not a clash. |
| D4 | **Seed** | From the asset `originalFilename` suffix after `-hero-` (NOT alt). `master`→`overview`; `<N>-<rest>`→`step-<N>-<rest>`. Filename number is authoritative over array order. |
| D5 | **Field type** | **`string`** (not `slug`). Avoids `.current` across 6 call-sites + GROQ; format is enforced by validation regardless. (Resolves red-team S4 — a `slug`/`string` mismatch would 404 every new URL.) |
| D6 | **Required?** | **No** — optional field; validation fires only when a value is present. (Resolves red-team B4 — a global `Rule.required()` would block Studio publish on the 22 excluded tools, whose body images have no `imageSlug`.) |
| D7 | **Legacy URLs** | The hours-old `/img/tool/<slug>/body/<descriptor>-<key>` URLs (live + in the sitemap since 28–29 Jun) **keep resolving** and **301 to the flat URL**. The `_key` branch is kept **permanently** as a universal fallback. (Resolves red-team B1 / S6.) |

---

## 2. URL scheme — before / after

| Surface | Live now (shipped 28–29 Jun) | After this migration |
|---|---|---|
| Hero | `/img/tool/<slug>-overview` | **unchanged** |
| Body master | `/img/tool/<slug>/body/<descriptor>-<key>` | `/img/tool/<slug>-overview` (= the hero URL; consolidated) |
| Body variant | `/img/tool/<slug>/body/<descriptor>-<key>` | `/img/tool/<slug>-step-N-<name>` |
| Legacy `/body/…` | (the above) | still resolves → **301** to the flat URL |

Query-param variants (`?fmt=avif&w=…`, `?w=1200&h=630&fit=crop`) are unchanged — they ride the same canonical path.

**Why flat is safe to parse** (the reason `/body/` originally existed): a flat new URL is **2 segments** (`['tool','<slug>-<role>']`); a legacy URL is **4 segments** (`['tool','<slug>','body','<tail>']`). Segment count — not a hex heuristic — separates them, so there is no misclassification risk. Within the 2-segment path, `<slug>-<role>` is split on a *recognised* trailing role (`overview | step-N-… | stage-N-…`), then resolution is **double-keyed**: the doc must match `slug.current == <slug>` **and** (for body) `body[imageSlug == <role>]`. A bad split can therefore only ever 404 — never serve the wrong image. Verified: no tool slug ends in anything that looks like a role token.

---

## 3. Sanity schema change (`sanity/schemas/tool.js`)

Add `imageSlug` to the `body` array's image member, alongside `alt` / `caption`. **Optional** string, format-validated, with **array-level uniqueness** (see §3.1).

```js
// inside the body[] image member's `fields` — alongside { alt }, { caption }
{
  name: 'imageSlug',
  title: 'Image URL slug (permanent)',
  type: 'string',
  description:
    'The permanent last part of this image’s stable URL: /img/tool/<page>-<image-slug>. ' +
    'House pattern — lowercase, hyphens, NUMBER FIRST: ' +
    '“overview” (the main / hero diagram) or “step-N-name” (e.g. step-1-political). ' +
    'SET ONCE, NEVER CHANGE — this slug IS the public URL; renaming it 404s the address Google indexed ' +
    '(same rule as “never delete-and-re-add a block”). Usually seeded by the backfill from the asset filename.',
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value) return true // optional: empty is allowed (falls back to the _key URL)
      return /^(overview|step-\d+(-[a-z0-9]+)+)$/.test(value)
        ? true
        : 'Use the house pattern: "overview" or "step-N-name" (lowercase, hyphens, number first, e.g. step-1-political).'
    }),
}
```

Format regex `^(overview|step-\d+(-[a-z0-9]+)+)$`: `overview` exactly, or `step-<n>-<name…>` with a **required** name tail (bare `step-1` rejected). `stage-` is intentionally **not** permitted (D2 = uniform `step`); add it later only if a content type needs it.

### 3.1 Within-page uniqueness (array-level)

Field-level validation can't reliably see array siblings; put uniqueness on the **`body` array field** itself, where every child is visible deterministically (resolves red-team B3):

```js
// on the `body` field (the array), add:
validation: (Rule) =>
  Rule.custom((blocks) => {
    const seen = new Map()
    for (const b of blocks || []) {
      if (b?._type !== 'image' || !b?.imageSlug) continue
      if (seen.has(b.imageSlug)) {
        return `Two images share the URL slug "${b.imageSlug}" — each must be unique on the page.`
      }
      seen.set(b.imageSlug, b._key)
    }
    return true
  }),
```

The **real** guarantee is the backfill assertion + the route's deterministic `[imageSlug == $s][0]`; Studio validation is the editor-facing guardrail.

### 3.2 Generic for the estate-wide phase

Lift the field object + the two validators into a shared `sanity/schemas/_imageSlug.js` (mirroring `_seo.js`'s `imageWithAlt()`), exporting `imageSlugField` and a `bodyImageWithSlug()` factory, so `article`/`project`/`service`/etc. body arrays reuse the identical contract later. **For scope-now, inline in `tool.js` is fine** — extract to the shared module when the estate-wide phase begins (keeps this change small). The `RESOLVE` table in `lib/image-proxy.js` already maps each URL type → `sanityType` + `bodyField`, so extending resolution to a new type is data, not new logic.

---

## 4. Backfill (`scripts/seed-body-image-slugs.mjs` — gitignored, idempotent)

`npx tsx scripts/seed-body-image-slugs.mjs` (dry-run) / `--apply`. Reads `SANITY_TOKEN` from `.env.local`.

**Algorithm**
1. `@sanity/client` `{ projectId:'c6pg4t4h', dataset:'production', token, apiVersion:'2024-01-01', useCdn:false }`.
2. Fetch the 37 docs **including drafts** (`drafts.<id>` *and* published `<id>` both patched, so a later publish can't clobber the field — red-team N4):
   `*[_type=="tool" && slug.current in $slugs]{ _id, "slug":slug.current, body[_type=="image"]{ _key, imageSlug, "fn":asset->originalFilename } }`
3. Per image, **re-derive live** (never trust a snapshot table — red-team S5):
   `suffix = fn.match(/-hero-(.+?)\.(png|jpe?g|webp|avif)$/i)[1]` → `master`→`overview`, else `step-<N>-<rest>`.
   - no `-hero-` match → **ERROR, skip** (0 expected).
   - `imageSlug === want` → **skip** (idempotent).
   - `imageSlug` set but `!== want` → **CONFLICT, do not overwrite** (enforces "set once"); print for review.
   - else → queue `set` on the `_key`-addressed path.
4. **Per-doc uniqueness assert** before writing (abort that doc on any dup — 0 expected, guard stays).
5. Patch shape (key-addressed, reorder-proof — never positional):
   ```js
   client.patch(docId).set({ [`body[_key=="${key}"].imageSlug`]: want }).commit()
   ```
6. Dry-run prints a per-doc diff; `--apply` commits. Re-runs converge with no churn.

**This run:** 209 sets across 37 docs (35 `overview` + 174 `step-N-*`); 0 conflicts / collisions / blank-alts expected (independently verified, §8).

**Order of operations (red-team S1):** run the backfill **to completion first**, *then* deploy the emitter cutover. Do not interleave — a half-backfilled dataset + flipped emitters would list a mix of URLs in the sitemap.

---

## 5. Code changes (flat scheme)

All four files are on `main`. Heroes / JSON-LD / OG are out of scope (already clean).

**`lib/image-proxy.js`**
- Add `bodyPathBySlug(type, slug, imageSlug)` → `` `${PROXY_BASE}/${type}/${slug}-${imageSlug}` `` (**flat**; for `imageSlug==='overview'` this equals `overviewPath`, i.e. the hero URL — the consolidation).
- `bodyCanonicalUrl(type, slug, {imageSlug, alt, key}, {absolute})`: `imageSlug` → `bodyPathBySlug` (flat); else legacy `bodyPath` (`/body/<descriptor>-<key>`) as the un-backfilled fallback.
- Same `{imageSlug, alt, key}` object-arg treatment for `bodyRenderSrcSet` and `bodySitemapImage`.
- Keep `altToDescriptor` / `descriptorToName` / `bodyPath` (the route still parses the legacy form).

**`app/img/[...slug]/route.js`**
- Extend `ROLE_SUFFIX` to capture the named tail: `^(.+)-(overview|step-\d+(?:-[a-z0-9]+)+)$`.
- **2-segment branch:** `role==='overview'` (or a fixed hero role) → existing `resolveDoc(heroImage)`; `role` matches `step-N-…` → new `resolveBodyImageBySlug(body, slug, role)` = `body[imageSlug == $s][0].asset->url` (param-bound `$s` — safe). Download filename = `` `${titleToFilename(title)}-${descriptorToName(role)}` `` e.g. `Process-Mapping-Step-1-Assumed.png` (red-team N2 — avoids `Overview.png` colliding across tools).
- **4-segment `/body/…` branch (legacy, kept permanently):** resolve by `_key`; project the block's `imageSlug` too. If present → **301** to the flat `/img/tool/<slug>-<imageSlug>` (preserve the query string; set `Cache-Control` on the redirect via `new Response(null,{status:301,headers})`, **not** `Response.redirect`, which sets no cache header — red-team S3). If absent → serve 200 from the key.

**`app/tools/[slug]/page.js`** — body renderer: `useBodyProxy = heroUseProxy && (value.imageSlug || value._key)`; pass `{imageSlug:value.imageSlug, alt:value.alt, key:value._key}` to `bodyCanonicalUrl` / `bodyRenderSrcSet`. Falls back to the `_key` URL for any not-yet-backfilled image (never regresses to a hashed CDN src). No GROQ change — `getTool` spreads `...,` so `value.imageSlug` already arrives.

**`app/sitemap.js`** — add `imageSlug` to the tool body projection (`body[_type=="image"]{ "url":asset->url, "key":_key, imageSlug, alt }`); pass `{imageSlug:b.imageSlug, alt:b.alt, key:b.key}` to `bodySitemapImage`.

---

## 6. Red-team resolutions (the contradictions the design agents disagreed on)

| Risk | Resolution |
|---|---|
| **B1** legacy URLs would 404 on a hard cutover | Keep legacy resolution + **301 to flat**; keep the `_key` branch **permanently** (D7). |
| **B2** hex-discriminator misreads a hex-looking slug as a key | **Dissolved by the flat scheme** — 2-seg (new) vs 4-seg (legacy) separates them; no hex heuristic. |
| **B3** Studio uniqueness can't see siblings at field level | Uniqueness at the **`body` array level** (§3.1). |
| **B4** global `Rule.required()` breaks the 22's Studio publish | Field is **optional** (D6); render/sitemap fall back gracefully. |
| **S4** `slug` vs `string` type/GROQ mismatch → total 404 | **`string`** everywhere; no `.current` (D5). |
| **S2/S3** sticky redirect cache / no cache header | 301 only targets validated, frozen slugs (set-once + format validation); set `Cache-Control` on the redirect response. |
| **S5** snapshot mapping could write a stale slug | Backfill **re-derives from live `originalFilename`** at apply time. |
| **S6** non-`-hero-` filename → no slug | Permanent `_key` fallback resolves any block regardless of filename. |
| **N2** `Overview.png` collides across tools | Filename = `<Title>-<ImageSlug>` . |
| **N4** publish clobbers field | Backfill patches drafts **and** published. |

---

## 7. Rollout & verify (prove-on-preview-then-prod)

1. Branch; schema + `_imageSlug` (inline), lib/route/page/sitemap changes; backfill script.
2. **Backfill `--apply` to completion** (37 docs, 209 sets), drafts+published; `rm -rf .next`.
3. Push branch → Vercel preview (behind SSO → `get_access_to_vercel_url` 23-hr bypass). Verify: flat body deliveries 200 (PNG/AVIF/WebP); a legacy `/body/<descriptor>-<key>` URL **301s** to the flat URL with query preserved; sitemap emits 37 hero + 209 body **flat** entries; the 22 still on CDN; edge `MISS→HIT`; **zero `get_runtime_logs` errors**.
4. Merge to `main` (prod); re-verify on `mutomorro.com`.
5. Strategic Change Log (Baserow 1049655): new row for the permalink migration (fill the four-before fields). Update the Craft wiki ("set once, never change" rule) + memory.

---

## 8. Verification already done (read-only)

- **37 tools · 209 body images · 0 collisions · 0 anomalies** — every filename matches `-hero-<N>-<state>` / `-hero-master`; every image has alt; derivation is unique within every tool (cross-checked independently, `scratchpad/derive-imageslugs.mjs`).
- **2 tools without a master** (`5-whys`, `the-heros-journey`): `step-1…N` only, no `overview`. Not an error.
- **2 tools with array-order ≠ filename-number** (`daci-framework`, `empathy-map`): the **filename number** is taken (e.g. `step-1-contributors` even though it sits at array index 3) — exactly why resolving by a stored field, not array position, is reorder-safe.
- **Hero == body-master asset** confirmed identical (`_ref`) on 4 sampled tools → `overview` consolidation is byte-safe.

---

## 9. Open for James (recommendations in bold)

1. **`step-1-assumed` vs `step-1-assumed-flow`.** The filename suffix is the short form (`assumed`), so the mechanical seed yields **`step-1-assumed`**. The house-pattern doc's `stage-1-assumed-flow` example was the longer alt-derived form. **Rec: keep the short, filename-verbatim form** (pure mechanical derivation; a longer form would need a hand-maintained per-image override map). Flag if you want the longer form anywhere.
2. **Confirm the spec** so I can build on a branch and bring the preview back for sign-off. The Sanity schema + dataset (backfill) writes happen **only after** your go.

---

## 10. Authoritative mapping (209 images)

`imageSlug ← (_key)` per tool; clean URL = `/img/tool/<slug>-<imageSlug>`. (Documentation only — the backfill re-derives live.)

- **4-stages-of-psychological-safety**: overview←dfb82400f885 · step-1-inclusion-safety←066222d18d5a · step-2-learner-safety←ea386cd2818b · step-3-contributor-safety←f3c9ccf0d8ec · step-4-challenger-safety←22aefbc1c873
- **5-whys** *(no master)*: step-1-symptom←2a67759948b0 · step-2-cause←37f114c7266e · step-3-condition←583c9cc94fd4 · step-4-pattern←1e808d797bba · step-5-system←9622f30d87c9
- **5ds-of-appreciative-inquiry**: overview←04de78cc3bea · step-1-define←080788958942 · step-2-discover←455ef86ff2aa · step-3-dream←0fb283fe9240 · step-4-design←75dc3253643d · step-5-deliver←70389feb09c8
- **6-team-conditions-for-team-effectiveness**: overview←cf6d15b3a490 · step-1-real-team←2e131b8dcde4 · step-2-compelling-direction←d696dff2144c · step-3-enabling-structure←3a098c2777c7 · step-4-supportive-context←b8a4efad4c6b · step-5-competent-coaching←1d9ff79bf7aa · step-6-shared-mindset←210058ab8b3b
- **8-wastes-of-lean**: overview←bcebb73e04f6 · step-1-defects←37c6c6d12e0d · step-2-overproduction←7322b88df523 · step-3-waiting←fdfb01f02ed1 · step-4-non-utilised-talent←4ecd877ebcb0 · step-5-transport←4dda358b19f9 · step-6-inventory←a3a28165a7fa · step-7-motion←5032409d67ec · step-8-extra-processing←b41549a824b0
- **audience-personas**: overview←e6632960d930 · step-1-demographics←4f8a0fb290b7 · step-2-goals←6a1449dba87e · step-3-pain-points←c2fb4b5f0130 · step-4-behaviour←94e70a062967 · step-5-values←b9988f914bd2 · step-6-influences←1fca1e87e8e4
- **bpm-lifecycle**: overview←668b1b340016 · step-1-design←87ff0e61edb6 · step-2-model←6907104da530 · step-3-implement←25341c5ec9a4 · step-4-monitor←a04974434562 · step-5-optimise←711cc91b59c1
- **bridges-transition-model**: overview←ab2f6e7f9625 · step-1-endings←0cb395ecd9eb · step-2-neutral-zone←9b5a1a7d9f08 · step-3-new-beginnings←3a13188708a1
- **competing-values-framework**: overview←1b8c58da8efb · step-1-collaborate←c0a5e368dd06 · step-2-create←c276e1e5ddfa · step-3-control←33beac4b1695 · step-4-compete←36d561405454
- **contextual-inquiry**: overview←bf1b75e11f0a · step-1-context←08dc197cbb14 · step-2-partnership←686237cc9d66 · step-3-interpretation←8ddd1ec41384 · step-4-focus←9325a60ed6ec
- **cynefin-framework**: overview←fd03c0d347a9 · step-1-clear←b6c0efb485f0 · step-2-complicated←555dae6058e3 · step-3-complex←20c9db7dff64 · step-4-chaotic←936d580fbe0e
- **daci-framework** *(array≠filename order)*: overview←dd2782808e71 · step-1-contributors←a73d2c4a4534 · step-2-driver←d12b311d78ac · step-3-approver←0f7f55ded0c6 · step-4-informed←f6db6487ea0d
- **disc-styles**: overview←9fe07cb69357 · step-1-dominance←5c3432d35d1d · step-2-influence←e3b46d8e2322 · step-3-steadiness←56f19e41987d · step-4-conscientiousness←ab605dcd9658
- **dmaic**: overview←33eb4768c9f9 · step-1-define←b91905512f77 · step-2-measure←fa75f424c2b8 · step-3-analyse←a264b48e59ed · step-4-improve←1d146155fa10 · step-5-control←29c3e7c9cc84
- **empathy-map** *(array≠filename order)*: overview←7dc0451955ee · step-1-says←5e4477395053 · step-2-does←e80971c114ec · step-3-thinks←62beac05dd89 · step-4-feels←9e91f60401df
- **five-dysfunctions-of-a-team**: overview←95142867346b · step-1-trust←3ce2fd704d34 · step-2-conflict←b963e09cf93b · step-3-commitment←039823ec9415 · step-4-accountability←aacf9e55a551 · step-5-results←a4d83eab5cf2
- **gemba-walk**: overview←ddd667061d96 · step-1-prepare←8fcea3812bca · step-2-go←abb8fac536ae · step-3-observe←604f7446fdea · step-4-ask←6acf8241618d · step-5-document←30f844013f22 · step-6-follow-up←85af42b0036f
- **heart-of-business**: overview←8a6152825322 · step-1-noble-purpose←c7349ad8c037 · step-2-people←a31b7de28f5c · step-3-stakeholders←3c78e6c866f4 · step-4-profit←2ed37bf6e3be
- **iceberg-model**: overview←7dd44695ba8d · step-1-events←b4b603c88e33 · step-2-patterns-and-trends←9f7857fed6b7 · step-3-underlying-structures←358c1c6d6b8c · step-4-mental-models←0ed2389e70f7
- **kaizen-cycle**: overview←58a0784574fd · step-1-identify←c1412551e337 · step-2-analyse←94bb0ad5a1ec · step-3-develop←0ce64e63e91c · step-4-implement←75f7dec8c06c · step-5-adjust←da81241f5a41 · step-6-standardise←095ee68c10b2
- **lewins-change-model**: overview←594542ad7f4f · step-1-unfreeze←8cffcc48e5b4 · step-2-change←3a4505298f5d · step-3-refreeze←bf18e18b35c9
- **mckinsey-7-s-model**: overview←64b8d42f9df0 · step-1-shared-values←c646ddbfb271 · step-2-strategy←86aef5fb70e4 · step-3-structure←2974748c6e1e · step-4-systems←c03bd531beb6 · step-5-skills←915ecb93efc2 · step-6-staff←49c0f1f4f5e1 · step-7-style←104047fd4c35
- **mendelow-power-interest-matrix**: overview←03a561a3215d · step-1-manage-closely←441af424bef5 · step-2-keep-satisfied←9abd5f0f6b12 · step-3-keep-informed←48e8cb1171dd · step-4-monitor←47e9eb89aec8
- **narrative-strategy**: overview←bf28bf63c8f9 · step-1-shift←b4ef8aaaec0a · step-2-core-message←3d0bfb07eba9 · step-3-audience-map←43ac20cff1a5 · step-4-story-architecture←f9723503ceb8 · step-5-channels-and-moments←bc4e6a09fec1 · step-6-feedback-loop←d120330c45ee
- **ooda-loop**: overview←ada5a135d5ff · step-1-observe←b700dc2dd04a · step-2-orient←76daf5c18502 · step-3-decide←d0cec50f4414 · step-4-act←aeb0d5c6495e
- **orca**: overview←0a1635abddf3 · step-1-evidence←6e72d154fcdc · step-2-context←45439ec23558 · step-3-facilitation←c4bcb273ac0a
- **pdca-cycle**: overview←3195b0117891 · step-1-plan←888640e168b1 · step-2-do←49a2ce5c4d6d · step-3-check←d30714565e49 · step-4-act←af802c76e658
- **problem-statement**: overview←75a826a17b89 · step-1-context←6255f77a940c · step-2-impact←7821cfa5a069 · step-3-define←4e0ec85bec72 · step-4-approach←04bbb5823d35 · step-5-action←3c16105aa68f
- **process-mapping**: overview←bf263e515ebb · step-1-assumed←33a15bf215c9 · step-2-actual←9880aefff30a · step-3-designed←398a2558ec4a
- **rasci-framework**: overview←1879bab44ca4 · step-1-responsible←dc0c535fb3c5 · step-2-accountable←d8117bdd4d25 · step-3-supportive←4f6e735647e7 · step-4-consulted←1b588bf0afb1 · step-5-informed←e03e3664df8b
- **satir-change-model**: overview←b10a4aac6eb8 · step-1-old-status-quo←a13e7c7be3bc · step-2-resistance←9b885102281d · step-3-chaos←fc1ac0b81c95 · step-4-integration←364194e3fa81 · step-5-new-status-quo←b9015d383f40
- **service-blueprints**: overview←f828395175e9 · step-1-audience-experience←a9bb71638c3d · step-2-frontstage←5dc45b760090 · step-3-backstage←7a3881d104c4 · step-4-support-processes←02aab6a46adb
- **star-method**: overview←6d9b5256cec9 · step-1-situation←1c20f8f0bd5c · step-2-task←813c938465e6 · step-3-action←f1fc172df98b · step-4-result←b0738a4ad7bf
- **tesi-model**: overview←690f826031bf · step-1-team-identity←1e82a0d0b918 · step-2-emotional-awareness←d18f21a68fbd · step-3-communication←1fe1898c4a1f · step-4-motivation←0f6b975f848b · step-5-conflict-resolution←92b3a72db4f8 · step-6-stress-tolerance←f08038f436b9 · step-7-positive-mood←dc2245495c63
- **the-heros-journey** *(no master)*: step-1-departure←3881c24ca248 · step-2-initiation←e40f8ec513cb · step-3-return←050eb602be9a
- **theory-of-change**: overview←1b14e83df02f · step-1-problem-statement←3f99abda2966 · step-2-target-audience←6a73a21d09bc · step-3-impact-on-audience←4a27359f89a8 · step-4-unique-solution←8e1ef5cc0ad5 · step-5-key-activities←120f796e9b58 · step-6-short-term-outcome←3daa07a3e95e · step-7-long-term-outcome←b687d61f3a1e · step-8-ultimate-impact←b820e1e56705
- **wicked-problems**: overview←2c98f828bb99 · step-1-defining←bc8bc412482a · step-2-solutions←e954cc20c660 · step-3-consequences←ca8c244c91f5
