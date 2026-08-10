// ─────────────────────────────────────────────
//  CurrentWeather — Animated main weather card
//  + Local timezone display + feels-like trend
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp, formatTime } from "../utils/formatters";
import { getWeatherEmoji, getIconUrl } from "../utils/weatherIcons";
import { useCountUp } from "../hooks/useCountUp";
import { getFeelsLikeTrend } from "../utils/trendIndicator";

// Compute the local time at the searched location using its
// UTC offset (in seconds) returned by OpenWeatherMap's free tier
const getLocalTime = (timezoneOffsetSeconds) => {
  if (timezoneOffsetSeconds === undefined || timezoneOffsetSeconds === null) {
    return null;
  }
  const utc = Date.now() + (new Date().getTimezoneOffset() * 60000);
  const localTime = new Date(utc + timezoneOffsetSeconds * 1000);
  return localTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CurrentWeather = () => {
  const { current, forecast, isDark, unit } = useWeatherContext();
  const animatedTemp = useCountUp(
    Math.round(current?.temp || 0), 1200, 0);
  const animatedFeels = useCountUp(
    Math.round(current?.feels_like || 0), 1000, 0);

  if (!current) return null;

  const displayTemp = unit === "F"
    ? Math.round(animatedTemp * 9/5 + 32)
    : animatedTemp;
  const displayFeels = unit === "F"
    ? Math.round(animatedFeels * 9/5 + 32)
    : animatedFeels;

  const localTime = getLocalTime(current.timezone);
  const trend = getFeelsLikeTrend(forecast?.hourly);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "glass" : "glass-light"} p-6`}
    >
      {/* City */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl font-black
              ${isDark ? "text-white" : "text-slate-800"}`}
          >
            {current.city}
          </motion.h2>
          <p className={`text-sm mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {current.country} •{" "}
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month  : "long",
              day    : "numeric",
            })}
          </p>
          {localTime && (
            <p className={`text-xs mt-1
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              🕐 Local time: {localTime}
            </p>
          )}
        </div>
        <motion.span
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity,
            ease: "easeInOut" }}
          className="text-5xl"
        >
          {getWeatherEmoji(current.condition)}
        </motion.span>
      </div>

      {/* Animated temperature */}
      <div className="flex items-end gap-3 mb-4">
        <div className="flex-1">
          <motion.p
            key={current.city}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring",
              stiffness: 100, delay: 0.3 }}
            className={`text-7xl font-black leading-none
              ${isDark ? "text-white" : "text-slate-800"}`}
          >
            {displayTemp}°{unit}
          </motion.p>

          {/* Prominent feels like + trend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`
              mt-3 inline-flex items-center gap-2
              px-3 py-1.5 rounded-xl
              ${isDark ? "bg-white/10" : "bg-black/8"}
            `}
          >
            <span className="text-lg">🌡️</span>
            <div>
              <p className={`text-[10px] uppercase
                tracking-wider
                ${isDark ? "text-white/40" : "text-slate-400"}`}>
                Feels like
              </p>
              <div className="flex items-center gap-1.5">
                <p className={`text-xl font-black
                  ${isDark ? "text-white" : "text-slate-800"}`}>
                  {displayFeels}°{unit}
                </p>
                {trend && (
                  <span
                    className="text-xs font-bold"
                    style={{ color: trend.color }}
                    title={trend.label}
                  >
                    {trend.arrow} {trend.label}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <p className={`text-base mt-2
            ${isDark ? "text-white/70" : "text-slate-600"}`}>
            {current.description}
          </p>
        </div>
        <motion.img
          src={getIconUrl(current.icon)}
          alt={current.condition}
          className="w-24 h-24 -mb-2 drop-shadow-lg"
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4 }}
        />
      </div>

      {/* Min/Max */}
      <div className="flex gap-4 pt-3 border-t
        border-white/10">
        <span className={`text-sm font-semibold
          ${isDark ? "text-blue-300" : "text-blue-600"}`}>
          ↓ {formatTemp(current.temp_min, unit)}
        </span>
        <span className={`text-sm font-semibold
          ${isDark ? "text-orange-300" : "text-orange-500"}`}>
          ↑ {formatTemp(current.temp_max, unit)}
        </span>
      </div>
    </motion.div>
  );
};

export default CurrentWeather;