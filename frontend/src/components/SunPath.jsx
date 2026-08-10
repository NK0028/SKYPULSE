// ─────────────────────────────────────────────
//  SunPath — Sun's arc across the sky with position
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTime } from "../utils/formatters";

const SunPath = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const now     = Date.now() / 1000;
  const sunrise = current.sunrise;
  const sunset  = current.sunset;
  const total   = sunset - sunrise;
  const progress = Math.min(Math.max(
    (now - sunrise) / total, 0), 1);
  const isDaytime = now >= sunrise && now <= sunset;

  // Position along a semicircle arc
  const angle = Math.PI * progress; // 0 → π
  const cx = 150, cy = 110, r = 100;
  const sunX = cx - r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  const currentHeight = Math.round(
    Math.sin(angle) * 90); // rough elevation angle proxy

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-3
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌅 Sun Path
      </h3>

      <svg viewBox="0 0 300 130" className="w-full h-32">
        {/* Horizon line */}
        <line x1="20" y1="110" x2="280" y2="110"
          stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Arc path */}
        <path
          d={`M 50 110 A 100 100 0 0 1 250 110`}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
          strokeWidth="2"
        />

        {/* Traveled portion */}
        <motion.path
          d={`M 50 110 A 100 100 0 0 1 250 110`}
          fill="none"
          stroke="url(#sunPathGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="314"
          initial={{ strokeDashoffset: 314 }}
          animate={{ strokeDashoffset: 314 - (314 * progress) }}
          transition={{ duration: 1.2 }}
        />
        <defs>
          <linearGradient id="sunPathGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Sunrise / Sunset markers */}
        <circle cx="50"  cy="110" r="3" fill="#fb923c" />
        <circle cx="250" cy="110" r="3" fill="#a855f7" />

        {/* Current sun position */}
        {isDaytime && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <circle cx={sunX} cy={sunY} r="8" fill="#fde047"
              style={{ filter: "drop-shadow(0 0 6px #fde047)" }} />
            <text x={sunX} y={sunY - 14} textAnchor="middle"
              fontSize="14">☀️</text>
          </motion.g>
        )}
      </svg>

      <div className="flex justify-between mt-2 text-xs">
        <div className={isDark ? "text-white/50" : "text-slate-500"}>
          🌅 {formatTime(sunrise)}
        </div>
        <div className={`font-medium
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          {isDaytime
            ? `Sun elevation ~${currentHeight}°`
            : "Below horizon"}
        </div>
        <div className={isDark ? "text-white/50" : "text-slate-500"}>
          🌇 {formatTime(sunset)}
        </div>
      </div>
    </motion.div>
  );
};

export default SunPath;