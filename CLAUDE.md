# CLAUDE.md - Mutomorro Project Reference

## Project Overview

Mutomorro is a UK organisational development consultancy. This is a full website rebuild from WordPress to Next.js, powered by Sanity CMS. The site is functional - all pages exist and content flows from Sanity. The current phase is **Phase 6 of the design system pass** - page-by-page polish, section transitions, background patterns, responsive, and visual refinement.

**Owner:** James Freeman-Gray (not a developer by background - works in VS Code)
**Repo:** github.com/mutomorro/mutomorro
**Local:** ~/Projects/mutomorro
**Staging:** mutomorro.vercel.app (password protected)

## Stack

- Next.js (app router)
- Sanity CMS (project ID: c6pg4t4h, dataset: production)
- Supabase (project ID: hzgnlxxnpvidnntiilcf, region: London eu-west-2)
- Vercel (auto-deploys on GitHub push)
- Resend (email)

## Working Principles

- Always write in **GB English** (colour not color, organisation not organization)
- Use dashes (-) not en/em dashes
- No consultancy or marketing language - write so a 10 year old could understand
- Use globals.css design system classes rather than inline styles wherever possible
- `await params` pattern for dynamic routes
- PortableText from @portabletext/react
- Relative imports (no lib folder - shared files in components/)
- James creates page files manually in VS Code - provide clear file paths
- When debugging, prefer complete file replacements over piecemeal patches
- After changes, run `rm -rf .next` if module-not-found errors persist

## Common Commands

```bash
cd ~/Projects/mutomorro && npm run dev          # Start dev server
cd ~/Projects/mutomorro && git add . && git commit -m "Description" && git push  # Deploy
npx sanity deploy                               # Redeploy Sanity Studio
```

## After Claude Code Desktop sessions

Claude Code Desktop works in a git worktree branch, not main. After it finishes:
1. Check: `git branch -a` for any claude/ branches
2. Merge: `git merge claude/[branch-name]`
3. If merge fails with "untracked files": delete the conflicting local files first, then merge
4. If merge fails with "local changes": run `git stash` first, then merge
5. Restart: `rm -rf .next && npm run dev`

Only trust localhost:3000 (your server). Claude Code's test server runs on random high ports.

---

# DESIGN SYSTEM REFERENCE

**IMPORTANT: Read `design-reference/design-system-showcase.html` first.** This single file contains the complete, approved design system as working code - every CSS variable, class, animation, card type, button, link style, marker highlight, scroll animation, background pattern, and form treatment. The descriptions below are a summary for quick reference; the showcase HTML is the source of truth **except where this document notes an override**.

All decisions below are **approved and final**. Apply them consistently. The design philosophy is: print-influenced, typographically-led, editorial restraint. "The Economist meets Monocle meets It's Nice That." Every element earns its place.

## Key Overrides (take priority over showcase file)

These values were updated after the showcase file was created:

- **Layout width:** 1350px (showcase uses 1100px)
- **Reading page width:** 800px for articles, tools, case studies
- **.heading-display:** `clamp(44px, 6vw, 72px)` (showcase uses clamp(52px, 7vw, 88px))
- **Hero padding:** 100px top, 120px bottom (showcase uses 80px)
- **H1 to lead-text gap:** 32px (showcase uses 24px)
- **Hero H1 max-width:** 900px. Lead-text max-width: 680px. No wrapping div.
- **Nav content:** constrained to 1350px with 48px padding (matches page content alignment)
- **Tailwind import:** `@import "tailwindcss" layer(tw)` - puts Tailwind in a named layer so design system CSS always wins

## Layout Widths

- Standard pages: max-width **1350px** (services, homepage, about, philosophy, how we work, contact, index pages, EMERGENT wiki, courses)
- Reading pages: max-width **800px** (articles, tools, case studies/projects)
- Padding: 0 48px desktop, 0 24px mobile
- Always margin: 0 auto
- Nav bar: background full-width, inner content 1350px with 48px padding

## Colours

| Name | Hex | Usage |
|------|-----|-------|
| White | #FFFFFF | Primary background |
| Warm | #FAF6F1 | Secondary background, nav panels |
| Dark | #221C2B | Dark sections, hero backgrounds |
| Accent purple | #9B51E0 | Buttons, links, highlights, patterns |
| Gradient start | #80388F | H1 gradient (left/start) |
| Gradient mid | #FF4279 | H1 gradient (middle) |
| Gradient end | #FFA200 | H1 gradient (right/end), kicker text on dark |
| Error | #FF4279 | Validation errors |

**Gradient direction:** Always cool to warm (purple to coral/orange). The eye lands on warmth.

**On dark backgrounds:**
- Body text: white at 85% opacity
- Kicker text: coral (#FFA200), not purple
- Inline links: lighter purple (#C9A4F0)
- Borders: rgba(255,255,255,0.1) or rgba(255,255,255,0.12)

## Typography

**Font:** Source Sans 3 only. Load: `Source+Sans+3:wght@300;400;600`

### Headings (weight 400, colour #000000)

| Level | Size | Line height | Letter spacing |
|-------|------|-------------|----------------|
| Display | **clamp(44px, 6vw, 72px)** | 1.02 | -0.03em |
| H1 | clamp(48px, 6vw, 80px) | 1.05 | -0.025em |
| H2 | clamp(36px, 4.5vw, 56px) | 1.1 | -0.02em |
| H3 | clamp(24px, 3vw, 34px) | 1.2 | - |
| H4 | clamp(20px, 2vw, 26px) | 1.25 | - |

- H1 and Display get the gradient treatment (background-clip: text)
- On dark: headings are white

### Body (weight 300, colour #000000)

| Style | Size | Line height |
|-------|------|-------------|
| Body | 18px | 1.75 |
| Body small (cards) | 16px | 1.75 |
| Lead paragraph | 22px, softer colour | 1.75 |

### Other text

| Style | Size | Weight | Details |
|-------|------|--------|---------|
| Kicker | 13px | 400 | Uppercase, letter-spacing 0.15em, purple on light, coral on dark |
| Caption | 13px | 400 | - |
| Pull quote | clamp(24px, 3vw, 36px) | 300 | Accent left border (purple on light, pink on dark) |
| Stats/numbers | clamp(48px, 5vw, 72px) | 300 | Gradient, black, or accent depending on context |

**Key rule:** Hierarchy comes from scale and weight contrast (400 headings vs 300 body), not colour.

## Hero Pattern (all pages except homepage)

Every page hero follows this exact structure:
```jsx
<section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
  <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
    <span className="kicker">PAGE LABEL</span>
    <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>...</h1>
    <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>...</p>
  </div>
</section>
```
No wrapping div around heading and lead text. They sit directly in the 1350px container and left-align with content below.

## Homepage

- Full-viewport hero (100vh, min-height 600px) with dark background and canvas animation
- Transparent nav overlay (white logo, white links, becomes solid on scroll)
- Reference: `design-reference/homepage-hero-v2.html`

## Logo

- SVG files in `/public/`: `logo-black.svg` and `logo-white.svg`
- Used via Next.js Image component in Nav.js
- Black version for standard nav, white version for transparent nav (homepage)
- Size: ~140-160px wide, auto height

## Navigation

### Nav bar
- Background full-width, content constrained to 1350px with 48px padding
- Logo left, links centre-left, buttons right
- Nav links use diagonal black fill hover animation
- Contact CTA: .btn-primary
- States of Vitality: .btn-sec
- Homepage: transparent nav with white logo and links, becomes solid on scroll

### Nav panels (hover-to-open on desktop, click on mobile)
- Open on hover with 250ms close delay (prevents flicker)
- Animation: slide down 600ms with 80ms staggered row reveals
- When switching between panels: previous closes instantly, new one animates in
- All panels: max-height calc(100vh - 70px) with overflow-y auto for small screens

### About panel
- Five full-width rows (book contents layout)
- Each row: .heading-h4 title (left ~40%), 18px description (middle ~45%), purple chevron (right)
- Bottom border separators, 28px vertical padding
- Hover: title shifts purple, chevron slides right, subtle background shift
- No kicker or intro text

### How We Help panel
- Four-column grid for service categories
- Category headings as .kicker (purple, uppercase)
- Service links: 16px, weight 400, black, bottom border separator, purple chevron
- Hover: text shifts purple, chevron slides right
- Building Capability section below divider with .kicker labels (FOR LEADERS / FOR TEAMS)
- 2rem column gap between all columns

### Explore panel
- Matches About/How We Help visual language
- Kicker section labels, 16px links with chevrons and separators

## Heading Highlights (Marker Pen)

Animated marker-pen highlight behind key words. Single colour (accent purple #9B51E0).

- **Subtle:** top 50% to bottom 95%, opacity 0.18. For H2 section headings.
- **Mid-weight:** top 25% to bottom 90%, opacity 0.22. For H1/hero headings.
- **On dark:** opacity bumped to 0.35 (subtle) or 0.4 (mid-weight)
- SVG feTurbulence + feDisplacementMap filter for organic rough edges
- Four different filter seeds so no two highlights look identical
- Slight random rotation (-1.25 to +1.25 degrees)
- clip-path: inset() animates from right to left for sweep-in
- One highlighted word/phrase per heading maximum
- Highlight the word that carries meaning, not a generic word
- SVG filters are in app/layout.js (3 seeds: rough1, rough2, rough3)

**Reference:** design-system-marker-v5.html

## Buttons

**Shape:** Sharp corners (border-radius: 0) everywhere. No rounded corners on anything.

### Primary Button
- Black (#000) background, white text
- Hover: diagonal purple (#9B51E0) wipe from left via clip-path: polygon()
- Padding: 16px 36px (md), 18px 44px (lg)
- Font: Source Sans 3, 400, 15px (md) / 16px (lg), letter-spacing 0.06em
- On dark: white background, dark text. Same diagonal purple wipe, text flips to white.

### Secondary Button
- No border, no background. Text only.
- Purple underline draws in from left on hover (transform: scaleX() on ::after)
- Padding: 16px 0 (flush with text)
- Same font specs as primary
- On dark: white text, same purple underline draw

**Rule:** No gradient on buttons. Single accent colour only. Gradient lives on H1 headings only.

**Reference:** design-system-button-system.html

## Cards

Three types. All sharp corners. All work with or without images.

### Card A - Corner Triangle (workhorse)
- Job: Services, application pages, general content
- Thin border (1px, rgba(0,0,0,0.12)), sharpens on hover
- Purple triangle top-right corner, grows on hover
- Footer: diagonal accent purple wipe (same as primary button)
- Arrow slides right on hover
- Images: 16:9, subtle zoom on hover (scale 1.04)

### Card C - Full Diagonal Fill (dramatic)
- Job: Featured content, case studies, high-impact
- Clean at rest - just border and content
- Hover: entire card fills black with diagonal wipe, text flips white, image fades to 30% opacity
- Featured variant: 2:1 image ratio, 28px title
- Use sparingly for impact

### Card D - Badge + Black Footer (categorised)
- Job: Dimensions, framework elements, articles, guides
- Purple badge top-left (over image if present)
- Footer wipes black (not purple) - inverts the button language
- Metadata line for dates, read times

**On dark:** White card backgrounds, border rgba(255,255,255,0.1)

**Reference:** design-system-cards-with-images.html

## Links

### Inline text links
- Accent purple, no underline at rest
- Underline draws in from left on hover via background-image (wraps multi-line)
- On dark: lighter purple (#C9A4F0)

### Anchor/sticky navigation
- 13px, weight 400, faded (rgba(0,0,0,0.4))
- Hover: full black
- Active: full black with 2px accent purple underline

### Breadcrumbs
- Slash separated
- Parents: rgba(0,0,0,0.35), hover to black
- Current page: accent purple
- On dark: parents rgba(255,255,255,0.35), current in accent

### Footer links
- 15px, weight 300, 75% white
- Purple underline draws in from left on hover
- Column titles: 13px, weight 400, uppercase, 40% white

## Section Transitions

### Hero transitions (signature moments)
- Dissolve network: scattered nodes and connections at section boundary
- 80px overlap each side (160px total zone)
- Accent purple (#9B51E0), max line opacity 0.3, max node opacity 0.4
- Canvas-drawn, z-index: 3

### Section transitions (between content sections)
- Flowing lines: fine sine waves crossing boundaries
- Light-to-light: accent purple at 3-4% opacity
- Dark transitions: #221C2B at 10-12% opacity
- Standard: 36 lines, zone 40px, amplitude 10
- Hero variant: 60 lines on light, 150 on dark, zone 55-60px, amplitude 12

**Reference:** design-system-network-tightness.html, design-system-flowing-transitions.html

## Scroll Animations

Three entrance types:

### Fade up (default)
- 24px rise, 0.7s, cubic-bezier(0.25, 0.46, 0.45, 0.94)
- For: heading stacks, body text, content blocks

### Staggered fade up (heading stacks)
- Same fade up but each element arrives separately
- 0.1s delay between elements

### Card stagger (grids)
- Left to right with 0.1s increments

**Technical:**
- ScrollObserver.js component in layout.js handles IntersectionObserver + MutationObserver
- Elements start opacity: 0 + transform, gain .visible class
- prefers-reduced-motion: reduce disables all animations

**Restraint rules:**
- Hero text is always static (heroes already have background animations)
- Never re-trigger on scroll back up
- Maximum 5 stagger steps
- No animation on nav, breadcrumbs, footer
- Body text animates as one block, not per paragraph

## Image Treatments

### Gallery mat (large/inline images)
- Warm (#FAF6F1) padding (24px), thin border (1px, rgba(0,0,0,0.06))
- On warm backgrounds: white padding instead

### Editorial offset frame (smaller/alongside images)
- Ghost border (1px, rgba(0,0,0,0.12)) positioned 8px offset behind/below
- Image gets subtle border (1px, rgba(0,0,0,0.08))

Both use sharp corners. No border-radius.

## Background Patterns

Three animated canvas patterns, all in accent purple (#9B51E0):

| Pattern | Class | Background |
|---------|-------|------------|
| Soft Network | bg-network | White (#FFFFFF) |
| Woven Threads | bg-woven | Warm (#FAF6F1) |
| Constellation | bg-constellation | Dark (#221C2B) |

- Use sparingly - not every section needs a pattern
- Respects prefers-reduced-motion (renders static frame)
- Seeded random for consistent rendering

## Forms

- Text inputs: sharp corners, thin border (1px, rgba(0,0,0,0.12))
- Focus: accent purple underline draws in from left along bottom edge
- Labels: kicker text treatment (13px, 400, uppercase, 0.15em spacing)
- Submit: primary button (black, diagonal purple wipe)
- On dark: border rgba(255,255,255,0.12), focus still accent purple
- Error border: #FF4279

## Feedback and Status

- Success: accent purple left border, confirmation text
- Error: #FF4279 left border, error text
- Loading: subtle opacity pulse, no spinners
- Toast: sharp corners, thin border, slides in from right

---

# PAGE INVENTORY

## Template pages (one file, many pages)
- `app/services/[slug]/page.js` - 14 service pages
- `app/emergent-framework/[dimension]/[section]/page.js` - 40 dimension articles
- `app/article/[slug]/page.js` - 25 articles
- `app/tools/[slug]/page.js` - 59 tools
- `app/projects/[slug]/page.js` - 11 case studies
- `app/courses/[slug]/page.js` - courses

## Shared components
- `components/Nav.js` - main navigation (with transparent prop for homepage)
- `components/NavPanel.js` - nav panels (hover-to-open, staggered animation)
- `components/Footer.js` - site footer
- `components/CTA.js` - call to action blocks
- `components/ContactForm.js` - contact form (client component)
- `components/NewsletterSignup.js` - newsletter form (client component)
- `components/ToolDownloadForm.js` - tool download form (client component)
- `components/ScrollObserver.js` - IntersectionObserver for scroll animations
- `components/emergent/EmergentSidebar.js` - framework wiki sidebar
- `components/emergent/SectionNavFooter.js` - prev/next navigation
- `components/emergent/constants.js` - section order and dimension mappings

## One-off pages
- `app/page.js` - homepage (full-viewport hero with canvas animation, transparent nav)
- `app/about/page.js`
- `app/philosophy/page.js`
- `app/how-we-work/page.js`
- `app/contact/page.js`
- `app/not-found.js` - 404
- `app/services/page.js` - services index
- `app/article/page.js` - articles index
- `app/tools/page.js` - tools index
- `app/projects/page.js` - projects index
- `app/courses/page.js` - courses index
- `app/emergent-framework/page.js` - framework overview

## Layout files
- `app/layout.js` - root layout (includes SVG marker filters + ScrollObserver)
- `app/emergent-framework/layout.js` - framework wiki layout with sidebar

---

# DESIGN PASS STATUS

Phases 1-5 are complete. Phase 6 (polish and integration) is in progress.

## What's done
- Global CSS foundation with all 12 design system classes (globals.css)
- Tailwind layer fix (@import "tailwindcss" layer(tw))
- All shared components styled (Nav, Footer, CTA, forms)
- All template pages styled (services, articles, tools, projects, wiki, courses)
- All index pages styled
- All one-off pages styled (about, philosophy, how-we-work, contact, 404)
- Nav redesigned (three panels with hover-to-open, staggered animation)
- SVG logo integrated
- Homepage hero (in progress)
- Global tweaks: heading-display size, hero padding, H1/lead-text gap

## What's remaining (Phase 6)
- Section transitions (dissolve network + flowing lines)
- Background patterns (canvas to React conversion)
- Heading marker highlights (editorial choices per page)
- Responsive pass (mobile nav, card stacking, wiki sidebar, touch targets)
- Page-by-page visual refinement (art direction)
- Cross-page consistency check

## Visual assets (separate workstream after Phase 6)
140 HTML files in `design-reference/visuals/` to convert into 5 React components:
- HeroAnimation (13 service heroes)
- RecognitionCard (56 cards, 4 per service)
- PropositionDiagram (14 diagrams)
- StageInfographic (56 infographics)
- EcosystemVisual (1 centrepiece animation)
