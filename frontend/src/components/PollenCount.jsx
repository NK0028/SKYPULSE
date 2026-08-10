// ─────────────────────────────────────────────
//  PollenCount — Allergy risk estimator
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const getPollenRisk = (temp, humidity, wind, condition) => {
  const c = condition?.toLowerCase() || "";
  const month = new Date().getMonth() + 1;

  // Season-based base pollen
  let base = 0;
  if (month >= 3 && month <= 5)  base = 80; // Spring peak
  else if (month >= 6 && month <= 8) base = 60; // Summer
  else if (month >= 9 && month <= 10) base = 40; // Fall
  else base = 10; // Winter

  // Weather adjustments
  if (c.includes("rain"))  base -= 40; // Rain washes pollen
  if (c.includes("cloud")) base -= 15;
  if (wind > 15)           base += 20; // Wind spreads pollen
  if (temp > 25)           base += 15; // Warmth increases
  if (humidity > 70)       base -= 10; // High humidity reduces

  const level = Math.max(0, Math.min(100, base));

  if (level >= 75) return { level, label: "Very High",
    emoji: "🤧", color: "#ef4444",
    advice: "Stay indoors, take antihistamines" };
  if (level >= 50) return { level, label: "High",
    emoji: "😤", color: "#f97316",
    advice: "Limit outdoor time, wear a mask" };
  if (level >= 25) return { level, label: "Moderate",
    emoji: "😐", color: "#eab308",
    advice: "Monitor symptoms if allergic" };
  return { level, label: "Low",
    emoji: "😊", color: "#22c55e",
    advice: "Good day for outdoor activities" };
};

const POLLEN_TYPES = [
  { name: "Grass",  emoji: "🌿" },
  { name: "Tree",   emoji: "🌳" },
  { name: "Weed",   emoji: "🌾" },
  { name: "Mold",   emoji: "🍄" },
];

const PollenCount = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const risk = getPollenRisk(
    current.temp, current.humidity,
    current.wind_speed, current.condition
  );

  const month = new Date().getMonth() + 1;
  const isSpring = month >= 3 && month <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        💨 Pollen & Allergy Risk
      </h3>

      {/* Main risk indicator */}
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4,
            repeat: Infinity }}
          className="text-4xl"
        >
          {risk.emoji}
        </motion.div>
        <div>
          <p className="text-2xl font-black"
            style={{ color: risk.color }}>
            {risk.label}
          </p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {risk.advice}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-black"
            style={{ color: risk.color }}>
            {risk.level}
          </p>
          <p className={`text-xs
            ${isDark ? "text-white/30" : "text-slate-400"}`}>
            / 100
          </p>
        </div>
      </div>

      {/* Pollen level bar */}
      <div className="mb-4">
        <div className={`h-3 rounded-full overflow-hidden
          ${isDark ? "bg-white/10" : "bg-black/8"}`}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right,
                #22c55e, #eab308, #f97316, #ef4444)`,
              width: `${risk.level}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${risk.level}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {["Low", "Moderate", "High", "Very High"].map(
            (l) => (
              <span key={l} className={`text-[9px]
                ${isDark ? "text-white/20" : "text-slate-300"}`}>
                {l}
              </span>
            )
          )}
        </div>
      </div>

      {/* Pollen types */}
      <div className="grid grid-cols-4 gap-2">
        {POLLEN_TYPES.map((p, i) => {
          const typeLevel = Math.max(0, risk.level +
            (Math.random() * 20 - 10));
          const typeColor = typeLevel >= 75
            ? "#ef4444" : typeLevel >= 50
            ? "#f97316" : typeLevel >= 25
            ? "#eab308" : "#22c55e";
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                p-2 rounded-xl text-center
                ${isDark ? "bg-white/5" : "bg-black/5"}
              `}
            >
              <p className="text-xl">{p.emoji}</p>
              <p className={`text-[10px] mt-1
                ${isDark ? "text-white/40" : "text-slate-400"}`}>
                {p.name}
              </p>
              <p className="text-xs font-bold"
                style={{ color: typeColor }}>
                {Math.round(typeLevel)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {isSpring && (
        <p className={`text-xs mt-3 text-center
          ${isDark ? "text-yellow-400/70" : "text-yellow-600"}`}>
          🌸 Spring peak pollen season
        </p>
      )}
    </motion.div>
  );
};

export default PollenCount;