// ─────────────────────────────────────────────
//  WeatherAlert — Smart weather notifications
//  + Accessible live region + colorblind-safe colors
// ─────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";
import { cbColor } from "../utils/colorPalette";

const generateAlerts = (current, forecast, unit) => {
  if (!current || !forecast) return [];
  const alerts = [];

  const rainHour = forecast.hourly?.find(
    (h) => h.pop > 0.6);
  if (rainHour) {
    alerts.push({
      type : "rain",
      emoji: "☂️",
      color: "#60a5fa",
      text : "Rain expected soon — carry an umbrella!",
    });
  }

  if (current.temp > 38) {
    alerts.push({
      type : "heat",
      emoji: "🌡️",
      color: "#ef4444",
      text : `Extreme heat ${formatTemp(current.temp, unit)} — stay hydrated!`,
    });
  }

  if (current.wind_speed > 12) {
    alerts.push({
      type : "wind",
      emoji: "💨",
      color: "#a78bfa",
      text : `Strong winds ${current.wind_speed} m/s — secure loose objects.`,
    });
  }

  if (current.visibility < 2) {
    alerts.push({
      type : "fog",
      emoji: "🌫️",
      color: "#94a3b8",
      text : "Low visibility — drive carefully.",
    });
  }

  if (current.temp < 2) {
    alerts.push({
      type : "cold",
      emoji: "🥶",
      color: "#38bdf8",
      text : "Near freezing temperatures — dress warmly!",
    });
  }

  return alerts;
};

const WeatherAlert = () => {
  const { current, forecast, isDark, unit } =
    useWeatherContext();

  const alerts = generateAlerts(current, forecast, unit);
  if (!alerts.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`
              flex items-center gap-3 px-4 py-3
              rounded-2xl text-sm font-medium
              ${isDark ? "glass" : "glass-light"}
            `}
            style={{
              borderLeft: `3px solid ${cbColor(alert.color)}`
            }}
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2,
                repeat: Infinity, delay: i * 0.5 }}
              className="text-xl flex-shrink-0"
              aria-hidden="true"
            >
              {alert.emoji}
            </motion.span>
            <p className={
              isDark ? "text-white/80" : "text-slate-700"}>
              {alert.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default WeatherAlert;