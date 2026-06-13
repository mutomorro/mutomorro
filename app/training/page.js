import Link from 'next/link'

export const metadata = {
  title: 'Training',
  description:
    'In-house training designed around your people - change management, systems thinking, team effectiveness, and focused workshops. Built around your real challenges, brought to you.',
  openGraph: {
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

function TrainingCard({ href, title, desc, bg }) {
  return (
    <Link
      href={href}
      className="develop-card"
      style={{
        display: 'block',
        padding: '32px',
        background: bg,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)',
      }}
    >
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--dark)', lineHeight: 1.3 }}>
        {title}
      </h3>
      <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(0,0,0,0.75)', fontWeight: 300, margin: 0 }}>
        {desc}
      </p>
    </Link>
  )
}

function CardGrid({ items, cardBg }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {items.map((it) => (
        <TrainingCard key={it.href} {...it} bg={cardBg} />
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
            Training
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            Practical, in-house training designed around your people - your real challenges,
            your actual teams, not pulled off a shelf.
          </p>
        </div>
      </section>

      {/* Intro band - bespoke link placed early, repointed to /enquiry */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p className="lead-text" style={{ margin: 0 }}>
            Everything here works the same way: we bring the training to you and shape it before
            we arrive, so your people leave able to do the thing, not just read about it. Find the
            area that fits what you&apos;re working on below - or, if you&apos;d rather we designed
            something around your organisation from the ground up, that&apos;s{' '}
            <Link href="/enquiry?service=training" className="inline-link">bespoke training</Link>.
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
          <CardGrid items={PILLARS} cardBg="var(--white)" />
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
          <CardGrid items={WORKSHOPS} cardBg="var(--warm)" />
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
          <CardGrid items={MORE_AREAS} cardBg="var(--white)" />
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
