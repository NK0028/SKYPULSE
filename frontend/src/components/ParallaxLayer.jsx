// ─────────────────────────────────────────────
//  ParallaxLayer — Scroll-based depth effect
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const ParallaxLayer = () => {
  const { current, isDark } = useWeatherContext();
  const { scrollY } = useScroll();

  const yClouds = useTransform(scrollY, [0, 1000], [0, 200]);
  const yStars  = useTransform(scrollY, [0, 1000], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  const condition = current?.condition?.toLowerCase() || "";
  const isNight   = isDark && (
    new Date().getHours() >= 19 ||
    new Date().getHours() < 6
  );

  return (
    <div className="fixed inset-0 pointer-events-none
      overflow-hidden z-0">

      {/* Stars layer — only at night */}
      {isNight && (
        <motion.div
          style={{ y: yStars, opacity }}
          className="absolute inset-0"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white
                animate-pulse"
              style={{
                left  : `${Math.random() * 100}%`,
                top   : `${Math.random() * 50}%`,
                width : `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.6 + 0.2,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Drifting clouds layer */}
      {(condition.includes("cloud") ||
        condition.includes("clear")) && (
        <motion.div
          style={{ y: yClouds, opacity }}
          className="absolute inset-0"
        >
          {[20, 50, 75].map((top, i) => (
            <div
              key={i}
              className="absolute text-6xl opacity-[0.06]"
              style={{
                top : `${top}%`,
                left: `${i * 30 - 10}%`,
              }}
            >
              ☁️
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ParallaxLayer;