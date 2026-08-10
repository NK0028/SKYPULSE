// ─────────────────────────────────────────────
//  ThemeTransition — Full page morph animation
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";

const ThemeTransition = () => {
  const { isDark }   = useWeatherContext();
  const overlayRef   = useRef(null);
  const prevDarkRef  = useRef(isDark);

  useEffect(() => {
    if (prevDarkRef.current === isDark) return;
    prevDarkRef.current = isDark;

    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.style.opacity    = "1";
    overlay.style.transition = "opacity 0ms";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = "opacity 600ms ease";
        overlay.style.opacity    = "0";
      });
    });
  }, [isDark]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none
        z-[200] opacity-0"
      style={{
        background: isDark ? "#ffffff" : "#0f0c29",
      }}
    />
  );
};

export default ThemeTransition;