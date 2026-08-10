// ─────────────────────────────────────────────
//  StreakBadgesPanel — Streak counter + badge showcase
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeatherStreak } from "../hooks/useWeatherStreak";
import { useAchievements } from "../hooks/useAchievements";

const StreakBadgesPanel = () => {
  const { current, isDark } = useWeatherContext();
  const streak = useWeatherStreak();
  const { unlocked, allBadges } = useAchievements(current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          🔥 Streak & Achievements
        </h3>
        <div className={`px-3 py-1 rounded-xl text-sm font-black
          ${isDark ? "bg-orange-500/15 text-orange-400"
                   : "bg-orange-100 text-orange-600"}`}>
          {streak} day{streak !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {allBadges.map((b) => {
          const isUnlocked = unlocked.includes(b.id);
          return (
            <div
              key={b.id}
              title={b.label}
              className={`
                aspect-square rounded-2xl flex items-center
                justify-center text-2xl transition-all
                ${isUnlocked
                  ? isDark ? "bg-yellow-500/15" : "bg-yellow-50"
                  : isDark ? "bg-white/5 grayscale opacity-30"
                           : "bg-black/5 grayscale opacity-30"
                }
              `}
            >
              {b.emoji}
            </div>
          );
        })}
      </div>
      <p className={`text-xs mt-3 text-center
        ${isDark ? "text-white/30" : "text-slate-400"}`}>
        {unlocked.length} / {allBadges.length} badges unlocked
      </p>
    </motion.div>
  );
};

export default StreakBadgesPanel;