'use client'

import RecognitionCard from './recognition/RecognitionCard'

export default function RecognitionRow({ item, index, slug, delay }) {
  const parts = item.text.split('||')

  return (
    <div
      className="recognition-row scroll-in"
      style={{ transitionDelay: `${delay}s` }}
    >
      {/* Text - left, sits above animation */}
      <div className="recognition-row__text">
        <p className="recognition-row__aspiration">
          {parts[0]?.trim()}
        </p>
        {parts[1] && (
          <p className="recognition-row__capability">
            {parts[1].trim()}
          </p>
        )}
      </div>
      {/* Animation - absolutely positioned, washes across right half */}
      <div className="recognition-row__animation">
        <RecognitionCard slug={slug} index={index} />
      </div>
    </div>
  )
}
