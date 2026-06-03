'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Build a Sanity CDN URL at a specific width. The Lightbox is a plain <img>
// (not next/image), so the global loader in sanity/imageLoader.js doesn't apply
// here — we size the images ourselves. Non-Sanity / unparseable srcs pass through.
function sized(src, w) {
  if (!src || !src.includes('cdn.sanity.io')) return src
  try {
    const u = new URL(src)
    u.searchParams.set('w', String(w))
    u.searchParams.set('q', '82')
    u.searchParams.set('auto', 'format')
    if (!u.searchParams.has('fit')) u.searchParams.set('fit', 'max')
    return u.toString()
  } catch {
    return src
  }
}

export default function Lightbox({ src, alt, cover = true, sizes = '(max-width: 768px) 100vw, 700px' }) {
  const [open, setOpen] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const handleOpen = (e) => {
    e.stopPropagation()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Responsive thumbnail (retina-aware) and a high-res source for the zoom view.
  const thumbSrcSet = src && src.includes('cdn.sanity.io')
    ? `${sized(src, 800)} 800w, ${sized(src, 1200)} 1200w, ${sized(src, 1600)} 1600w`
    : undefined
  const zoomSrc = sized(src, 2400)

  return (
    <>
      <img
        src={sized(src, 1000)}
        srcSet={thumbSrcSet}
        sizes={sizes}
        alt={alt || ''}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        style={{ width: '100%', height: cover ? '100%' : 'auto', objectFit: cover ? 'cover' : undefined, display: 'block', cursor: 'zoom-in' }}
      />

      {open && createPortal(
        <div
          ref={overlayRef}
          className="lightbox-overlay"
          onClick={handleClose}
        >
          <button
            className="lightbox-close"
            onClick={handleClose}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={zoomSrc}
            alt={alt || ''}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
