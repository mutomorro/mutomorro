'use client'

// Flat list of pill cards rendered into a centred, flex-wrapped cluster.
// nth-child margin nudges in CSS create the organic, slightly-staggered
// feel without splitting into pre-arranged rows in JS.

export default function RecognitionTriggers({
  cards = [],
  heading = 'Leaders come to us at moments like these',
  kicker = 'Common catalysts',
}) {
  if (!cards?.length) return null

  return (
    <section
      className="section--full recognition-triggers"
      style={{ background: 'var(--warm)' }}
    >
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        <div className="scroll-in recognition-triggers__header">
          {kicker && (
            <span className="kicker recognition-triggers__kicker">
              {kicker}
            </span>
          )}
          {heading && (
            <h2 className="heading-h3 recognition-triggers__heading">
              {heading}
            </h2>
          )}
        </div>

        <div className="recognition-triggers__cluster">
          {cards.map((card, i) => (
            <span
              key={card._key || i}
              className="recognition-triggers__chip"
            >
              {card.phrase}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
