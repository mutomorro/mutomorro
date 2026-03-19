'use client';

import { useRef, useEffect, useCallback } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * Shared canvas hook for all Mutomorro canvas animations.
 *
 * Handles:
 * - Canvas ref and 2D context
 * - Device pixel ratio scaling (crisp on retina)
 * - ResizeObserver for responsive containers
 * - requestAnimationFrame loop with cleanup
 * - prefers-reduced-motion (renders single static frame)
 *
 * Usage:
 *   const canvasRef = useCanvas(drawFn);
 *
 * Where drawFn is: (ctx, width, height, time) => void
 * - ctx: CanvasRenderingContext2D (already scaled for DPR)
 * - width: container width in CSS pixels
 * - height: container height in CSS pixels
 * - time: timestamp from requestAnimationFrame (0 for static frame)
 *
 * The drawFn may also be a factory: (ctx, width, height) => (time) => void
 * This lets you initialise nodes/paths once and return a render function.
 * The factory is re-called on resize.
 */
export default function useCanvas(drawFactory) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const renderRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Stable reference to the latest drawFactory
  const drawFactoryRef = useRef(drawFactory);
  drawFactoryRef.current = drawFactory;

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
    ctx.scale(dpr, dpr);

    // Call the factory to get back a render function (or use drawFactory directly)
    const result = drawFactoryRef.current(ctx, w, h);
    renderRef.current = typeof result === 'function' ? result : null;
  }, []);

  useEffect(() => {
    // Find the container (canvas parent)
    const canvas = canvasRef.current;
    if (!canvas) return;
    containerRef.current = canvas.parentElement;

    setup();

    // If reduced motion, render one static frame and stop
    if (prefersReducedMotion) {
      if (renderRef.current) renderRef.current(0);
      return;
    }

    // Animation loop
    let running = true;
    function tick(time) {
      if (!running) return;
      if (renderRef.current) renderRef.current(time);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    // ResizeObserver for responsive containers
    const ro = new ResizeObserver(() => {
      setup();
      if (prefersReducedMotion && renderRef.current) {
        renderRef.current(0);
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [setup, prefersReducedMotion]);

  return canvasRef;
}
