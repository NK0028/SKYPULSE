// ─────────────────────────────────────────────
//  FeelScore — Comfort index + clothing tips
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const getFeelScore = (temp, humidity, windSpeed) => {
  // Heat index simplified
  let score = 100;
  if (temp > 40)        score -= 40;
  else if (temp > 35)   score -= 25;
  else if (temp > 30)   score -= 10;
  else if (temp < 5)    score -= 35;
  else if (temp < 15)   score -= 15;
  if (humidity > 80)    score -= 20;
  else if (humidity > 60) score -= 10;
  if (windSpeed > 15)   score -= 15;
  else if (windSpeed > 8) score -= 5;
  return Math.max(0, Math.min(100, score));
};

const getFeelLabel = (score) => {
  if (score >= 85) return { label: "Perfect", emoji: "😊",
    color: "#34d399", desc: "Ideal conditions today!" };
  if (score >= 70) return { label: "Good",    emoji: "🙂",
    color: "#60a5fa", desc: "Comfortable outside." };
  if (score >= 50) return { label: "Okay",    emoji: "😐",
    color: "#fbbf24", desc: "Manageable conditions." };
  if (score >= 30) return { label: "Rough",   emoji: "😓",
    color: "#f97316", desc: "Uncomfortable outside." };
  return               { label: "Brutal",  emoji: "🥵",
    color: "#ef4444", desc: "Stay indoors if possible." };
};

const getClothing = (temp, condition) => {
  const c = condition?.toLowerCase() || "";
  const items = [];
  if (temp < 5)         items.push("🧥 Heavy coat", "🧣 Scarf", "🧤 Gloves");
  else if (temp < 15)   items.push("🧥 Light jacket", "👕 Warm layer");
  else if (temp < 22)   items.push("👔 Light jacket", "👖 Jeans");
  else if (temp < 30)   items.push("👕 T-shirt", "😎 Sunglasses");
  else                  items.push("👕 Light clothes", "🧴 Sunscreen", "💧 Stay hydrated");
  if (c.includes("rain") ||
      c.includes("drizzle")) items.push("☂️ Umbrella");
  if (c.includes("snow"))    items.push("👢 Snow boots");
  if (c.includes("thunder")) items.push("🏠 Stay indoors");
  return items;
};

const FeelScore = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const score   = getFeelScore(
    current.temp, current.humidity, current.wind_speed);
  const feel    = getFeelLabel(score);
  const clothes = getClothing(
    current.temp, current.condition);

  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌡️ Comfort Score
      </h3>

      <div className="flex items-center gap-5 mb-5">
        {/* Score ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100"
            className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40"
              fill="none"
              stroke={isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)"}
              strokeWidth="8"
            />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={feel.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset:
                circumference - progress }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 6px ${feel.color})`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col
            items-center justify-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-2xl"
            >
              {feel.emoji}
            </motion.span>
            <span className={`text-xs font-bold
              ${isDark ? "text-white/60" : "text-slate-500"}`}>
              {score}
            </span>
          </div>
        </div>

        {/* Label */}
        <div>
          <p className="text-2xl font-black"
            style={{ color: feel.color }}>
            {feel.label}
          </p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {feel.desc}
          </p>
        </div>
      </div>

      {/* Clothing suggestions */}
      <div>
        <p className={`text-xs font-semibold mb-2
          ${isDark ? "text-white/40" : "text-slate-400"}`}>
          WHAT TO WEAR
        </p>
        <div className="flex flex-wrap gap-2">
          {clothes.map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                text-xs px-2.5 py-1 rounded-xl
                ${isDark
                  ? "bg-white/8 text-white/70"
                  : "bg-black/5 text-slate-600"
                }
              `}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeelScore;