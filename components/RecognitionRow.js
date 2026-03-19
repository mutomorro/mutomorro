'use client'

import RecognitionCard from './recognition/RecognitionCard'

export default function RecognitionRow({ item, index, slug, delay }) {
  const parts = item.text.split('||')

  return (
    <div
      className="scroll-in"
      style={{
        transitionDelay: `${delay}s`,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--warm)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.008)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Text - left, sits above animation */}
      <div style={{
        flex: '1 1 100%',
        minWidth: '280px',
        padding: '28px 32px',
        position: 'relative',
        zIndex: 2,
        maxWidth: '65%',
      }}>
        <p style={{
          fontSize: '19px',
          fontWeight: '600',
          color: 'var(--dark)',
          margin: '0 0 8px',
          lineHeight: '1.4',
        }}>
          {parts[0]?.trim()}
        </p>
        {parts[1] && (
          <p style={{
            fontSize: '17px',
            fontWeight: '400',
            color: 'rgba(0,0,0,0.5)',
            margin: 0,
            lineHeight: '1.45',
          }}>
            {parts[1].trim()}
          </p>
        )}
      </div>
      {/* Animation - absolutely positioned, washes across right half */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '55%',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        <RecognitionCard slug={slug} index={index} />
      </div>
    </div>
  )
}
