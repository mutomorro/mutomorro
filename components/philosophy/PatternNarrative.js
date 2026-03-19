'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * PatternNarrative - Renders two coordinated canvas patterns behind
 * sections 2 and 3 of the Philosophy page.
 *
 * Section 2 (white): disconnected fragments
 * Section 3 (warm): connected network (transitions as section scrolls in)
 *
 * Usage:
 *   <PatternNarrative
 *     section2Content={<>...</>}
 *     section3Content={<>...</>}
 *   />
 */

const P = [155, 81, 224];

function rgba(a) {
  return `rgba(${P[0]},${P[1]},${P[2]},${a})`;
}

function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function generateNetwork(sr, count) {
  const clusters = [
    { x: 0.15, y: 0.3 },
    { x: 0.45, y: 0.2 },
    { x: 0.75, y: 0.35 },
    { x: 0.3, y: 0.7 },
    { x: 0.65, y: 0.75 },
  ];

  const nodes = [];
  for (let i = 0; i < count; i++) {
    const cluster = clusters[i % clusters.length];
    const dx = cluster.x + (sr() - 0.5) * 0.18;
    const dy = cluster.y + (sr() - 0.5) * 0.18;
    const cx = dx + (0.5 - dx) * 0.04;
    const cy = dy + (0.5 - dy) * 0.04;
    nodes.push({
      disX: Math.max(0.03, Math.min(0.97, dx)),
      disY: Math.max(0.03, Math.min(0.97, dy)),
      conX: Math.max(0.03, Math.min(0.97, cx)),
      conY: Math.max(0.03, Math.min(0.97, cy)),
      radius: 2 + sr() * 1.5,
      driftSeed: sr() * 100,
      driftSpeed: 0.1 + sr() * 0.15,
    });
  }

  const connections = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const ddx = nodes[i].conX - nodes[j].conX;
      const ddy = nodes[i].conY - nodes[j].conY;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dist < 0.25) {
        connections.push({
          from: i,
          to: j,
          midX: (sr() - 0.5) * 0.01,
          midY: (sr() - 0.5) * 0.01,
        });
      }
    }
  }
  if (connections.length > 40) connections.length = 40;

  return { nodes, connections };
}

export default function PatternNarrative({ section2Content, section3Content }) {
  const c1Ref = useRef(null); // canvas for section 2
  const c2Ref = useRef(null); // canvas for section 3
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const rafRef = useRef(null);
  const progressRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile || !mounted) return;

    const c1 = c1Ref.current;
    const c2 = c2Ref.current;
    const s2 = s2Ref.current;
    const s3 = s3Ref.current;
    if (!c1 || !c2 || !s2 || !s3) return;

    const ctx1 = c1.getContext('2d');
    const ctx2 = c2.getContext('2d');

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    const motionHandler = (e) => { reduced = e.matches; };
    motionQuery.addEventListener('change', motionHandler);
    if (reduced) progressRef.current = 1;

    const sr = makeSeed(271828);
    const { nodes, connections } = generateNetwork(sr, 28);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      [[c1, s2], [c2, s3]].forEach(([canvas, section]) => {
        const w = section.offsetWidth;
        const h = section.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
      });
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(s2);
    ro.observe(s3);

    function updateProgress() {
      if (reduced) { progressRef.current = 1; return; }
      const rect = s3.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top >= vh) {
        progressRef.current = 0;
      } else if (rect.top <= vh * 0.7) {
        progressRef.current = 1;
      } else {
        progressRef.current = 1 - (rect.top - vh * 0.7) / (vh * 0.3);
      }
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    const NODE_OP_WHITE = 0.06;
    const NODE_OP_WARM = 0.05;
    const CONN_OP = 0.045;

    function drawOnCanvas(ctx, canvas, p, isWarm, time) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const nodeOp = isWarm ? NODE_OP_WARM : NODE_OP_WHITE;

      // Connections
      if (p > 0) {
        connections.forEach((c) => {
          const n1 = nodes[c.from];
          const n2 = nodes[c.to];
          const x1 = lerp(n1.disX, n1.conX, p) * w;
          const y1 = lerp(n1.disY, n1.conY, p) * h;
          const x2 = lerp(n2.disX, n2.conX, p) * w;
          const y2 = lerp(n2.disY, n2.conY, p) * h;
          const mx = (x1 + x2) / 2 + c.midX * w;
          const my = (y1 + y2) / 2 + c.midY * h;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx, my, x2, y2);
          ctx.strokeStyle = rgba(CONN_OP * p);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      }

      // Nodes
      nodes.forEach((n) => {
        let x = lerp(n.disX, n.conX, p);
        let y = lerp(n.disY, n.conY, p);
        if (!reduced && p >= 1) {
          x += Math.sin(time * 0.0003 * n.driftSpeed + n.driftSeed) * 0.002;
          y += Math.cos(time * 0.00025 * n.driftSpeed + n.driftSeed * 1.3) * 0.002;
        }
        ctx.beginPath();
        ctx.arc(x * w, y * h, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(nodeOp);
        ctx.fill();
      });
    }

    let lastP = -1;

    function draw(time) {
      const p = progressRef.current;
      const drifting = !reduced && p >= 1;

      if (p !== lastP || drifting) {
        // Section 2: mostly disconnected, connections only appear near end of transition
        const p2 = Math.max(0, (p - 0.7) / 0.3);
        drawOnCanvas(ctx1, c1, p2, false, time);
        // Section 3: full transition
        drawOnCanvas(ctx2, c2, p, true, time);
        lastP = p;
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('scroll', updateProgress);
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, [isMobile, mounted]);

  return (
    <>
      {/* Section 2: The familiar world */}
      <section
        ref={s2Ref}
        className="section--full"
        style={{ padding: '80px 48px', background: 'var(--white)', position: 'relative' }}
      >
        {mounted && !isMobile && (
          <canvas
            ref={c1Ref}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          {section2Content}
        </div>
      </section>

      {/* Section 3: The shift */}
      <section
        ref={s3Ref}
        className="section--full warm-bg"
        style={{ padding: '80px 48px', position: 'relative' }}
      >
        {mounted && !isMobile && (
          <canvas
            ref={c2Ref}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          {section3Content}
        </div>
      </section>
    </>
  );
}
