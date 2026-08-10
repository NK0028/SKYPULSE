// ─────────────────────────────────────────────
//  DailyDigest — "Today at a glance" summary card
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp, formatTime } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const getDigestLine = (current, forecast) => {
  if (!current) return "";
  const temp = Math.round(current.temp);
  const cond = current.condition.toLowerCase();
  const rainSoon = forecast?.hourly?.some((h) => h.pop > 0.5);

  const parts = [];
  if (temp > 35) parts.push("It's a scorcher");
  else if (temp < 10) parts.push("Bundle up, it's chilly");
  else parts.push("Comfortable temperatures");

  if (rainSoon) parts.push("rain is likely today");
  else if (cond.includes("clear")) parts.push("clear skies expected");

  return parts.join(" — ") + ".";
};

const DailyDigest = () => {
  const { current, forecast, isDark, unit } = useWeatherContext();
  if (!current) return null;

  const today = forecast?.daily?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${isDark ? "glass" : "glass-light"} p-5
        relative overflow-hidden
      `}
    >
      <div className="absolute -right-4 -top-4 text-7xl opacity-10">
        {getWeatherEmoji(current.condition)}
      </div>

      <h3 className={`text-sm font-semibold mb-3 relative
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📋 Today at a Glance
      </h3>

      <p className={`text-base font-medium mb-4 relative
        ${isDark ? "text-white/90" : "text-slate-700"}`}>
        {getDigestLine(current, forecast)}
      </p>

      <div className="grid grid-cols-4 gap-3 relative">
        {[
          { label: "Now",  value: `${Math.round(current.temp)}°${unit}` },
          { label: "High", value: today
              ? formatTemp(today.temp_max, unit) : "--" },
          { label: "Low",  value: today
              ? formatTemp(today.temp_min, unit) : "--" },
          { label: "Rain", value: today
              ? `${Math.round(today.pop * 100)}%` : "--" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className={`text-xs
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              {s.label}
            </p>
            <p className={`text-lg font-bold mt-0.5
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DailyDigest;