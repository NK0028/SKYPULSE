// ─────────────────────────────────────────────
//  usePullToRefresh — Mobile pull gesture
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

export const usePullToRefresh = (onRefresh) => {
  const [pulling,   setPulling]   = useState(false);
  const [pullDist,  setPullDist]  = useState(0);
  const [refreshing,setRefreshing]= useState(false);
  const startY = useRef(0);
  const THRESHOLD = 80;

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (window.scrollY > 0) return;
      const dist = e.touches[0].clientY - startY.current;
      if (dist > 0) {
        setPulling(true);
        setPullDist(Math.min(dist, THRESHOLD * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (pullDist >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        try { await onRefresh(); } catch { /* ignore */ }
        setRefreshing(false);
      }
      setPulling(false);
      setPullDist(0);
    };

    document.addEventListener("touchstart", onTouchStart,
      { passive: true });
    document.addEventListener("touchmove",  onTouchMove,
      { passive: true });
    document.addEventListener("touchend",   onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [pullDist, refreshing, onRefresh]);

  return { pulling, pullDist, refreshing, THRESHOLD };
};