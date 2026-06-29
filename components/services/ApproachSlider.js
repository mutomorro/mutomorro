import { PortableText } from '@portabletext/react'
import Lightbox from '../Lightbox'
import { isProxyEnabled, bodyCanonicalUrl, bodyRenderSrcSet, RENDER_WIDTHS } from '@/lib/image-proxy'

// Vertical Approach flow (Wave 2 - replaced the tabbed slider).
// Every stage renders into the server HTML, visible and in order, so there
// are no hidden panels to drop from SSR and no height-jump on interaction.
// Each stage's sub-page connector is surfaced inline as a card. Per-stage
// colours carry over from the original journey strip so the four stages keep
// their distinct visual identity.
const STAGE_COLOURS = ['#80388F', '#9B51E0', '#FF4279', '#E08F00']

export default function ApproachSlider({
  serviceSlug,
  approachIntro,
  stages = [],
  approachKicker = 'Our approach',
  approachIntroHeadline = 'How we work',
  principles = [],
}) {
  // Stable-URL proxy is on per-service (ENABLED_TYPES has 'service'); a stage renders through
  // the proxy only once it also has a backfilled imageSlug, so pre-backfill stages fall back to
  // the plain CDN Lightbox unchanged. Resolved once here and threaded down to each stage.
  const proxyService = !!serviceSlug && isProxyEnabled('service', serviceSlug)
  return (
    <div className="approach-flow">
      <div className="approach-flow__intro">
        <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
          {approachKicker}
        </span>
        {approachIntroHeadline && (
          <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
            {approachIntroHeadline}
          </h2>
        )}
        <div className="portable-text">
          <PortableText value={approachIntro} />
        </div>
      </div>

      <div className="approach-flow__stages">
        {stages.map((stage, i) => (
          <ApproachStage
            key={stage._key || `stage-${i}`}
            stage={stage}
            index={i}
            colour={STAGE_COLOURS[i] || STAGE_COLOURS[STAGE_COLOURS.length - 1]}
            serviceSlug={serviceSlug}
            proxyService={proxyService}
          />
        ))}
      </div>

      {principles?.length > 0 && (
        <div className="approach-flow__principles-end">
          <span className="kicker approach-flow__principles-label">What guides our work</span>
          <div className="approach-flow__principles">
            {principles.map((p, i) => (
              <div key={p._key || i} className="approach-principle">
                <p className="approach-principle__title">{p.title}</p>
                <p className="approach-principle__desc">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ApproachStage({ stage, index, colour, serviceSlug, proxyService }) {
  if (!stage) return null
  const number = stage.stageNumber || String(index + 1).padStart(2, '0')

  // Feed the Lightbox stable proxy <picture> URLs when this stage has a backfilled imageSlug
  // (the canonical PNG <img> is the stable Google target). All proxy props absent → exact
  // original CDN Lightbox behaviour. Same flat builders as a tool's step-N body image.
  const proxyOn = proxyService && !!stage.imageSlug
  const proxyProps = proxyOn
    ? (() => {
        const id = { imageSlug: stage.imageSlug }
        const canonical = bodyCanonicalUrl('service', serviceSlug, id)
        return {
          proxySrc: canonical,
          proxyAvifSrcSet: bodyRenderSrcSet('service', serviceSlug, id, RENDER_WIDTHS, 'avif'),
          proxyWebpSrcSet: bodyRenderSrcSet('service', serviceSlug, id, RENDER_WIDTHS, 'webp'),
          proxyZoomSrc: `${canonical}?w=2000`,
        }
      })()
    : {}
  return (
    <section className="approach-stage" style={{ '--stage-colour': colour }}>
      <div className="approach-stage__head">
        <span className="approach-stage__num">{number}</span>
        <span className="kicker approach-stage__kicker">
          {stage.stageTitle || `Stage ${number}`}
        </span>
      </div>

      <div className="approach-stage__top">
        <div className="approach-stage__text">
          <h3 className="heading-h3" style={{ margin: '0 0 16px' }}>
            {stage.stageHeading}
          </h3>
          <div className="portable-text">
            <PortableText value={stage.stageBody} />
          </div>
        </div>
        {stage.stageImageUrl && (
          <div className="approach-stage__image img-lift">
            <Lightbox src={stage.stageImageUrl} alt={stage.stageImageAlt || stage.stageHeading} {...proxyProps} />
          </div>
        )}
      </div>

      {(stage.stageInPractice?.length > 0 || stage.stageOutcome) && (
        <>
          <div className="approach-stage__divider" />
          <div className="approach-stage__detail">
            <div>
              {stage.stageInPractice?.length > 0 && (
                <>
                  <span className="kicker approach-stage__practice-label">
                    What this looks like in practice
                  </span>
                  <ul className="practice-list">
                    {stage.stageInPractice.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div>
              {stage.stageOutcome && (
                <div className="stage-outcome-box">
                  <p className="stage-outcome-box__label">What you get</p>
                  <p className="stage-outcome-box__text">{stage.stageOutcome}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {stage.stageLinkLabel && stage.stageLinkUrl && (
        <a href={stage.stageLinkUrl} className="approach-connect">
          <span className="approach-connect__text">
            <span className="approach-connect__label">{stage.stageLinkLabel}</span>
            <span className="approach-connect__sub">Go deeper on this stage</span>
          </span>
          <span aria-hidden="true" className="approach-connect__arrow">→</span>
        </a>
      )}
    </section>
  )
}
