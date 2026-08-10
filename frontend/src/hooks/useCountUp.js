// ─────────────────────────────────────────────
//  useCountUp — Animate numbers from 0 to value
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

export const useCountUp = (target, duration = 1000, decimals = 0) => {
  const [value,    setValue]    = useState(0);
  const startRef  = useRef(null);
  const prevRef   = useRef(0);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    const from = prevRef.current;
    const to   = parseFloat(target) || 0;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic easeOut
      const current = from + (to - from) * ease;
      setValue(parseFloat(current.toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
        setValue(to);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals]);

  return value;
};