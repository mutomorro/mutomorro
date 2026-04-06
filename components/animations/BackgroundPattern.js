'use client';

import { useCallback } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import useCanvas from '../hooks/useCanvas';

// --- Shared utilities (from bg-patterns-auto.html v7) ---

const COL = { r: 155, g: 81, b: 224 }; // #9B51E0

function rgba(a) {
  return `rgba(${COL.r},${COL.g},${COL.b},${a})`;
}

function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Drawing functions ---

function createNetwork(ctx, w, h) {
  const sr = makeSeed(42);
  const nodes = [];
  for (let i = 0; i < 40; i++) {
    nodes.push({
      bx: sr() * w, by: sr() * h, x: 0, y: 0,
      r: 3 + sr() * 8,
      phase: sr() * Math.PI * 2,
      speed: 0.5 + sr() * 0.5,
    });
  }
  nodes.forEach((n) => { n.x = n.bx; n.y = n.by; });

  return function render(time) {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach((n) => {
      n.x = n.bx + Math.sin(time * 0.0004 * n.speed + n.phase) * 25;
      n.y = n.by + Math.cos(time * 0.0003 * n.speed + n.phase * 1.3) * 20;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const alpha = (1 - dist / 220) * 0.08;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = rgba(alpha);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    nodes.forEach((n) => {
      const pulse = 0.8 + Math.sin(time * 0.001 + n.phase) * 0.2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(0.05 + 0.03 * pulse);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(0.12 + 0.1 * pulse);
      ctx.fill();
    });
  };
}

function createWoven(ctx, w, h) {
  const sr = makeSeed(400);
  const threads = [];
  for (let i = 0; i < 20; i++) {
    const pts = [];
    let y = sr() * h;
    pts.push({ x: -20, y, cpx: 0, cpy: 0 });
    const numPts = 6 + Math.floor(sr() * 4);
    const stepX = (w + 40) / numPts;
    for (let j = 1; j <= numPts; j++) {
      const px = j * stepX - 20;
      const py = y + (sr() - 0.5) * 120;
      const cpx = px - stepX * 0.5;
      const cpy = (y + py) / 2 + (sr() - 0.5) * 80;
      pts.push({ x: px, y: py, cpx, cpy });
      y = py;
    }
    threads.push({
      pts,
      alpha: 0.05 + sr() * 0.03,
      width: 1 + sr() * 1.5,
      phase: sr() * Math.PI * 2,
      speed: 0.6 + sr() * 0.8,
    });
  }

  return function render(time) {
    ctx.clearRect(0, 0, w, h);
    threads.forEach((t) => {
      const wave = Math.sin(time * 0.00015 * t.speed + t.phase) * 25;
      const alphaShift = 0.75 + Math.sin(time * 0.0002 + t.phase) * 0.25;
      ctx.beginPath();
      ctx.moveTo(t.pts[0].x, t.pts[0].y + wave);
      for (let j = 1; j < t.pts.length; j++) {
        const p = t.pts[j];
        const lw = wave * (1 + Math.sin(j * 0.7 + time * 0.0001) * 0.5);
        ctx.quadraticCurveTo(p.cpx, p.cpy + lw, p.x, p.y + lw);
      }
      ctx.strokeStyle = rgba(t.alpha * alphaShift);
      ctx.lineWidth = t.width;
      ctx.stroke();
    });
  };
}

function createConstellation(ctx, w, h) {
  const sr = makeSeed(200);
  const stars = [];
  for (let i = 0; i < 55; i++) {
    stars.push({
      bx: sr() * w, by: sr() * h, x: 0, y: 0,
      size: 1 + sr() * 2.5,
      phase: sr() * Math.PI * 2,
      twinkleSpeed: 0.0015 + sr() * 0.003,
      speed: 0.5 + sr() * 0.5,
    });
  }
  stars.forEach((st) => { st.x = st.bx; st.y = st.by; });

  return function render(time) {
    ctx.clearRect(0, 0, w, h);
    stars.forEach((st) => {
      st.x = st.bx + Math.sin(time * 0.0002 * st.speed + st.phase) * 15;
      st.y = st.by + Math.cos(time * 0.00015 * st.speed + st.phase * 1.2) * 12;
    });
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = rgba((1 - dist / 160) * 0.15);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    stars.forEach((st) => {
      const tw = 0.5 + Math.sin(time * st.twinkleSpeed + st.phase) * 0.5;
      const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, st.size * 5);
      g.addColorStop(0, rgba(0.25 * tw));
      g.addColorStop(1, rgba(0));
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size * (0.8 + tw * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = rgba(0.3 + 0.3 * tw);
      ctx.fill();
    });
  };
}

// --- Variant map ---

const VARIANTS = {
  network: createNetwork,
  woven: createWoven,
  constellation: createConstellation,
};

// --- Fade overlay gradients ---

const FADE_GRADIENTS = {
  left: 'linear-gradient(90deg, rgba(255,255,255,1) 30%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0) 65%)',
  right: 'linear-gradient(270deg, rgba(255,255,255,1) 30%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0) 65%)',
  'warm-left': 'linear-gradient(90deg, rgba(250,246,241,1) 30%, rgba(250,246,241,0.8) 45%, rgba(250,246,241,0) 65%)',
  'warm-right': 'linear-gradient(270deg, rgba(250,246,241,1) 30%, rgba(250,246,241,0.8) 45%, rgba(250,246,241,0) 65%)',
};

// --- Component ---

export default function BackgroundPattern({ variant = 'network', fade, children, className = '', style = {} }) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <div className={className} style={{ position: 'relative', ...style }}>{children}</div>;
  }

  const createFn = VARIANTS[variant];

  if (!createFn) {
    console.warn(`BackgroundPattern: unknown variant "${variant}". Use: ${Object.keys(VARIANTS).join(', ')}`);
  }

  const drawFactory = useCallback(
    (ctx, w, h) => {
      if (!createFn) return () => {};
      return createFn(ctx, w, h);
    },
    [createFn]
  );

  const canvasRef = useCanvas(drawFactory);

  const fadeGradient = fade ? FADE_GRADIENTS[fade] : null;

  return (
    <div
      className={className}
      style={{ position: 'relative', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {fadeGradient && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: fadeGradient,
            pointerEvents: 'none',
          }}
        />
      )}

      {children}
    </div>
  );
}
