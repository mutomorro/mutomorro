import Link from 'next/link'

export const metadata = {
  title: 'Training',
  description:
    'In-house training designed around your people - change management, systems thinking, team effectiveness, and focused workshops. Built around your real challenges, brought to you.',
  alternates: {
    canonical: 'https://mutomorro.com/training',
  },
  openGraph: {
    siteName: 'Mutomorro',
    locale: 'en_GB',
    title: 'Training',
    url: 'https://mutomorro.com/training',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

// Card descriptors are pulled from each destination's own standfirst, so the
// card rhymes with the page it opens. All eight links use the final slugs.
const PILLARS = [
  {
    href: '/training/change-management',
    title: 'Change Management Training',
    desc: 'Help the managers and sponsors leading your change lead it well.',
  },
  {
    href: '/training/systems-thinking',
    title: 'Systems Thinking Training',
    desc: 'See how your organisation really works - and where a small change shifts the whole pattern.',
  },
  {
    href: '/training/team-effectiveness',
    title: 'Team Effectiveness Training',
    desc: "Diagnose what's really going on in your teams, and build the habits that change it.",
  },
]

const WORKSHOPS = [
  {
    href: '/training/theory-of-change-workshop',
    title: 'Theory of Change Workshop',
    desc: 'Learn to build a Theory of Change by building yours - and leave able to run it again.',
  },
  {
    href: '/training/process-mapping-workshop',
    title: 'Process Mapping Workshop',
    desc: 'Map a real process end to end, find where it breaks down, and design something better.',
  },
  {
    href: '/training/scenario-planning-workshop',
    title: 'Scenario Planning Workshop',
    desc: 'Build a set of plausible futures and stress-test your strategy against them.',
  },
]

const MORE_AREAS = [
  {
    href: '/training/customer-experience',
    title: 'Customer Experience Training',
    desc: "See your services through your customers' eyes, and redesign around what you find.",
  },
  {
    href: '/training/continuous-improvement',
    title: 'Continuous Improvement Training',
    desc: 'Build the habit of improving the work as you go - without a big transformation programme.',
  },
]

const SECTION_HEADING_STYLE = {
  fontSize: 'clamp(28px, 3.5vw, 40px)',
  fontWeight: 400,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  margin: '0 0 12px',
  maxWidth: '600px',
}

// Site-standard nav card (.card-a): subtle border + accent corner, with a
// footer "action" that fills with accent and slides the arrow on hover —
// matching /tools, /projects and /diagnostics. The .card-a image area is
// deliberately omitted for now (the front-door items carry no hero yet); it
// slots straight in once we add them — the card handles with/without an image.
function TrainingCard({ href, title, desc, action = 'Explore' }) {
  return (
    <Link href={href} className="card-a">
      <div className="card-a__corner" />
      <div className="card-a__body">
        <div className="card-a__title">{title}</div>
        <p className="card-a__text">{desc}</p>
      </div>
      <div className="card-a__footer">
        <div className="card-a__footer-bg" />
        <div className="card-a__action">
          {action} <span className="arrow">→</span>
        </div>
      </div>
    </Link>
  )
}

function CardGrid({ items, action }) {
  return (
    <div className="card-grid">
      {items.map((it) => (
        <TrainingCard key={it.href} {...it} action={action} />
      ))}
    </div>
  )
}

export default function TrainingFrontDoor() {
  return (
    <main>
      {/* ==========================================
          1 - THE DOOR (dark hero)
          ========================================== */}
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker" style={{ marginBottom: '16px' }}>In-house training</span>
          <h1 className="heading-gradient heading-display" style={{ margin: '0 0 32px', maxWidth: '720px' }}>
            In-house training, designed around your people
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Practical, in-house training designed around your people - your real challenges,
            your actual teams, not pulled off a shelf.
          </p>
        </div>
      </section>

      {/* ==========================================
          2 - TRAINING AREAS (the pillars)
          ========================================== */}
      <section className="section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <h2 style={SECTION_HEADING_STYLE}>Training areas</h2>
          <p className="body-text" style={{ margin: '0 0 48px', maxWidth: '620px', color: 'rgba(0,0,0,0.65)' }}>
            The ongoing territories we work across - the deeper areas, where we run a range of
            courses for your managers, teams and leaders.
          </p>
          <CardGrid items={PILLARS} action="Explore the courses" />
        </div>
      </section>

      {/* ==========================================
          3 - WORKSHOPS
          ========================================== */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <h2 style={SECTION_HEADING_STYLE}>Workshops</h2>
          <p className="body-text" style={{ margin: '0 0 48px', maxWidth: '620px', color: 'rgba(0,0,0,0.65)' }}>
            Focused days where your team learns to run a specific method - by using it on
            something real of your own.
          </p>
          <CardGrid items={WORKSHOPS} action="Explore the workshop" />
        </div>
      </section>

      {/* ==========================================
          4 - MORE TRAINING AREAS (the groupings)
          ========================================== */}
      <section className="section-padding" style={{ background: 'var(--warm)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <h2 style={SECTION_HEADING_STYLE}>More training areas</h2>
          <p className="body-text" style={{ margin: '0 0 48px', maxWidth: '620px', color: 'rgba(0,0,0,0.65)' }}>
            Two more areas we work across - lighter than the pillars, the same approach.
          </p>
          <CardGrid items={MORE_AREAS} action="Explore the courses" />
        </div>
      </section>

      {/* ==========================================
          5 - START WITH THE FREE TOOLS
          ========================================== */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p className="lead-text" style={{ margin: '0 0 20px' }}>
            Plenty of people meet us through the free tools first - over 7,000 a month do.
            They&apos;re the quickest way to get a feel for how we think, and a good warm-up for
            any of the training above.
          </p>
          <Link href="/tools" className="inline-link" style={{ fontSize: '18px' }}>
            Explore the free tools <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ==========================================
          6 - NOT SURE WHICH FITS? (dark CTA)
          ========================================== */}
      <section className="section--full dark-bg section-padding" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '16px',
          }}>
            Not sure which fits?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 300,
            marginBottom: '32px',
          }}>
            Tell us what you&apos;re working on and we&apos;ll help you find the right shape - one
            area, a combination, or something designed from scratch. And if it turns out we&apos;re
            not the right people for it, we&apos;ll tell you that too. No pitch, just a conversation.
          </p>
          <Link href="/contact" className="btn-primary btn-primary--dark">
            Talk to us
          </Link>
        </div>
      </section>
    </main>
  )
}
