// Static, all-visible 3-up of the proposition argument (Wave 2 - Batch 4).
// Replaces the one-step-at-a-time PropositionStepper: the argument is the
// point, so all three beats are visible at once and fully in the SSR HTML -
// nothing sits behind a click. The supporting line is the step body flattened
// to text in the query (`bodyText`) and CSS line-clamped, so the full copy
// stays in the DOM (indexable) while a long, not-yet-tightened body can't blow
// out the layout.
export default function PropositionArgument({ steps = [] }) {
  if (!steps.length) return null

  return (
    <div className="prop-argument">
      {steps.map((step, i) => (
        <div
          key={step._key || i}
          className="prop-argument__step scroll-in"
          style={{ transitionDelay: `${i * 0.08}s` }}
        >
          {step.kicker && (
            <span className="prop-argument__kicker">{step.kicker}</span>
          )}
          {step.headline && (
            <h3 className="prop-argument__headline">{step.headline}</h3>
          )}
          {step.bodyText && (
            <p className="prop-argument__body">{step.bodyText}</p>
          )}
        </div>
      ))}
    </div>
  )
}
