import Link from 'next/link'
import CTA from '../../components/CTA'

export const metadata = {
  title: 'Our Philosophy - Mutomorro',
  description: 'Intentional Ecosystems - a systems-thinking approach to organisational development. Why we see organisations as living systems, not machines to control.',
}

const perspectives = [
  {
    from: 'Disconnection',
    to: 'Interconnectedness',
    body: 'Traditional thinking treats organisational elements as separate - strategy over here, culture over there, people in their silos. Systems thinking sees everything connecting to everything else. How you structure work shapes what culture emerges. A change in one area ripples through the whole.',
  },
  {
    from: 'Linear',
    to: 'Circular',
    body: "Traditional thinking assumes cause and effect flow in straight lines. Systems thinking recognises feedback loops. Today's solution becomes tomorrow's problem. Success in one area creates challenges in another. Effects circle back to influence causes. Nothing moves in straight lines.",
  },
  {
    from: 'Silos',
    to: 'Emergence',
    body: "Traditional thinking sees outcomes as the sum of parts. Systems thinking understands emergence - where the whole becomes something different from the sum of its parts. Organisational capability emerges from how people work together, not just individual skills.",
  },
  {
    from: 'Parts',
    to: 'Wholes',
    body: 'Traditional thinking breaks things down to analyse them - fix what\'s broken, improve each piece. Systems thinking sees the whole first. How do all the pieces create the patterns you\'re experiencing? Where are the leverage points that shift everything?',
  },
  {
    from: 'Analysis',
    to: 'Synthesis',
    body: 'Traditional thinking analyses - breaking complex situations into manageable pieces to understand them separately. Systems thinking synthesises - bringing pieces back together to understand how they interact, reinforce, and create the reality you\'re experiencing.',
  },
  {
    from: 'Isolation',
    to: 'Relationships',
    body: 'Traditional thinking focuses on things themselves - the quality of your strategy, the effectiveness of your structure. Systems thinking focuses on the relationships between things. How strategy connects to culture. How structure enables or constrains collaboration. That\'s where transformation happens.',
  },
]

const concepts = [
  {
    title: 'Leverage points',
    headline: 'Small changes in the right place create disproportionate impact.',
    body: "Not all interventions are equal. Some require massive effort for minimal results. Others create ripples that multiply across your entire ecosystem. Traditional thinking assumes change requires proportional effort. Systems thinking reveals this isn't true. The key is finding leverage points - places in the system where focused attention creates cascading positive effects. Change how decisions get made in one area, and coordination improves across multiple teams. Strengthen one dimension, and others lift with it.",
  },
  {
    title: 'Feedback loops',
    headline: 'Actions circle back to influence themselves - understanding these loops reveals why patterns persist.',
    body: "In complex systems, cause and effect aren't separated by straight lines. Effects feed back to influence their own causes. Reinforcing loops amplify change - success builds more success, or decline accelerates decline. Balancing loops resist change, maintaining stability. These are why transformation often feels like pushing against invisible resistance. Understanding which loops are operating in your organisation explains why some patterns feel stuck whilst others gain momentum.",
  },
  {
    title: 'Structures shape behaviour',
    headline: 'People respond to the systems around them - change the structure, behaviour shifts naturally.',
    body: "When organisations face behavioural challenges, the instinct is to address the people. Systems thinking looks deeper: what structures are creating these behaviours? If information doesn't flow, structures may not support sharing. If people resist change, structures might be punishing risk or rewarding the status quo. When you redesign structures - not just org charts, but the full set of patterns that shape behaviour - people naturally respond differently. Change becomes sustainable because it's built into how the system works.",
  },
]

const outcomes = [
  {
    title: 'Transformation that sticks',
    body: 'Changes embed naturally because they\'re designed with the people who\'ll live them, account for system dynamics, and create self-reinforcing patterns.',
  },
  {
    title: 'Adaptation becomes continuous',
    body: 'Instead of periodic restructures and change programmes, your organisation develops the capacity to sense, respond, and evolve fluidly.',
  },
  {
    title: 'Energy flows toward purpose',
    body: "When you remove systemic friction and create conditions for thriving, people's natural motivation and creativity flow toward what matters.",
  },
  {
    title: 'Collective intelligence emerges',
    body: 'Moving from hero leadership to distributed wisdom. Solutions emerge that no individual could have designed alone.',
  },
  {
    title: 'Internal capability compounds',
    body: 'Rather than dependency on external experts, you build sophisticated internal capacity for ongoing evolution.',
  },
  {
    title: 'Complexity becomes workable',
    body: 'Not simplified away or ignored, but made visible and tangible. What felt intractable becomes manageable.',
  },
  {
    title: 'People flourish whilst delivering impact',
    body: 'The false choice between performance and wellbeing dissolves. Healthy ecosystems enable both.',
  },
]

export default function PhilosophyPage() {
  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Philosophy</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>
            Designing intentional ecosystems
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Every organisation is a living ecosystem. We help you see it clearly, design it intentionally, and build the capability to lead change from within.
          </p>
        </div>
      </section>

      {/* Opening - the shift */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ maxWidth: '720px' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              The new world of work
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 24px', maxWidth: '700px' }}>
              Most organisations are being led by ideas designed for a different time
            </h2>
            <div className="body-text" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p>
                Complexity isn't an exception anymore - it's the constant. Change doesn't happen in waves we can plan around - it's continuous. The challenges leaders face today require something different from what worked even a decade ago.
              </p>
              <p>
                Yet most approaches to organisational development assume predictability we no longer have. They treat organisations as machines to control rather than living systems to cultivate. They optimise parts when we need to understand wholes.
              </p>
              <p>
                The leaders we work with are asking different questions: How do we navigate constant complexity whilst creating environments where people bring their best? How do we build organisations that adapt continuously rather than resist change? How do we move from reactive firefighting to intentional design?
              </p>
              <p style={{ fontWeight: '400', fontSize: '1.1rem' }}>
                This is where intentional ecosystem thinking comes in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it means - two cards */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in">
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              The approach
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 3rem', maxWidth: '600px' }}>
              Two words that change everything
            </h2>
          </div>

          <div className="scroll-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            maxWidth: '900px',
            marginBottom: '3rem',
          }}>
            <div style={{
              padding: '2rem',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'var(--white)',
            }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                Intentional
              </span>
              <p className="body-text" style={{ margin: 0 }}>
                Conscious, strategic design of how your organisation works. Not just reacting to what emerges, but deliberately creating the conditions where thriving happens naturally. Being thoughtful and systems-aware in your choices about structure, culture, processes, and development.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'var(--white)',
            }}>
              <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
                Ecosystems
              </span>
              <p className="body-text" style={{ margin: 0 }}>
                Recognising your organisation as a living, interconnected, adaptive system. Not a machine with parts to fix, but a dynamic environment where everything influences everything else. Where health emerges from relationships and patterns, not just individual components.
              </p>
            </div>
          </div>

          <div className="scroll-in" style={{ maxWidth: '720px' }}>
            <p className="body-text" style={{ fontSize: '1.1rem' }}>
              Together, intentional ecosystems thinking means <strong style={{ fontWeight: '400' }}>strategically cultivating the conditions where your organisation continuously adapts and flourishes.</strong> You understand patterns rather than endlessly addressing symptoms. You design for emergence rather than imposing rigid solutions. You strengthen the whole system rather than optimising parts.
            </p>
          </div>
        </div>
      </section>

      {/* Six perspective shifts */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              Shifting perspectives
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
              Six shifts that change how you see your organisation
            </h2>
            <p className="body-text" style={{ maxWidth: '620px', margin: 0 }}>
              Systems thinking isn't just another framework - it's a fundamentally different way of seeing. Here are the shifts that change what you notice, and what becomes possible.
            </p>
          </div>

          <div className="grid-3">
            {perspectives.map((p, index) => (
              <div
                key={p.from}
                className="scroll-in"
                style={{
                  padding: '2rem',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'var(--white)',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.3)', textDecoration: 'line-through' }}>
                    {p.from}
                  </span>
                  <span style={{ color: 'var(--accent)', fontSize: '14px' }}>→</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '400',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    background: 'rgba(155, 81, 224, 0.06)',
                    padding: '5px 12px',
                  }}>
                    {p.to}
                  </span>
                </div>
                <p className="body-small" style={{ margin: 0, color: 'rgba(0,0,0,0.6)' }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three systems concepts */}
      <section className="section--full dark-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>Systems concepts</span>
            <h2 className="heading-h2" style={{ color: '#ffffff', margin: '0 0 16px', maxWidth: '600px' }}>
              Three ideas that explain almost everything
            </h2>
            <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '620px', margin: 0 }}>
              Once you start seeing systems, these concepts become essential for understanding organisations and creating lasting change.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {concepts.map((c, i) => (
              <div
                key={c.title}
                className="scroll-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '4rem',
                  padding: '2.5rem 0',
                  borderBottom: i < concepts.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  alignItems: 'start',
                }}
              >
                <div>
                  <span className="kicker" style={{ marginBottom: '12px' }}>{c.title}</span>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '400',
                    color: '#fff',
                    lineHeight: '1.5',
                    margin: 0,
                  }}>
                    {c.headline}
                  </p>
                </div>
                <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What becomes possible */}
      <section className="section--full warm-bg" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              What becomes possible
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
              When you work with how organisations actually function
            </h2>
            <p className="body-text" style={{ maxWidth: '620px', margin: 0 }}>
              The shift to intentional ecosystem thinking doesn't mean working harder. It means working with reality rather than fighting it.
            </p>
          </div>

          <div className="grid-3">
            {outcomes.map((o, index) => (
              <div
                key={o.title}
                className="scroll-in"
                style={{
                  padding: '0.25rem 0',
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div style={{
                  width: '2rem',
                  height: '2px',
                  background: 'var(--accent)',
                  marginBottom: '1rem',
                }} />
                <h3 className="heading-h4" style={{ margin: '0 0 8px' }}>{o.title}</h3>
                <p className="body-small" style={{ margin: 0, color: 'rgba(0,0,0,0.6)' }}>
                  {o.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Link to EMERGENT */}
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
              Putting it into practice
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 20px' }}>
              The EMERGENT Framework
            </h2>
            <p className="body-text" style={{ margin: '0 0 2rem' }}>
              Systems thinking needs practical application. The EMERGENT Framework gives you eight lenses for observing, understanding, and strengthening your organisational ecosystem - from Resonant Purpose through to Energy from Culture.
            </p>
            <Link href="/emergent-framework" className="btn-primary">
              Explore the framework
            </Link>
          </div>
          <div className="scroll-in delay-1">
            {[
              'Resonant Purpose',
              'Embedded Strategy',
              'Narrative Connections',
              'Momentum through Work',
              'Service Innovation',
              'Generative Capacity',
              'Tuned to Change',
              'Energy from Culture',
            ].map((d, i) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <span className="caption-text" style={{ minWidth: '1.5rem' }}>
                  0{i + 1}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '400', color: 'var(--black)' }}>
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA
        heading="Ready to see your organisation differently?"
        body="Let's explore what intentional ecosystem thinking could unlock for you."
        secondaryText="How we work"
        secondaryLink="/how-we-work"
      />
    </main>
  )
}
