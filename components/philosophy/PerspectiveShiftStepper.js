'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// --- Shift content data ---
const SHIFTS = [
  {
    from: 'Disconnection',
    to: 'Interconnectedness',
    body: 'Traditional thinking treats everything separately - strategy here, culture there, people in their silos. Systems thinking sees how everything connects. How you structure work shapes what culture emerges. Change one thing and it ripples through everything.',
  },
  {
    from: 'Linear',
    to: 'Circular',
    body: "Traditional thinking follows straight lines - do this, get that. Systems thinking sees feedback loops. Today's solution shapes tomorrow's challenge. Success in one area creates dynamics that circle back. Nothing moves in straight lines.",
  },
  {
    from: 'Silos',
    to: 'Emergence',
    body: "Traditional thinking sees the organisation as the sum of its parts. Improve each piece, the whole improves. Systems thinking understands emergence - the whole becomes something none of the parts could create alone. Capability comes from how people work together, not just individual skills.",
  },
  {
    from: 'Parts',
    to: 'Wholes',
    body: "Traditional thinking breaks things down to understand them - analyse each piece, fix what's broken. Systems thinking sees the whole first. What patterns are all the pieces creating together? Where are the leverage points that shift everything at once?",
  },
  {
    from: 'Analysis',
    to: 'Synthesis',
    body: "Traditional thinking analyses - breaking complex situations into manageable pieces to understand them separately. Systems thinking synthesises - bringing the pieces back together to see how they interact, reinforce, and create the patterns you're experiencing.",
  },
  {
    from: 'Isolation',
    to: 'Relationships',
    body: "Traditional thinking focuses on things themselves - is the strategy good? Is the structure right? Systems thinking focuses on the relationships between things. How strategy connects to culture. How structure shapes collaboration. That's where transformation happens.",
  },
];

// --- Colours ---
const COL = {
  purple: [155, 81, 224],
  pink: [255, 66, 121],
  amber: [255, 162, 0],
  deepPurple: [128, 56, 143],
};

function rgba(col, a) {
  return `rgba(${col[0]},${col[1]},${col[2]},${a})`;
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

// --- Seeded random ---
function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Easing ---
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// --- State generators ---
// Each returns { particles: [...], connections: [...] }

function generateState0(sr, count) {
  // Interconnectedness: richly connected network with clusters
  const particles = [];
  const clusterCentres = [
    { x: 0.2, y: 0.25 },
    { x: 0.75, y: 0.2 },
    { x: 0.3, y: 0.7 },
    { x: 0.8, y: 0.65 },
    { x: 0.5, y: 0.45 },
  ];
  for (let i = 0; i < count; i++) {
    const cluster = clusterCentres[i % clusterCentres.length];
    particles.push({
      x: cluster.x + (sr() - 0.5) * 0.22,
      y: cluster.y + (sr() - 0.5) * 0.22,
      radius: 3 + sr() * 4,
      opacity: 0.5 + sr() * 0.4,
      color: COL.purple,
    });
  }
  const connections = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.28) {
        const iCluster = i % clusterCentres.length;
        const jCluster = j % clusterCentres.length;
        const crossCluster = iCluster !== jCluster;
        connections.push({
          from: i,
          to: j,
          opacity: crossCluster ? 0.2 + (1 - dist / 0.28) * 0.15 : (1 - dist / 0.28) * 0.15,
          width: crossCluster ? 1.5 : 1,
          color: COL.purple,
        });
      }
    }
  }
  return { particles, connections };
}

function generateState1(sr, count) {
  // Circular: particles on an elliptical loop + some outside
  const particles = [];
  const cx = 0.5, cy = 0.5, rx = 0.32, ry = 0.28;
  const ringCount = 35;
  for (let i = 0; i < count; i++) {
    if (i < ringCount) {
      const angle = (i / ringCount) * Math.PI * 2;
      particles.push({
        x: cx + Math.cos(angle) * rx + (sr() - 0.5) * 0.02,
        y: cy + Math.sin(angle) * ry + (sr() - 0.5) * 0.02,
        radius: 3 + sr() * 3,
        opacity: 0.6 + sr() * 0.3,
        color: COL.purple,
      });
    } else {
      const angle = sr() * Math.PI * 2;
      const dist = 0.35 + sr() * 0.12;
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        radius: 2 + sr() * 3,
        opacity: 0.3 + sr() * 0.3,
        color: COL.purple,
      });
    }
  }
  const connections = [];
  for (let i = 0; i < ringCount; i++) {
    connections.push({
      from: i, to: (i + 1) % ringCount,
      opacity: 0.18, width: 1.2, color: COL.purple,
    });
  }
  for (let i = 0; i < ringCount; i += 5) {
    const across = (i + Math.floor(ringCount / 2.5)) % ringCount;
    connections.push({
      from: i, to: across,
      opacity: 0.08, width: 0.8, color: COL.purple,
    });
  }
  for (let i = ringCount; i < count; i++) {
    const nearest = Math.floor(sr() * ringCount);
    connections.push({
      from: i, to: nearest,
      opacity: 0.1, width: 0.8, color: COL.purple,
    });
  }
  return { particles, connections };
}

function generateState2(sr, count) {
  // Emergence: flowing S-curve / wave
  const particles = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = 0.08 + t * 0.84;
    const baseY = 0.5 + Math.sin(t * Math.PI * 2.5) * 0.25;
    const curveIntensity = Math.abs(Math.cos(t * Math.PI * 2.5));
    const scatter = 0.02 + (1 - curveIntensity) * 0.03;
    particles.push({
      x: x + (sr() - 0.5) * 0.02,
      y: baseY + (sr() - 0.5) * scatter,
      radius: 2.5 + curveIntensity * 3 + sr() * 2,
      opacity: 0.45 + curveIntensity * 0.35,
      color: lerpColor(COL.purple, COL.pink, t * 0.3),
    });
  }
  const connections = [];
  for (let i = 0; i < count - 1; i++) {
    connections.push({
      from: i, to: i + 1,
      opacity: 0.15, width: 1, color: COL.purple,
    });
    if (i + 3 < count && sr() > 0.6) {
      connections.push({
        from: i, to: i + 3,
        opacity: 0.08, width: 0.7, color: COL.purple,
      });
    }
  }
  return { particles, connections };
}

function generateState3(sr, count) {
  // Wholes: concentric rings
  const particles = [];
  const cx = 0.5, cy = 0.5;
  const rings = [
    { r: 0.08, count: 8, radiusMul: 1.4, opacityMul: 1.2 },
    { r: 0.2, count: 18, radiusMul: 1, opacityMul: 1 },
    { r: 0.34, count: 24, radiusMul: 0.9, opacityMul: 0.85 },
  ];
  let idx = 0;
  rings.forEach((ring) => {
    for (let i = 0; i < ring.count && idx < count; i++, idx++) {
      const angle = (i / ring.count) * Math.PI * 2 + (sr() - 0.5) * 0.15;
      particles.push({
        x: cx + Math.cos(angle) * ring.r + (sr() - 0.5) * 0.015,
        y: cy + Math.sin(angle) * ring.r + (sr() - 0.5) * 0.015,
        radius: (3 + sr() * 3) * ring.radiusMul,
        opacity: (0.5 + sr() * 0.3) * ring.opacityMul,
        color: ring.r < 0.12 ? lerpColor(COL.purple, COL.pink, 0.2) : COL.purple,
      });
    }
  });
  while (idx < count) {
    const angle = sr() * Math.PI * 2;
    const r = 0.12 + sr() * 0.24;
    particles.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 2 + sr() * 2,
      opacity: 0.3 + sr() * 0.2,
      color: COL.purple,
    });
    idx++;
  }
  const connections = [];
  let offset = 0;
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.count; i++) {
      const next = offset + (i + 1) % ring.count;
      connections.push({
        from: offset + i, to: next,
        opacity: 0.12, width: 1, color: COL.purple,
      });
      if (ri < rings.length - 1) {
        const nextRingOffset = offset + ring.count;
        const target = nextRingOffset + Math.floor((i / ring.count) * rings[ri + 1].count);
        if (target < count) {
          connections.push({
            from: offset + i, to: target,
            opacity: 0.08, width: 0.7, color: COL.purple,
          });
        }
      }
    }
    offset += ring.count;
  });
  return { particles, connections };
}

function generateState4(sr, count) {
  // Synthesis: three overlapping clusters (Venn)
  const particles = [];
  const centres = [
    { x: 0.32, y: 0.35, color: COL.purple },
    { x: 0.68, y: 0.35, color: COL.pink },
    { x: 0.5, y: 0.65, color: COL.amber },
  ];
  const perCluster = Math.floor(count / 3);
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < perCluster; i++) {
      const angle = sr() * Math.PI * 2;
      const dist = sr() * 0.18;
      const x = centres[c].x + Math.cos(angle) * dist;
      const y = centres[c].y + Math.sin(angle) * dist;
      let overlapCount = 0;
      centres.forEach((other, oi) => {
        if (oi !== c) {
          const dx = x - other.x;
          const dy = y - other.y;
          if (Math.sqrt(dx * dx + dy * dy) < 0.2) overlapCount++;
        }
      });
      const inOverlap = overlapCount > 0;
      particles.push({
        x, y,
        radius: inOverlap ? 4 + sr() * 3 : 2.5 + sr() * 3,
        opacity: inOverlap ? 0.7 + sr() * 0.25 : 0.35 + sr() * 0.3,
        color: inOverlap ? lerpColor(centres[c].color, centres[(c + 1) % 3].color, 0.5) : centres[c].color,
      });
    }
  }
  for (let i = particles.length; i < count; i++) {
    const c = i % 3;
    const angle = sr() * Math.PI * 2;
    const dist = sr() * 0.16;
    particles.push({
      x: centres[c].x + Math.cos(angle) * dist,
      y: centres[c].y + Math.sin(angle) * dist,
      radius: 2 + sr() * 2,
      opacity: 0.3 + sr() * 0.2,
      color: centres[c].color,
    });
  }
  const connections = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.14) {
        const iCluster = Math.floor(i / perCluster);
        const jCluster = Math.floor(j / perCluster);
        const crossCluster = iCluster !== jCluster && iCluster < 3 && jCluster < 3;
        connections.push({
          from: i, to: j,
          opacity: crossCluster ? 0.2 : 0.1,
          width: crossCluster ? 1.5 : 0.8,
          color: crossCluster
            ? lerpColor(particles[i].color, particles[j].color, 0.5)
            : particles[i].color,
        });
      }
    }
  }
  return { particles, connections };
}

function generateState5(sr, count) {
  // Relationships: even spread, connections are the focus
  const particles = [];
  const cols = 8;
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    particles.push({
      x: 0.1 + (col / (cols - 1)) * 0.8 + (sr() - 0.5) * 0.06,
      y: 0.1 + (row / (rows - 1)) * 0.8 + (sr() - 0.5) * 0.06,
      radius: 2.5 + sr() * 1.5,
      opacity: 0.25 + sr() * 0.15,
      color: COL.purple,
    });
  }
  const connections = [];
  for (let i = 0; i < count; i++) {
    const dists = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      dists.push({ j, dist: Math.sqrt(dx * dx + dy * dy) });
    }
    dists.sort((a, b) => a.dist - b.dist);
    const neighbourCount = 3 + Math.floor(sr() * 2);
    for (let n = 0; n < neighbourCount && n < dists.length; n++) {
      const j = dists[n].j;
      if (i < j) {
        const t = dists[n].dist / 0.35;
        connections.push({
          from: i, to: j,
          opacity: 0.25 + (1 - t) * 0.25,
          width: 1.5 + (1 - t) * 1.5,
          color: lerpColor(COL.purple, t > 0.5 ? COL.amber : COL.pink, t),
        });
      }
    }
  }
  return { particles, connections };
}

const STATE_GENERATORS = [
  generateState0, generateState1, generateState2,
  generateState3, generateState4, generateState5,
];

// --- The Component ---

export default function PerspectiveShiftStepper() {
  const [activeShift, setActiveShift] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);
  const shiftRefs = useRef([]);
  const animStateRef = useRef(null);
  const rafRef = useRef(null);
  const sectionRef = useRef(null);
  const isVisibleRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const needsDrawRef = useRef(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = query.matches;
    const handler = (e) => { reducedMotionRef.current = e.matches; };
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  // Intersection observer for shift blocks
  useEffect(() => {
    if (isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            const idx = parseInt(entry.target.dataset.shift);
            if (!isNaN(idx)) setActiveShift(idx);
          }
        });
      },
      { threshold: [0.35, 0.6], rootMargin: '-10% 0px -30% 0px' }
    );
    shiftRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isMobile]);

  // Section visibility observer
  useEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile]);

  // --- Canvas animation system ---
  const initCanvas = useCallback(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const PARTICLE_COUNT = 50;
    const TRANSITION_DURATION = 800;
    const sr = makeSeed(777);

    // Generate all 6 target states upfront
    const allStates = STATE_GENERATORS.map((gen, i) => {
      const localSr = makeSeed(42 + i * 100);
      return gen(localSr, PARTICLE_COUNT);
    });

    // Ensure all states have exactly PARTICLE_COUNT particles
    allStates.forEach((state) => {
      while (state.particles.length < PARTICLE_COUNT) {
        state.particles.push({
          x: sr() * 0.8 + 0.1, y: sr() * 0.8 + 0.1,
          radius: 2, opacity: 0.1, color: COL.purple,
        });
      }
    });

    // Initialise particles at state 0 resolved positions (pre-resolved)
    const particles = allStates[0].particles.map((p) => ({
      x: p.x, y: p.y,
      radius: p.radius, opacity: p.opacity,
      color: [...p.color],
      tx: p.x, ty: p.y, tr: p.radius, to: p.opacity, tc: [...p.color],
      sx: p.x, sy: p.y, sr: p.radius, so: p.opacity, sc: [...p.color],
    }));

    // Initialise connections at state 0
    const MAX_CONNECTIONS = 300;
    const connections = [];
    allStates[0].connections.slice(0, MAX_CONNECTIONS).forEach((c) => {
      connections.push({
        from: c.from, to: c.to,
        opacity: c.opacity, width: c.width, color: [...c.color],
        to2: c.opacity, tw: c.width, tc: [...c.color],
        so: c.opacity, sw: c.width, sc: [...c.color],
      });
    });

    // Pulse trackers for state 5
    const pulses = [];
    for (let i = 0; i < 5; i++) {
      pulses.push({
        connectionIdx: Math.floor(sr() * 20),
        progress: sr(), speed: 0.3 + sr() * 0.5, active: false,
      });
    }

    animStateRef.current = {
      particles, connections, allStates,
      transitionStart: 0, transitioning: false, settledAt: 0,
      currentState: 0, pulses,
      PARTICLE_COUNT, TRANSITION_DURATION, MAX_CONNECTIONS,
    };

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      needsDrawRef.current = true;
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function draw(time) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const st = animStateRef.current;

      // Draw connections
      connections.forEach((c, ci) => {
        if (c.opacity < 0.005) return;
        const p1 = particles[c.from];
        const p2 = particles[c.to];
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.strokeStyle = rgba(c.color, c.opacity);
        ctx.lineWidth = c.width;
        ctx.stroke();

        // Pulses for state 5 only during hold
        if (st.currentState === 5 && !st.transitioning && !reducedMotionRef.current) {
          st.pulses.forEach((pulse) => {
            if (pulse.connectionIdx === ci % connections.length && c.opacity > 0.15) {
              pulse.active = true;
              pulse.progress += pulse.speed * 0.008;
              if (pulse.progress > 1) {
                pulse.progress = 0;
                pulse.connectionIdx = (pulse.connectionIdx + 7) % Math.min(connections.length, 40);
              }
              const px = p1.x * w + (p2.x * w - p1.x * w) * pulse.progress;
              const py = p1.y * h + (p2.y * h - p1.y * h) * pulse.progress;
              const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
              g.addColorStop(0, rgba(COL.purple, 0.7));
              g.addColorStop(1, rgba(COL.purple, 0));
              ctx.beginPath();
              ctx.arc(px, py, 6, 0, Math.PI * 2);
              ctx.fillStyle = g;
              ctx.fill();
            }
          });
        }
      });

      // Draw particles
      particles.forEach((p, i) => {
        if (p.opacity < 0.01) return;
        const px = p.x * w;
        const py = p.y * h;

        // Ambient life when holding (not transitioning)
        let drawOpacity = p.opacity;
        let drawRadius = p.radius;
        let drawX = px;
        let drawY = py;
        if (!st.transitioning && !reducedMotionRef.current && time) {
          const pulsePhase = i * 0.7;
          const wave = Math.sin((time * 0.001 + pulsePhase) * 0.5);
          drawOpacity += wave * 0.15;
          drawOpacity = Math.max(0, drawOpacity);
          drawRadius *= 1 + wave * 0.08; // subtle size breath
          // Subtle position drift - each node wanders its own little orbit
          // Ease drift in over 600ms after transition settles to avoid jolt
          const driftFade = st.settledAt > 0 ? Math.min(1, (time - st.settledAt) / 600) : 1;
          const driftPhaseX = i * 1.3 + 0.5;
          const driftPhaseY = i * 0.9 + 2.1;
          drawX += Math.sin((time * 0.0007 + driftPhaseX) * 0.6) * 3 * driftFade;
          drawY += Math.cos((time * 0.0006 + driftPhaseY) * 0.5) * 3 * driftFade;
        }

        const glowR = drawRadius * 2.5;
        const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowR);
        g.addColorStop(0, rgba(p.color, drawOpacity * 0.15));
        g.addColorStop(1, rgba(p.color, 0));
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(p.color, drawOpacity);
        ctx.fill();
      });
    }

    // Animation loop
    function tick(time) {
      if (!isVisibleRef.current && !animStateRef.current.transitioning) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const st = animStateRef.current;
      const reduced = reducedMotionRef.current;

      // If transitioning, lerp particles toward targets
      if (st.transitioning) {
        const elapsed = time - st.transitionStart;
        let t = Math.min(elapsed / st.TRANSITION_DURATION, 1);
        t = easeOutCubic(t);
        if (reduced) t = 1;

        particles.forEach((p) => {
          p.x = p.sx + (p.tx - p.sx) * t;
          p.y = p.sy + (p.ty - p.sy) * t;
          p.radius = p.sr + (p.tr - p.sr) * t;
          p.opacity = p.so + (p.to - p.so) * t;
          p.color[0] = p.sc[0] + (p.tc[0] - p.sc[0]) * t;
          p.color[1] = p.sc[1] + (p.tc[1] - p.sc[1]) * t;
          p.color[2] = p.sc[2] + (p.tc[2] - p.sc[2]) * t;
        });
        connections.forEach((c) => {
          c.opacity = c.so + (c.to2 - c.so) * t;
          c.width = c.sw + (c.tw - c.sw) * t;
          c.color[0] = c.sc[0] + (c.tc[0] - c.sc[0]) * t;
          c.color[1] = c.sc[1] + (c.tc[1] - c.sc[1]) * t;
          c.color[2] = c.sc[2] + (c.tc[2] - c.sc[2]) * t;
        });

        needsDrawRef.current = true;

        if (t >= 1) {
          // Snap to exact targets
          particles.forEach((p) => {
            p.x = p.tx; p.y = p.ty;
            p.radius = p.tr; p.opacity = p.to;
            p.color = [...p.tc];
          });
          connections.forEach((c) => {
            c.opacity = c.to2; c.width = c.tw;
            c.color = [...c.tc];
          });
          st.transitioning = false;
          st.settledAt = time;
          needsDrawRef.current = true;
        }
      }

      // Ambient pulse (all states) and state 5 connection pulses need continuous drawing
      const needsAmbient = !st.transitioning && !reduced;

      if (needsDrawRef.current || needsAmbient) {
        draw(time);
        if (!needsAmbient) {
          needsDrawRef.current = false;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // Initial draw (state 0 is pre-resolved)
    needsDrawRef.current = true;
    rafRef.current = requestAnimationFrame(tick);

    return () => { ro.disconnect(); };
  }, [isMobile]);

  // Init canvas
  useEffect(() => {
    const cleanup = initCanvas();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (cleanup) cleanup();
    };
  }, [initCanvas]);

  // Transition to new state when activeShift changes
  useEffect(() => {
    const st = animStateRef.current;
    if (!st || isMobile) return;

    const targetState = st.allStates[activeShift];
    if (!targetState) return;

    // Set start = current, target = new state
    st.particles.forEach((p, i) => {
      p.sx = p.x; p.sy = p.y; p.sr = p.radius;
      p.so = p.opacity; p.sc = [...p.color];
      const tp = targetState.particles[i];
      if (tp) {
        p.tx = tp.x; p.ty = tp.y; p.tr = tp.radius;
        p.to = tp.opacity; p.tc = [...tp.color];
      }
    });

    // Rebuild connections
    const targetConns = targetState.connections.slice(0, st.MAX_CONNECTIONS);
    const newConns = [];
    for (let i = 0; i < Math.max(st.connections.length, targetConns.length); i++) {
      if (i < targetConns.length) {
        const tc = targetConns[i];
        const existing = i < st.connections.length ? st.connections[i] : null;
        newConns.push({
          from: tc.from, to: tc.to,
          opacity: existing ? existing.opacity : 0,
          width: existing ? existing.width : 0.5,
          color: existing ? [...existing.color] : [...tc.color],
          to2: tc.opacity, tw: tc.width, tc: [...tc.color],
          so: existing ? existing.opacity : 0,
          sw: existing ? existing.width : 0.5,
          sc: existing ? [...existing.color] : [...tc.color],
        });
      } else if (i < st.connections.length) {
        const ec = st.connections[i];
        newConns.push({
          from: ec.from, to: ec.to,
          opacity: ec.opacity, width: ec.width, color: [...ec.color],
          to2: 0, tw: 0, tc: [...ec.color],
          so: ec.opacity, sw: ec.width, sc: [...ec.color],
        });
      }
    }
    st.connections.length = 0;
    newConns.forEach((c) => st.connections.push(c));

    st.currentState = activeShift;
    st.transitionStart = performance.now();
    st.transitioning = true;
    needsDrawRef.current = true;
  }, [activeShift, isMobile]);

  // --- Mobile fallback ---
  if (isMobile) {
    return (
      <section className="section--full" style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div className="scroll-in" style={{ marginBottom: '3rem' }}>
            <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              Shifting perspectives
            </span>
            <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
              Six ideas that change how organisations work
            </h2>
            <p className="body-text" style={{ maxWidth: '620px', margin: 0 }}>
              Systems thinking isn't just another framework - it's a fundamentally different way of seeing.
              These ideas shape how we work with every organisation we help.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SHIFTS.map((shift, index) => (
              <div
                key={shift.from}
                className="scroll-in"
                style={{
                  padding: '2rem 0',
                  borderBottom: index < SHIFTS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', marginBottom: '16px', display: 'block' }}>
                  {String(index + 1).padStart(2, '0')} / 06
                </span>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '400',
                    lineHeight: '1.2', color: 'rgba(0,0,0,0.25)', marginBottom: '4px',
                  }}>
                    From {shift.from}
                  </div>
                  <div style={{
                    fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '400',
                    lineHeight: '1.2', color: 'var(--black)',
                  }}>
                    To {shift.to}
                  </div>
                </div>
                <p className="body-text" style={{ margin: 0, color: 'var(--black)' }}>
                  {shift.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- Desktop: sticky stepper ---
  return (
    <section
      ref={sectionRef}
      className="section--full section-padding"
      style={{ background: 'var(--white)' }}
    >
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        {/* Section intro */}
        <div className="scroll-in" style={{ marginBottom: '3rem' }}>
          <span className="kicker" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
            Shifting perspectives
          </span>
          <h2 className="heading-h2" style={{ margin: '0 0 16px', maxWidth: '600px' }}>
            Six shifts that change how you see your organisation
          </h2>
          <p className="body-text" style={{ maxWidth: '620px', margin: 0 }}>
            Systems thinking isn't just another framework - it's a fundamentally different way of seeing.
            Here are the shifts that change what you notice, and what becomes possible.
          </p>
        </div>

        {/* Stepper grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '45% 50%',
          gap: '5%',
          position: 'relative',
        }}>
          {/* Left: scrolling text */}
          <div>
            {SHIFTS.map((shift, index) => (
              <div
                key={shift.from}
                ref={(el) => { shiftRefs.current[index] = el; }}
                data-shift={index}
                style={{
                  minHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '2rem 0',
                  borderLeft: activeShift === index ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: '2rem',
                  transition: 'border-color 0.4s ease',
                }}
              >
                <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', marginBottom: '16px', display: 'block' }}>
                  {String(index + 1).padStart(2, '0')} / 06
                </span>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: 'clamp(28px, 3.5vw, 42px)',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    letterSpacing: '-0.01em',
                    color: 'rgba(0,0,0,0.25)',
                    marginBottom: '4px',
                  }}>
                    From {shift.from}
                  </div>
                  <div style={{
                    fontSize: 'clamp(28px, 3.5vw, 42px)',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    letterSpacing: '-0.01em',
                    color: 'var(--black)',
                  }}>
                    To {shift.to}
                  </div>
                </div>
                <p className="body-text" style={{ margin: 0, color: 'var(--black)' }}>
                  {shift.body}
                </p>
              </div>
            ))}
          </div>

          {/* Right: sticky canvas */}
          <div style={{
            position: 'sticky',
            top: '15vh',
            height: '70vh',
            alignSelf: 'start',
          }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Visual demonstration of six perspective shifts in systems thinking"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
