'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const P = [155, 81, 224]; // accent purple

function rgba(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}

function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function StructuresBehaviourDemo() {
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

    const PARTICLE_COUNT = 20;
    const GRAVITY = 0.00003;
    const DAMPING = 0.995;
    const ATTRACTION = 0.00001;
    const JITTER = 0.00015;
    const WALL_BOUNCE = 0.6;

    let seedCounter = 0;

    function createParticles() {
      const sr = makeSeed(100 + seedCounter++);
      const particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: 0.15 + sr() * 0.7,
          y: 0.15 + sr() * 0.7,
          vx: (sr() - 0.5) * 0.002,
          vy: (sr() - 0.5) * 0.002,
          radius: 3 + sr() * 1.5,
          brightness: 0.4,
          baseBrightness: 0.4,
          stuckTime: 0,
        });
      }
      return particles;
    }

    // Rigid structure: walls dividing into cells with narrow gaps
    // Normalised within 0-1 box for each environment
    const rigidWalls = [
      // Horizontal divider (with gap in centre)
      { x1: 0, y1: 0.5, x2: 0.42, y2: 0.5 },
      { x1: 0.58, y1: 0.5, x2: 1, y2: 0.5 },
      // Vertical dividers top half
      { x1: 0.5, y1: 0, x2: 0.5, y2: 0.42 },
      // Vertical dividers bottom half
      { x1: 0.5, y1: 0.58, x2: 0.5, y2: 1 },
    ];

    // Open structure: gentle curved guides (represented as arcs by control points)
    // We'll use short line segments to approximate curves for collision
    const openGuides = [
      // Gentle curve top-left to centre-right
      { x1: 0.15, y1: 0.3, x2: 0.5, y2: 0.25, curve: true },
      // Gentle curve bottom-right to centre-left
      { x1: 0.85, y1: 0.7, x2: 0.5, y2: 0.75, curve: true },
    ];

    const state = {
      rigid: createParticles(),
      open: createParticles(),
      resetFlash: 0,
    };

    // Copy initial positions to open so they match
    state.open.forEach((p, i) => {
      p.x = state.rigid[i].x;
      p.y = state.rigid[i].y;
      p.vx = state.rigid[i].vx;
      p.vy = state.rigid[i].vy;
    });

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

    // Wall collision
    function collideWall(p, wall) {
      const wx = wall.x2 - wall.x1;
      const wy = wall.y2 - wall.y1;
      const wLen = Math.sqrt(wx * wx + wy * wy);
      if (wLen === 0) return;
      const nx = -wy / wLen;
      const ny = wx / wLen;
      // Distance from particle to wall line
      const dx = p.x - wall.x1;
      const dy = p.y - wall.y1;
      const dist = dx * nx + dy * ny;
      const threshold = 0.02;
      if (Math.abs(dist) < threshold) {
        // Check if particle is within wall segment bounds
        const along = (dx * wx + dy * wy) / (wLen * wLen);
        if (along >= -0.02 && along <= 1.02) {
          // Bounce
          const dot = p.vx * nx + p.vy * ny;
          if ((dist > 0 && dot < 0) || (dist < 0 && dot > 0)) {
            p.vx -= 2 * dot * nx * WALL_BOUNCE;
            p.vy -= 2 * dot * ny * WALL_BOUNCE;
            // Push away from wall
            p.x += nx * (threshold - Math.abs(dist)) * (dist > 0 ? 1 : -1);
            p.y += ny * (threshold - Math.abs(dist)) * (dist > 0 ? 1 : -1);
          }
        }
      }
    }

    function updateParticles(particles, walls, isRigid) {
      if (reduced) return;

      const sr = makeSeed(Date.now() % 10000);

      particles.forEach((p) => {
        // Gravity
        p.vy += GRAVITY;

        // Jitter
        p.vx += (Math.random() - 0.5) * JITTER;
        p.vy += (Math.random() - 0.5) * JITTER;

        // Attraction to nearby particles
        particles.forEach((other) => {
          if (other === p) return;
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01 && dist < 0.15) {
            const force = ATTRACTION / dist;
            p.vx += dx * force;
            p.vy += dy * force;
          }
          // Repulsion when very close
          if (dist > 0 && dist < 0.03) {
            const repel = 0.0001 / (dist * dist);
            p.vx -= dx * repel;
            p.vy -= dy * repel;
          }
        });

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions
        walls.forEach((wall) => collideWall(p, wall));

        // Boundary bounce
        if (p.x < 0.02) { p.x = 0.02; p.vx = Math.abs(p.vx) * WALL_BOUNCE; }
        if (p.x > 0.98) { p.x = 0.98; p.vx = -Math.abs(p.vx) * WALL_BOUNCE; }
        if (p.y < 0.02) { p.y = 0.02; p.vy = Math.abs(p.vy) * WALL_BOUNCE; }
        if (p.y > 0.98) { p.y = 0.98; p.vy = -Math.abs(p.vy) * WALL_BOUNCE; }

        // Brightness based on velocity (flowing = brighter)
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const targetBrightness = isRigid
          ? 0.3 + Math.min(speed * 50, 0.2) // dims when stuck
          : 0.4 + Math.min(speed * 80, 0.4); // brighter when flowing
        p.brightness += (targetBrightness - p.brightness) * 0.05;
      });
    }

    function drawEnvironment(particles, walls, guides, ox, oy, envW, envH, label, isRigid) {
      // Environment border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, envW, envH);

      // Label
      ctx.font = '400 11px "Source Sans 3", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(label, ox + envW / 2, oy - 10);

      // Walls
      walls.forEach((wall) => {
        ctx.beginPath();
        ctx.moveTo(ox + wall.x1 * envW, oy + wall.y1 * envH);
        ctx.lineTo(ox + wall.x2 * envW, oy + wall.y2 * envH);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Guides (curves for open structure)
      if (guides) {
        guides.forEach((g) => {
          ctx.beginPath();
          ctx.moveTo(ox + g.x1 * envW, oy + g.y1 * envH);
          const cpx = ox + ((g.x1 + g.x2) / 2) * envW;
          const cpy = oy + ((g.y1 + g.y2) / 2 + 0.1) * envH;
          ctx.quadraticCurveTo(cpx, cpy, ox + g.x2 * envW, oy + g.y2 * envH);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // Connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.12) {
            ctx.beginPath();
            ctx.moveTo(ox + particles[i].x * envW, oy + particles[i].y * envH);
            ctx.lineTo(ox + particles[j].x * envW, oy + particles[j].y * envH);
            ctx.strokeStyle = rgba(P[0], P[1], P[2], (1 - dist / 0.12) * 0.08);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach((p) => {
        const px = ox + p.x * envW;
        const py = oy + p.y * envH;

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 2.5);
        g.addColorStop(0, rgba(P[0], P[1], P[2], p.brightness * 0.15));
        g.addColorStop(1, rgba(P[0], P[1], P[2], 0));
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(P[0], P[1], P[2], p.brightness);
        ctx.fill();
      });
    }

    function draw(time) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const st = stateRef.current;

      // Update physics
      updateParticles(st.rigid, rigidWalls, true);
      updateParticles(st.open, [], false); // open has no collision walls

      // Layout: two environments side by side
      const gap = w * 0.06;
      const envW = (w - gap * 3) / 2;
      const envH = h * 0.75;
      const topY = h * 0.12;

      drawEnvironment(st.rigid, rigidWalls, null, gap, topY, envW, envH, 'RIGID STRUCTURE', true);
      drawEnvironment(st.open, [], openGuides, gap * 2 + envW, topY, envW, envH, 'OPEN STRUCTURE', false);

      // Reset flash
      if (st.resetFlash > 0) {
        ctx.fillStyle = `rgba(155, 81, 224, ${st.resetFlash * 0.05})`;
        ctx.fillRect(0, 0, w, h);
        st.resetFlash *= 0.92;
        if (st.resetFlash < 0.01) st.resetFlash = 0;
      }

      // Subtle "click to reset" hint at bottom
      ctx.font = '400 11px "Source Sans 3", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK TO RESET', w / 2, h - 10);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, [isMobile]);

  const handleClick = useCallback(() => {
    const st = stateRef.current;
    if (!st) return;

    // Reset both environments with identical starting positions
    const sr = makeSeed(Date.now());
    const newPositions = [];
    for (let i = 0; i < 20; i++) {
      newPositions.push({
        x: 0.15 + sr() * 0.7,
        y: 0.15 + sr() * 0.7,
        vx: (sr() - 0.5) * 0.002,
        vy: (sr() - 0.5) * 0.002,
      });
    }

    st.rigid.forEach((p, i) => {
      if (newPositions[i]) {
        p.x = newPositions[i].x;
        p.y = newPositions[i].y;
        p.vx = newPositions[i].vx;
        p.vy = newPositions[i].vy;
        p.brightness = 0.4;
      }
    });
    st.open.forEach((p, i) => {
      if (newPositions[i]) {
        p.x = newPositions[i].x;
        p.y = newPositions[i].y;
        p.vx = newPositions[i].vx;
        p.vy = newPositions[i].vy;
        p.brightness = 0.4;
      }
    });

    st.resetFlash = 1;
  }, []);

  if (isMobile) return null;

  return (
    <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
        role="img"
        aria-label="Interactive demo: watch identical particles behave differently in two different structures - click to reset and watch them diverge again"
      />
    </div>
  );
}
