// ─────────────────────────────────────────────
//  UVTracker — Daily UV dose accumulation
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const UV_LEVELS = [
  { max: 2,  label: "Low",       color: "#22c55e",
    bg: "bg-green-500",  advice: "Safe to be outside" },
  { max: 5,  label: "Moderate",  color: "#eab308",
    bg: "bg-yellow-500", advice: "Wear sunscreen SPF 30+" },
  { max: 7,  label: "High",      color: "#f97316",
    bg: "bg-orange-500", advice: "Seek shade 10am-4pm" },
  { max: 10, label: "Very High", color: "#ef4444",
    bg: "bg-red-500",    advice: "Avoid sun exposure" },
  { max: 20, label: "Extreme",   color: "#a855f7",
    bg: "bg-purple-500", advice: "Stay indoors!" },
];

const getUVInfo = (uv) => {
  return UV_LEVELS.find((l) => uv <= l.max) ||
    UV_LEVELS[UV_LEVELS.length - 1];
};

// Estimate UV based on time + condition
const estimateUV = (temp, condition, hour) => {
  const c = condition?.toLowerCase() || "";
  let base = 0;
  if (hour >= 6 && hour <= 18) {
    const peak = 12;
    const dist = Math.abs(hour - peak);
    base = Math.max(0, 11 - dist * 1.5);
  }
  if (c.includes("cloud"))   base *= 0.6;
  if (c.includes("rain"))    base *= 0.3;
  if (c.includes("thunder")) base *= 0.2;
  return Math.round(base * 10) / 10;
};

const UVTracker = () => {
  const { current, isDark } = useWeatherContext();
  const [accumulated, setAccumulated] = useState(0);
  const [exposureMin,  setExposureMin]  = useState(0);
  const [isTracking,   setIsTracking]   = useState(false);

  const hour = new Date().getHours();
  const uv   = current
    ? estimateUV(current.temp,
        current.condition, hour)
    : 0;
  const info = getUVInfo(uv);

  // Accumulate UV exposure
  useEffect(() => {
    if (!isTracking || !current) return;
    const interval = setInterval(() => {
      setAccumulated((prev) => prev + uv / 600);
      setExposureMin((prev) => prev + 0.1);
    }, 6000); // update every 6 seconds = 0.1 min
    return () => clearInterval(interval);
  }, [isTracking, uv]);

  const safeLimit = uv > 0
    ? Math.round((25 / uv) * 10) / 10
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌈 UV Index Tracker
      </h3>

      {/* Main UV display */}
      <div className="flex items-center gap-5 mb-5">
        {/* UV ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100"
            className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40"
              fill="none"
              stroke={isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)"}
              strokeWidth="10"
            />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={info.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={251.2}
              initial={{ strokeDashoffset: 251.2 }}
              animate={{
                strokeDashoffset: 251.2 -
                  (251.2 * Math.min(uv / 11, 1))
              }}
              transition={{ duration: 1.5,
                ease: "easeOut" }}
              style={{
                filter:
                  `drop-shadow(0 0 6px ${info.color})`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col
            items-center justify-center">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5,
                type: "spring" }}
              className="text-2xl font-black"
              style={{ color: info.color }}
            >
              {uv}
            </motion.p>
            <p className={`text-xs
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              UV
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-xl font-black"
            style={{ color: info.color }}>
            {info.label}
          </p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {info.advice}
          </p>
          {safeLimit && (
            <p className={`text-xs mt-2
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              ⏱ Safe limit: {safeLimit} min
            </p>
          )}

          {/* Track button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isTracking) {
                setIsTracking(false);
                setAccumulated(0);
                setExposureMin(0);
              } else {
                setIsTracking(true);
              }
            }}
            className={`
              mt-3 px-3 py-1.5 rounded-xl text-xs
              font-bold transition-all
              ${isTracking
                ? "bg-red-500/20 text-red-400"
                : "bg-blue-500/20 text-blue-400"
              }
            `}
          >
            {isTracking ? "⏹ Stop Tracking" : "▶ Track Exposure"}
          </motion.button>
        </div>
      </div>

      {/* Exposure bar */}
      {isTracking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-between text-xs mb-1">
            <span className={
              isDark ? "text-white/50" : "text-slate-400"}>
              Exposure: {Math.round(exposureMin)} min
            </span>
            <span style={{ color: info.color }}>
              {((accumulated / 25) * 100).toFixed(1)}%
              of safe limit
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden
            ${isDark ? "bg-white/10" : "bg-black/10"}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: info.color }}
              animate={{
                width: `${Math.min(
                  (accumulated / 25) * 100, 100)}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {accumulated >= 20 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 mt-2
                font-medium"
            >
              ⚠️ Approaching safe UV dose limit!
            </motion.p>
          )}
        </motion.div>
      )}

      {/* UV scale */}
      <div className="flex gap-1 mt-4">
        {UV_LEVELS.map((l, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full ${l.bg}
              ${uv <= l.max && (i === 0 || uv > UV_LEVELS[i-1]?.max)
                ? "opacity-100 scale-y-150" : "opacity-40"
              }`}
            />
            <p className={`text-[9px] mt-1 text-center
              ${isDark ? "text-white/30" : "text-slate-400"}`}>
              {l.label.split(" ")[0]}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UVTracker;