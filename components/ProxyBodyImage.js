import Image from 'next/image'
import { isProxyEnabled, bodyCanonicalUrl, bodyRenderSrcSet, RENDER_WIDTHS } from '@/lib/image-proxy'
import { urlFor } from '@/sanity/image'

const BODY_SIZES = '(max-width: 768px) 100vw, 680px'

// Shared in-body diagram renderer for PortableText `image` blocks.
//
// When the proxy is enabled for (type, slug) and the block is addressable, emits the
// stable-URL <picture> (AVIF/WebP skin + canonical PNG <img>) — preferring the permanent
// imageSlug, falling back to the legacy `_key` URL for any block not yet backfilled so no
// image regresses to a hashed CDN src. Otherwise the existing next/image + CDN render.
// One component so the proxy body markup lives in ONE place, not hand-rolled per template.
export default function ProxyBodyImage({ type, slug, value }) {
  const useProxy = isProxyEnabled(type, slug) && (value?.imageSlug || value?._key)
  const id = { imageSlug: value?.imageSlug, alt: value?.alt, key: value?._key }
  return (
    <div className="img-mat" style={{ margin: '2.5rem 0' }}>
      {useProxy ? (
        <picture>
          <source type="image/avif" srcSet={bodyRenderSrcSet(type, slug, id, RENDER_WIDTHS, 'avif')} sizes={BODY_SIZES} />
          <source type="image/webp" srcSet={bodyRenderSrcSet(type, slug, id, RENDER_WIDTHS, 'webp')} sizes={BODY_SIZES} />
          <img
            src={bodyCanonicalUrl(type, slug, id)}
            alt={value?.alt || ''}
            width={900}
            height={506}
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </picture>
      ) : (
        <Image
          src={urlFor(value).width(900).url()}
          alt={value?.alt || ''}
          width={900}
          height={506}
          sizes={BODY_SIZES}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      )}
    </div>
  )
}
