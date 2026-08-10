// ─────────────────────────────────────────────
//  GoldenHour — Photography golden hour timer
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTime } from "../utils/formatters";

const GoldenHour = () => {
  const { current, isDark } = useWeatherContext();
  const [timeLeft, setTimeLeft] = useState("");
  const [phase,    setPhase]    = useState("");

  useEffect(() => {
    if (!current) return;

    const updateTimer = () => {
      const now     = Date.now() / 1000;
      const sunrise = current.sunrise;
      const sunset  = current.sunset;

      // Golden hour = 1 hour after sunrise, 1 hour before sunset
      const morningGoldenStart = sunrise;
      const morningGoldenEnd   = sunrise + 3600;
      const eveningGoldenStart = sunset  - 3600;
      const eveningGoldenEnd   = sunset;

      let diff = 0;
      let label = "";

      if (now < morningGoldenStart) {
        diff  = morningGoldenStart - now;
        label = "Morning golden hour starts in";
      } else if (now < morningGoldenEnd) {
        diff  = morningGoldenEnd - now;
        label = "🌅 Morning golden hour ends in";
      } else if (now < eveningGoldenStart) {
        diff  = eveningGoldenStart - now;
        label = "Evening golden hour starts in";
      } else if (now < eveningGoldenEnd) {
        diff  = eveningGoldenEnd - now;
        label = "🌇 Evening golden hour ends in";
      } else {
        label = "Golden hour passed for today";
        setPhase(label);
        setTimeLeft("");
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = Math.floor(diff % 60);
      setPhase(label);
      setTimeLeft(
        h > 0
          ? `${h}h ${m}m ${s}s`
          : `${m}m ${s}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [current]);

  if (!current) return null;

  const isActive = phase.includes("ends in");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📸 Golden Hour
      </h3>

      <div className={`
        rounded-2xl p-4 text-center
        ${isActive
          ? "bg-gradient-to-br from-orange-500/20 to-yellow-500/20"
          : isDark ? "bg-white/5" : "bg-black/5"
        }
      `}>
        {isActive && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl mb-2"
          >
            ✨
          </motion.div>
        )}

        <p className={`text-xs mb-2
          ${isDark ? "text-white/50" : "text-slate-500"}`}>
          {phase}
        </p>

        {timeLeft && (
          <motion.p
            key={timeLeft}
            className="text-2xl font-black"
            style={{ color: isActive
              ? "#f97316" : isDark
              ? "white" : "#1e293b" }}
          >
            {timeLeft}
          </motion.p>
        )}

        <div className="flex justify-between mt-4
          text-xs">
          <div className="text-center">
            <p className={isDark
              ? "text-white/40" : "text-slate-400"}>
              🌅 Morning
            </p>
            <p className={`font-semibold mt-1
              ${isDark ? "text-white/70" : "text-slate-600"}`}>
              {formatTime(current.sunrise)} –{" "}
              {formatTime(current.sunrise + 3600)}
            </p>
          </div>
          <div className="text-center">
            <p className={isDark
              ? "text-white/40" : "text-slate-400"}>
              🌇 Evening
            </p>
            <p className={`font-semibold mt-1
              ${isDark ? "text-white/70" : "text-slate-600"}`}>
              {formatTime(current.sunset - 3600)} –{" "}
              {formatTime(current.sunset)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoldenHour;