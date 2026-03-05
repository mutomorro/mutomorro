'use client'

export default function NavPanel({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          backgroundColor: 'rgba(34, 28, 43, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        zIndex: 95,
        backgroundColor: 'var(--color-warm)',
        borderBottom: '1px solid #f0ece6',
        padding: '4rem 4rem 5rem',
        boxShadow: '0 20px 60px rgba(34, 28, 43, 0.15)',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-dark)',
            opacity: 0.4,
            lineHeight: 1,
            padding: '0.25rem',
          }}
        >
          ✕
        </button>

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </>
  )
}