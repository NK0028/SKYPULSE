// ─────────────────────────────────────────────
//  PrecipitationBar — Google-style rain bars
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatHour } from "../utils/formatters";

const getIntensityLabel = (pop) => {
  if (pop >= 0.8) return { label: "Heavy",    color: "#1d4ed8", height: "100%" };
  if (pop >= 0.5) return { label: "Moderate", color: "#3b82f6", height: "65%"  };
  if (pop >= 0.2) return { label: "Light",    color: "#93c5fd", height: "35%"  };
  return               { label: "None",       color: "#dbeafe", height: "8%"   };
};

const PrecipitationBar = () => {
  const { forecast, isDark, current } = useWeatherContext();
  if (!forecast?.hourly?.length) return null;

  const hasRain = forecast.hourly.some((h) => h.pop > 0.1);
  const condition = current?.condition?.toLowerCase() || "";
  const isRaining = condition.includes("rain") ||
                    condition.includes("drizzle") ||
                    condition.includes("thunder");

  // Find when rain stops/starts
  const rainInfo = (() => {
    if (isRaining) {
      const stopIdx = forecast.hourly.findIndex(
        (h, i) => i > 0 && h.pop < 0.2);
      if (stopIdx === -1) return "Rain continuing all day";
      const hours = stopIdx;
      return hours === 1
        ? "Rain stopping in about 1 hour"
        : `Rain continuing for about ${hours} hours`;
    } else {
      const startIdx = forecast.hourly.findIndex(
        (h) => h.pop > 0.5);
      if (startIdx === -1) return "No significant rain expected";
      return startIdx === 1
        ? "Rain expected in about 1 hour"
        : `Rain expected in about ${startIdx} hours`;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-sm font-semibold
            ${isDark ? "text-white/70" : "text-slate-600"}`}>
            🌧️ Precipitation
          </h3>
          <p className={`text-xs mt-1 font-medium
            ${isRaining
              ? isDark ? "text-blue-300" : "text-blue-600"
              : isDark ? "text-white/40" : "text-slate-400"
            }`}>
            {rainInfo}
          </p>
        </div>
        {isRaining && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl"
          >
            🌧️
          </motion.div>
        )}
      </div>

      {/* Intensity legend */}
      <div className="flex gap-4 mb-3">
        {[
          { label: "Heavy",    color: "#1d4ed8" },
          { label: "Moderate", color: "#3b82f6" },
          { label: "Light",    color: "#93c5fd" },
        ].map((l) => (
          <div key={l.label}
            className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
              style={{ background: l.color }} />
            <span className={`text-xs
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-20">
        {forecast.hourly.slice(0, 12).map((h, i) => {
          const intensity = getIntensityLabel(h.pop);
          return (
            <div key={i}
              className="flex-1 flex flex-col
                items-center gap-1 group">
              {/* Bar */}
              <div className="relative w-full h-16
                flex items-end">
                <motion.div
                  className="w-full rounded-t-md
                    relative overflow-hidden"
                  style={{ background: intensity.color }}
                  initial={{ height: 0 }}
                  animate={{ height: intensity.height }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  {/* Shimmer on active rain */}
                  {h.pop > 0.5 && (
                    <motion.div
                      className="absolute inset-0
                        bg-white/20"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.div>
              </div>
              {/* Time label */}
              <span className={`text-[9px] truncate w-full
                text-center
                ${isDark
                  ? "text-white/30"
                  : "text-slate-400"}`}>
                {i === 0 ? "Now" : formatHour(h.dt)}
              </span>
              {/* Tooltip on hover */}
              <div className="absolute bottom-8 hidden
                group-hover:block z-50">
                <div className={`
                  px-2 py-1 rounded-lg text-xs
                  whitespace-nowrap
                  ${isDark ? "glass text-white" : "glass-light text-slate-800"}
                `}>
                  {Math.round(h.pop * 100)}%
                  {intensity.label !== "None" &&
                    ` — ${intensity.label}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PrecipitationBar;