# Performance Audit Report - Mutomorro

**Date:** 24 March 2026
**Auditor:** Claude Code
**Site:** mutomorro.com (Next.js 16.2.1 + Sanity CMS + Vercel)

---

## 1. Summary

The primary cause of the slow TTFB (2.0s mobile, 1.3s desktop) is that **every page request hits the Sanity API directly** - there is no caching at any layer. The Sanity client is configured with `useCdn: false`, no Next.js fetch caching is applied, and no routes use ISR (`revalidate`) or static generation (`generateStaticParams`). This means every visitor triggers a fresh server-side render with uncached API calls to Sanity's origin servers in real time. Fixing this single issue - enabling Sanity's CDN and adding ISR - will likely cut TTFB by 60-80%.

---

## 2. Route Rendering Audit

Build output confirms the following route types (Next.js 16.2.1 Turbopack):

### Static Routes (pre-rendered at build time) - already optimal

| Route | Notes |
|-------|-------|
| `/` | Homepage - static at build, fetches projects + tools |
| `/about` | Pure JSX |
| `/philosophy` | Pure JSX |
| `/how-we-work` | Pure JSX |
| `/privacy` | Pure JSX |
| `/unsubscribed` | Pure JSX |
| `/services` | Index - fetches all services at build |
| `/articles` | Index - fetches all articles at build |
| `/tools` | Index - fetches all tools at build |
| `/projects` | Index - fetches all projects at build |
| `/courses` | Index - fetches all courses at build |
| `/develop` | Index - fetches capabilities at build |
| `/emergent-framework` | Overview - fetches at build |
| `/states-of-vitality` | Pure JSX |
| `/sitemap.xml` | Generated at build |

### Dynamic Routes (SSR on every request) - **all need ISR**

| Route | Data Source | Recommended | Est. Pages |
|-------|-----------|-------------|------------|
| `/services/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | 14 |
| `/services/[slug]/[subpage]` | Sanity | ISR 3600s + `generateStaticParams` | ~28 |
| `/articles/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | 25 |
| `/tools/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | 59 |
| `/projects/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | 11 |
| `/courses/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | ~5 |
| `/develop/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | 7 |
| `/emergent-framework/[dimension]` | Sanity | ISR 3600s + `generateStaticParams` | ~8 |
| `/emergent-framework/[dimension]/[article]` | Sanity | ISR 3600s + `generateStaticParams` | ~40 |
| `/emergent-framework/[dimension]/section` | Sanity | ISR 3600s + `generateStaticParams` | ~8 |
| `/resources/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | ~5 |
| `/case-studies/[slug]` | Sanity | ISR 3600s + `generateStaticParams` | ~11 |
| `/contact` | searchParams | Keep dynamic (form state) | 1 |
| `/newsletter/[id]` | Supabase | Keep dynamic (real-time data) | N/A |
| `/studio/[[...tool]]` | Sanity Studio | Keep dynamic (CMS app) | N/A |

**Key finding:** None of the ~220 CMS-backed pages use `generateStaticParams()` or `export const revalidate`. Every page visit triggers a fresh Sanity API call.

---

## 3. Findings

### CRITICAL: Sanity CDN disabled

**File:** `sanity/client.js`, line 7
```js
useCdn: false,
```

Every query goes to Sanity's origin API instead of their globally distributed CDN. The CDN serves cached responses in ~50-100ms; the origin API takes 200-800ms per query. With multiple queries per page (data + metadata), this alone accounts for most of the TTFB.

**Impact:** HIGH - this is the single biggest performance issue.

---

### CRITICAL: No ISR or static generation on any dynamic route

**Files:** All `app/*/[slug]/page.js` files

No dynamic route exports `revalidate` or implements `generateStaticParams()`. This means:
- Every page visit triggers server-side rendering
- Sanity is queried on every request
- Vercel's edge cache is never populated
- Pages that change once a month are re-rendered thousands of times

**Impact:** HIGH - combined with the CDN issue, this is why TTFB is 2 seconds.

---

### HIGH: Duplicate Sanity queries in metadata + page component

**Files:**
- `app/articles/[slug]/page.js` - `generateMetadata()` (line 12) and `ArticlePage()` (line 41) both query the same article
- `app/projects/[slug]/page.js` - same pattern
- `app/courses/[slug]/page.js` - same pattern
- `app/tools/[slug]/page.js` - same pattern

Next.js deduplicates `fetch()` calls within a request, but this relies on the Sanity client using `fetch()` internally with identical request signatures. With `next-sanity`, deduplication may not work as expected because the client uses its own HTTP layer.

**Impact:** MEDIUM - potentially doubles the Sanity API calls per page load.

---

### MEDIUM: All Sanity images use raw `<img>` tags without optimisation

**Files:** Multiple (ArticlesGrid.js, ToolsGrid.js, CoursesGrid.js, ProjectsGrid.js, all `[slug]/page.js` templates)

Sanity images are rendered as `<img src={urlFor(image).width(600).url()}>` instead of using Next.js `<Image>`. This means:
- No automatic WebP/AVIF conversion
- No responsive `srcset` generation
- No lazy loading (below-fold images load immediately)
- No priority hints for LCP images
- No image size optimisation via Vercel's image CDN

Additionally, no `.quality()` or `.auto('format')` is called on the `urlFor()` chains, so Sanity serves full-quality originals.

**Impact:** MEDIUM - affects LCP and total page weight.

---

### MEDIUM: Sanity Studio embedded in main app bundle

**File:** `app/studio/[[...tool]]/page.jsx`

The Sanity Studio (`sanity` package, ~3.8MB chunk) is bundled as part of the main application. While it's code-split to the `/studio` route, the `sanity` and `styled-components` packages are listed as production dependencies, potentially affecting tree-shaking and overall bundle analysis.

**Impact:** LOW for visitors (code-split), but increases build time and deploy size.

---

### MEDIUM: `puppeteer` in production dependencies

**File:** `package.json`

```
"puppeteer": "^24.39.1"
```

Puppeteer is a 200MB+ package with a bundled Chromium binary. It should be in `devDependencies` unless it's used in a server-side API route. If it's only used for local scripts or PDF generation during development, moving it to devDependencies will speed up installs and reduce the Vercel deployment package.

**Impact:** LOW for page speed, MEDIUM for deploy times.

---

### LOW: No caching headers in next.config.mjs

**File:** `next.config.mjs`

No custom `headers()` function is defined. Vercel applies sensible defaults, but explicit `Cache-Control` and `s-maxage` headers on static assets and ISR pages would ensure optimal CDN behaviour.

**Impact:** LOW - Vercel defaults are reasonable but could be better.

---

### LOW: 550+ redirects in next.config.mjs

**File:** `next.config.mjs`, lines 8-575

Large redirect arrays are evaluated at the edge on every request. While Vercel handles this efficiently, the sheer volume (550+ rules) could add a few milliseconds. These are permanent (301) redirects from the WordPress migration.

**Impact:** LOW - Vercel processes these efficiently at the edge.

---

### LOW: No `minimumCacheTTL` for image optimisation

**File:** `next.config.mjs`, lines 3-7

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
  ],
},
```

No `minimumCacheTTL` is set, so Vercel uses the default (60 seconds). Setting this higher (e.g. 2592000 = 30 days) for CMS images that rarely change would reduce re-optimisation.

**Impact:** LOW - mostly affects repeat visits.

---

### INFO: Font loading is optimal

**File:** `app/layout.js`

Source Sans 3 is loaded via `next/font/google` with self-hosting and font-display swap. This is the recommended approach - no issues here.

---

### INFO: No middleware

No `middleware.js` or `middleware.ts` exists. This rules out middleware as a TTFB contributor.

---

### INFO: Client component count is high but code-split

113 `'use client'` components found across `app/` and `components/`. Most are canvas animations for service heroes (14 hero components, 56 recognition cards) and interactive UI elements. These are code-split per route, so they don't affect initial page load of unrelated routes. However, service pages with animated heroes will have larger client bundles.

---

## 4. Recommendations (ranked by impact)

### 1. Enable Sanity CDN (HIGH impact, 1 minute fix)

**File:** `sanity/client.js`, line 7

Change `useCdn: false` to `useCdn: true`.

This alone will likely cut TTFB by 40-60% because Sanity's CDN serves cached responses from edge locations globally. The CDN is safe for production reads (it only caches published content, not drafts).

If you need draft preview, create a separate client:
```js
export const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Fast CDN for production reads
})

export const previewClient = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Direct API for draft content
  token: process.env.SANITY_PREVIEW_TOKEN,
})
```

---

### 2. Add ISR to all CMS-backed dynamic routes (HIGH impact, 30 minutes)

Add to every `[slug]/page.js` file:

```js
export const revalidate = 3600 // Revalidate every hour
```

And add `generateStaticParams()` to pre-build the known pages:

```js
export async function generateStaticParams() {
  const items = await client.fetch(`*[_type == "service"]{ "slug": slug.current }`)
  return items.map(item => ({ slug: item.slug }))
}
```

**Do this for:** services, articles, tools, projects, courses, develop, emergent-framework dimensions, emergent-framework articles, resources, case-studies.

This means:
- Pages are built at deploy time (instant TTFB on first visit)
- After 1 hour, the next visitor triggers a background rebuild
- Stale content is served while rebuilding (no slow requests)

For content that changes less frequently, use `revalidate: 86400` (daily) instead.

---

### 3. Add Sanity image optimisation parameters (MEDIUM impact, 5 minutes)

**File:** `sanity/image.js`

Update the `urlFor` helper or add convenience functions:

```js
export function urlFor(source) {
  return builder.image(source).auto('format').quality(80)
}
```

`.auto('format')` serves WebP to supporting browsers (30-50% smaller). `.quality(80)` reduces file size with negligible visual difference.

---

### 4. Convert LCP images to next/image (MEDIUM impact, 15 minutes per template)

For above-the-fold hero/card images, replace:
```jsx
<img src={urlFor(image).width(600).url()} />
```

With:
```jsx
<Image
  src={urlFor(image).width(600).auto('format').quality(80).url()}
  alt={image.alt || ''}
  width={600}
  height={338}
  priority  // Only for above-the-fold images
/>
```

This adds lazy loading for below-fold images, responsive srcset, and priority hints for LCP candidates.

---

### 5. Add `minimumCacheTTL` to image config (LOW impact, 1 minute)

**File:** `next.config.mjs`

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
  ],
  minimumCacheTTL: 2592000, // 30 days
},
```

---

### 6. Move puppeteer to devDependencies (LOW impact, 1 minute)

```bash
npm install --save-dev puppeteer
```

This removes ~200MB from the production deployment package.

---

## 5. Quick Wins (under 5 minutes each)

| # | Change | File | Time | Expected Impact |
|---|--------|------|------|-----------------|
| 1 | Change `useCdn: false` to `useCdn: true` | `sanity/client.js:7` | 30 sec | TTFB drops 40-60% |
| 2 | Add `export const revalidate = 3600` to all `[slug]/page.js` | 12 files | 3 min | Pages cached at edge |
| 3 | Add `.auto('format').quality(80)` to urlFor | `sanity/image.js` | 1 min | Images 30-50% smaller |
| 4 | Add `minimumCacheTTL: 2592000` to images config | `next.config.mjs` | 1 min | Fewer re-optimisations |
| 5 | Move puppeteer to devDependencies | `package.json` | 1 min | Faster deploys |

**Estimated combined effect of fixes 1-2:** TTFB should drop from 2.0s to under 0.5s on mobile, bringing FCP and LCP well within Core Web Vitals thresholds.

---

## 6. Build Output Summary

```
Total static bundle: 8.3MB (.next/static/)
Largest chunks:
  - 3.8MB - Sanity Studio (code-split to /studio route only)
  - 1.0MB - Shared framework chunk
  - 523KB - Page-level chunk
  - 455KB - Page-level chunk
  - 453KB - Page-level chunk

Static pages (pre-rendered): 15
Dynamic pages (SSR per request): 16 route patterns (~220 actual pages)
Client components: 113
```

The Sanity Studio chunk (3.8MB) does not affect visitor-facing pages as it's code-split to `/studio`. The visitor-facing bundles are reasonably sized.

---

## 7. Architecture Note

The current setup treats every page as if content changes in real-time. In reality, Mutomorro's content (services, articles, tools, framework pages) changes at most weekly. The entire site could be statically generated with hourly ISR revalidation, making TTFB effectively zero for cached pages.

The two changes that will have the most dramatic effect:
1. `useCdn: true` - lets Sanity serve cached data from edge
2. `revalidate: 3600` on all routes - lets Vercel serve cached pages from edge

Together, these eliminate both the slow API call and the server-side render on every request.
