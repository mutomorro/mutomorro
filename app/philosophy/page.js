import Link from 'next/link'
import CTA from '@/components/CTA'

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
    <>
      {/* Hero */}
      <section className="section section--dark">
        <div className="wrap wrap--narrow">
          <p className="label label--light" style={{ marginBottom: '1.5rem' }}>Philosophy</p>
          <h1 className="heading-display heading-gradient" style={{ marginBottom: '1.5rem' }}>
            Designing intentional ecosystems
          </h1>
          <p className="lead lead--light" style={{ maxWidth: '680px' }}>
            Every organisation is a living ecosystem. We help you see it clearly, design it intentionally, and build the capability to lead change from within.
          </p>
        </div>
      </section>

      {/* Opening - the shift */}
      <section className="section section--white">
        <div className="wrap wrap--narrow">
          <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>The new world of work</p>
          <h2 className="heading-large" style={{ marginBottom: '1.5rem', maxWidth: '700px' }}>
            Most organisations are being led by ideas designed for a different time
          </h2>
          <div className="body-text" style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
      </section>

      {/* What it means */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>The approach</p>
          <h2 className="heading-large" style={{ marginBottom: '3rem', maxWidth: '600px' }}>
            Two words that change everything
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <p className="label label--accent" style={{ marginBottom: '1rem' }}>Intentional</p>
              <p className="body-text">
                Conscious, strategic design of how your organisation works. Not just reacting to what emerges, but deliberately creating the conditions where thriving happens naturally. Being thoughtful and systems-aware in your choices about structure, culture, processes, and development.
              </p>
            </div>
            <div className="card" style={{ padding: '2rem' }}>
              <p className="label label--accent" style={{ marginBottom: '1rem' }}>Ecosystems</p>
              <p className="body-text">
                Recognising your organisation as a living, interconnected, adaptive system. Not a machine with parts to fix, but a dynamic environment where everything influences everything else. Where health emerges from relationships and patterns, not just individual components.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '2.5rem', maxWidth: '680px' }}>
            <p className="body-text" style={{ fontSize: '1.1rem' }}>
              Together, intentional ecosystems thinking means <strong style={{ fontWeight: '400' }}>strategically cultivating the conditions where your organisation continuously adapts and flourishes.</strong> You understand patterns rather than endlessly addressing symptoms. You design for emergence rather than imposing rigid solutions. You strengthen the whole system rather than optimising parts.
            </p>
          </div>
        </div>
      </section>

      {/* Six perspective shifts */}
      <section className="section section--white">
        <div className="wrap">
          <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>Shifting perspectives</p>
          <h2 className="heading-large" style={{ marginBottom: '1rem', maxWidth: '600px' }}>
            Six shifts that change how you see your organisation
          </h2>
          <p className="body-text" style={{ maxWidth: '620px', marginBottom: '3rem' }}>
            Systems thinking isn't just another framework - it's a fundamentally different way of seeing. Here are the shifts that change what you notice, and what becomes possible.
          </p>
          <div className="card-grid">
            {perspectives.map((p) => (
              <div key={p.from} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#999', textDecoration: 'line-through' }}>{p.from}</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>→</span>
                  <span className="label label--accent" style={{ margin: 0 }}>{p.to}</span>
                </div>
                <p className="body-text" style={{ margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three systems concepts */}
      <section className="section section--dark">
        <div className="wrap">
          <p className="label label--light" style={{ marginBottom: '1.5rem' }}>Systems concepts</p>
          <h2 className="heading-large" style={{ color: '#fff', marginBottom: '1rem', maxWidth: '600px' }}>
            Three ideas that explain almost everything
          </h2>
          <p className="body-text" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '620px', marginBottom: '3rem' }}>
            Once you start seeing systems, these concepts become essential for understanding organisations and creating lasting change.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {concepts.map((c, i) => (
              <div
                key={c.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '3rem',
                  padding: '2.5rem 0',
                  borderBottom: i < concepts.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p className="label label--light" style={{ marginBottom: '0.75rem' }}>{c.title}</p>
                  <p style={{ fontSize: '1.05rem', fontWeight: '400', color: '#fff', lineHeight: '1.5', margin: 0 }}>
                    {c.headline}
                  </p>
                </div>
                <p className="body-text" style={{ color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What becomes possible */}
      <section className="section section--warm">
        <div className="wrap">
          <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>What becomes possible</p>
          <h2 className="heading-large" style={{ marginBottom: '1rem', maxWidth: '600px' }}>
            When you work with how organisations actually function
          </h2>
          <p className="body-text" style={{ maxWidth: '620px', marginBottom: '3rem' }}>
            The shift to intentional ecosystem thinking doesn't mean working harder. It means working with reality rather than fighting it.
          </p>
          <div className="card-grid">
            {outcomes.map((o) => (
              <div key={o.title} style={{ padding: '0.25rem 0' }}>
                <div style={{ width: '2rem', height: '2px', background: 'var(--color-accent)', marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
                  {o.title}
                </p>
                <p className="body-text" style={{ margin: 0 }}>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Link to EMERGENT */}
      <section className="section section--white">
        <div className="wrap wrap--narrow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>Putting it into practice</p>
            <h2 className="heading-large" style={{ marginBottom: '1.25rem' }}>
              The EMERGENT Framework
            </h2>
            <p className="body-text" style={{ marginBottom: '2rem' }}>
              Systems thinking needs practical application. The EMERGENT Framework gives you eight lenses for observing, understanding, and strengthening your organisational ecosystem - from Resonant Purpose through to Energy from Culture.
            </p>
            <Link href="/emergent-framework" className="btn btn--primary">
              Explore the framework
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f0ece6',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#bbb', fontWeight: '300', minWidth: '1.5rem' }}>
                  0{i + 1}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'var(--color-dark)' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA
        heading="Ready to see your organisation differently?"
        body="Let's explore what intentional ecosystem thinking could unlock for you."
        primaryLabel="Talk to us"
        primaryHref="/contact"
        secondaryLabel="How we work"
        secondaryHref="/how-we-work"
      />
    </>
  )
}