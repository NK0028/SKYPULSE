// ─────────────────────────────────────────────
//  RainCountdown — Minute-by-minute rain timer
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const RainCountdown = () => {
  const { current, forecast, isDark } = useWeatherContext();
  const [timeStr, setTimeStr] = useState("");
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!current || !forecast?.hourly?.length) return;

    const condition = current.condition.toLowerCase();
    const isRaining =
      condition.includes("rain") ||
      condition.includes("drizzle") ||
      condition.includes("thunder");

    const hourly = forecast.hourly;

    if (isRaining) {
      // Find when rain stops
      const stopIdx = hourly.findIndex(
        (h, i) => i > 0 && h.pop < 0.2);
      if (stopIdx === -1) {
        setMessage("Rain continuing all day");
        setIsActive(true);
        return;
      }
      const stopTime = new Date(hourly[stopIdx].dt * 1000);
      const updateTimer = () => {
        const now  = new Date();
        const diff = stopTime - now;
        if (diff <= 0) {
          setMessage("Rain has stopped");
          setIsActive(false);
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeStr(h > 0
          ? `${h}h ${m}m ${s}s`
          : m > 0 ? `${m}m ${s}s` : `${s}s`);
        setMessage("Rain stopping in");
        setIsActive(true);
      };
      updateTimer();
      const iv = setInterval(updateTimer, 1000);
      return () => clearInterval(iv);
    } else {
      // Find when rain starts
      const startIdx = hourly.findIndex(
        (h) => h.pop > 0.5);
      if (startIdx === -1) {
        setMessage("No rain expected today");
        setIsActive(false);
        return;
      }
      const startTime = new Date(
        hourly[startIdx].dt * 1000);
      const updateTimer = () => {
        const now  = new Date();
        const diff = startTime - now;
        if (diff <= 0) {
          setMessage("Rain has started");
          setIsActive(true);
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeStr(h > 0
          ? `${h}h ${m}m ${s}s`
          : m > 0 ? `${m}m ${s}s` : `${s}s`);
        setMessage("Rain expected in");
        setIsActive(false);
      };
      updateTimer();
      const iv = setInterval(updateTimer, 1000);
      return () => clearInterval(iv);
    }
  }, [current?.city, forecast]);

  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${isDark ? "glass" : "glass-light"}
        p-4 flex items-center gap-4
      `}
    >
      <motion.div
        animate={{ scale: isActive
          ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 1.5,
          repeat: isActive ? Infinity : 0 }}
        className="text-3xl flex-shrink-0"
      >
        {isActive ? "🌧️" : "☀️"}
      </motion.div>

      <div className="flex-1">
        <p className={`text-xs font-medium
          ${isDark ? "text-white/50" : "text-slate-400"}`}>
          {message}
        </p>
        {timeStr && (
          <motion.p
            key={timeStr}
            className={`text-xl font-black mt-0.5
              ${isActive
                ? isDark ? "text-blue-300" : "text-blue-600"
                : isDark ? "text-white" : "text-slate-800"
              }`}
          >
            {timeStr}
          </motion.p>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5">
        <motion.div
          className={`w-2 h-2 rounded-full
            ${isActive ? "bg-blue-400" : "bg-green-400"}`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5,
            repeat: Infinity }}
        />
        <span className={`text-xs
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Live
        </span>
      </div>
    </motion.div>
  );
};

export default RainCountdown;