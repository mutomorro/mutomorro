'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const DIMENSIONS = [
  { name: 'Resonant Purpose', short: 'Purpose', desc: 'Why the organisation exists and whether people feel it' },
  { name: 'Embedded Strategy', short: 'Strategy', desc: 'Whether strategy lives in daily decisions or just documents' },
  { name: 'Narrative Connections', short: 'Narrative', desc: 'How knowledge and stories flow through the organisation' },
  { name: 'Momentum through Work', short: 'Work', desc: 'Whether work flows smoothly or gets stuck at every turn' },
  { name: 'Evolving Service', short: 'Service', desc: 'How well you create and deliver value to the people you serve' },
  { name: 'Generative Capacity', short: 'Capacity', desc: 'The ability to grow, learn, and build new capabilities' },
  { name: 'Tuned to Change', short: 'Change', desc: 'How naturally the organisation adapts when things shift' },
  { name: 'Enacted Culture', short: 'Culture', desc: 'Whether culture is lived in practice or just written on walls' },
];

const RING_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
];
const CROSS_CONNECTIONS = [
  [0, 4], [1, 5], [2, 6], [3, 7],
];
const ALL_CONNECTIONS = [...RING_CONNECTIONS, ...CROSS_CONNECTIONS];

const P = [155, 81, 224];

function getNodePositions(cx, cy, rx, ry) {
  return DIMENSIONS.map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    // Slight organic irregularity
    const jx = [0, 3, -2, 4, -3, 2, -4, 1][i];
    const jy = [2, -3, 4, -1, 3, -4, 1, -2][i];
    return {
      x: cx + Math.cos(angle) * rx + jx,
      y: cy + Math.sin(angle) * ry + jy,
    };
  });
}

export default function EmergentConstellation() {
  const [hovered, setHovered] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const pulseRef = useRef(0);

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

  // Ambient pulse animation
  useEffect(() => {
    if (reduced || isMobile) return;
    let running = true;
    function tick(time) {
      if (!running) return;
      pulseRef.current = time;
      // Force re-render for pulse (throttled to ~15fps)
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, isMobile]);

  // Mobile fallback
  if (isMobile) {
    return (
      <div>
        {DIMENSIONS.map((d, i) => (
          <div
            key={d.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '12px 0',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span className="caption-text" style={{ minWidth: '1.5rem' }}>0{i + 1}</span>
            <span style={{ fontSize: '16px', fontWeight: '400', color: 'var(--black)' }}>{d.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // SVG dimensions
  const W = 400;
  const H = 380;
  const CX = W / 2;
  const CY = H / 2;
  const RX = 140;
  const RY = 130;

  const positions = getNodePositions(CX, CY, RX, RY);

  const connectedTo = (index) => {
    const related = new Set();
    ALL_CONNECTIONS.forEach(([a, b]) => {
      if (a === index) related.add(b);
      if (b === index) related.add(a);
    });
    return related;
  };

  const activeSet = hovered >= 0 ? connectedTo(hovered) : null;
  const time = pulseRef.current;

  // Label positions (outside the node, pushing outward)
  function labelPos(i) {
    const p = positions[i];
    const angle = Math.atan2(p.y - CY, p.x - CX);
    const dist = 22;
    const lx = p.x + Math.cos(angle) * dist;
    const ly = p.y + Math.sin(angle) * dist;
    // Text anchor based on angle
    let anchor = 'middle';
    if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) anchor = 'start';
    else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) anchor = 'end';
    return { x: lx, y: ly + 4, anchor };
  }

  // Tooltip position
  function tooltipPos(i) {
    const p = positions[i];
    const angle = Math.atan2(p.y - CY, p.x - CX);
    const dist = 45;
    let tx = p.x + Math.cos(angle) * dist;
    let ty = p.y + Math.sin(angle) * dist;
    // Clamp to SVG bounds
    tx = Math.max(80, Math.min(W - 80, tx));
    ty = Math.max(20, Math.min(H - 40, ty));
    return { x: tx, y: ty };
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Interactive constellation showing the eight EMERGENT framework dimensions and their connections"
      >
        {/* Connections */}
        {ALL_CONNECTIONS.map(([a, b], i) => {
          const pa = positions[a];
          const pb = positions[b];
          const isRing = i < RING_CONNECTIONS.length;
          let opacity = isRing ? 0.15 : 0.08;
          let width = 1;

          if (hovered >= 0) {
            if (hovered === a || hovered === b) {
              opacity = 0.3;
              width = 1.5;
            } else {
              opacity = 0.04;
            }
          }

          return (
            <line
              key={`c${i}`}
              x1={pa.x} y1={pa.y}
              x2={pb.x} y2={pb.y}
              stroke={`rgb(${P[0]},${P[1]},${P[2]})`}
              strokeOpacity={opacity}
              strokeWidth={width}
              style={{
                transition: reduced ? 'none' : 'stroke-opacity 250ms ease, stroke-width 250ms ease',
              }}
            />
          );
        })}

        {/* Nodes */}
        {positions.map((p, i) => {
          const isHovered = hovered === i;
          const isConnected = activeSet && activeSet.has(i);
          let nodeOpacity = 0.4;
          let r = 7;

          if (hovered >= 0) {
            if (isHovered) {
              nodeOpacity = 0.85;
              r = 9;
            } else if (isConnected) {
              nodeOpacity = 0.6;
            } else {
              nodeOpacity = 0.15;
            }
          } else if (!reduced) {
            // Ambient pulse
            const pulse = Math.sin(time * 0.0008 + i * 0.8) * 0.05;
            nodeOpacity = 0.4 + pulse;
          }

          const lp = labelPos(i);

          return (
            <g key={`n${i}`}>
              {/* Glow */}
              <circle
                cx={p.x} cy={p.y}
                r={r * 2.5}
                fill={`rgba(${P[0]},${P[1]},${P[2]},${nodeOpacity * 0.08})`}
                style={{
                  transition: reduced ? 'none' : 'r 250ms ease, fill 250ms ease',
                }}
              />
              {/* Core node */}
              <circle
                cx={p.x} cy={p.y}
                r={r}
                fill={`rgba(${P[0]},${P[1]},${P[2]},${nodeOpacity})`}
                style={{
                  cursor: 'pointer',
                  transition: reduced ? 'none' : 'r 250ms ease, fill 250ms ease',
                }}
                tabIndex={0}
                role="button"
                aria-label={`${DIMENSIONS[i].name}: ${DIMENSIONS[i].desc}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(-1)}
              />
              {/* Short label */}
              <text
                x={lp.x} y={lp.y}
                textAnchor={lp.anchor}
                style={{
                  fontSize: '11px',
                  fontWeight: '400',
                  fontFamily: '"Source Sans 3", sans-serif',
                  fill: hovered >= 0
                    ? (isHovered || isConnected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)')
                    : 'rgba(0,0,0,0.35)',
                  transition: reduced ? 'none' : 'fill 250ms ease',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {DIMENSIONS[i].short}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered >= 0 && (() => {
          const tp = tooltipPos(hovered);
          const dim = DIMENSIONS[hovered];
          return (
            <foreignObject
              x={tp.x - 90}
              y={tp.y - 10}
              width="180"
              height="80"
              style={{ pointerEvents: 'none', overflow: 'visible' }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  padding: '10px 14px',
                  fontFamily: '"Source Sans 3", sans-serif',
                  width: '180px',
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#000',
                  marginBottom: '4px',
                  lineHeight: '1.3',
                }}>
                  {dim.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '300',
                  color: 'rgba(0,0,0,0.5)',
                  lineHeight: '1.4',
                }}>
                  {dim.desc}
                </div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
    </div>
  );
}
