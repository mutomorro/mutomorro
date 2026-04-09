'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ src, alt, cover = true }) {
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

  return (
    <>
      <img
        src={src}
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
            src={src}
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
