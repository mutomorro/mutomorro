import Image from 'next/image'
import { isProxyEnabled, canonicalPngUrl, renderSrcSet, RENDER_WIDTHS } from '@/lib/image-proxy'

const HERO_STYLE = { width: '100%', height: 'auto', display: 'block' }

// Shared hero / cover image renderer.
//
// When the stable-URL proxy is enabled for (type, slug) it emits the hand-rolled
// <picture> — AVIF/WebP render skin + the canonical PNG <img> (the save/share/Google
// target) — pointing at /img/<type>/<slug>-overview. Otherwise it renders the existing
// next/image from the CDN `fallbackSrc`. The wrapper/layout stays with each caller
// (every template's hero wrapper differs); this owns ONLY the image element, so the
// proxy <picture> lives in one place instead of being hand-rolled per template.
//
// `height` is the proxy <img>'s intrinsic height; `fallbackHeight` (defaults to height)
// lets a template keep its existing next/image aspect hint unchanged. Display is always
// width:100% / height:auto, so these are CLS hints, not layout.
export default function ProxyHeroImage({
  type,
  slug,
  alt = '',
  fallbackSrc,
  width,
  height,
  fallbackHeight,
  sizes,
  priority = false,
}) {
  if (isProxyEnabled(type, slug)) {
    return (
      <picture>
        <source type="image/avif" srcSet={renderSrcSet(type, slug, RENDER_WIDTHS, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={renderSrcSet(type, slug, RENDER_WIDTHS, 'webp')} sizes={sizes} />
        <img
          src={canonicalPngUrl(type, slug)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          style={HERO_STYLE}
        />
      </picture>
    )
  }
  if (!fallbackSrc) return null
  return (
    <Image
      src={fallbackSrc}
      alt={alt}
      width={width}
      height={fallbackHeight ?? height}
      priority={priority}
      sizes={sizes}
      style={HERO_STYLE}
    />
  )
}
