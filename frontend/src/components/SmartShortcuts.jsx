// ─────────────────────────────────────────────
//  SmartShortcuts — Auto-detected frequent cities
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "../hooks/useWeather";

const FREQ_KEY = "skyPulseCityFrequency";
const MIN_VISITS_TO_SUGGEST = 3;

export const trackCityVisit = (city) => {
  try {
    const raw = localStorage.getItem(FREQ_KEY);
    const freq = raw ? JSON.parse(raw) : {};
    freq[city] = (freq[city] || 0) + 1;
    localStorage.setItem(FREQ_KEY, JSON.stringify(freq));
  } catch { /* ignore */ }
};

const SmartShortcuts = () => {
  const { isDark, current } = useWeatherContext();
  const { fetchByCity } = useWeather();
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    if (current?.city) trackCityVisit(current.city);
  }, [current?.city]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FREQ_KEY);
      const freq = raw ? JSON.parse(raw) : {};
      const top = Object.entries(freq)
        .filter(([, count]) => count >= MIN_VISITS_TO_SUGGEST)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([city]) => city)
        .filter((c) => c !== current?.city);
      setShortcuts(top);
    } catch { setShortcuts([]); }
  }, [current?.city]);

  if (!shortcuts.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 flex-wrap"
    >
      <span className={`text-xs
        ${isDark ? "text-white/30" : "text-slate-400"}`}>
        🔥 Often checked:
      </span>
      {shortcuts.map((city) => (
        <button
          key={city}
          onClick={() => fetchByCity(city)}
          className={`
            text-xs px-3 py-1.5 rounded-xl transition-all
            ${isDark
              ? "bg-white/8 text-white/70 hover:bg-white/15"
              : "bg-black/5 text-slate-600 hover:bg-black/10"
            }
          `}
        >
          {city}
        </button>
      ))}
    </motion.div>
  );
};

export default SmartShortcuts;