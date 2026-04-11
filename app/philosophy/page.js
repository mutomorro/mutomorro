import Link from 'next/link'
import CTA from '../../components/CTA'
import PerspectiveShiftStepper from '@/components/philosophy/PerspectiveShiftStepper'
import PhilosophyHero from '@/components/philosophy/PhilosophyHero'

import LeveragePointsDemo from '@/components/philosophy/LeveragePointsDemo'
import FeedbackLoopsDemo from '@/components/philosophy/FeedbackLoopsDemo'
import StructuresBehaviourDemo from '@/components/philosophy/StructuresBehaviourDemo'
import ConvergenceSection from '@/components/philosophy/ConvergenceSection'
import OutcomesConstellation from '@/components/philosophy/OutcomesConstellation'
import EmergentConstellation from '@/components/philosophy/EmergentConstellation'
import NetworkDivider from '@/components/philosophy/NetworkDivider'

export const metadata = {
  title: 'Our philosophy - Intentional Ecosystems',
  description: 'Organisations are living systems - complex, interconnected, and adaptive. We work with the patterns beneath the surface to help leaders create conditions where good things happen naturally.',
}

const concepts = [
  {
    title: 'Leverage points',
    headline: 'Small changes in the right place create disproportionate impact. Not all interventions are equal.',
    body: 'Some changes require massive effort for minimal results. Others create ripples that multiply across your entire ecosystem. The key is finding leverage points - places where focused attention creates cascading positive effects. Change how decisions get made in one area, and coordination improves across multiple teams. Strengthen one dimension, and others lift with it.',
    example: 'A housing association struggling with tenant satisfaction found the root cause wasn\'t frontline service - it was how information flowed between teams. Fixing that one thing improved satisfaction scores across every department.',
  },
  {
    title: 'Feedback loops',
    headline: 'Actions circle back to influence themselves. Understanding these loops reveals why patterns persist.',
    body: "Reinforcing loops amplify change - success builds more success, or decline accelerates decline. Balancing loops resist change, maintaining stability even when you're trying to shift things. Understanding which loops operate in your organisation explains why some patterns feel stuck whilst others gain momentum. It reveals where you're fighting the system - and where you can work with it.",
    example: 'A charity kept investing in staff training, but nothing changed. The loop: managers weren\'t given time to apply what they\'d learned, so skills faded, so more training was commissioned. Breaking the loop meant changing how managers\' time was protected - not adding more courses.',
  },
  {
    title: 'Structures shape behaviour',
    headline: 'People respond to the systems around them. Change the structure, behaviour shifts naturally.',
    body: "When organisations face behavioural challenges, the instinct is to address the people. Systems thinking looks deeper - what structures are creating these behaviours? If information doesn't flow, structures might not support sharing. If people resist change, structures might be rewarding the status quo. Redesign the structures and people naturally respond differently. Change becomes sustainable because it's built into how the system works.",
    example: 'An organisation wanted more cross-team collaboration but kept getting silos. The issue wasn\'t attitude - it was that every team had its own budget line and its own targets. Redesigning the goal structure made collaboration the natural path, not the effortful one.',
  },
]

export default function PhilosophyPage() {
  return (
    <main className="philosophy-page">

      {/* Section 1: Hero */}
      <PhilosophyHero>
        <span className="kicker" style={{ marginBottom: '20px' }}>Philosophy</span>
        <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px', margin: '0 0 32px' }}>
          Why we think about organisations differently
        </h1>
        <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
          Most approaches to improving organisations focus on fixing individual parts. We've found that the biggest shifts come from understanding how everything connects.
        </p>
      </PhilosophyHero>

      {/* Section 2: Opening - the idea */}
      <section className="section--full warm-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ maxWidth: '720px' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              Our thinking
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 24px', maxWidth: '700px' }}>
              Everything is connected
            </h2>
            <div className="body-text" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p>
                We see organisations as living systems. Everything connects to everything else - culture emerges from patterns, capability grows from conditions, change ripples in ways you can't predict by looking at individual pieces.
              </p>
              <p>
                Most approaches to developing organisations were built for a simpler time - when you could break things into parts, fix each piece, and the whole got better. The world leaders navigate today doesn't work that way. It's more connected, more complex, and moving faster than any fixed plan can keep up with.
              </p>
              <p style={{ fontWeight: '400', fontSize: '1.1rem' }}>
                Once you see this, it changes how you approach every challenge - from restructures to culture change to how you design services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Intentional + Ecosystems - convergence animation */}
      <ConvergenceSection />

      {/* Divider: network dissolve strip */}
      <NetworkDivider />

      {/* Section 5: Six perspective shifts - interactive stepper */}
      <PerspectiveShiftStepper />

      {/* Section 6: Three systems concepts */}
      <section className="section--full dark-bg section-padding">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ marginBottom: '20px' }}>Systems concepts</span>
            <h2 className="heading-h2" style={{ color: '#ffffff', margin: '0 0 16px', maxWidth: '600px' }}>
              Three concepts we come back to again and again
            </h2>
            <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '620px', margin: 0 }}>
              These three ideas run through almost every project we work on. They're simple, but they explain a lot.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {concepts.map((c, i) => {
              const DemoComponent = [LeveragePointsDemo, FeedbackLoopsDemo, StructuresBehaviourDemo][i];
              return (
                <div
                  key={c.title}
                  className="scroll-in"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    padding: '3rem 0',
                    borderBottom: i < concepts.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span className="kicker" style={{ marginBottom: '12px' }}>{c.title}</span>
                    <h3 className="heading-h3" style={{
                      color: '#fff',
                      margin: '0 0 16px',
                    }}>
                      {c.headline}
                    </h3>
                    <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                      {c.body}
                    </p>
                    {c.example && (
                      <p className="body-text" style={{
                        color: 'rgba(255,255,255,0.45)',
                        margin: '16px 0 0',
                        fontStyle: 'italic',
                        fontSize: '15px',
                      }}>
                        {c.example}
                      </p>
                    )}
                  </div>
                  <div>
                    {DemoComponent && <DemoComponent />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 7: What becomes possible - constellation */}
      <OutcomesConstellation />

      {/* Section 8: Bridge to EMERGENT Framework */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
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
              Systems thinking needs practical tools. The EMERGENT Framework gives you eight lenses for understanding your organisational ecosystem - from Resonant Purpose through to Enacted Culture. Not a diagnostic checklist, but a way of seeing what's really happening and where focused attention creates the most impact.
            </p>
            <Link href="/emergent-framework" className="btn-primary">
              Explore the framework
            </Link>
          </div>
          <div className="scroll-in delay-1">
            <EmergentConstellation />
          </div>
        </div>
      </section>

      {/* Section 9: CTA */}
      <CTA
        heading="Want to explore what this means for your organisation?"
        body="Start with a conversation. No framework, no methodology - just a different way of looking at what you're navigating. And if it resonates, we'll explore where it leads."
        secondaryText="How we work"
        secondaryLink="/how-we-work"
      />
    </main>
  )
}
