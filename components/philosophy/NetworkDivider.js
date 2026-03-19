'use client';

import { useRef, useEffect, useState } from 'react';

function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const P = [155, 81, 224]; // accent purple

export default function NetworkDivider() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(q.matches);
    const h = (e) => setReduced(e.matches);
    q.addEventListener('change', h);
    return () => q.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const sr = makeSeed(789);

    // Generate nodes spread across full width, clustered vertically around centre
    const NODE_COUNT = 40;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const x = sr(); // full width spread
      const y = 0.25 + sr() * 0.5; // clustered in middle 50%
      nodes.push({
        baseX: x,
        baseY: y,
        x, y,
        radius: 2 + sr() * 3,
        opacity: 0.15 + sr() * 0.25,
        driftPhaseX: sr() * Math.PI * 2,
        driftPhaseY: sr() * Math.PI * 2,
        driftSpeedX: 0.3 + sr() * 0.4,
        driftSpeedY: 0.2 + sr() * 0.3,
        driftAmountX: 0.005 + sr() * 0.01,
        driftAmountY: 0.01 + sr() * 0.02,
      });
    }

    // Build connections - connect nearby nodes
    const edges = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.15) {
          edges.push({ from: i, to: j, baseOpacity: 0.06 + (0.15 - dist) * 0.6 });
        }
      }
    }

    nodesRef.current = { nodes, edges };

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

    function draw(time) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const { nodes, edges } = nodesRef.current;

      // Update positions with drift
      if (!reduced) {
        nodes.forEach((n) => {
          n.x = n.baseX + Math.sin(time * 0.001 * n.driftSpeedX + n.driftPhaseX) * n.driftAmountX;
          n.y = n.baseY + Math.cos(time * 0.001 * n.driftSpeedY + n.driftPhaseY) * n.driftAmountY;
        });
      }

      // Vertical fade: nodes near top/bottom edges fade out
      function verticalFade(ny) {
        if (ny < 0.15) return ny / 0.15;
        if (ny > 0.85) return (1 - ny) / 0.15;
        return 1;
      }

      // Draw edges
      edges.forEach((e) => {
        const n1 = nodes[e.from];
        const n2 = nodes[e.to];
        const fade = Math.min(verticalFade(n1.y), verticalFade(n2.y));
        const alpha = e.baseOpacity * fade;
        if (alpha < 0.005) return;
        ctx.beginPath();
        ctx.moveTo(n1.x * w, n1.y * h);
        ctx.lineTo(n2.x * w, n2.y * h);
        ctx.strokeStyle = `rgba(${P[0]},${P[1]},${P[2]},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((n) => {
        const px = n.x * w;
        const py = n.y * h;
        const fade = verticalFade(n.y);
        const alpha = n.opacity * fade;
        if (alpha < 0.005) return;

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, n.radius * 2.5);
        g.addColorStop(0, `rgba(${P[0]},${P[1]},${P[2]},${alpha * 0.12})`);
        g.addColorStop(1, `rgba(${P[0]},${P[1]},${P[2]},0)`);
        ctx.beginPath();
        ctx.arc(px, py, n.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${P[0]},${P[1]},${P[2]},${alpha})`;
        ctx.fill();
      });

      if (!reduced) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    // Draw at least one static frame
    if (reduced) {
      draw(0);
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <div style={{ width: '100%', height: '100px', position: 'relative', background: '#FFFFFF' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
}
