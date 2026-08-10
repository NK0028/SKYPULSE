// ─────────────────────────────────────────────
//  FavoriteCities — Save & quick-load cities
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "../hooks/useWeather";

const FavoriteCities = () => {
  const { current, isDark } = useWeatherContext();
  const { fetchByCity }     = useWeather();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("skyPulseFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "skyPulseFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = () => {
    if (!current) return;
    const city = current.city;
    if (favorites.includes(city)) return;
    setFavorites([...favorites, city]);
  };

  const removeFavorite = (city) => {
    setFavorites(favorites.filter((f) => f !== city));
  };

  const isFavorite = current &&
    favorites.includes(current.city);

  return (
    <div className={`
      ${isDark ? "glass" : "glass-light"} p-5
    `}>
      <div className="flex items-center
        justify-between mb-4">
        <h3 className={`text-sm font-semibold
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          ⭐ Favorite Cities
        </h3>
        {current && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={addFavorite}
            disabled={isFavorite}
            className={`
              text-xs px-3 py-1.5 rounded-xl
              font-medium transition-all
              ${isFavorite
                ? isDark
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-yellow-600 bg-yellow-100"
                : isDark
                  ? "text-white/50 bg-white/5 hover:bg-white/10"
                  : "text-slate-500 bg-black/5 hover:bg-black/10"
              }
            `}
          >
            {isFavorite ? "★ Saved" : "+ Save"}
          </motion.button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className={`text-xs text-center py-4
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Search a city and save it here
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {favorites.map((city) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5
                  rounded-xl text-sm cursor-pointer
                  transition-all group
                  ${isDark
                    ? "bg-white/8 hover:bg-white/15 text-white"
                    : "bg-black/5 hover:bg-black/10 text-slate-800"
                  }
                `}
                onClick={() => fetchByCity(city)}
              >
                <span>🏙️</span>
                <span className="font-medium">{city}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(city);
                  }}
                  className={`
                    ml-1 opacity-0 group-hover:opacity-100
                    transition-opacity text-xs
                    ${isDark
                      ? "text-white/40 hover:text-red-400"
                      : "text-slate-400 hover:text-red-500"
                    }
                  `}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FavoriteCities;