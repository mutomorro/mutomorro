'use client';

import { useState, useEffect, useRef } from 'react';

const OUTCOMES = [
  {
    title: 'Transformation that sticks',
    body: "Changes embed naturally because they're designed with the people who'll live them and create self-reinforcing patterns.",
    x: 15, y: 8,
  },
  {
    title: 'Adaptation becomes continuous',
    body: 'Instead of periodic restructures, your organisation develops the capacity to sense, respond, and evolve fluidly.',
    x: 62, y: 3,
  },
  {
    title: 'Energy flows toward purpose',
    body: "When you remove systemic friction and create conditions for thriving, people's natural motivation and creativity flow toward what matters - and they flourish whilst delivering impact.",
    x: 76, y: 40,
  },
  {
    title: 'Collective intelligence emerges',
    body: 'Moving from hero leadership to distributed wisdom. Solutions emerge that no individual could have designed alone.',
    x: 58, y: 73,
  },
  {
    title: 'Internal capability compounds',
    body: 'Rather than dependency on external experts, you build internal capacity for ongoing evolution.',
    x: 16, y: 76,
  },
  {
    title: 'Complexity becomes workable',
    body: 'Not simplified away or ignored, but made visible and tangible. What felt intractable becomes manageable.',
    x: 3, y: 43,
  },
];

const CONNECTIONS = [
  [0, 1], [0, 4],
  [1, 2], [1, 5],
  [2, 3], [2, 4],
  [3, 5],
  [4, 5],
];

// Centre point of each card for SVG lines (offset from card top-left)
function cardCentre(outcome, cardW) {
  return {
    x: outcome.x + cardW * 0.5 / 100,
    y: outcome.y + 3, // roughly centre vertically of a card
  };
}

export default function OutcomesConstellation() {
  const [hovered, setHovered] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(q.matches);
    const h = (e) => setReduced(e.matches);
    q.addEventListener('change', h);
    return () => q.removeEventListener('change', h);
  }, []);

  const CARD_W = 22; // % of container width

  // Mobile fallback: simple stacked grid
  if (isMobile) {
    return (
      <section className="section--full warm-bg" style={{ padding: '80px 24px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {OUTCOMES.map((o, i) => (
              <div key={o.title} className="scroll-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', marginBottom: '1rem' }} />
                <h3 className="heading-h4" style={{ margin: '0 0 8px' }}>{o.title}</h3>
                <p className="body-small" style={{ margin: 0, color: 'rgba(0,0,0,0.6)' }}>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Get connection state for each outcome
  const connectedTo = (index) => {
    const related = new Set();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === index) related.add(b);
      if (b === index) related.add(a);
    });
    return related;
  };

  const activeConnections = hovered >= 0 ? connectedTo(hovered) : null;

  return (
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

        {/* Constellation */}
        <div
          ref={containerRef}
          className="scroll-in"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '550px',
            paddingBottom: '4rem',
          }}
          onMouseLeave={() => setHovered(-1)}
        >
          {/* SVG connection layer */}
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {CONNECTIONS.map(([a, b], i) => {
              const ca = cardCentre(OUTCOMES[a], CARD_W);
              const cb = cardCentre(OUTCOMES[b], CARD_W);
              const isActive = hovered >= 0 && (hovered === a || hovered === b);
              return (
                <line
                  key={i}
                  x1={`${ca.x}%`}
                  y1={`${ca.y}%`}
                  x2={`${cb.x}%`}
                  y2={`${cb.y}%`}
                  stroke="rgb(155, 81, 224)"
                  strokeOpacity={isActive ? 0.35 : 0.08}
                  strokeWidth={isActive ? 1.5 : 1}
                  style={{
                    transition: reduced ? 'none' : 'stroke-opacity 300ms ease, stroke-width 300ms ease',
                  }}
                />
              );
            })}
          </svg>

          {/* Outcome cards */}
          {OUTCOMES.map((o, i) => {
            let opacity = 0.85;
            let borderLeft = '2px solid transparent';
            if (hovered >= 0) {
              if (hovered === i) {
                opacity = 1;
                borderLeft = '2px solid var(--accent)';
              } else if (activeConnections && activeConnections.has(i)) {
                opacity = 1;
              } else {
                opacity = 0.45;
              }
            }

            return (
              <div
                key={o.title}
                onMouseEnter={() => setHovered(i)}
                style={{
                  position: 'absolute',
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  width: `${CARD_W}%`,
                  minWidth: '200px',
                  maxWidth: '260px',
                  padding: '1rem 1rem 1rem 1.25rem',
                  borderLeft,
                  opacity,
                  cursor: 'default',
                  transition: reduced ? 'none' : 'opacity 300ms ease, border-color 300ms ease',
                }}
              >
                <h3 className="heading-h4" style={{ margin: '0 0 6px', fontSize: '18px' }}>{o.title}</h3>
                <p className="body-small" style={{ margin: 0, color: 'rgba(0,0,0,0.55)', fontSize: '14px', lineHeight: '1.6' }}>
                  {o.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
