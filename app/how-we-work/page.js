import Link from 'next/link'
import CTA from '../../components/CTA'

export const metadata = {
  title: 'How We Work - Mutomorro',
  description: 'Our four-stage approach to working together - from understanding where you are now, through collaborative design, to embedded change and lasting internal capability.',
}

const stages = [
  {
    number: '01',
    name: 'Assess',
    tagline: 'Understanding where you really are',
    body: "Before anything else, we need to see clearly. Not just the presenting problem, but the patterns beneath it - where energy flows, where it gets stuck, what's generating the reality you're experiencing. We evaluate your organisation across the eight EMERGENT dimensions, creating the shared insight that enables confident decisions about where to focus for greatest impact.",
    detail: 'Creates clarity from ambiguity. Turns vague sensing that something needs to shift into a clear picture of what\'s actually happening and why.',
    perfect: [
      'Organisations sensing something needs to shift but can\'t pinpoint what',
      'Planning significant transformation',
      'New leadership wanting deep understanding',
      'Before major restructuring or change',
    ],
  },
  {
    number: '02',
    name: 'Co-Design',
    tagline: 'Building solutions that fit your context',
    body: "We don't arrive with predetermined answers. We facilitate the process through which your people - the ones who'll live with the solutions - design the approaches that fit your unique context. Systems expertise meets collective intelligence. The result is solutions that account for complexity because diverse perspectives reveal it, and that carry genuine ownership because the right people shaped them.",
    detail: "This is why our solutions stick when expert-led approaches have repeatedly failed. You can't impose your way to lasting change.",
    perfect: [
      'Developing new structures, operating models, or ways of working',
      'Translating strategy into operational reality',
      'When expert-designed solutions have repeatedly failed',
      'Building genuine participation into how you evolve',
    ],
  },
  {
    number: '03',
    name: 'Transform',
    tagline: 'Working alongside you as change unfolds',
    body: "Designed solutions need to become lived reality. We embed with your teams over extended timeframes - present as challenges arise, not parachuting in for workshops then disappearing. We're transformation partners, not programme managers. Multiple small shifts reinforcing across your system create lasting change in a way that big-bang rollouts rarely do.",
    detail: 'Change stops feeling like something done to people and becomes something enabled within the system.',
    perfect: [
      'Implementing new structures or operating models',
      'Embedding strategic initiatives into daily practice',
      'Culture change programmes',
      'Post-merger integration',
      'When change needs to stick, not just launch',
    ],
  },
  {
    number: '04',
    name: 'Sustain',
    tagline: 'Making ourselves unnecessary',
    body: "The goal of every engagement is to make ourselves unnecessary. We progressively transfer all facilitation and systems-thinking expertise to your people, so they can independently lead continued evolution. You develop the capability to facilitate systems workshops, assess ecosystem health, and steward ongoing change without external support. The organisation becomes self-sustaining.",
    detail: "This isn't just a nice idea - it's our core commitment. We measure success by how little you need us.",
    perfect: [
      'Ensuring transformation embeds permanently',
      'Building internal OD and change capability',
      'When ending consultant dependency matters',
      'Developing distributed expertise for ongoing evolution',
    ],
  },
]

export default function HowWeWorkPage() {
  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>How we work</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px', margin: '0 0 32px' }}>
            A partner, not a programme
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            We work alongside you through the complete journey - from understanding where you are now, through collaborative design, to embedded change and lasting internal capability.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'start',
          }}>
            <div>
              <h2 className="heading-h2" style={{ margin: 0 }}>
                Not a consultant. A capability-building partner.
              </h2>
            </div>
            <div className="body-text" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p>
                Traditional consultants arrive with the answer. We arrive with a process. One that draws on your people's knowledge, builds genuine ownership, and transfers real capability - so you're stronger at the end of the engagement than at the start.
              </p>
              <p>
                Our four-stage approach isn't a rigid methodology. It's a natural progression that organisations move through in different ways, at different paces, entering at different points depending on where they are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four stages */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              The four stages
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '560px' }}>
              Assess. Co-Design. Transform. Sustain.
            </h2>
            <p className="body-text" style={{ maxWidth: '620px', margin: 0 }}>
              Four stages that build toward organisations where people and purpose flourish.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stages.map((stage, i) => (
              <div
                key={stage.name}
                className="card-a scroll-in"
                style={{
                  cursor: 'default',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="card-a__body" style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr',
                  gap: '3rem',
                  alignItems: 'start',
                  padding: '2.5rem 32px',
                }}>
                  {/* Stage label */}
                  <div>
                    <span className="caption-text" style={{ display: 'block', marginBottom: '8px' }}>
                      {stage.number}
                    </span>
                    <h3 className="heading-h3" style={{ margin: '0 0 6px' }}>
                      {stage.name}
                    </h3>
                    <span className="kicker" style={{ color: 'var(--accent)' }}>
                      {stage.tagline}
                    </span>
                  </div>

                  {/* Stage content */}
                  <div>
                    <p className="body-text" style={{ margin: '0 0 1rem' }}>{stage.body}</p>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '400',
                      color: 'var(--accent)',
                      fontStyle: 'italic',
                      margin: '0 0 1.5rem',
                    }}>
                      {stage.detail}
                    </p>
                    <div>
                      <span className="kicker" style={{
                        color: 'rgba(0,0,0,0.3)',
                        marginBottom: '12px',
                      }}>
                        Works well when
                      </span>
                      <div className="practice-list">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {stage.perfect.map((item) => (
                            <li
                              key={item}
                              style={{
                                position: 'relative',
                                paddingLeft: '18px',
                                marginBottom: '6px',
                                fontSize: '16px',
                                fontWeight: '300',
                                color: 'var(--dark)',
                              }}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible entry */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              Worth knowing
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
              You don't have to start at the beginning
            </h2>
            <p className="body-text" style={{ margin: 0 }}>
              Whilst the four stages represent a natural progression, organisations enter at different points depending on where they are. Some begin with Co-Design when they already understand their challenges. Others start with Transform when solutions exist but implementation needs support. Some come to us just for Sustain - building the internal capability to keep evolving independently.
            </p>
          </div>

          <div className="scroll-in delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Assess → Co-Design → Transform → Sustain', note: 'Starting from scratch or planning major change' },
              { label: 'Co-Design → Transform → Sustain', note: 'Clear on the problem, need collaborative solutions' },
              { label: 'Transform → Sustain', note: 'Solutions in hand, need embedded implementation' },
              { label: 'Sustain', note: 'Building ongoing internal capability' },
            ].map((path) => (
              <div
                key={path.label}
                style={{
                  padding: '1.25rem',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'var(--white)',
                }}
              >
                <p style={{
                  fontSize: '15px',
                  fontWeight: '400',
                  color: 'var(--black)',
                  margin: '0 0 4px',
                }}>
                  {path.label}
                </p>
                <p className="caption-text" style={{ margin: 0 }}>{path.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>How we show up</span>
            <h2 className="heading-h2" style={{ color: '#ffffff', margin: 0, maxWidth: '560px' }}>
              The principles behind everything we do
            </h2>
          </div>

          <div className="grid-3">
            {[
              {
                title: 'Your people hold the answers',
                body: 'We bring systems frameworks and facilitation expertise. You bring context, relationships, and knowledge no outsider could have. The best solutions emerge from both.',
              },
              {
                title: 'Ownership over compliance',
                body: "People implement what they helped design. We build genuine co-ownership into every stage - not as a nice extra, but as the mechanism that makes change stick.",
              },
              {
                title: 'Building towards independence',
                body: 'Every engagement is designed to transfer capability, not create dependency. We measure success by how well you can lead your own evolution without us.',
              },
              {
                title: 'Patterns over symptoms',
                body: "We're not interested in solving today's urgent issue if it means tomorrow's problem goes unaddressed. We work at the level of the system.",
              },
              {
                title: 'Embedded, not parachuted',
                body: "We work alongside your people over time, not in and out for workshops. Real transformation needs sustained presence, not periodic visits.",
              },
              {
                title: 'Honest about complexity',
                body: "We won't oversimplify. Organisations are genuinely complex. We help you work with that complexity rather than pretending it away.",
              },
            ].map((p, index) => (
              <div
                key={p.title}
                className="scroll-in"
                style={{
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#ffffff',
                  margin: '0 0 10px',
                }}>
                  {p.title}
                </h3>
                <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA
        heading="Let's talk about where you are"
        body="Tell us what's happening in your organisation and we'll explore what working together could look like."
        secondaryText="See our services"
        secondaryLink="/services"
      />
    </main>
  )
}