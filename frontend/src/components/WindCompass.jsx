// ─────────────────────────────────────────────
//  WindCompass — Animated wind direction
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { windDirection } from "../utils/formatters";

const WindCompass = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const deg     = current.wind_deg   || 0;
  const speed   = current.wind_speed || 0;
  const dirLabel = windDirection(deg);

  const getWindLabel = (s) => {
    if (s < 1)  return { label: "Calm",     color: "#60a5fa" };
    if (s < 5)  return { label: "Light",    color: "#34d399" };
    if (s < 10) return { label: "Moderate", color: "#fbbf24" };
    if (s < 20) return { label: "Strong",   color: "#f97316" };
    return            { label: "Storm",     color: "#ef4444" };
  };

  const { label, color } = getWindLabel(speed);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        ${isDark ? "glass" : "glass-light"} p-5
      `}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🧭 Wind Compass
      </h3>

      <div className="flex items-center gap-6">
        {/* Compass */}
        <div className="relative w-28 h-28 flex-shrink-0">
          {/* Outer ring */}
          <div className={`
            absolute inset-0 rounded-full border-2
            ${isDark
              ? "border-white/10"
              : "border-slate-200"}
          `}/>

          {/* Cardinal directions */}
          {[
            { label: "N", pos: "top-0.5 left-1/2 -translate-x-1/2" },
            { label: "S", pos: "bottom-0.5 left-1/2 -translate-x-1/2" },
            { label: "E", pos: "right-0.5 top-1/2 -translate-y-1/2" },
            { label: "W", pos: "left-0.5 top-1/2 -translate-y-1/2" },
          ].map((d) => (
            <span
              key={d.label}
              className={`
                absolute text-xs font-bold ${d.pos}
                ${isDark ? "text-white/30" : "text-slate-300"}
              `}
            >
              {d.label}
            </span>
          ))}

          {/* Inner circle */}
          <div className={`
            absolute inset-4 rounded-full
            ${isDark ? "bg-white/5" : "bg-black/5"}
          `}/>

          {/* Animated arrow */}
          <motion.div
            className="absolute inset-0 flex items-center
              justify-center"
            animate={{ rotate: deg }}
            transition={{ type: "spring", stiffness: 60,
              damping: 15 }}
          >
            <div className="relative w-full h-full
              flex items-center justify-center">
              {/* Arrow up */}
              <div className="absolute w-1 rounded-full"
                style={{
                  height: "35%",
                  bottom: "50%",
                  background: color,
                  left: "calc(50% - 2px)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
              {/* Arrow down (grey) */}
              <div className="absolute w-1 rounded-full"
                style={{
                  height: "30%",
                  top: "50%",
                  background: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",
                  left: "calc(50% - 2px)",
                  borderRadius: "0 0 4px 4px",
                }}
              />
              {/* Center dot */}
              <div className="w-3 h-3 rounded-full z-10"
                style={{ background: color }} />
            </div>
          </motion.div>
        </div>

        {/* Wind info */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-3xl font-black"
              style={{ color }}>
              {speed} <span className="text-lg">m/s</span>
            </p>
            <p className={`text-xs mt-1 font-medium
              ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {label} Wind
            </p>
          </div>
          <div className={`
            px-3 py-1.5 rounded-xl text-sm font-bold
            ${isDark ? "bg-white/10" : "bg-black/5"}
          `}>
            <span style={{ color }}>{dirLabel}</span>
            <span className={`ml-2 text-xs font-normal
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              {deg}°
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WindCompass;