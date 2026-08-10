// ─────────────────────────────────────────────
//  WeatherCursor — Custom animated cursor
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const getCursorEmoji = (condition) => {
  if (!condition) return "🌤️";
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⚡";
  if (c.includes("rain"))    return "🌧️";
  if (c.includes("drizzle")) return "🌦️";
  if (c.includes("snow"))    return "❄️";
  if (c.includes("mist") ||
      c.includes("fog"))     return "🌫️";
  if (c.includes("cloud"))   return "☁️";
  if (c.includes("clear"))   return "☀️";
  return "🌤️";
};

const WeatherCursor = () => {
  const { current } = useWeatherContext();
  const [pos,     setPos]     = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);

  const emoji = getCursorEmoji(current?.condition);

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const onLeave  = () => setVisible(false);
    const onClick  = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 400);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Main cursor */}
          <motion.div
            className="fixed pointer-events-none z-[9999]
              text-xl select-none"
            style={{
              left: pos.x - 12,
              top : pos.y - 12,
            }}
            animate={{
              scale : clicked ? 1.5 : 1,
              rotate: clicked ? 20  : 0,
            }}
            transition={{ type: "spring",
              stiffness: 300, damping: 20 }}
          >
            {emoji}
          </motion.div>

          {/* Trailing dot */}
          <motion.div
            className="fixed pointer-events-none z-[9998]
              w-2 h-2 rounded-full bg-white/30"
            animate={{
              x: pos.x - 4,
              y: pos.y - 4,
            }}
            transition={{ type: "spring",
              stiffness: 150, damping: 15,
              mass: 0.5 }}
            style={{ position: "fixed" }}
          />

          {/* Click ripple */}
          {clicked && (
            <motion.div
              className="fixed pointer-events-none
                z-[9997] rounded-full border-2
                border-white/40"
              style={{
                left: pos.x - 20,
                top : pos.y - 20,
                width: 40,
                height: 40,
              }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2,   opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default WeatherCursor;