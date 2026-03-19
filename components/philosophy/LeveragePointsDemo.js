'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// --- Seeded random ---
function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Colours ---
function rgba(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}

const P = [155, 81, 224]; // accent purple

export default function LeveragePointsDemo() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    const sr = makeSeed(42);
    const NODE_COUNT = 32;
    const LEVERAGE_INDICES = []; // will be calculated

    // Generate nodes
    const nodes = [];
    // Create clusters
    const clusterCentres = [
      { x: 0.2, y: 0.3 },
      { x: 0.5, y: 0.2 },
      { x: 0.8, y: 0.35 },
      { x: 0.3, y: 0.7 },
      { x: 0.7, y: 0.75 },
    ];

    for (let i = 0; i < NODE_COUNT; i++) {
      const cluster = clusterCentres[i % clusterCentres.length];
      nodes.push({
        x: cluster.x + (sr() - 0.5) * 0.2,
        y: cluster.y + (sr() - 0.5) * 0.2,
        radius: 4 + sr() * 3,
        baseRadius: 4 + sr() * 3,
        brightness: 0.4 + sr() * 0.15,
        baseBrightness: 0.4 + sr() * 0.15,
        phase: sr() * Math.PI * 2,
        pulseSpeed: 0.8 + sr() * 0.4,
        neighbours: [],
        rippleTime: -1,
        rippleDelay: 0,
      });
    }

    // Build connections based on distance
    const edges = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Find nearest 3-4 neighbours
      const dists = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        dists.push({ j, dist: Math.sqrt(dx * dx + dy * dy) });
      }
      dists.sort((a, b) => a.dist - b.dist);
      const count = 2 + Math.floor(sr() * 2);
      for (let k = 0; k < count; k++) {
        const j = dists[k].j;
        if (!edges.find((e) => (e.from === i && e.to === j) || (e.from === j && e.to === i))) {
          edges.push({ from: i, to: j, brightness: 0.08, baseBrightness: 0.08 });
          nodes[i].neighbours.push(j);
          nodes[j].neighbours.push(i);
        }
      }
    }

    // Find leverage points: nodes with the most connections (high betweenness)
    const connectionCounts = nodes.map((n) => n.neighbours.length);
    const sorted = connectionCounts.map((c, i) => ({ i, c })).sort((a, b) => b.c - a.c);
    LEVERAGE_INDICES.push(sorted[0].i, sorted[1].i, sorted[2].i);

    // Ripple system
    const ripples = []; // { x, y, radius, maxRadius, opacity, startTime }

    stateRef.current = { nodes, edges, ripples, LEVERAGE_INDICES, lastClickTime: 0 };

    // Resize
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    const motionHandler = (e) => { reduced = e.matches; };
    motionQuery.addEventListener('change', motionHandler);

    function draw(time) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const st = stateRef.current;

      // Update ripple effects on nodes
      st.nodes.forEach((n) => {
        if (n.rippleTime > 0) {
          const elapsed = time - n.rippleTime;
          const duration = 800;
          if (elapsed < duration) {
            const t = elapsed / duration;
            const intensity = Math.sin(t * Math.PI);
            n.brightness = n.baseBrightness + intensity * 0.5;
            n.radius = n.baseRadius + intensity * 3;
          } else {
            n.brightness = n.baseBrightness;
            n.radius = n.baseRadius;
            n.rippleTime = -1;
          }
        }
        // Ambient pulse
        if (!reduced) {
          const pulse = Math.sin(time * 0.001 * n.pulseSpeed + n.phase) * 0.5;
          n.radius = (n.rippleTime > 0 ? n.radius : n.baseRadius) + pulse;
        }
      });

      // Draw edges
      st.edges.forEach((e) => {
        const n1 = st.nodes[e.from];
        const n2 = st.nodes[e.to];
        // Brighten if both nodes are rippling
        let alpha = e.baseBrightness;
        if (n1.rippleTime > 0 && n2.rippleTime > 0) {
          alpha = 0.35;
        } else if (n1.rippleTime > 0 || n2.rippleTime > 0) {
          alpha = 0.18;
        }
        ctx.beginPath();
        ctx.moveTo(n1.x * w, n1.y * h);
        ctx.lineTo(n2.x * w, n2.y * h);
        ctx.strokeStyle = rgba(P[0], P[1], P[2], alpha);
        ctx.lineWidth = alpha > 0.2 ? 1.5 : 1;
        ctx.stroke();
      });

      // Draw expanding ripple rings
      for (let i = st.ripples.length - 1; i >= 0; i--) {
        const r = st.ripples[i];
        const elapsed = time - r.startTime;
        const progress = elapsed / 1200;
        if (progress > 1) {
          st.ripples.splice(i, 1);
          continue;
        }
        const currentR = r.maxRadius * progress;
        const alpha = 0.4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(r.x * w, r.y * h, currentR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(P[0], P[1], P[2], alpha);
        ctx.lineWidth = 2 * (1 - progress);
        ctx.stroke();
      }

      // Draw nodes
      st.nodes.forEach((n, i) => {
        let px = n.x * w;
        let py = n.y * h;

        // Ambient position drift when not rippling
        if (!reduced && n.rippleTime < 0) {
          const driftPhaseX = i * 1.3 + 0.5;
          const driftPhaseY = i * 0.9 + 2.1;
          px += Math.sin((time * 0.0007 + driftPhaseX) * 0.6) * 2;
          py += Math.cos((time * 0.0006 + driftPhaseY) * 0.5) * 2;
        }

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, n.radius * 3);
        g.addColorStop(0, rgba(P[0], P[1], P[2], n.brightness * 0.2));
        g.addColorStop(1, rgba(P[0], P[1], P[2], 0));
        ctx.beginPath();
        ctx.arc(px, py, n.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(P[0], P[1], P[2], n.brightness);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, [isMobile]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const st = stateRef.current;
    if (!canvas || !st) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);

    // Find closest node
    let closest = -1;
    let closestDist = Infinity;
    st.nodes.forEach((n, i) => {
      const dx = n.x * w - mx;
      const dy = n.y * h - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30 && dist < closestDist) {
        closest = i;
        closestDist = dist;
      }
    });

    if (closest < 0) return;

    const now = performance.now();
    const isLeverage = st.LEVERAGE_INDICES.includes(closest);

    // Ripple ring at click point
    st.ripples.push({
      x: st.nodes[closest].x,
      y: st.nodes[closest].y,
      maxRadius: isLeverage ? 60 : 35,
      startTime: now,
    });

    // Trigger clicked node
    st.nodes[closest].rippleTime = now;

    if (isLeverage) {
      // Cascade: BFS through network
      const visited = new Set([closest]);
      let frontier = [closest];
      let delay = 0;

      const propagate = () => {
        delay += 200;
        const nextFrontier = [];
        frontier.forEach((idx) => {
          st.nodes[idx].neighbours.forEach((nb) => {
            if (!visited.has(nb)) {
              visited.add(nb);
              nextFrontier.push(nb);
              // Schedule ripple
              setTimeout(() => {
                st.nodes[nb].rippleTime = performance.now();
                st.ripples.push({
                  x: st.nodes[nb].x,
                  y: st.nodes[nb].y,
                  maxRadius: 25,
                  startTime: performance.now(),
                });
              }, delay);
            }
          });
        });
        frontier = nextFrontier;
        if (frontier.length > 0) propagate();
      };
      propagate();
    } else {
      // Small local ripple - affect immediate neighbours only
      st.nodes[closest].neighbours.forEach((nb, i) => {
        setTimeout(() => {
          st.nodes[nb].rippleTime = performance.now();
        }, 150 + i * 80);
      });
    }
  }, []);

  if (isMobile) return null;

  return (
    <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
        role="img"
        aria-label="Interactive demo: click nodes to discover leverage points - some create small ripples, others cascade across the entire network"
      />
    </div>
  );
}
