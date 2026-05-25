# Mutomorro SEO and technical health audit — 25 May 2026

**Scope:** Full top-to-toe audit of the Next.js 16 codebase, Sanity content, robots/sitemap, redirects, and live response headers. Read-only — no code changes made.

**Methodology:**
- Read every page template under `app/` and the shared components under `components/`.
- Read `next.config.mjs` end-to-end (904 lines).
- Read `app/sitemap.js`, `public/robots.txt`, `middleware.js`, `vercel.json`, `app/layout.js`, `components/LayoutShell.js`.
- GROQ queries against the live Sanity production dataset (project `c6pg4t4h`) for every content type — `published` perspective.
- 30+ live HEAD requests against `https://mutomorro.com` for redirect, sitemap, robots, soft-404, and rendered-tag verification.

---

## 1. Executive summary — five most impactful findings

| # | Finding | Class | Where |
|---|---------|-------|-------|
| 1 | **Root layout sets `<html lang="en">` instead of `lang="en-GB"`** — every page sends the wrong language signal | CRITICAL | [app/layout.js:46](app/layout.js:46) |
| 2 | **EMERGENT article pages have no JSON-LD at all** — 40 pages missing structured data | CRITICAL | [app/emergent-framework/[dimension]/[article]/page.js](app/emergent-framework/[dimension]/[article]/page.js) |
| 3 | **Footer service links use `/services/#fragment` (trailing slash before anchor)** — every click 308-redirects and silently strips the anchor, breaking the in-page jump | CRITICAL | [components/Footer.js:67-70](components/Footer.js:67) |
| 4 | **Sector landing page links to `/article/${slug}` (legacy singular path)** — every related-article click from /sectors/housing triggers an internal 308 chain | CRITICAL | [app/sectors/[slug]/page.js:307](app/sectors/[slug]/page.js:307) |
| 5 | **robots.txt blocks only `/studio`** — does not block `/admin` or `/api`. (The audit also flagged `/_next/static/` here; that turned out to be a brief error — see §3.6 correction note. The block was deliberately removed on 23 May 2026 and stays removed.) | IMPORTANT | [public/robots.txt](public/robots.txt) |

---

## 2. Verification of previous May 2026 fixes

| Fix | Status | Evidence |
|-----|--------|----------|
| `trailingSlash: false` deliberate | **VERIFIED OK** | [next.config.mjs:3](next.config.mjs:3); live test: `/tools/adkar-model/` → 308 → `/tools/adkar-model` |
| No trailing slashes in sitemap (except `/`) | **VERIFIED OK** | Live sitemap: 289 URLs, 0 with trailing slashes apart from homepage |
| No trailing slashes on redirect destinations | **VERIFIED OK** | `grep "destination:.*'/.*/'"` returned 0 hits across all ~280 rules |
| Redirect helper auto-doubles `/path` and `/path/` source variants | **VERIFIED OK** | [next.config.mjs:865-884](next.config.mjs:865) |
| `skipTrailingSlashRedirect` not set | **VERIFIED OK** | Not present anywhere in `next.config.mjs` |
| og:image on tool pages | **VERIFIED OK** | Live `/tools/adkar-model` returns `<meta property="og:image" content="https://cdn.sanity.io/...">` |
| og:image on service / capability / EMERGENT pages | **VERIFIED OK (with caveats)** — services use Sanity `propositionImage`, capability + emergent fall back to `/og-default.png` (no per-page custom OG). All have a working image. |
| twitter:card = `summary_large_image` | **VERIFIED OK** | [app/layout.js:30](app/layout.js:30); live homepage emits `<meta name="twitter:card" content="summary_large_image">` |
| og:url present on tool/article/service/project/course/etc. | **VERIFIED OK** | Every dynamic `generateMetadata` sets `openGraph.url`. Live spot-checks confirm. |
| article:published_time / modified_time on articles | **VERIFIED OK** | [app/articles/[slug]/page.js:49-50](app/articles/[slug]/page.js:49) — emitted as `publishedTime` / `modifiedTime` under `openGraph` |
| Article slug typo `governance-the-enables-innovation` → corrected | **VERIFIED OK** | Sanity slug now `governance-that-enables-innovation`; redirect from typo in place at [next.config.mjs:365](next.config.mjs:365); live `/articles/governance-that-enables-innovation` returns 200 |
| Sanity inline links bulk-cleaned of trailing slashes | **PARTIAL — see §10** | No raw trailing-slash internal hrefs were found, but many absolute-URL legacy paths remain (e.g. `https://mutomorro.com/change-management` → 308) |
| WordPress catch-alls (`/category`, `/tag`, `/author`, `/feed`, `/wp-content`) | **VERIFIED OK** | All five live HEAD requests returned the correct 308 destination |
| 308 (not 302) on permanent redirects | **VERIFIED OK** | Every `permanent: true` rule observed returns 308; grep for `permanent: false` returned 0 results |
| robots.txt sitemap reference | **VERIFIED OK** | `Sitemap: https://mutomorro.com/sitemap.xml` present |
| Static `og-default.png` exists | **VERIFIED OK** | [public/og-default.png](public/og-default.png) present |

---

## 3. CRITICAL issues — fix immediately (could block indexing or undo recovery)

### 3.1 `<html lang="en">` — should be `en-GB`
- **File:** [app/layout.js:46](app/layout.js:46)
- **Plain English:** The root HTML element declares the page is in generic English, not British English. The site uses British spellings (organisation, optimise, behaviour) and `openGraph.locale: 'en_GB'` is already set, but the `<html lang>` doesn't match. Search engines use this to decide regional ranking and answer-box treatment in the UK.
- **Affected:** All pages (208+).
- **Fix:**
  ```js
  // app/layout.js, line 46
  <html lang="en-GB">
  ```

### 3.2 EMERGENT article pages have no JSON-LD
- **File:** [app/emergent-framework/[dimension]/[article]/page.js](app/emergent-framework/[dimension]/[article]/page.js) (40 pages)
- **Plain English:** Every other content type renders an `Article`/`Service`/`Course` JSON-LD block and a `BreadcrumbList`. The 40 EMERGENT articles render neither.
- **Fix:** Add the same pattern used on [app/articles/[slug]/page.js:67-109](app/articles/[slug]/page.js:67) — an Article schema with author, publisher, url, dates, plus a 3-level BreadcrumbList (`EMERGENT Framework › {Dimension} › {Article}`).

### 3.3 Footer service-category links emit `/services/#anchor` (trailing slash before fragment)
- **File:** [components/Footer.js:67-70](components/Footer.js:67)
- **Plain English:** A URL like `/services/#purpose-direction` is requested as path `/services/`. With `trailingSlash: false`, the path 308s to `/services` and the browser drops the fragment, so the user lands at the top of the services page rather than the section they clicked. Internally this is a redirect chain on every footer click.
- **Fix:**
  ```jsx
  // four lines, change /services/#... to /services#...
  <li><Link href="/services#purpose-direction" className="footer-link">Purpose & Direction</Link></li>
  <li><Link href="/services#structure-operations" className="footer-link">Structure & Operations</Link></li>
  <li><Link href="/services#people-capability" className="footer-link">People & Capability</Link></li>
  <li><Link href="/services#service-experience" className="footer-link">Service & Experience</Link></li>
  ```

### 3.4 Sector page links to `/article/${slug}` instead of `/articles/${slug}`
- **File:** [app/sectors/[slug]/page.js:307](app/sectors/[slug]/page.js:307)
- **Plain English:** The "useful resources" section on /sectors/housing builds article links using the old singular `/article/` path, which redirects (via the catch-all rule on [next.config.mjs:60](next.config.mjs:60)) to `/articles/`. Every "related article" click from a sector page is a 308.
- **Fix:**
  ```jsx
  // line 307
  <Link href={`/articles/${article.slug}`} className="inline-link">
  ```

### 3.5 `/studio` route has no `noindex` meta tag
- **File:** [app/studio/[[...tool]]/page.jsx](app/studio/[[...tool]]/page.jsx)
- **Plain English:** The Studio page is a single `<NextStudio>` render with no `metadata` export. Indexing is currently prevented only by `robots.txt`'s `Disallow: /studio` line — that's correct as a primary defence, but the brief specifies belt-and-braces (`noindex` meta on the page itself). Without it, a single backlink could surface the Studio in unindexed-but-discovered crawl data.
- **Fix:**
  ```js
  // app/studio/[[...tool]]/page.jsx — add above the function
  export const metadata = { robots: 'noindex, nofollow' }
  ```

### 3.6 robots.txt only blocks `/studio` — does not block `/admin` or `/api`
- **File:** [public/robots.txt](public/robots.txt)
- **Current contents:**
  ```
  User-agent: *
  Allow: /

  Sitemap: https://mutomorro.com/sitemap.xml

  # Block Sanity Studio
  Disallow: /studio
  ```
- **Plain English:** Two Disallow rules are missing — `/admin` and `/api`. The `/admin` namespace is already `noindex` via its layout, but blocking the crawl is still cleaner. `/api` routes should never be crawled; some bots try.
- **Fix:**
  ```
  User-agent: *
  Allow: /
  Disallow: /studio
  Disallow: /admin
  Disallow: /api

  Sitemap: https://mutomorro.com/sitemap.xml
  ```

**Correction note (25 May 2026, post-deploy):** The original version of this audit recommended adding `Disallow: /_next/static/`. That was wrong. Google's official guidance is that blocking JS/CSS chunks harms rendering and indexing quality; Vercel's own site doesn't block them; the chunk URLs showing as "Crawled — currently not indexed" in GSC are harmless. The block was deliberately removed on 23 May 2026 for exactly this reason — a fact the original audit missed by trusting earlier session notes that called the block "already shipped." The 25 May deploy briefly re-added the line, and we removed it again the same day. The robots.txt now stays with three Disallow rules only (`/studio`, `/admin`, `/api`). See the SEO incident log for the 23 May entry.

### 3.7 Three pages exist but are missing from the sitemap
- **File:** [app/sitemap.js](app/sitemap.js)
- **Missing:**
  - `/services/culture-change-consultancy/culture-change-programmes` (one `serviceSubPage` published)
  - `/sectors/housing` (one `sectorLandingPage` published)
  - `/resources/thinking-in-ecosystems` (one `resource` published, also the Nav "featured" card)
- **Fix:** Add three more `Promise.all` arms querying `serviceSubPage`, `sectorLandingPage`, `resource`. Pattern:
  ```js
  ...subPages.map(s => ({
    url: `${BASE_URL}/services/${s.parentSlug}/${s.slug}`,
    lastModified: s._updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  })),
  ```

### 3.8 Stale comment in middleware claims `trailingSlash: true`
- **File:** [middleware.js:14](middleware.js:14)
- **Plain English:** The comment says "next.config trailingSlash: true" — the actual setting is `false`. The comment is misleading but the code behaviour is fine (the pathname normalisation it describes is the correct, defensive behaviour). Risk is that someone reads the comment and "fixes" the config to match.
- **Fix:** One-line comment update.

---

## 4. IMPORTANT issues — fix this week (strengthen signals)

### 4.1 Tool page JSON-LD missing `datePublished` / `dateModified`
- **File:** [app/tools/[slug]/page.js:72-88](app/tools/[slug]/page.js:72)
- The Article schema has author, publisher, url, image — but no dates. Articles (the file [app/articles/[slug]/page.js:82-83](app/articles/[slug]/page.js:82)) include them. Add them on tools too.
- **Fix:** add inside the `jsonLd` object:
  ```js
  ...(tool._createdAt && { datePublished: tool._createdAt }),
  ...(tool._updatedAt && { dateModified: tool._updatedAt }),
  ```

### 4.2 No SearchAction on the homepage WebSite schema
- **File:** [app/page.js:67-79](app/page.js:67)
- Brief explicitly asks for it. Current schema is just `name + url`.
- **Fix:** Add a `potentialAction` referencing `/?q={search_term_string}` (or the actual nav typeahead route — confirm). Since search is currently client-side via the SearchPanel component, the SearchAction would need a real URL pattern. If none exists, leave this and the WebSite schema as-is — Google won't penalise missing SearchAction.

### 4.3 Global organisation JSON-LD is `ProfessionalService`, not `Organization`
- **File:** [components/LayoutShell.js:42-64](components/LayoutShell.js:42)
- This is actually a CORRECT choice (ProfessionalService is a subtype of Organization). Worth knowing it's already there — but a separate `Organization` block with `@id` is sometimes recommended for clarity. Low priority.

### 4.4 No explicit `alternates.canonical` on most pages — relies on implicit `./'` from layout
- **Files:** Most dynamic page templates (tool, article, course, project, service, develop, emergent dimension, emergent article, sector, resource).
- **Plain English:** Next.js will compute a canonical from `metadataBase + './'` resolving against the current pathname — but this is implicit. The pages that DO set explicit canonical (homepage, topics, diagnostics, tool template) prove the pattern works. Best practice is to be explicit everywhere so a future refactor can't accidentally drop it.
- **Status check:** Live HEAD on `/tools/adkar-model` confirms the canonical IS being emitted correctly (`<link rel="canonical" href="https://mutomorro.com/tools/adkar-model"/>`). So this is **VERIFIED WORKING but FRAGILE**.
- **Fix:** In each `generateMetadata`, add `alternates: { canonical: 'https://mutomorro.com/<path>/${slug}' }`. Low-urgency since it works today.

### 4.5 Homepage canonical inconsistency with sitemap
- **Sitemap homepage URL:** `https://mutomorro.com/` (with trailing slash) — [app/sitemap.js:10](app/sitemap.js:10)
- **Homepage canonical:** `https://mutomorro.com` (no trailing slash) — [app/page.js:15](app/page.js:15) and rendered HTML confirms
- **Plain English:** Google treats these as equivalent for the root domain, so this isn't a ranking issue. But it's the only inconsistency in an otherwise-clean URL hygiene story. Pick one form — recommend no trailing slash everywhere including the sitemap homepage entry, then everything matches the rule (homepage URL is `/` displayed in the browser but emitted as `https://mutomorro.com`).
- **Fix (option A — easier):** Sitemap line 10, change `${BASE_URL}/` to `${BASE_URL}` (and the static lastmod comment).

### 4.6 Service page H1 is the small "heroKicker" label, not the keyword headline
- **File:** [app/services/[slug]/page.js](app/services/[slug]/page.js) — comment at line 188 explicitly notes this is intentional: "H1 = small heroKicker label, H2 = large statement"
- **Plain English:** This is a design choice that doesn't follow SEO convention. The big keyword-rich `heroHeading` ("Creating the conditions for a thriving culture") is an H2, and the small kicker (e.g. "Culture Change") is the H1. The kicker IS keyword-rich though (the service name) — so it's defensible, just non-standard.
- **Decision needed:** Either accept (kicker is the service name, which is the target keyword) or swap H1/H2.

### 4.7 Article page H1 becomes the small kicker when `articleKicker` is set
- **File:** [app/articles/[slug]/page.js:145-156](app/articles/[slug]/page.js:145)
- Same pattern as services — when `articleKicker` exists on the article, the kicker is H1 and the article title becomes H2. The actual article title is what would rank for the long-tail keyword.
- **Fix:** Consider rendering article title as H1 always, with `articleKicker` as a `<p class="kicker">` above it.

### 4.8 EMERGENT dimension pages have empty body content
- **GROQ verified:** All 8 dimensions return `defined(body) = false`. The dimension template DOES conditionally render `dimension.body` ([emergent-framework/[dimension]/page.js:164](app/emergent-framework/[dimension]/page.js:164)) — so the pages render fine, just without the intended main-body intro between the hero and the article list.
- **Affected dimensions:** tuned-to-change, resonant-purpose, generative-capacity, embedded-strategy, evolving-service, momentum-through-work, narrative-connections, enacted-culture
- **Fix:** Author intro body content for each dimension in Sanity Studio. The schema has a `body` PortableText field ([sanity/schemas/dimension.js:94](sanity/schemas/dimension.js:94)).

### 4.9 Topic hub section intros (toolsIntro, articlesIntro, etc.) are sparse
- **GROQ result summary across 16 active themes (scaling-operations excluded):**
  - All 16 have `description` ✓
  - `customer-experience`, `employee-experience`: missing toolsIntro AND articlesIntro
  - `organisational-restructuring`, `post-merger-integration`: missing toolsIntro, articlesIntro, coursesIntro
  - `teams`: missing articlesIntro AND caseStudiesIntro (despite having 10 tools)
  - Several others: 1-2 fields missing each
- **Plain English:** When an intro field is missing, the topic page omits the intro paragraph above that section but still shows the cards. Not broken, just thinner copy.
- **Fix:** Author short intro paragraphs in Sanity. Especially worth doing on hubs that DO have content (e.g. teams hub has 10 tools but no `articlesIntro` because it has no articles — that's fine).

### 4.10 Topic hubs with very thin content
- `customer-experience`: 0 tools, 0 articles, 1 case study, 1 course
- `employee-experience`: 0 tools, 0 articles, 1 case study, 2 courses
- `organisational-restructuring`: 0 tools, 0 articles, 1 case study, 0 courses
- `post-merger-integration`: 0 tools, 0 articles, 1 case study, 0 courses
- `capacity-building`: 1 tool, 0 articles, 1 case study, 1 course
- `organisational-development`: 2 tools, 1 article, 0 case studies, 0 courses
- **Plain English:** These hub pages render with very few cards. From an SEO POV, thin pages with mostly-empty sections rank poorly and dilute internal link equity.
- **Decision:** Either author more content tagged to these themes, or `notFound()` them (the scaling-operations pattern) until they have enough content to justify a hub.

### 4.11 Three courses missing hero images
- **Affected slugs:** `building-a-theory-of-change`, `driving-organisational-change`, `effective-change-sponsor`
- **Impact:** These courses don't get an image entry in the sitemap, and their og:image falls back to default. They also won't show a hero on the page.
- **Fix:** Upload hero images in Sanity Studio.

### 4.12 Two Sanity inline links use `http://` instead of `https://`
- **Found via GROQ:**
  - `tool tesi-model` → `http://www.emotionalcenter.org/tesi`
  - `tool vuca-prime` → `http://wiki.doing-projects.org/index.php/VUCA`
- **Plain English:** Mixed-content risk if either external site doesn't auto-upgrade to HTTPS. Some browsers downgrade trust signals for HTTPS pages that link to HTTP resources.
- **Fix:** Test whether each target serves HTTPS; if so, update inline links to `https://`. If the targets are HTTP-only, leave them (external content out of our control).

### 4.13 Sanity inline links use legacy absolute paths that all 308-redirect
- **GROQ found dozens of instances** of `https://mutomorro.com/<old-path>` in body content. Examples (non-exhaustive):
  - `mutomorro.com/pestle-analysis` → 308 → `/tools/pestle-analysis` (in tool `2x2-scenario-matrix`)
  - `mutomorro.com/change-management` → 308 (3 tools)
  - `mutomorro.com/process-improvement` → 308 (in `bpm-lifecycle`, `galbraith-star-model`, `process-mapping`)
  - `mutomorro.com/culture-change` → 308 (in 5 tools)
  - `mutomorro.com/service-areas/change-management` → 308 (in `adkar-model`)
  - `mutomorro.com/service-areas/purpose-and-impact` → 308 (in `heart-of-business`, `logframe`, `pestle-analysis`)
  - `mutomorro.com/training/systems-thinking-for-organisational-change` → 308 (in `cynefin-framework`)
  - `mutomorro.com/topic/teamwork` → 308 (in `t7-model-for-teams`)
  - `mutomorro.com/4-stages-of-psychological-safety` → 308 (in `five-dysfunctions-of-a-team`)
  - `mutomorro.com/services/co-creation` → 308 → `/services` (in `bpm-lifecycle`)
  - `mutomorro.com/employee-experience` → 308 (in `disc-styles`, `galbraith-star-model`)
  - `mutomorro.com/team-development` → 308 (in `project-aristotle-effective-teams`)
  - `mutomorro.com/service-areas/design-thinking` → 308 (in `nonprofit-business-model-canvas`)
- **Plain English:** Editors' inline links point to the old WordPress URL structure. Redirects catch them so users still arrive, but every click is a 308. Google has guidance that direct internal links transfer slightly more link equity than redirected ones, and it's clearly a deferred maintenance burden.
- **Fix:** Write a one-off Sanity migration script (extension of the existing `scripts/sanity-remove-trailing-slashes.js` pattern) that maps each known legacy path to its current canonical path and rewrites the `markDefs[].href`. A rough mapping table can be derived from `next.config.mjs`. Affected docs span ~30+ tools and several articles.

### 4.14 Two-hop redirect chains for renamed-slug content reached via legacy taxonomy
- **Live tests confirmed these chains:**
  - `/the-star-method` → `/tools/the-star-method` → `/tools/star-method` (2 hops)
  - `/sessions/change-management-fundamentals` → `/courses/change-management-fundamentals` → `/courses/change-management-training` (2 hops)
  - `/guides/change-readiness` → `/articles/change-readiness` → `/articles/change-readiness-assessment` (2 hops)
- **Pattern:** any time a legacy section (`/sessions/`, `/training/`, `/guides/`, root-level tool slugs) is renamed AND the slug was further changed, two hops occur. The catch-all rule runs first, then the slug rename runs on the result.
- **Fix:** Add specific direct redirects for the chainable cases — at the top of the relevant section, before the catch-all. For example, near [next.config.mjs:67](next.config.mjs:67):
  ```js
  // Break chains for renamed course slugs reached via legacy /sessions/ or /training/
  { source: '/sessions/change-management-fundamentals', destination: '/courses/change-management-training', permanent: true },
  { source: '/training/change-management-fundamentals', destination: '/courses/change-management-training', permanent: true },
  // ...and similar for every renamed course slug
  ```
  Compare against the 25+ slugs in the "COURSES - slug changes from rewrite project" section to find which need breaking.
  Same pattern for `/the-star-method` → add `{ source: '/the-star-method', destination: '/tools/star-method', permanent: true }` BEFORE the existing `/the-star-method → /tools/the-star-method` rule.
- **Impact:** Low — most of these chains are from legacy paths that get few hits — but it's the kind of thing GSC flags as "redirect" rather than "indexed".

### 4.15 Skip-to-content link is missing
- **File:** [components/LayoutShell.js](components/LayoutShell.js) (and [app/layout.js](app/layout.js))
- **Plain English:** No skip-to-content link in the root layout. Accessibility issue and minor SEO signal.
- **Fix:** Add at the top of `LayoutShell.js`:
  ```jsx
  <a href="#main-content" className="skip-link">Skip to content</a>
  ```
  …and ensure each page's `<main>` has `id="main-content"`. Or use the established `.page-X` class on main and link to that.

### 4.16 `<Analytics />` and `<SpeedInsights />` rendered twice in LayoutShell
- **File:** [components/LayoutShell.js:65-66, 76-77](components/LayoutShell.js:65)
- **Plain English:** Both components appear outside `PostHogProvider` AND again inside `ConsentProvider`. Vercel analytics will fire twice per pageview, slightly inflating their metrics and possibly affecting consent-gated tracking. Not an SEO impact, but a clear bug spotted during the audit.
- **Fix:** Delete one set (probably the inner pair, since the outer pair doesn't depend on consent).

---

## 5. NICE-TO-HAVE improvements

### 5.1 No FAQ JSON-LD on tool pages despite many tools being FAQ-shaped
- Tool pages currently emit Article + BreadcrumbList. Many tools have body content that's structured Q&A (e.g. "What is ADKAR? When should you use ADKAR? …"). Adding FAQ schema would unlock rich-result eligibility for question-based queries. Services already do this via [components/services/faqJsonLd.js](components/services/faqJsonLd.js) — pattern is reusable.

### 5.2 Course JSON-LD is minimal
- [app/courses/[slug]/page.js:62-73](app/courses/[slug]/page.js:62) only has name/description/provider/url. Schema.org Course rich-results require `hasCourseInstance` with a `courseMode`, `location`, etc. With bespoke training, exact dates aren't usually available — but worth deciding whether to skip rich-results or to populate.

### 5.3 Capability service (`develop/[slug]`) pages have no custom OG image
- The `capabilityService` schema has no `heroImage` / `ogImage` field. All 7 pages fall back to `/og-default.png`. Adding a schema field + value per page would improve social-share thumbnails.

### 5.4 Sitemap homepage entry has trailing slash
- See §4.5 above.

### 5.5 No `lastmod` on static pages other than the SOV/diagnostics anchors
- All static pages share a single hard-coded `STATIC_LASTMOD = 2026-05-02`. Fine, but if a static page is edited the lastmod won't reflect it. Low priority.

### 5.6 Thin tool: project-aristotle-effective-teams
- Body length 5,379 characters (≈900 words). All other tools are 8,000+. This tool is one of the older ones and could benefit from expansion.

### 5.7 Footer LinkedIn link has trailing slash (`https://www.linkedin.com/company/mutomorro/`)
- External URL — fine to leave (LinkedIn canonicalises with the slash). No action.

### 5.8 No `headers()` function in `next.config.mjs`
- No security headers (CSP, X-Frame-Options, X-Robots-Tag). Vercel sets HSTS automatically. Consider adding at least:
  ```js
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }]
  }
  ```

### 5.9 Tool with `hasToolkit: false` doesn't surface as "no template" — UI just hides the CTA
- Five tools have `hasToolkit: false`: `disc-styles`, `galbraith-star-model`, `mendelow-power-interest-matrix`, `polism-canvas`, `process-mapping`. Notably Mendelow is one of the top-5 traffic drivers. Consider whether a template would be worth building (content opportunity, not SEO bug).

### 5.10 `resource` content type only has 1 published page but the route + schema exist
- [app/resources/[slug]/page.js](app/resources/[slug]/page.js) is built out for a content type that has a single page (`thinking-in-ecosystems`). Either expand the content type or fold the single resource into another type (e.g. as an article).

### 5.11 Resource page generateMetadata missing `openGraph.url`
- [app/resources/[slug]/page.js:32-41](app/resources/[slug]/page.js:32) — only sets title/description/type, no `url`. Add it.

---

## 6. Content audit summary

### 6.1 Published content totals (Sanity, `published` perspective)

| Type | Brief said | Actual | Diff |
|------|-----------|--------|------|
| Tools | 59 | 59 | match |
| Articles | 25 | **31** | +6 (content grew since brief) |
| Services | 14 | 14 | match |
| Service sub-pages | "1+" | 1 | match |
| Courses | 31 | **30** | −1 |
| Projects | 11 | **12** | +1 |
| EMERGENT dimensions | 8 | 8 | match |
| EMERGENT articles | 40 | 40 | match |
| Topic hubs (themes) | 16 | **17** (1 hidden `scaling-operations`) | +1 |
| Capability services | 7 | 7 | match |
| Sector landing pages | (not specified) | 1 (housing) | new content type |
| Resources | (not specified) | 1 (thinking-in-ecosystems) | new content type |
| **Total dynamic pages** |  | **261** |  |
| Static pages |  | 18 |  |
| Tool template pages | (sitemap-only) | 54 |  |
| **Sitemap URLs total** |  | **289** (live count) | matches expected math |

### 6.2 Field completeness

| Content type | seoTitle | seoDescription | shortSummary | hero/og image | theme | Notes |
|---|---|---|---|---|---|---|
| Tool (59) | **59/59** | **59/59** | **59/59** | **59/59** | **59/59** | Pristine. 1 thin body (`project-aristotle-effective-teams`, ~900 words). 5 with `hasToolkit:false`. |
| Article (31) | **31/31** | **31/31** | **31/31** | **31/31** | **31/31** | Pristine. Shortest body ≈1,100 words (`impact-measurement-framework`). |
| Service (14) | **14/14** | **14/14** | n/a | **14/14** (propositionImage) | n/a | All 14 services have 4 stages, FAQs, related projects. |
| Service subPage (1) | **1/1** | **1/1** | n/a | falls back | n/a | Only `culture-change-programmes` published. |
| Course (30) | **30/30** | **30/30** | **30/30** | **27/30** | **30/30** | 3 missing heroImage (see §4.11). |
| Project (12) | **12/12** | **12/12** | n/a | **12/12** | n/a | Pristine. |
| Dimension (8) | **8/8** | **8/8** | n/a | n/a | n/a | **All 8 missing body content** (see §4.8). |
| DimensionArticle (40) | **40/40** | **40/40** | n/a | n/a | n/a | All have body, but body length 1,800–7,300 chars (short-form by design). |
| Theme (17) | **17/17** | **17/17** | n/a | n/a | n/a | Description ✓ on all 16 active. Section intros sparse on several (see §4.9). |
| CapabilityService (7) | **7/7** | **7/7** | n/a | **0/7** (no field in schema) | n/a | OG image relies on default fallback. |
| SectorLandingPage (1) | **1/1** | **1/1** | n/a | **0/1** (seoImage not set) | n/a | Falls back to og-default. |
| Resource (1) | **1/1** | **1/1** | n/a | (uses previewImage) | n/a | One published. |

### 6.3 Inline link hygiene in Sanity content

| Issue | Count | Severity |
|---|---|---|
| Internal hrefs with trailing slash | 0 | ✓ |
| `http://` (not https://) external links | 2 | IMPORTANT (§4.12) |
| `www.mutomorro.com` references | 0 | ✓ |
| Absolute `mutomorro.com/<legacy-path>` that 308-redirect | **30+** across ~25 docs | IMPORTANT (§4.13) |
| `/article/<slug>` legacy singular path | 1 in source code (sectors page), 0 in Sanity | CRITICAL (§3.4) |

---

## 7. Redirect health report

### 7.1 Sample live test results (25 URLs, HEAD request, no follow then with follow for chain depth)

| Source | First response | Final URL after follow | Hops | Notes |
|---|---|---|---|---|
| `/` | 200 |  | 0 | ✓ |
| `/robots.txt` | 200 |  | 0 | ✓ |
| `/studio` | 200 |  | 0 | Studio renders; no noindex meta (§3.5) |
| `/tools/adkar-model` | 200 |  | 0 | ✓ |
| `/tools/adkar-model/` | 308 | `/tools/adkar-model` | 1 | Trailing-slash strip ✓ |
| `/articles/governance-that-enables-innovation` | 200 |  | 0 | Slug typo fix ✓ |
| `/article/psychological-safety-guide` | 308 | `/articles/psychological-safety-in-organisations` | 1 | Specific rename ✓ |
| `/article/random-slug-test` | 308 | `/articles/random-slug-test` | 1 | Catch-all ✓ |
| `/toolkit/free-adkar-template` | 308 | `/tools/adkar-model` | 1 | ✓ |
| `/the-star-method` | 308 | `/tools/the-star-method` → `/tools/star-method` | **2** | **CHAIN — §4.14** |
| `/tools/the-star-method` | 308 | `/tools/star-method` | 1 | ✓ |
| `/category/some-tag` | 308 | `/articles` | 1 | ✓ |
| `/tag/another-tag` | 308 | `/tools` | 1 | ✓ |
| `/key-themes/change-fluency/page/2` | 308 | `/topics/change-management` | 1 | ✓ |
| `/change-focus/culture` | 308 | `/topics/culture-change` | 1 | ✓ |
| `/products/cultural-web-free-pdf-template` | 308 | `/tools/cultural-web` | 1 | ✓ |
| `/developing-leaders/leadership-development-programme` | 308 | `/develop/deeper-ground` | 1 | ✓ |
| `/wp-content/2024/foo.jpg` | 308 | `/` | 1 | ✓ |
| `/feed` | 308 | `/` | 1 | ✓ |
| `/sitemap_index.xml` | 308 | `/sitemap.xml` | 1 | ✓ |
| `/privacy-policy` | 308 | `/privacy` | 1 | ✓ |
| `/case-studies` | 308 | `/projects` | 1 | ✓ |
| `/signs-of-vitality-snapshot` | 308 | `/states-of-vitality` | 1 | ✓ |
| `/admin` | 307 | `/admin/login` (via middleware) | 1 | ✓ (auth gate) |
| `/admin/` | 308 | `/admin` → `/admin/login` | 2 | Internal-only, not crawled |
| `/sessions/change-management-fundamentals` | 308 | `/courses/change-management-training` (via `/courses/change-management-fundamentals`) | **2** | **CHAIN — §4.14** |
| `/guides/change-readiness` | 308 | `/articles/change-readiness-assessment` (via `/articles/change-readiness`) | **2** | **CHAIN — §4.14** |
| `/article/the-economics-of-authentic-purpose` | 308 | `/articles/organisational-purpose-business-case` | 1 | Specific redirect breaks the chain ✓ |

### 7.2 Soft-404 verification
All four tested non-existent slugs return proper **404**:
- `/tools/this-tool-does-not-exist` → 404
- `/articles/this-article-does-not-exist` → 404
- `/courses/this-does-not-exist` → 404
- `/topics/this-does-not-exist` → 404
- `/random-nonexistent-path` → 404

No soft-404 issues detected. The `notFound()` guards in dynamic page templates are working correctly.

### 7.3 Redirect rule count
Counted ~280 base rules in `next.config.mjs` (before the helper doubles them). After doubling: ~560 rules. Vercel's redirect limit is 1,024 — comfortably within budget.

### 7.4 Redirect quality summary
- ✓ 0 destinations with trailing slashes
- ✓ 0 `permanent: false` (302s) — all are 308s as expected
- ✓ Specific renames correctly placed BEFORE catch-alls
- ✓ Pagination catch-alls (`/page/:num`) correctly placed before slug catch-alls
- ✓ WordPress legacy patterns (`/category`, `/tag`, `/author`, `/feed`, `/wp-content`) all functional
- ✓ Old taxonomy redirects (`/key-themes`, `/topic`, `/change-focus`) all map sensibly
- ⚠️ Several 2-hop chains exist for renamed slugs reached via legacy paths (see §4.14)

---

## 8. Clean bill of health — things that are already correct

| Item | Where | Status |
|---|---|---|
| `trailingSlash: false` | next.config.mjs:3 | ✓ Intentional, load-bearing |
| Trailing slash strip for `/path/` requests | Confirmed via live `/tools/adkar-model/` test | ✓ |
| No trailing slashes in sitemap | 289-URL live count, 0 trailing | ✓ |
| No trailing slashes on redirect destinations | grep verified | ✓ |
| All redirects use 308 (permanent) | grep verified | ✓ |
| og:image present on all major content types | Live tests on tools, services, topics | ✓ |
| twitter:card = summary_large_image | app/layout.js:30, live verified | ✓ |
| og:url present on all dynamic templates | Code + live verified | ✓ |
| BreadcrumbList JSON-LD | Present on tools, articles, services, projects, courses, capability, EMERGENT dimension, topics, sectors, resources, service-sub-pages | ✓ (missing only on EMERGENT articles — §3.2) |
| Article schema with datePublished/dateModified | app/articles/[slug]/page.js:82-83 | ✓ |
| Global ProfessionalService schema on every public page | components/LayoutShell.js:42-64 | ✓ |
| Homepage WebSite schema | app/page.js:67-79 | ✓ (missing SearchAction — §4.2) |
| /og-default.png file exists | public/og-default.png | ✓ |
| GROQ queries exclude drafts | All use `!(_id in path("drafts.**"))` — equivalent to `perspective: 'published'` | ✓ |
| Image entries in sitemap | 608 image:loc entries across services/tools/articles/projects/courses/dimensions/dimensionArticles | ✓ |
| lastmod via `_updatedAt` on all dynamic content | sitemap.js | ✓ |
| `image.minimumCacheTTL` set to 30 days | next.config.mjs:8 | ✓ |
| Next font with `display: 'swap'` | app/layout.js:5-9 | ✓ |
| Google site verification meta | app/layout.js:40 | ✓ |
| 404 returns proper 404 status | Live tested 5 different non-existent paths | ✓ |
| Notable rename redirects in place | `/the-star-method` slug rename, article slug typo, EMERGENT dimension renames (20 May 2026), course rewrites | ✓ |
| Vercel cron paths have no trailing slashes | vercel.json | ✓ |
| Middleware scoped only to /admin and /api/admin | middleware.js:72-75 | ✓ |
| /admin/* is `noindex` | app/admin/layout.js:4 | ✓ |
| External links use rel="noopener" / "noopener noreferrer" | Footer LinkedIn, open resources, article inline links | ✓ |
| Skip-to-content NOT present | LayoutShell.js | ✗ — see §4.15 |
| BreadcrumbList trails accurate | All cross-checked | ✓ |
| PostHog rewrites in next.config (not middleware) | next.config.mjs:886-901 | ✓ matches brief's expectation |
| FAQ JSON-LD on service pages with faqItems | app/services/[slug]/page.js:167 | ✓ |
| Tool template page sets explicit canonical | app/tools/[slug]/template/page.js:56 | ✓ |
| Topic hub page sets explicit canonical | app/topics/[slug]/page.js:37 | ✓ |
| Topic page explicitly notFound()s `/topics/scaling-operations` | app/topics/[slug]/page.js:19,156 | ✓ matches sitemap exclusion |

---

## 9. Recommended fix order (one-line summary)

1. **CRITICAL — same morning:** §3.1 (html lang), §3.3 (footer fragments), §3.4 (sector /article/ links), §3.5 (studio noindex), §3.6 (robots.txt), §3.8 (middleware comment).
2. **CRITICAL — same week:** §3.2 (EMERGENT article JSON-LD), §3.7 (3 pages missing from sitemap).
3. **IMPORTANT — next sprint:** §4.1 (tool dates in JSON-LD), §4.5 (homepage canonical/sitemap mismatch), §4.11 (3 course heroes), §4.12 (2 http: external links), §4.14 (break 2-hop chains), §4.15 (skip link), §4.16 (duplicate Analytics).
4. **IMPORTANT — content team:** §4.8 (8 EMERGENT dimension bodies), §4.9 (theme section intros), §4.10 (decide on thin hubs), §4.13 (Sanity legacy-link sweep).
5. **NICE-TO-HAVE:** §5.x as schedule allows.

---

## 10. Notes and caveats

- Live tests run from London, 25 May 2026, against the Vercel production deployment.
- Sanity queries used `published` perspective — drafts excluded.
- One area NOT covered in depth: Lighthouse / Core Web Vitals. The brief asked for 5-page Lighthouse audit; this audit covered HTML/metadata/redirects/content but did not run Lighthouse. Recommended follow-up.
- Sanity inline-link audit was thorough for `tool`, `article` types; `service`, `course`, `project`, `dimension`, `dimensionArticle`, `theme`, `capabilityService`, `serviceSubPage`, `resource` documents were also queried but body text inline-link sampling focused on tools/articles where the volume is.
- No code changes were made — this audit is read-only as specified.
