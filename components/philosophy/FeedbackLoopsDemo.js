'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const P = [155, 81, 224]; // accent purple
const PK = [255, 66, 121]; // pink
const AM = [255, 162, 0]; // amber

function rgba(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

export default function FeedbackLoopsDemo() {
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

    const PARTICLE_COUNT = 10;

    // Build loops
    function makeLoop(cx, cy, radius, count) {
      const particles = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        particles.push({
          baseAngle: angle,
          angle: angle,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          radius: 4,
          baseRadius: 4,
        });
      }
      return particles;
    }

    const state = {
      reinforcing: {
        particles: makeLoop(0.25, 0.52, 0.16, PARTICLE_COUNT),
        energy: 1,
        baseEnergy: 1,
        pulseAngle: 0,
        pulseSpeed: 0.8,
        clickCount: 0,
        cx: 0.25,
        cy: 0.52,
        loopRadius: 0.16,
      },
      balancing: {
        particles: makeLoop(0.75, 0.52, 0.16, PARTICLE_COUNT),
        energy: 1,
        baseEnergy: 1,
        pulseAngle: 0,
        pulseSpeed: 0.8,
        pulseDirection: 1,
        clickCount: 0,
        disturbance: 0,
        cx: 0.75,
        cy: 0.52,
        loopRadius: 0.16,
      },
      showReset: false,
    };

    stateRef.current = state;

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
      const dt = reduced ? 0 : 0.016;

      // --- Reinforcing loop ---
      const rl = st.reinforcing;
      if (!reduced) {
        rl.pulseAngle += dt * rl.pulseSpeed * rl.energy * 0.5;
      }
      const rColor = rl.energy > 2.5
        ? lerpColor(P, PK, Math.min((rl.energy - 2.5) / 4, 1))
        : P;

      // Draw reinforcing loop ring
      ctx.beginPath();
      ctx.arc(rl.cx * w, rl.cy * h, rl.loopRadius * w, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(rColor[0], rColor[1], rColor[2], 0.08 + rl.energy * 0.02);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Direction arrow hint (subtle arc arrow)
      const arrowAngle = rl.pulseAngle;
      const ax = rl.cx * w + Math.cos(arrowAngle) * rl.loopRadius * w;
      const ay = rl.cy * h + Math.sin(arrowAngle) * rl.loopRadius * w;
      const arrowSize = 4 + rl.energy * 0.5;
      const tangent = arrowAngle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(ax + Math.cos(tangent - 0.5) * arrowSize, ay + Math.sin(tangent - 0.5) * arrowSize);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax + Math.cos(tangent + 0.5) * arrowSize, ay + Math.sin(tangent + 0.5) * arrowSize);
      ctx.strokeStyle = rgba(rColor[0], rColor[1], rColor[2], 0.3 * Math.min(rl.energy / 2, 1));
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw reinforcing particles
      rl.particles.forEach((p, i) => {
        const angle = p.baseAngle + (reduced ? 0 : Math.sin(time * 0.0005 * rl.energy + i) * 0.03);
        const orbitalSpeed = reduced ? 0 : time * 0.0003 * rl.energy;
        const currentAngle = angle + orbitalSpeed;
        p.x = rl.cx + Math.cos(currentAngle) * rl.loopRadius;
        p.y = rl.cy + Math.sin(currentAngle) * rl.loopRadius;
        const pr = p.baseRadius * (1 + (rl.energy - 1) * 0.15);
        const brightness = 0.35 + Math.min(rl.energy * 0.1, 0.55);

        // Glow
        const gx = p.x * w, gy = p.y * h;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, pr * 3);
        g.addColorStop(0, rgba(rColor[0], rColor[1], rColor[2], brightness * 0.2));
        g.addColorStop(1, rgba(rColor[0], rColor[1], rColor[2], 0));
        ctx.beginPath();
        ctx.arc(gx, gy, pr * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(gx, gy, pr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(rColor[0], rColor[1], rColor[2], brightness);
        ctx.fill();
      });

      // Energy pulse dot (reinforcing)
      const pulseX = rl.cx + Math.cos(rl.pulseAngle) * rl.loopRadius;
      const pulseY = rl.cy + Math.sin(rl.pulseAngle) * rl.loopRadius;
      const pulseSize = 3 + rl.energy * 1.5;
      const pg = ctx.createRadialGradient(pulseX * w, pulseY * h, 0, pulseX * w, pulseY * h, pulseSize * 2);
      pg.addColorStop(0, rgba(rColor[0], rColor[1], rColor[2], 0.8));
      pg.addColorStop(1, rgba(rColor[0], rColor[1], rColor[2], 0));
      ctx.beginPath();
      ctx.arc(pulseX * w, pulseY * h, pulseSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // Label
      ctx.font = '400 11px "Source Sans 3", sans-serif';
      ctx.letterSpacing = '0.12em';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('REINFORCING', rl.cx * w, (rl.cy - rl.loopRadius - 0.06) * h);

      // Connections between adjacent reinforcing particles
      for (let i = 0; i < rl.particles.length; i++) {
        const p1 = rl.particles[i];
        const p2 = rl.particles[(i + 1) % rl.particles.length];
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.strokeStyle = rgba(rColor[0], rColor[1], rColor[2], 0.08 + rl.energy * 0.02);
        ctx.lineWidth = 0.8 + rl.energy * 0.1;
        ctx.stroke();
      }

      // --- Balancing loop ---
      const bl = st.balancing;
      // Balancing energy decays back to base
      if (!reduced && bl.energy > bl.baseEnergy) {
        bl.energy += (bl.baseEnergy - bl.energy) * 0.02;
        if (Math.abs(bl.energy - bl.baseEnergy) < 0.01) bl.energy = bl.baseEnergy;
      }
      if (!reduced && bl.disturbance > 0) {
        bl.disturbance *= 0.97;
        if (bl.disturbance < 0.01) bl.disturbance = 0;
      }
      if (!reduced) {
        bl.pulseAngle += dt * bl.pulseSpeed * bl.pulseDirection;
        // Oscillate direction for balancing
        if (bl.pulseAngle > Math.PI * 1.5) bl.pulseDirection = -1;
        if (bl.pulseAngle < -Math.PI * 0.5) bl.pulseDirection = 1;
      }

      // Draw balancing loop ring
      ctx.beginPath();
      ctx.arc(bl.cx * w, bl.cy * h, bl.loopRadius * w, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(P[0], P[1], P[2], 0.08);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Balancing particles
      bl.particles.forEach((p, i) => {
        // Oscillation effect (push out and spring back on disturbance)
        const pushOut = bl.disturbance * Math.sin(time * 0.005 + i * 0.7) * 0.03;
        const angle = p.baseAngle + (reduced ? 0 : Math.sin(time * 0.0008 + i * 0.6) * 0.05);
        const currentRadius = bl.loopRadius + pushOut;
        p.x = bl.cx + Math.cos(angle) * currentRadius;
        p.y = bl.cy + Math.sin(angle) * currentRadius;
        const pr = p.baseRadius * (1 + bl.disturbance * 0.1);
        const brightness = 0.35 + bl.disturbance * 0.15;

        // Glow
        const gx = p.x * w, gy = p.y * h;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, pr * 3);
        g.addColorStop(0, rgba(P[0], P[1], P[2], brightness * 0.2));
        g.addColorStop(1, rgba(P[0], P[1], P[2], 0));
        ctx.beginPath();
        ctx.arc(gx, gy, pr * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(gx, gy, pr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(P[0], P[1], P[2], brightness);
        ctx.fill();
      });

      // Energy pulse dot (balancing - oscillates)
      const bPulseX = bl.cx + Math.cos(bl.pulseAngle) * bl.loopRadius;
      const bPulseY = bl.cy + Math.sin(bl.pulseAngle) * bl.loopRadius;
      const bPulseSize = 3 + bl.disturbance * 2;
      const bpg = ctx.createRadialGradient(bPulseX * w, bPulseY * h, 0, bPulseX * w, bPulseY * h, bPulseSize * 2);
      bpg.addColorStop(0, rgba(P[0], P[1], P[2], 0.6 + bl.disturbance * 0.2));
      bpg.addColorStop(1, rgba(P[0], P[1], P[2], 0));
      ctx.beginPath();
      ctx.arc(bPulseX * w, bPulseY * h, bPulseSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = bpg;
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('BALANCING', bl.cx * w, (bl.cy - bl.loopRadius - 0.06) * h);

      // Connections between adjacent balancing particles
      for (let i = 0; i < bl.particles.length; i++) {
        const p1 = bl.particles[i];
        const p2 = bl.particles[(i + 1) % bl.particles.length];
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.strokeStyle = rgba(P[0], P[1], P[2], 0.08);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Reset icon (if reinforcing got intense)
      if (rl.clickCount >= 6) {
        st.showReset = true;
        const rx = 0.5 * w, ry = 0.92 * h;
        ctx.beginPath();
        ctx.arc(rx, ry, 10, -Math.PI * 0.8, Math.PI * 0.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Arrow head
        const tipAngle = Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(rx + Math.cos(tipAngle) * 10, ry + Math.sin(tipAngle) * 10);
        ctx.lineTo(rx + Math.cos(tipAngle) * 10 + 4, ry + Math.sin(tipAngle) * 10 - 5);
        ctx.moveTo(rx + Math.cos(tipAngle) * 10, ry + Math.sin(tipAngle) * 10);
        ctx.lineTo(rx + Math.cos(tipAngle) * 10 - 5, ry + Math.sin(tipAngle) * 10 - 3);
        ctx.stroke();
      }

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
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nx = mx / w;
    const ny = my / h;

    // Check reset button
    if (st.showReset && Math.abs(nx - 0.5) < 0.04 && ny > 0.85) {
      st.reinforcing.energy = 1;
      st.reinforcing.clickCount = 0;
      st.balancing.energy = 1;
      st.balancing.disturbance = 0;
      st.showReset = false;
      return;
    }

    // Determine which side was clicked
    if (nx < 0.5) {
      // Reinforcing - energy compounds
      st.reinforcing.energy += 0.6;
      st.reinforcing.clickCount++;
    } else {
      // Balancing - energy spikes then returns
      st.balancing.energy = st.balancing.baseEnergy + 1.5;
      st.balancing.disturbance = 1;
      st.balancing.clickCount++;
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
        aria-label="Interactive demo: click to add energy to reinforcing and balancing feedback loops and watch how they respond differently"
      />
    </div>
  );
}
