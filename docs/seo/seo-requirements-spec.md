# Mutomorro SEO requirements & best-practice spec

**Living document — the definition-of-done for SEO across the estate.** Every item is a checkable statement; the delta re-audit verifies the code + live site against it.

**Consolidates:** `docs/seo-audit-25-may-2026.md` (top-to-toe audit) + `docs/seo-metadata-audit/phase-1-diagnostic.md` (metadata flow) + `docs/seo/trailing-slash-audit-*.md`, **plus the two dimensions those missed** — image-alt coverage (§E) and Core Web Vitals (§G).

Tags: **[auto]** should be machine-enforced (CI/schema-lint) · **[code]** code-level · **[content]** editorial/Sanity. References like `§4.4` point at the 25 May audit.

---

## A. Site-wide (layout / robots / sitemap)
- **A1 [code]** `metadataBase = https://mutomorro.com` set in `app/layout.js`
- **A2 [code]** `<html lang="en-GB">` (not `"en"`) — must match `og:locale = en_GB` · *§3.1 CRITICAL*
- **A3 [code]** Title template `%s | Mutomorro` + a default title
- **A4 [code]** Global default meta description
- **A5 [code]** Global OG defaults: `type`, `locale=en_GB`, `siteName`, default image (`/og-default.png` exists)
- **A6 [code]** Global `twitter:card = summary_large_image`
- **A7 [code]** Default `robots: index, follow`; Google site-verification meta present
- **A8 [code]** `robots.txt`: `Allow: /`; `Disallow: /studio`, `/admin`, `/api`; `Sitemap:` reference. **Do NOT block `/_next/static`** (harms rendering — see §3.6 correction)
- **A9 [code]** Global `Organization`/`ProfessionalService` JSON-LD on every public page (LayoutShell)
- **A10 [code]** Homepage `WebSite` JSON-LD (SearchAction optional)
- **A11 [code]** Skip-to-content link present + `<main id>` target · *§4.15*
- **A12 [code]** No duplicate `<Analytics>`/`<SpeedInsights>` · *§4.16*

## B. Per-page head metadata (every public route)
- **B1 [code]** Unique `<title>`, ~50–60 chars, `seoTitle → title/heroHeading` fallback, template applied once (no doubled `| Mutomorro`)
- **B2 [code]** Unique meta description, ~120–160 chars, `seoDescription → shortSummary/heroTagline` fallback
- **B3 [code]** Explicit absolute self-canonical, no trailing slash, matching sitemap form. *Don't rely on the implicit root `'./'` — it works today but is fragile · §4.4*
- **B4 [code]** OG `title`, `description`, `url` (absolute), `image` (1200×630), `type`; article-likes add `publishedTime`/`modifiedTime`
- **B5 [code]** Twitter derives from OG (card global; title/desc/image inherited)
- **B6 [code]** Utility routes (`/admin/*`, `/studio`, `/confirm`, `/enquiry`, `/unsubscribed`, `/api/*`) = `noindex` · *§3.5*

## C. Structured data (JSON-LD)
- **C1 [code]** Correct primary type per page (Article / Course / Service / tool CreativeWork…)
- **C2 [code]** `BreadcrumbList` on every content page — **incl. EMERGENT articles** · *§3.2 CRITICAL*
- **C3 [code]** `datePublished` + `dateModified` on Article, Course, **and Tool** · *§4.1*
- **C4 [content/code]** FAQ schema where body is Q&A-shaped (services have it; tools are candidates · §5.1)
- **C5 [code]** Valid schema.org (required props; passes Rich Results test)

## D. Semantic HTML & accessibility
- **D1 [code]** Exactly one keyword-bearing `<h1>` per page — resolve service & article rendering the small *kicker* as H1 · *§4.6 / §4.7*
- **D2 [code]** Logical heading hierarchy, no skipped levels
- **D3 [auto]** Every content/body image has descriptive `alt`; decorative images `alt=""`
- **D4 [code]** Descriptive link text; external links `rel="noopener"`

## E. Images — alt coverage (the blind-spot dimension)
- **E1 [auto]** Every image **field** in every routable schema has an `alt` subfield (or sibling alt) — **except** OG-only `seoImage` (meta image, takes no alt)
- **E2 [auto]** Every render (`hero` / named / body / `next/Image`) reads the alt field, with a sensible fallback
- **E3 [content]** Alt is populated and descriptive — backfill tool: `scripts/generate-image-alt.mjs` (review-first, AI-vision)
- **E4 [code]** A real OG image source per type — `capabilityService`/`develop` and `sectorLandingPage` currently fall back to default · *§5.3 / §6.2*
- **E5 [code]** `frameworkOverview` body images actually render (currently a bare `<PortableText>` drops them)

## F. Crawlability & URLs
- **F1 [code]** Sitemap includes **every** public route type — `serviceSubPage`, `sectorLandingPage`, `resource` were missing · *§3.7*; image entries + `lastmod` via `_updatedAt`
- **F2 [code]** `trailingSlash:false`; no trailing slashes in sitemap (decide homepage form · §4.5) or redirect destinations
- **F3 [code]** No internal links to redirecting/legacy paths (sector `/article/` · §3.4; footer `/services/#anchor` · §3.3); no >1-hop redirect chains · *§4.14*
- **F4 [content]** Sanity inline links use current canonical paths (legacy `mutomorro.com/<old>` 308s · §4.13); `https` not `http` · *§4.12*
- **F5 [code]** Genuine 404s (no soft-404s); `/studio` `noindex` · *§3.5*

## G. Performance / Core Web Vitals (deferred by the May audit — §10)
- **G1** LCP hero image has `priority` · **G2** font `display: 'swap'` · **G3** `width`/`height`/`sizes` set on images (no CLS) · **G4** run Lighthouse on 5 representative pages · **G5** image `minimumCacheTTL` set

## H. Per-type completeness matrix
The re-audit fills this for every routable type — **rows:** tool, article, course, service, serviceSubPage, project, dimension, dimensionArticle, frameworkOverview, capabilityService, theme, sectorLandingPage, resource. **Columns:** (1) SEO title/desc fields surfaced in a group · (2) explicit canonical · (3) OG image source · (4) JSON-LD primary type · (5) image alt fields + render wired · (6) H1 correct.

## I. Process / enforcement (so findings stop rotting)
- **I1** A shared `buildMetadata()` helper every route calls → kills the per-type `generateMetadata` drift (each type currently hand-rolls inline GROQ)
- **I2** Shared schema fragments: one SEO field-group + one image-with-alt object, spread into every type
- **I3** One automated check in CI/pre-deploy: fetch each route-type's HTML, assert §B/§C/§D/§E baseline; a schema-lint asserting §E1
- **I4** A findings tracker: every audit finding carries a status (open / fixed / verified) — a closed loop from finding to fix
