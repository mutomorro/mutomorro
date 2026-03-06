import Link from 'next/link'
import CTA from '@/components/CTA'

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
    <>
      {/* Hero */}
      <section className="section section--dark">
        <div className="wrap wrap--narrow">
          <p className="label label--light" style={{ marginBottom: '1.5rem' }}>How we work</p>
          <h1 className="heading-display heading-gradient" style={{ marginBottom: '1.5rem' }}>
            A partner, not a programme
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '640px' }}>
            We work alongside you through the complete journey - from understanding where you are now, through collaborative design, to embedded change and lasting internal capability.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section section--white">
        <div className="wrap wrap--narrow">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <h2 className="heading-large" style={{ marginBottom: '1.25rem' }}>
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
      <section className="section section--warm">
        <div className="wrap">
          <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>The four stages</p>
          <h2 className="heading-large" style={{ marginBottom: '0.75rem', maxWidth: '560px' }}>
            Assess. Co-Design. Transform. Sustain.
          </h2>
          <p className="body-text" style={{ maxWidth: '620px', marginBottom: '3.5rem' }}>
            Four stages that build toward organisations where people and purpose flourish.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {stages.map((stage, i) => (
              <div
                key={stage.name}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '2.5rem',
                  marginBottom: i < stages.length - 1 ? '1rem' : 0,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', alignItems: 'start' }}>
                  {/* Stage label */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#ccc', fontWeight: '300', display: 'block', marginBottom: '0.5rem' }}>
                      {stage.number}
                    </span>
                    <p style={{ fontSize: '1.4rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.35rem' }}>
                      {stage.name}
                    </p>
                    <p className="label label--accent" style={{ margin: 0 }}>{stage.tagline}</p>
                  </div>

                  {/* Stage content */}
                  <div>
                    <p className="body-text" style={{ marginBottom: '1rem' }}>{stage.body}</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--color-accent)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                      {stage.detail}
                    </p>
                    <div>
                      <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: '0.75rem' }}>
                        Works well when
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {stage.perfect.map((item) => (
                          <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--color-accent)', marginTop: '2px', flexShrink: 0 }}>→</span>
                            <span style={{ fontSize: '0.875rem', color: '#666' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible entry note */}
      <section className="section section--white">
        <div className="wrap wrap--narrow">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>Worth knowing</p>
              <h2 className="heading-medium" style={{ marginBottom: '1.25rem' }}>
                You don't have to start at the beginning
              </h2>
              <p className="body-text">
                Whilst the four stages represent a natural progression, organisations enter at different points depending on where they are. Some begin with Co-Design when they already understand their challenges. Others start with Transform when solutions exist but implementation needs support. Some come to us just for Sustain - building the internal capability to keep evolving independently.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Assess →  Co-Design → Transform → Sustain', note: 'Starting from scratch or planning major change' },
                { label: 'Co-Design → Transform → Sustain', note: 'Clear on the problem, need collaborative solutions' },
                { label: 'Transform → Sustain', note: 'Solutions in hand, need embedded implementation' },
                { label: 'Sustain', note: 'Building ongoing internal capability' },
              ].map((path) => (
                <div
                  key={path.label}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid #f0ece6',
                    borderRadius: '6px',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                    {path.label}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>{path.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ marginBottom: '1.5rem' }}>How we show up</p>
          <h2 className="heading-large" style={{ color: '#fff', marginBottom: '3rem', maxWidth: '560px' }}>
            The principles behind everything we do
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
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
            ].map((p) => (
              <div
                key={p.title}
                style={{
                  padding: '1.75rem 0',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <p style={{ fontSize: '1rem', fontWeight: '400', color: '#fff', marginBottom: '0.75rem' }}>
                  {p.title}
                </p>
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
        primaryLabel="Talk to us"
        primaryHref="/contact"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </>
  )
}