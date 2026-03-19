'use client';

import { useRef, useEffect, useState } from 'react';

function makeSeed(n) {
  let s = n;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const P = [155, 81, 224];

// --- Network nodes (created once) ---
function createNodes() {
  const sr = makeSeed(555);
  const count = 22;
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      // Start: spread wide across the full container
      sx: 0.15 + sr() * 0.7,
      sy: 0.15 + sr() * 0.7,
      // End: gathered in the centre third
      ex: 0.33 + sr() * 0.34,
      ey: 0.2 + sr() * 0.6,
      delay: sr() * 0.12,
      phase: sr() * Math.PI * 2,
      size: 1.5 + sr() * 2,
    });
  }
  return nodes;
}

export default function ConvergenceSection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const canvasRef = useRef(null);
  const intentionalWrapRef = useRef(null);
  const ecosystemsWrapRef = useRef(null);
  const intentionalSpanRef = useRef(null);
  const ecosystemsSpanRef = useRef(null);

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const animFrameRef = useRef(null);
  const highlightFired = useRef(false);
  const nodesRef = useRef(null);
  if (!nodesRef.current) nodesRef.current = createNodes();

  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);

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

  // Scroll handler — updates target only
  useEffect(() => {
    if (isMobile || reduced) return;
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // scrolled = how far past the sticky-engage point (section top at viewport top)
      const scrolled = Math.max(0, -rect.top);
      const scrollable = rect.height - vh; // 200vh - 100vh = 100vh
      if (scrollable <= 0) return;
      targetProgress.current = Math.min(1, scrolled / scrollable);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, reduced]);

  // Animation loop
  useEffect(() => {
    if (isMobile || reduced) return;
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;

    const ctx = canvas.getContext('2d');
    const nodes = nodesRef.current;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = content.offsetWidth;
      const h = content.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(content);

    let running = true;

    function tick(time) {
      if (!running) return;

      // Smooth toward target
      smoothProgress.current += (targetProgress.current - smoothProgress.current) * 0.1;
      const p = smoothProgress.current;

      // --- Measure words ---
      const iw = intentionalSpanRef.current?.offsetWidth || 400;
      const ew = ecosystemsSpanRef.current?.offsetWidth || 400;
      const cw = content.offsetWidth;
      const ch = content.offsetHeight;
      const gap = 80;

      // --- Word positions ---
      // Start: words pushed to edges (left-aligned positioning)
      const iStartX = 0; // flush with left padding edge
      const eStartX = cw - ew; // flush with right padding edge

      // End: centred as a pair with gap
      const totalPairWidth = iw + gap + ew;
      const pairLeft = (cw - totalPairWidth) / 2;
      const iEndX = pairLeft;
      const eEndX = pairLeft + iw + gap;

      // Convergence: starts IMMEDIATELY when sticky kicks in (p=0)
      // Completes at p=0.45
      const convergence = smoothstep(Math.min(1, p / 0.45));

      const intentionalX = lerp(iStartX, iEndX, convergence);
      const ecosystemsX = lerp(eStartX, eEndX, convergence);

      // Apply word positions
      if (intentionalWrapRef.current) {
        intentionalWrapRef.current.style.left = intentionalX + 'px';
      }
      if (ecosystemsWrapRef.current) {
        ecosystemsWrapRef.current.style.left = ecosystemsX + 'px';
      }

      // Definitions stay visible throughout
      // (no fade - they travel with the words)

      // Synthesis fade in (0.4 to 0.55)
      const synthOpacity = Math.max(0, Math.min(1, (p - 0.4) / 0.15));
      const synthEl = document.querySelector('.conv-synth');
      if (synthEl) synthEl.style.opacity = String(synthOpacity);

      // Highlight
      if (p >= 0.55 && !highlightFired.current) {
        highlightFired.current = true;
        setHighlightActive(true);
      }

      // --- Canvas ---
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Network alpha: visible from the start but faint, grows with convergence
      const netAlpha = 0.3 + convergence * 0.7;
      if (netAlpha <= 0) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      // Node positions
      const positions = nodes.map((n) => {
        const nConv = smoothstep(Math.max(0, Math.min(1, convergence * 1.15 - n.delay)));
        const x = lerp(n.sx * w, n.ex * w, nConv);
        const y = lerp(n.sy * h, n.ey * h, nConv);

        // Gentle ambient pulse in resolved state
        let pulse = 0;
        if (p > 0.5 && time) {
          pulse = Math.sin(time * 0.0008 + n.phase) * 0.03;
        }

        return { x, y, size: n.size, pulse };
      });

      // Connections
      const connThreshold = lerp(100, 130, convergence);
      const connAlpha = lerp(0.04, 0.12, convergence) * netAlpha;
      const nodeAlpha = lerp(0.06, 0.22, convergence) * netAlpha;

      if (connAlpha > 0.002) {
        for (let i = 0; i < positions.length; i++) {
          for (let j = i + 1; j < positions.length; j++) {
            const dx = positions[i].x - positions[j].x;
            const dy = positions[i].y - positions[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connThreshold) {
              const a = (1 - dist / connThreshold) * connAlpha;
              ctx.beginPath();
              ctx.moveTo(positions[i].x, positions[i].y);
              ctx.lineTo(positions[j].x, positions[j].y);
              ctx.strokeStyle = `rgba(${P[0]},${P[1]},${P[2]},${a})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      // Nodes
      positions.forEach((pos) => {
        const a = nodeAlpha + pos.pulse;
        if (a < 0.003) return;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${P[0]},${P[1]},${P[2]},${a * 0.15})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${P[0]},${P[1]},${P[2]},${a})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [isMobile, reduced]);

  // --- Reduced motion ---
  if (reduced) {
    return (
      <section style={{ padding: '80px 48px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            fontSize: '13px', fontWeight: '400', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#9B51E0', display: 'block', marginBottom: '2rem',
          }}>The approach</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'left', maxWidth: '340px' }}>
              <span style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '400', letterSpacing: '-0.03em', lineHeight: '1.0', color: '#000' }}>
                Intentional
              </span>
              <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '300', lineHeight: '1.65', color: 'var(--black)' }}>
                Conscious, deliberate design of how your organisation works. Not reacting to what emerges, but creating the conditions where good things happen naturally.
              </p>
            </div>
            <div style={{ textAlign: 'right', maxWidth: '340px' }}>
              <span style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '400', letterSpacing: '-0.03em', lineHeight: '1.0', color: '#000' }}>
                Ecosystems
              </span>
              <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '300', lineHeight: '1.65', color: 'var(--black)' }}>
                Recognising your organisation as a living, interconnected, adaptive system. Not a collection of parts to manage separately, but a dynamic environment where everything influences everything else.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: '400', lineHeight: '1.65', color: '#000', maxWidth: '680px', margin: '0 auto' }}>
            Together: <span style={{
              background: 'linear-gradient(to right, rgba(155,81,224,0.12), rgba(155,81,224,0.12))',
              backgroundSize: '100% 40%', backgroundRepeat: 'no-repeat', backgroundPosition: '0 85%',
            }}>creating the environment where your organisation thrives</span> - not once, but continuously. Seeing the patterns underneath. Working with the whole, not just the parts.
          </p>
        </div>
      </section>
    );
  }

  // --- Mobile ---
  if (isMobile) {
    return (
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span className="kicker scroll-in" style={{ color: 'var(--accent)', marginBottom: '24px', textAlign: 'center', display: 'block' }}>
            The approach
          </span>
          <div className="scroll-in" style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: '400', letterSpacing: '-0.02em', display: 'block', marginBottom: '12px' }}>
              Intentional
            </span>
            <p className="body-text" style={{ color: 'var(--black)' }}>
              Conscious, deliberate design of how your organisation works. Not reacting to what emerges, but creating the conditions where good things happen naturally.
            </p>
          </div>
          <div className="scroll-in" style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: '400', letterSpacing: '-0.02em', display: 'block', marginBottom: '12px' }}>
              Ecosystems
            </span>
            <p className="body-text" style={{ color: 'var(--black)' }}>
              Recognising your organisation as a living, interconnected, adaptive system. Not a collection of parts to manage separately, but a dynamic environment where everything influences everything else.
            </p>
          </div>
          <div className="scroll-in">
            <p style={{ fontSize: '1.1rem', fontWeight: '400', lineHeight: '1.65' }}>
              Together: creating the environment where your organisation thrives - not once, but continuously. Seeing the patterns underneath. Working with the whole, not just the parts.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // --- Desktop ---
  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '200vh',
        background: '#FFFFFF',
      }}
    >
      {/* Sticky container - fills viewport, pins in place */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Content container - words and canvas share this coordinate space */}
        <div
          ref={contentRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxWidth: '1350px',
            margin: '0 auto',
            padding: '0 48px',
            boxSizing: 'border-box',
          }}
        >
          {/* Canvas - BEHIND everything, same coordinate space as words */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'block',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Kicker */}
          <span style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '13px',
            fontWeight: '400',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#9B51E0',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}>
            The approach
          </span>

          {/* Intentional — left-positioned by animation loop */}
          <div
            ref={intentionalWrapRef}
            style={{
              position: 'absolute',
              left: 0,
              top: '32%',
              zIndex: 1,
            }}
          >
            <span
              ref={intentionalSpanRef}
              style={{
                fontSize: 'clamp(52px, 8vw, 96px)',
                fontWeight: '400',
                letterSpacing: '-0.03em',
                lineHeight: '1.0',
                color: '#000000',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              Intentional
            </span>
            <p
              className="conv-def"
              style={{
                marginTop: '20px',
                maxWidth: '340px',
                fontSize: '16px',
                fontWeight: '300',
                lineHeight: '1.65',
                color: 'var(--black)',
              }}
            >
              Conscious, deliberate design of how your organisation works. Not reacting to what emerges, but creating the conditions where good things happen naturally.
            </p>
          </div>

          {/* Ecosystems — left-positioned by animation loop */}
          <div
            ref={ecosystemsWrapRef}
            style={{
              position: 'absolute',
              left: 0,
              top: '32%',
              textAlign: 'right',
              zIndex: 1,
            }}
          >
            <span
              ref={ecosystemsSpanRef}
              style={{
                fontSize: 'clamp(52px, 8vw, 96px)',
                fontWeight: '400',
                letterSpacing: '-0.03em',
                lineHeight: '1.0',
                color: '#000000',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              Ecosystems
            </span>
            <p
              className="conv-def"
              style={{
                marginTop: '20px',
                maxWidth: '340px',
                fontSize: '16px',
                fontWeight: '300',
                lineHeight: '1.65',
                color: 'var(--black)',
                marginLeft: 'auto',
              }}
            >
              Recognising your organisation as a living, interconnected, adaptive system. Not a collection of parts to manage separately, but a dynamic environment where everything influences everything else.
            </p>
          </div>

          {/* Synthesis */}
          <div
            className="conv-synth"
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              maxWidth: '680px',
              opacity: 0,
              zIndex: 1,
            }}
          >
            <p style={{
              fontSize: '1.15rem',
              fontWeight: '400',
              lineHeight: '1.65',
              color: '#000000',
              margin: 0,
            }}>
              Together:{' '}
              <span style={{
                background: 'linear-gradient(to right, rgba(155,81,224,0.12), rgba(155,81,224,0.12))',
                backgroundSize: highlightActive ? '100% 40%' : '0% 40%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 85%',
                transition: 'background-size 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}>
                creating the environment where your organisation thrives
              </span>{' '}
              - not once, but continuously. Seeing the patterns underneath. Working with the whole, not just the parts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
