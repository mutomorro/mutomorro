// Global next/image loader for Sanity-hosted images.
//
// Why this exists: previously every <Image> was given a Sanity URL that had
// already been resized small (e.g. ?w=900) AND was then re-processed by
// Next's built-in /_next/image optimizer. That double-optimised the image and,
// worse, capped the source at ~900px — so on retina/2x screens there were never
// enough real pixels and everything looked soft. See docs / git history.
//
// With this loader, Next asks Sanity directly for the exact pixel width each
// device needs (via deviceSizes/imageSizes + the `sizes` prop), and Sanity does
// the resize + format + compression ONCE. No /_next/image hop, no double encode,
// full retina resolution straight from the 2,800–6,250px originals.
//
// It runs on both server and client, so it must stay isomorphic (no Node APIs).

// Single-pass quality, applied uniformly. We intentionally ignore the per-image
// `quality` prop (none is set in the app, and Next always passes its default of
// 75, which can't be told apart from an explicit 75). 82 is a touch above that
// default because much of the content is diagrams with fine text/lines.
const QUALITY = 82

export default function sanityImageLoader({ src, width }) {
  // Pass non-Sanity images through untouched (local SVG logos, etc.). Doing this
  // before `new URL()` also avoids throwing on relative paths like "/logo.svg".
  if (!src || !src.includes('cdn.sanity.io')) return src

  const url = new URL(src)
  const w0 = Number(url.searchParams.get('w'))
  const h0 = Number(url.searchParams.get('h'))

  url.searchParams.set('w', String(width))

  if (w0 && h0) {
    // The image was requested with an explicit crop box (cards, thumbnails).
    // Preserve that aspect ratio at the new width and leave `fit` as-is so the
    // existing crop/hotspot behaviour is unchanged.
    url.searchParams.set('h', String(Math.round((width * h0) / w0)))
  } else if (!url.searchParams.has('fit')) {
    // Proportional image: never let Sanity upscale past the original.
    url.searchParams.set('fit', 'max')
  }

  url.searchParams.set('q', String(QUALITY))
  url.searchParams.set('auto', 'format')
  return url.toString()
}
