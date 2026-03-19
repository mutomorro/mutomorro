'use client';

import { useRef, useEffect, useState } from 'react';

// --- Seeded random ---
function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Colour ---
const P = [155, 81, 224];
function rgba(a) {
  return `rgba(${P[0]},${P[1]},${P[2]},${a})`;
}

// --- Smooth noise for ambient drift ---
function noiseOffset(time, seed, speed) {
  return Math.sin(time * speed * 0.001 + seed) * 0.5 +
    Math.sin(time * speed * 0.0007 + seed * 1.7) * 0.3 +
    Math.sin(time * speed * 0.0003 + seed * 2.3) * 0.2;
}

export default function PhilosophyHero({ children }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = canvas.parentElement;
    if (!section) return;

    const ctx = canvas.getContext('2d');

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    const motionHandler = (e) => { reduced = e.matches; };
    motionQuery.addEventListener('change', motionHandler);

    // Responsive node count
    function getNodeCount() {
      const w = window.innerWidth;
      if (w < 480) return 20;
      if (w < 768) return 33;
      return 65;
    }

    // Build network
    let nodes = [];
    let connections = [];
    let pulses = [];
    let nodeCount = 0;

    function buildNetwork() {
      const sr = makeSeed(314159);
      nodeCount = getNodeCount();
      const anchorCount = Math.max(6, Math.floor(nodeCount * 0.13));

      nodes = [];
      connections = [];
      pulses = [];

      // Generate nodes - clustered centre-left, sparser at edges
      for (let i = 0; i < nodeCount; i++) {
        // Bias toward centre-left: weighted random
        const bx = sr() * 0.4 + sr() * 0.6; // skews left-centre
        const by = sr();
        // Organic jitter
        const x = Math.max(0.03, Math.min(0.97, bx + (sr() - 0.5) * 0.15));
        const y = Math.max(0.03, Math.min(0.97, by + (sr() - 0.5) * 0.15));

        const isAnchor = i < anchorCount;
        // Distance from centre for stagger ordering
        const distFromCentre = Math.sqrt((x - 0.45) ** 2 + (y - 0.5) ** 2);

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          radius: isAnchor ? 4.5 + sr() * 1.5 : 2 + sr() * 2,
          baseOpacity: isAnchor ? 0.45 + sr() * 0.1 : 0.2 + sr() * 0.12,
          opacity: 0,
          isAnchor,
          distFromCentre,
          driftSeed: sr() * 100,
          driftSpeed: 0.15 + sr() * 0.2,
          // Entrance: centre nodes appear first
          fadeInStart: distFromCentre * 400,
          fadeInDuration: 300 + sr() * 200,
        });
      }

      // Sort by fadeInStart for rendering order
      nodes.sort((a, b) => a.fadeInStart - b.fadeInStart);

      // Build connections - distance based
      const maxDist = nodeCount < 25 ? 0.22 : 0.18;
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].baseX - nodes[j].baseX;
          const dy = nodes[i].baseY - nodes[j].baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            // Curved midpoint offset
            const midOffsetX = (sr() - 0.5) * 0.015;
            const midOffsetY = (sr() - 0.5) * 0.015;
            // Connection timing: anchor-to-anchor first, then short connections, then long
            const bothAnchors = nodes[i].isAnchor && nodes[j].isAnchor;
            const oneAnchor = nodes[i].isAnchor || nodes[j].isAnchor;
            let drawStart;
            if (bothAnchors) {
              drawStart = 500 + dist * 2000;
            } else if (oneAnchor) {
              drawStart = 800 + dist * 3000;
            } else {
              drawStart = 1100 + dist * 4000;
            }

            connections.push({
              from: i,
              to: j,
              dist,
              midOffsetX,
              midOffsetY,
              drawStart,
              drawDuration: 350 + sr() * 250,
              progress: 0, // 0 = not started, 1 = fully drawn
              baseOpacity: 0.06 + (1 - dist / maxDist) * 0.04,
            });
          }
        }
      }

      // Cap connections for performance
      connections.sort((a, b) => a.drawStart - b.drawStart);
      const maxConns = nodeCount < 25 ? 50 : nodeCount < 35 ? 70 : 120;
      if (connections.length > maxConns) connections.length = maxConns;
    }

    buildNetwork();

    // Resize
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      // Rebuild if node count changed
      const newCount = getNodeCount();
      if (newCount !== nodeCount) {
        buildNetwork();
        startTimeRef.current = null; // restart entrance
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    function draw(time) {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // --- Node updates ---
      nodes.forEach((n) => {
        if (reduced) {
          // Static: fully visible, no drift
          n.opacity = n.baseOpacity;
          n.x = n.baseX;
          n.y = n.baseY;
        } else {
          // Entrance fade
          if (elapsed < n.fadeInStart) {
            n.opacity = 0;
          } else if (elapsed < n.fadeInStart + n.fadeInDuration) {
            const t = (elapsed - n.fadeInStart) / n.fadeInDuration;
            n.opacity = n.baseOpacity * t;
          } else {
            n.opacity = n.baseOpacity;
          }

          // Ambient drift (after entrance)
          if (elapsed > 2500) {
            const driftAmt = 0.004;
            n.x = n.baseX + noiseOffset(time, n.driftSeed, n.driftSpeed) * driftAmt;
            n.y = n.baseY + noiseOffset(time, n.driftSeed + 50, n.driftSpeed * 0.8) * driftAmt;
          }
        }
      });

      // --- Connection updates ---
      connections.forEach((c) => {
        if (reduced) {
          c.progress = 1;
        } else {
          if (elapsed < c.drawStart) {
            c.progress = 0;
          } else if (elapsed < c.drawStart + c.drawDuration) {
            c.progress = (elapsed - c.drawStart) / c.drawDuration;
            // Ease out
            c.progress = 1 - Math.pow(1 - c.progress, 2);
          } else {
            c.progress = 1;
          }
        }
      });

      // --- Draw connections ---
      connections.forEach((c) => {
        if (c.progress <= 0) return;
        const n1 = nodes[c.from];
        const n2 = nodes[c.to];
        if (n1.opacity <= 0 || n2.opacity <= 0) return;

        const x1 = n1.x * w;
        const y1 = n1.y * h;
        const x2 = n2.x * w;
        const y2 = n2.y * h;
        const mx = (x1 + x2) / 2 + c.midOffsetX * w;
        const my = (y1 + y2) / 2 + c.midOffsetY * h;

        if (c.progress < 1) {
          // Partial draw: line growing from n1 toward n2
          const t = c.progress;
          // Quadratic bezier point at t
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          // Draw partial curve
          const steps = 12;
          for (let s = 1; s <= steps; s++) {
            const st = (s / steps) * t;
            const sx = (1 - st) * (1 - st) * x1 + 2 * (1 - st) * st * mx + st * st * x2;
            const sy = (1 - st) * (1 - st) * y1 + 2 * (1 - st) * st * my + st * st * y2;
            ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = rgba(c.baseOpacity * c.progress);
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Full curve
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx, my, x2, y2);
          ctx.strokeStyle = rgba(c.baseOpacity);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // --- Pulses (after entrance) ---
      if (!reduced && elapsed > 3000) {
        // Spawn new pulse every ~4 seconds
        if (connections.length > 0 && (pulses.length === 0 || (pulses.length < 2 && Math.random() < 0.004))) {
          const ci = Math.floor(Math.random() * connections.length);
          const c = connections[ci];
          if (c.progress >= 1) {
            pulses.push({
              connectionIndex: ci,
              progress: 0,
              speed: 0.0008 + Math.random() * 0.0006,
            });
          }
        }

        for (let i = pulses.length - 1; i >= 0; i--) {
          const pulse = pulses[i];
          pulse.progress += pulse.speed * 16; // approx per frame
          if (pulse.progress > 1) {
            pulses.splice(i, 1);
            continue;
          }

          const c = connections[pulse.connectionIndex];
          if (!c) { pulses.splice(i, 1); continue; }
          const n1 = nodes[c.from];
          const n2 = nodes[c.to];
          const x1 = n1.x * w, y1 = n1.y * h;
          const x2 = n2.x * w, y2 = n2.y * h;
          const mx = (x1 + x2) / 2 + c.midOffsetX * w;
          const my = (y1 + y2) / 2 + c.midOffsetY * h;

          const t = pulse.progress;
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;

          const alpha = 0.4 * Math.sin(t * Math.PI); // fade in/out
          const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
          g.addColorStop(0, rgba(alpha));
          g.addColorStop(1, rgba(0));
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      // --- Draw nodes (on top of connections) ---
      nodes.forEach((n) => {
        if (n.opacity <= 0) return;
        const px = n.x * w;
        const py = n.y * h;

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, n.radius * 3);
        g.addColorStop(0, rgba(n.opacity * 0.25));
        g.addColorStop(1, rgba(0));
        ctx.beginPath();
        ctx.arc(px, py, n.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(n.opacity);
        ctx.fill();
      });

      // --- Readability gradient (left side) ---
      const grad = ctx.createLinearGradient(0, 0, w * 0.4, 0);
      grad.addColorStop(0, 'rgba(34, 28, 43, 0.45)');
      grad.addColorStop(0.6, 'rgba(34, 28, 43, 0.15)');
      grad.addColorStop(1, 'rgba(34, 28, 43, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w * 0.5, h);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, [isMounted]);

  return (
    <section
      className="section--full dark-bg"
      style={{ padding: '100px 48px 120px', position: 'relative', overflow: 'hidden' }}
    >
      {isMounted && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
        {children}
      </div>
    </section>
  );
}
