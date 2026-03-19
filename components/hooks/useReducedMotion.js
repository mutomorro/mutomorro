'use client';

import { useState, useEffect } from 'react';

/**
 * Hook that detects prefers-reduced-motion media query.
 * Returns true if the user has requested reduced motion.
 *
 * All canvas animations should check this and either:
 * - Render a single static frame (preferred)
 * - Skip animation entirely
 */
export default function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
