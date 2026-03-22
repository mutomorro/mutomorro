# SEO Audit Results

**Date:** 22 March 2026, GMT
**Scope:** All ~208 pages across mutomorro.com
**Method:** Codebase analysis of every page.js template + GROQ queries against Sanity production dataset

---

## Summary

- **24 page templates** audited
- **12 templates** have metadata (static or generateMetadata) - some with gaps
- **12 templates** have **no metadata at all** - falling back to generic "Mutomorro / Organisational development consultancy"
- **196 Sanity documents** audited across 9 content types
- **73 documents** have fully populated SEO fields
- **123 documents** have missing or placeholder SEO fields
- **No robots.txt** exists
- **Sitemap** exists and is comprehensive (missing service subpages only)
- **No structured data / JSON-LD** on any page
- **No canonical URL overrides** set

---

## Part 1: Template Metadata Audit

### Root Layout (app/layout.js)

Site-wide fallback metadata:
- `title`: "Mutomorro"
- `description`: "Organisational development consultancy"
- `verification.google`: Present (Google Search Console verified)

This is what every page without its own metadata shows in search results.

### One-Off Pages

| Page | File | Metadata? | Type | Fields | Source |
|------|------|-----------|------|--------|--------|
| Homepage | app/page.js | **MISSING** | - | - | Falls back to layout |
| About | app/about/page.js | **MISSING** | - | - | Falls back to layout |
| Contact | app/contact/page.js | Yes | Static | title, description | Hardcoded |
| How We Work | app/how-we-work/page.js | Yes | Static | title, description | Hardcoded |
| Philosophy | app/philosophy/page.js | Yes | Static | title, description | Hardcoded |
| Privacy | app/privacy/page.js | Yes | Static | title, description | Hardcoded |
| States of Vitality | app/states-of-vitality/page.js | Yes | Static | title, description, openGraph | Hardcoded |

### Index/Listing Pages

| Page | File | Metadata? | Type | Fields | Source |
|------|------|-----------|------|--------|--------|
| Services index | app/services/page.js | **MISSING** | - | - | Falls back to layout |
| Articles index | app/articles/page.js | **MISSING** | - | - | Falls back to layout |
| Tools index | app/tools/page.js | **MISSING** | - | - | Falls back to layout |
| Projects index | app/projects/page.js | **MISSING** | - | - | Falls back to layout |
| Courses index | app/courses/page.js | **MISSING** | - | - | Falls back to layout |
| EMERGENT overview | app/emergent-framework/page.js | Yes | Static | title, description | Hardcoded |
| Develop index | app/develop/page.js | Yes | Static | title, description | Hardcoded |

### Dynamic/Template Pages (Sanity-driven)

| Page | File | Metadata? | Fields | Sanity Fields Used | Fallback |
|------|------|-----------|--------|--------------------|----------|
| Services (14) | app/services/[slug]/page.js | Yes - generateMetadata | title, description | seoTitle, seoDescription | heroHeading, heroTagline |
| Service subpages (1) | app/services/[slug]/[subpage]/page.js | Yes - generateMetadata | title, description | seoTitle, seoDescription | heroHeading, heroTagline |
| Articles (25) | app/articles/[slug]/page.js | **MISSING** | - | - | Falls back to layout |
| Tools (59) | app/tools/[slug]/page.js | Yes - generateMetadata | title, description | seoTitle, seoDescription | title, shortSummary |
| Projects (11) | app/projects/[slug]/page.js | **MISSING** | - | - | Falls back to layout |
| Courses (31) | app/courses/[slug]/page.js | **MISSING** | - | - | Falls back to layout |
| Dimensions (8) | app/emergent-framework/[dimension]/page.js | Yes - generateMetadata | title, description | shortSummary (not seoTitle) | Hardcoded pattern |
| Dimension articles (40) | app/emergent-framework/[dimension]/[article]/page.js | Yes - generateMetadata | title, description | shortSummary (not seoTitle) | Hardcoded pattern |
| Capabilities (7) | app/develop/[slug]/page.js | Yes - generateMetadata | title, description | seoTitle, seoDescription | heroHeading, heroTagline |

### What's Missing from Templates That Have Metadata

Even templates with generateMetadata are missing:
- **openGraph** fields (image, url, type) - only States of Vitality has these
- **twitter** card fields
- **canonical** URL overrides
- **robots** directives (for any pages that should be noindexed)

---

## Part 2: Sanity Content SEO Fields

### Schema Field Availability

| Content Type | Schema File | seoTitle field? | seoDescription field? | seoImage field? |
|---|---|---|---|---|
| service | sanity/schemas/service.js | Yes | Yes | Yes |
| serviceSubPage | sanity/schemas/serviceSubPage.js | Yes | Yes | No |
| article | sanity/schemas/article.js | Yes | Yes | No |
| tool | sanity/schemas/tool.js | Yes | Yes | No |
| project | sanity/schemas/project.js | Yes | Yes | No |
| course | sanity/schemas/course.js | Yes | Yes | No |
| capabilityService | sanity/schemas/capabilityService.js | Yes | Yes | No |
| **dimension** | sanity/schemas/dimension.js | **No** | **No** | **No** |
| **dimensionArticle** | sanity/schemas/dimensionArticle.js | **No** | **No** | **No** |

**Gap:** dimension and dimensionArticle schemas need seoTitle and seoDescription fields added.

### Content Population Status

#### Services (14 total) - FULLY POPULATED

All 14 services have both seoTitle and seoDescription populated. No action needed.

#### Service Subpages (1 total) - FULLY POPULATED

The 1 service subpage (Culture Change Programmes) has both fields. No action needed.

#### Capability Services (7 total) - FULLY POPULATED

All 7 capability services have both fields. No action needed.

#### Projects / Case Studies (11 total) - FULLY POPULATED

All 11 projects have both fields. No action needed.

#### Courses (31 total) - 1 MISSING

| Field | Populated | Missing |
|---|---|---|
| seoTitle | 30/31 | 1 |
| seoDescription | 30/31 | 1 |

**Missing both fields:**
- "Leading your team through change"

#### Tools (59 total) - SIGNIFICANT GAPS

| Field | Populated | Issue |
|---|---|---|
| seoTitle | 18/59 with content (all WordPress placeholders) | 41 completely empty, 18 contain Yoast SEO placeholder strings |
| seoDescription | 59/59 | All populated |

**seoTitle issue:** The 18 "populated" seoTitles contain WordPress Yoast SEO placeholder syntax like:
- `%title%: Guide for Nonprofits %page% %sep% %sitename%`
- `%title% %sep% %sitename%`

These render as literal text, not resolved values. They need replacing with proper titles.

**All 59 tools effectively need seoTitle written.** The seoDescriptions are all populated and usable.

#### Articles (25 total) - MAJOR GAP

| Field | Populated | Missing |
|---|---|---|
| seoTitle | 5/25 | 20 |
| seoDescription | 5/25 | 20 |

**5 articles WITH SEO fields:**
- These are likely the most recently created/edited articles

**20 articles WITHOUT any SEO fields** (both seoTitle and seoDescription empty):
- These need both fields written from scratch
- **Note:** The articles template (app/articles/[slug]/page.js) doesn't even have generateMetadata, so even populated fields wouldn't be used until the template is fixed.

#### Dimensions (8 total) - NO SEO FIELDS IN SCHEMA

The dimension schema does not include seoTitle or seoDescription fields. The template uses `shortSummary` as a description fallback and constructs a pattern-based title.

All 8 dimensions need SEO fields added to the schema, then populated.

#### Dimension Articles (40 total) - NO SEO FIELDS IN SCHEMA

Same as dimensions. The schema needs seoTitle and seoDescription fields. The template uses `shortSummary` as fallback.

All 40 dimension articles need SEO fields added to the schema, then populated.

### Content Population Summary

| Content Type | Total | seoTitle OK | seoTitle Missing/Bad | seoDescription OK | seoDescription Missing |
|---|---|---|---|---|---|
| service | 14 | 14 | 0 | 14 | 0 |
| serviceSubPage | 1 | 1 | 0 | 1 | 0 |
| capabilityService | 7 | 7 | 0 | 7 | 0 |
| project | 11 | 11 | 0 | 11 | 0 |
| course | 31 | 30 | **1** | 30 | **1** |
| tool | 59 | 0 | **59** (18 placeholders + 41 empty) | 59 | 0 |
| article | 25 | 5 | **20** | 5 | **20** |
| dimension | 8 | - | **8** (no schema field) | - | **8** (no schema field) |
| dimensionArticle | 40 | - | **40** (no schema field) | - | **40** (no schema field) |
| **TOTAL** | **196** | **68** | **128** | **127** | **69** |

---

## Part 3: Other SEO Essentials

### 1. robots.txt - MISSING

No `public/robots.txt` file exists. Search engines will crawl everything by default, but best practice is to have an explicit robots.txt that:
- Allows all crawlers
- Points to the sitemap at `https://mutomorro.com/sitemap.xml`
- Blocks any paths that shouldn't be indexed (e.g., /api/ routes)

### 2. Sitemap - GOOD

`app/sitemap.js` exists and is well-implemented:
- 14 static pages with appropriate priority and changeFrequency
- 8 dynamic content types fetched from Sanity
- lastModified timestamps from `_updatedAt`
- Base URL correctly set to `https://mutomorro.com`

**One gap:** Service subpages (app/services/[slug]/[subpage]) are not included in the sitemap. Currently only 1 exists (Culture Change Programmes) but more may be added.

### 3. Canonical URLs - NONE SET

No templates set explicit canonical URLs. Next.js generates them automatically via the metadata API when alternates.canonical is set, but this isn't being used. For a single-domain site without syndicated content, this is low priority but still good practice.

### 4. Structured Data / JSON-LD - NOT IMPLEMENTED

No structured data markup exists anywhere in the codebase. No `application/ld+json` scripts, no schema.org references. This is a significant gap for:
- **Organization schema** (homepage) - company name, logo, contact, social profiles
- **Service schema** (service pages) - what services are offered
- **Article/BlogPosting schema** (articles) - authorship, publish date, category
- **Course schema** (courses) - course details, provider
- **BreadcrumbList schema** (all pages with breadcrumbs) - structured navigation
- **FAQPage schema** (if applicable)

### 5. Image Alt Text - PARTIAL

**Template handling:**
- `app/tools/[slug]/page.js`: Uses `alt={tool.title || ''}` - functional but not ideal (title != description of image)
- `app/articles/[slug]/page.js`: Uses `alt={value.alt || ''}` for inline images via PortableText - correctly reads Sanity alt field
- `app/services/[slug]/page.js`: Hero images handled via ServiceHero component - needs verification

**Sanity schema side:**
- Sanity's native image type includes an alt text field by default
- Whether editors have populated alt text on images is not auditable without querying every image field across every document
- PortableText inline images read `value.alt`, so they depend on editor input

**Risk:** Empty alt attributes (`alt=""`) tell screen readers to skip the image entirely. If images are meaningful content, they need descriptive alt text.

---

## Recommendations

### Priority 1 - Critical (do now)

These pages are live and showing generic metadata in search results.

1. **Add generateMetadata to articles template** (`app/articles/[slug]/page.js`)
   - This affects 25 live article pages showing as "Mutomorro" in search results
   - Pattern: match services template, pull seoTitle/seoDescription with title/shortSummary fallback

2. **Add generateMetadata to projects template** (`app/projects/[slug]/page.js`)
   - 11 case study pages with no metadata
   - SEO fields are already populated in Sanity - just need the template to read them

3. **Add generateMetadata to courses template** (`app/courses/[slug]/page.js`)
   - 31 course pages with no metadata
   - SEO fields are already populated in Sanity (30/31)

4. **Add static metadata to homepage** (`app/page.js`)
   - The most important page on the site has generic metadata

5. **Add static metadata to about page** (`app/about/page.js`)
   - Key landing page with no metadata

6. **Add static metadata to all 5 index pages** (services, articles, tools, projects, courses)
   - These are navigation/discovery pages that will appear in search results

### Priority 2 - Important (this week)

7. **Create robots.txt** at `public/robots.txt`
   - Allow all, reference sitemap, block /api/ routes

8. **Clean up 59 tool seoTitles** in Sanity
   - Replace 18 WordPress Yoast placeholders with proper titles
   - Write titles for the remaining 41

9. **Write SEO fields for 20 articles** in Sanity
   - Both seoTitle and seoDescription needed

10. **Add seoTitle/seoDescription fields to dimension and dimensionArticle schemas**
    - Then populate for all 48 documents

11. **Write missing course SEO fields** (1 document: "Leading your team through change")

### Priority 3 - Valuable (this month)

12. **Add openGraph metadata** to all generateMetadata functions
    - At minimum: og:title, og:description, og:image, og:url, og:type
    - seoImage field already exists on service schema - add to others

13. **Add service subpages to sitemap** (`app/sitemap.js`)

14. **Implement JSON-LD structured data**
    - Organization schema on homepage
    - Article schema on article pages
    - Course schema on course pages
    - BreadcrumbList schema site-wide

15. **Audit image alt text** across Sanity content
    - Query all image fields for populated alt text
    - Establish editorial guidelines for alt text

### Priority 4 - Nice to have

16. **Add canonical URL support** via alternates.canonical in metadata
17. **Add twitter card metadata** to key pages
18. **Consider robots meta for low-value pages** (e.g., noindex on paginated results if added later)

---

## Appendix: Page Count by Metadata Status

| Status | Pages | % of Site |
|---|---|---|
| generateMetadata pulling from Sanity | ~130 (services, tools, capabilities, dimensions, dimension articles) | 63% |
| Static metadata (hardcoded) | 7 (contact, how-we-work, philosophy, privacy, states-of-vitality, emergent overview, develop index) | 3% |
| **No metadata at all** | **~71 (homepage, about, 5 index pages, 25 articles, 11 projects, 31 courses)** | **34%** |

**Bottom line:** A third of the site's pages are showing generic "Mutomorro / Organisational development consultancy" in search results. The template fixes (Priority 1) would immediately improve ~67 pages, and the Sanity content work (Priority 2) would cover the remaining gaps.
