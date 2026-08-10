// ─────────────────────────────────────────────
// WeatherDetails — Humidity, Wind, Visibility,
// Pressure with Animated Cards
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { windDirection } from "../utils/formatters";
import { useCountUp } from "../hooks/useCountUp";

const DetailCard = ({
  emoji,
  label,
  value,
  numericValue,
  isDark,
  suffix = "",
}) => {
  const animated = useCountUp(numericValue, 800, 0);

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -2,
      }}
      transition={{ duration: 0.2 }}
      className={`
        flex flex-col items-center justify-center
        p-4 rounded-2xl cursor-default
        transition-shadow duration-200
        ${
          isDark
            ? "glass hover:shadow-[0_8px_30px_rgba(96,165,250,0.15)]"
            : "glass-light hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
        }
      `}
    >
      {/* Animated Emoji */}
      <motion.span
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
        className="text-2xl mb-1"
      >
        {emoji}
      </motion.span>

      {/* Label */}
      <p
        className={`text-xs mb-1 ${
          isDark ? "text-white/50" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className={`text-sm font-bold ${
          isDark ? "text-white" : "text-slate-800"
        }`}
      >
        {numericValue !== undefined
          ? `${animated}${suffix}`
          : value}
      </p>
    </motion.div>
  );
};

const WeatherDetails = () => {
  const { current, isDark } = useWeatherContext();

  if (!current) return null;

  const details = [
    {
      emoji: "💧",
      label: "Humidity",
      numericValue: current.humidity,
      suffix: "%",
    },
    {
      emoji: "🌬️",
      label: "Wind",
      value: `${current.wind_speed} m/s ${windDirection(
        current.wind_deg
      )}`,
    },
    {
      emoji: "👁️",
      label: "Visibility",
      numericValue: current.visibility,
      suffix: " km",
    },
    {
      emoji: "📊",
      label: "Pressure",
      numericValue: current.pressure,
      suffix: " hPa",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in">
      {details.map((detail, index) => (
        <DetailCard
          key={index}
          {...detail}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

export default WeatherDetails;