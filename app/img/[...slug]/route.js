// Stable image proxy — the route handler (Phase 1).
//
// Serves /img/<type>/<slug>-<role> by resolving the CURRENT Sanity asset for that
// slug+role and streaming its bytes from our own origin, so the public URL is
// stable across re-uploads. Format is chosen by URL param (not Accept), so there
// is no Vary/cache fragmentation:
//   - default (no fmt) -> true PNG   (the canonical save/share/Google/og delivery)
//   - ?fmt=avif | ?fmt=webp -> the invisible <picture> render skin
// See lib/image-proxy.js for the resolver + rollout and docs/seo/ for the spec.

import { parseSegment, resolveField, titleToFilename, SANITY } from '@/lib/image-proxy'

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

export async function GET(request, { params }) {
  const { slug: segments } = await params

  // Flattened path: [type, '<slug>-<role>'] e.g. ['tool', 'process-mapping-overview'].
  if (!Array.isArray(segments) || segments.length !== 2) {
    return new Response('Not found', { status: 404 })
  }
  const [typeSegment, segment] = segments

  const parsed = parseSegment(segment)
  if (!parsed) return new Response('Unparseable image path', { status: 404 })

  const resolved = resolveField(typeSegment, parsed.role)
  if (!resolved) return new Response('Unknown image path', { status: 404 })

  let doc
  try {
    doc = await resolveDoc(resolved.sanityType, resolved.field, parsed.slug)
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

  const headers = new Headers()
  headers.set('Content-Type', imageRes.headers.get('Content-Type') || (fmt ? `image/${fmt}` : 'image/png'))
  headers.set('Cache-Control', CACHE_CONTROL)
  // Rich, inline filename on every delivery, extension matched to the format served
  // (png/avif/webp). A browser saves the displayed source, so the on-page AVIF saves
  // as <Title>-Diagram.avif; the canonical PNG URL saves as <Title>-Diagram.png.
  // `inline` (never `attachment`) keeps og/inline rendering intact.
  const ext = fmt || 'png'
  const safe = titleToFilename(doc.title, ext).replace(/[^A-Za-z0-9._-]/g, '')
  headers.set('Content-Disposition', `inline; filename="${safe}"`)
  const len = imageRes.headers.get('Content-Length')
  if (len) headers.set('Content-Length', len)

  return new Response(imageRes.body, { status: 200, headers })
}
