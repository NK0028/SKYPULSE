// ─────────────────────────────────────────────
//  EmptyState — Reusable empty/error placeholder
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const EmptyState = ({ emoji = "🌤️", title, subtitle, compact = false }) => {
  const { isDark } = useWeatherContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        flex flex-col items-center justify-center text-center
        ${compact ? "py-6" : "py-10"}
      `}
    >
      <p className={compact ? "text-3xl mb-2" : "text-4xl mb-3"}>
        {emoji}
      </p>
      {title && (
        <p className={`text-sm font-semibold
          ${isDark ? "text-white/50" : "text-slate-500"}`}>
          {title}
        </p>
      )}
      {subtitle && (
        <p className={`text-xs mt-1
          ${isDark ? "text-white/25" : "text-slate-300"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default EmptyState;