// ─────────────────────────────────────────────
//  PhotoSpotTiming — Best window for photography today
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTime } from "../utils/formatters";

const scorePhotoWindow = (current) => {
  const cond = current.condition.toLowerCase();
  const cloudBonus = cond.includes("cloud") ? 15 : 0; // some clouds = better color
  const clearBonus = cond.includes("clear") ? 25 : 0;
  const windPenalty = current.wind_speed > 8 ? -10 : 0;
  const score = 50 + cloudBonus + clearBonus + windPenalty;
  return Math.max(0, Math.min(100, score));
};

const PhotoSpotTiming = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const score = scorePhotoWindow(current);
  const morningStart = current.sunrise;
  const morningEnd   = current.sunrise + 3600;
  const eveningStart = current.sunset - 3600;
  const eveningEnd   = current.sunset;

  const rating = score >= 80
    ? { label: "Excellent", color: "#34d399" }
    : score >= 60
    ? { label: "Good", color: "#60a5fa" }
    : { label: "Fair", color: "#fbbf24" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-3
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📸 Best Photo Window Today
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">📷</div>
        <div>
          <p className="text-xl font-black" style={{ color: rating.color }}>
            {rating.label}
          </p>
          <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Conditions score: {score}/100
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl
          ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
            🌅 Morning
          </p>
          <p className={`text-sm font-bold mt-1
            ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatTime(morningStart)} – {formatTime(morningEnd)}
          </p>
        </div>
        <div className={`p-3 rounded-xl
          ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
            🌇 Evening
          </p>
          <p className={`text-sm font-bold mt-1
            ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatTime(eveningStart)} – {formatTime(eveningEnd)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoSpotTiming;