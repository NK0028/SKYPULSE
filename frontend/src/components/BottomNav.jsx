// ─────────────────────────────────────────────
//  BottomNav — 6 tabs for full mobile coverage
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const TABS = [
  { id: "home",     emoji: "🏠", label: "Home"    },
  { id: "forecast", emoji: "📅", label: "Forecast" },
  { id: "charts",   emoji: "📈", label: "Charts"  },
  { id: "map",      emoji: "🗺️", label: "Map"    },
  { id: "travel",   emoji: "✈️", label: "Travel" },
  { id: "stats",    emoji: "🔬", label: "Stats"   },
];

const BottomNav = ({ activeTab, onTabChange }) => {
  const { isDark } = useWeatherContext();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200,
        damping: 25 }}
      className={`
        fixed bottom-0 left-0 right-0 z-50
        lg:hidden px-2 py-2 pb-safe
        ${isDark ? "glass" : "glass-light"}
        flex items-center justify-around
      `}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.8 }}
            className={`
              relative flex flex-col items-center
              gap-0.5 px-2 py-1 rounded-xl
              transition-all duration-200
              ${isActive
                ? "text-blue-400"
                : isDark
                  ? "text-white/30"
                  : "text-slate-400"
              }
            `}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 rounded-xl
                  bg-blue-500/15"
                transition={{ type: "spring",
                  stiffness: 300, damping: 30 }}
              />
            )}
            <span className={`text-lg transition-all
              ${isActive ? "scale-110" : "scale-100"}`}>
              {tab.emoji}
            </span>
            <span className="text-[10px] font-medium
              relative z-10">
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

export default BottomNav;