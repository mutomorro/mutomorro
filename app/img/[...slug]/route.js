// Stable image proxy — the route handler (heroes + body images, flat house-pattern URLs).
//
// Resolves the CURRENT Sanity asset and streams its bytes from our own origin, so the
// public URL is stable across re-uploads. Path shapes:
//   - /img/<type>/<slug>-<role>          FLAT — hero (`overview`) AND body (`step-N-name`),
//                                        body resolved by its permanent `imageSlug` field
//   - /img/<type>/<slug>/body/<…-_key>   LEGACY (pre-29 Jun) — kept resolving; 301s to the
//                                        flat URL once the block has an imageSlug
// Format is chosen by URL param (not Accept), so there is no Vary/cache fragmentation:
//   - default (no fmt) -> true PNG   (the canonical save/share/Google/og delivery)
//   - ?fmt=avif | ?fmt=webp -> the invisible <picture> render skin
// See lib/image-proxy.js for the resolver + rollout and docs/seo/ for the spec.

import { parseSegment, resolveField, RESOLVE, titleToFilename, descriptorToName, imageSlugToName, bodyPathBySlug, SANITY } from '@/lib/image-proxy'

export const runtime = 'edge'

const MAX_DIM = 2000
const QUALITY = 82
// NOT `immutable`: the bytes behind a slug URL change on an intentional re-upload,
// so the edge serves from cache but revalidates in the background.
const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800'

function clampDim(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.min(Math.round(n), MAX_DIM)
}

async function resolveDoc(sanityType, field, slug) {
  // `field` is a fixed allow-list value (lib/image-proxy.js), never user input.
  // Title is fetched here specifically to build the rich download filename.
  const query =
    `*[_type == $t && slug.current == $s && !(_id in path("drafts.**"))][0]` +
    `{ "url": ${field}.asset->url, "title": coalesce(title, name, internalTitle, heading) }`
  const url =
    `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}` +
    `?query=${encodeURIComponent(query)}` +
    `&$t=${encodeURIComponent(JSON.stringify(sanityType))}` +
    `&$s=${encodeURIComponent(JSON.stringify(slug))}`

  // Resolver freshness: revalidate hourly (matches the site's ISR cadence).
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const json = await res.json()
  return json?.result || null
}

// NEW (flat) body resolver: resolve a body image by its permanent `imageSlug`. Returns
// { url, title } or null. `bodyField` is a fixed allow-list value; slug + imageSlug bound.
async function resolveBodyImageBySlug(sanityType, bodyField, slug, imageSlug) {
  const query =
    `*[_type == $t && slug.current == $s && !(_id in path("drafts.**"))][0]` +
    `{ "url": ${bodyField}[imageSlug == $is][0].asset->url, "title": coalesce(title, name, internalTitle, heading) }`
  const url =
    `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}` +
    `?query=${encodeURIComponent(query)}` +
    `&$t=${encodeURIComponent(JSON.stringify(sanityType))}` +
    `&$s=${encodeURIComponent(JSON.stringify(slug))}` +
    `&$is=${encodeURIComponent(JSON.stringify(imageSlug))}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const json = await res.json()
  return json?.result || null
}

// LEGACY (keyed) body resolver, used only by the `/body/<…-_key>` path. Resolves by the
// block `_key` AND projects that block's `imageSlug` (if any), so the route can 301 a
// legacy keyed URL onto its clean flat permalink in one round-trip.
async function resolveBodyImageByKey(sanityType, bodyField, slug, key) {
  const query =
    `*[_type == $t && slug.current == $s && !(_id in path("drafts.**"))][0]{` +
    ` "url": ${bodyField}[_key == $k][0].asset->url,` +
    ` "imageSlug": ${bodyField}[_key == $k][0].imageSlug,` +
    ` "title": coalesce(title, name, internalTitle, heading) }`
  const url =
    `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}` +
    `?query=${encodeURIComponent(query)}` +
    `&$t=${encodeURIComponent(JSON.stringify(sanityType))}` +
    `&$s=${encodeURIComponent(JSON.stringify(slug))}` +
    `&$k=${encodeURIComponent(JSON.stringify(key))}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const json = await res.json()
  return json?.result || null
}

export async function GET(request, { params }) {
  const { slug: segments } = await params
  if (!Array.isArray(segments)) return new Response('Not found', { status: 404 })

  // Resolve the doc {url, title} from one of two path shapes.
  let doc
  let filenameBase = null // body: title-cased descriptor for the download filename
  try {
    if (segments.length === 2) {
      // FLAT path: ['tool', '<slug>-<role>']. Role is split off the END (parseSegment).
      //   - a FIXED role (`overview`) resolves to a single image field (heroImage) — this
      //     also serves the consolidated body master, whose render emits `<slug>-overview`.
      //   - any other role (`step-N-name`) is a body image addressed by its `imageSlug`.
      const [typeSegment, segment] = segments
      const parsed = parseSegment(segment)
      if (!parsed) return new Response('Unparseable image path', { status: 404 })
      const resolved = resolveField(typeSegment, parsed.role)
      if (resolved) {
        doc = await resolveDoc(resolved.sanityType, resolved.field, parsed.slug)
      } else {
        const entry = RESOLVE[typeSegment]
        if (!entry?.bodyField) return new Response('Unknown image path', { status: 404 })
        doc = await resolveBodyImageBySlug(entry.sanityType, entry.bodyField, parsed.slug, parsed.role)
        // Download filename: `<Title>-<Image-Slug>` (e.g. Process-Mapping-Step-1-Assumed),
        // unique per page (avoids every diagram saving as the same name).
        const titleBase = (doc?.title || '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const slugName = imageSlugToName(parsed.role)
        filenameBase = titleBase ? `${titleBase}-${slugName}` : slugName
      }
    } else if (segments.length === 4 && segments[2] === 'body') {
      // LEGACY path (pre-29 Jun): ['tool', '<slug>', 'body', '<descriptor>-<_key>'] or
      // bare '<_key>'. Resolve by `_key`; if the block now carries an `imageSlug`, 301 to
      // the clean flat permalink so any nascent Google signal consolidates there.
      const [typeSegment, slug, , tail] = segments
      const m = /^(?:(.*)-)?([0-9a-f]{8,})$/.exec(tail)
      if (!m) return new Response('Unparseable image path', { status: 404 })
      const entry = RESOLVE[typeSegment]
      if (!entry?.bodyField) return new Response('Unknown image path', { status: 404 })
      const keyed = await resolveBodyImageByKey(entry.sanityType, entry.bodyField, slug, m[2])
      if (keyed?.imageSlug) {
        const url = new URL(request.url)
        // Preserve only the real rendition params. Next.js puts the catch-all path into a
        // `slug` query param on request.url, so copying the whole search string would point
        // the 301 at a param-polluted URL and FRAGMENT the SEO signal — allow-list instead.
        const keep = new URLSearchParams()
        for (const k of ['fmt', 'w', 'h', 'fit']) {
          const v = url.searchParams.get(k)
          if (v != null) keep.set(k, v)
        }
        const qs = keep.toString()
        const location = `${url.origin}${bodyPathBySlug(typeSegment, slug, keyed.imageSlug)}${qs ? `?${qs}` : ''}`
        // Build the 301 by hand so it carries Cache-Control (Response.redirect does not).
        return new Response(null, { status: 301, headers: { Location: location, 'Cache-Control': CACHE_CONTROL } })
      }
      // Not yet backfilled — serve straight from the key (legacy descriptor filename).
      filenameBase = descriptorToName(m[1])
      doc = keyed ? { url: keyed.url, title: keyed.title } : null
    } else {
      return new Response('Not found', { status: 404 })
    }
  } catch {
    return new Response('Upstream resolve error', { status: 502 })
  }
  if (!doc?.url) return new Response('Image not found', { status: 404 })

  // Rendition params. Format by URL param: avif/webp for the render skin, else PNG.
  const sp = new URL(request.url).searchParams
  const fmtParam = sp.get('fmt')
  const fmt = fmtParam === 'avif' || fmtParam === 'webp' ? fmtParam : null
  const w = clampDim(sp.get('w'))
  const h = clampDim(sp.get('h'))
  const fit = sp.get('fit') === 'crop' ? 'crop' : 'max'

  const upstream = new URL(doc.url)
  if (w) upstream.searchParams.set('w', String(w))
  if (h) upstream.searchParams.set('h', String(h))
  upstream.searchParams.set('q', String(QUALITY))
  upstream.searchParams.set('fit', fit)

  let acceptForSanity
  if (fmt) {
    // Sanity has no fm=avif; AVIF/WebP come via auto=format + a fixed Accept we set
    // here (NOT the browser's — the format is already pinned by our URL param).
    upstream.searchParams.set('auto', 'format')
    acceptForSanity = fmt === 'avif' ? 'image/avif,image/webp,*/*' : 'image/webp,*/*'
  } else {
    upstream.searchParams.set('fm', 'png') // true PNG — the canonical delivery
  }

  let imageRes
  try {
    imageRes = await fetch(upstream.toString(), acceptForSanity ? { headers: { Accept: acceptForSanity } } : {})
  } catch {
    return new Response('Upstream fetch error', { status: 502 })
  }
  if (!imageRes.ok || !imageRes.body) {
    return new Response('Upstream image error', { status: 502 })
  }

  // Derive the served format from the UPSTREAM content-type, not the requested
  // fmt: Sanity's auto=format may return webp where avif was asked, so keying the
  // filename off the request would mislabel the bytes. This keeps it always honest.
  const actualType = (imageRes.headers.get('Content-Type') || (fmt ? `image/${fmt}` : 'image/png'))
    .split(';')[0].trim()
  const EXT_BY_TYPE = { 'image/avif': 'avif', 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }
  const ext = EXT_BY_TYPE[actualType] || 'png'

  const headers = new Headers()
  headers.set('Content-Type', actualType)
  headers.set('Cache-Control', CACHE_CONTROL)
  // Rich, inline filename on every delivery, extension matched to the format actually
  // served. Clean body images use `<Title>-<Image-Slug>` (e.g. Process-Mapping-Step-1-
  // Assumed.png); heroes (and legacy body with no slug) fall back to the doc title.
  // `inline` (never `attachment`) keeps og/inline rendering intact.
  const name = filenameBase ? `${filenameBase}.${ext}` : titleToFilename(doc.title, ext)
  const safe = name.replace(/[^A-Za-z0-9._-]/g, '')
  headers.set('Content-Disposition', `inline; filename="${safe}"`)
  const len = imageRes.headers.get('Content-Length')
  if (len) headers.set('Content-Length', len)

  return new Response(imageRes.body, { status: 200, headers })
}
