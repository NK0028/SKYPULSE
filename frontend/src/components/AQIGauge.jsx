// ─────────────────────────────────────────────
// AQIGauge — Animated ring gauge for AQI
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { getAQILabel } from "../utils/formatters";

const AQIGauge = () => {
  const { airQuality, isDark } = useWeatherContext();
  if (!airQuality) return null;

  const { label, color } = getAQILabel(airQuality.aqi);

  // Ring calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = ((airQuality.aqi - 1) / 4) * circumference;

  const pollutants = [
    { label: "PM2.5", value: airQuality.pm2_5?.toFixed(1) },
    { label: "PM10", value: airQuality.pm10?.toFixed(1) },
    { label: "CO", value: airQuality.co?.toFixed(1) },
    { label: "NO₂", value: airQuality.no2?.toFixed(1) },
    { label: "O₃", value: airQuality.o3?.toFixed(1) },
    { label: "SO₂", value: airQuality.so2?.toFixed(1) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3
        className={`text-sm font-semibold mb-4 ${
          isDark ? "text-white/70" : "text-slate-600"
        }`}
      >
        🌿 Air Quality Index
      </h3>

      <div className="flex items-center gap-5 mb-5">
        {/* Animated Ring */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={
                isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)"
              }
              strokeWidth="10"
            />

            {/* Animated progress ring */}
            <motion.circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - progress,
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
              }}
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.5,
                type: "spring",
              }}
              className="text-2xl font-black"
              style={{ color }}
            >
              {airQuality.aqi}
            </motion.p>

            <p
              className={`text-xs ${
                isDark ? "text-white/40" : "text-slate-400"
              }`}
            >
              AQI
            </p>
          </div>
        </div>

        {/* AQI Info */}
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold"
            style={{ color }}
          >
            {label}
          </motion.p>

          <p
            className={`text-xs mt-1 ${
              isDark ? "text-white/40" : "text-slate-400"
            }`}
          >
            Air Quality Index
          </p>

          {/* Live Monitoring */}
          <div className="flex items-center gap-2 mt-3">
            <div className="relative w-2 h-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />

              <div
                className="absolute inset-0 rounded-full pulse-ring"
                style={{ background: color }}
              />
            </div>

            <span
              className={`text-xs ${
                isDark ? "text-white/40" : "text-slate-400"
              }`}
            >
              Live monitoring
            </span>
          </div>

          {/* ───────── Breathing Animation ───────── */}
          <div className="flex flex-col items-center gap-2 mt-5">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `${color}15`,
                border: `2px solid ${color}40`,
              }}
              animate={{
                scale:
                  airQuality.aqi <= 2
                    ? [1, 1.2, 1]
                    : airQuality.aqi <= 3
                    ? [1, 1.1, 1]
                    : [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: airQuality.aqi <= 2 ? 4 : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {airQuality.aqi <= 2
                ? "😮‍💨"
                : airQuality.aqi <= 3
                ? "😐"
                : "😷"}
            </motion.div>

            <p
              className={`text-xs text-center ${
                isDark ? "text-white/40" : "text-slate-400"
              }`}
            >
              {airQuality.aqi <= 2
                ? "Breathe freely 😊"
                : airQuality.aqi <= 3
                ? "Breathe normally"
                : "Limit outdoor breathing"}
            </p>
          </div>
          {/* ─────────────────────────────────────── */}
        </div>
      </div>

      {/* Pollutants */}
      <div className="grid grid-cols-3 gap-2">
        {pollutants.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 * i + 0.5,
            }}
            className={`p-2 rounded-xl text-center ${
              isDark ? "bg-white/5" : "bg-black/5"
            }`}
          >
            <p
              className={`text-xs ${
                isDark ? "text-white/40" : "text-slate-400"
              }`}
            >
              {p.label}
            </p>

            <p
              className={`text-sm font-bold mt-1 ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              {p.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AQIGauge;