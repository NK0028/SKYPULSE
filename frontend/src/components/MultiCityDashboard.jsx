// ─────────────────────────────────────────────
//  MultiCityDashboard — Side-by-side comparison
// ─────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const API = "http://localhost:8000/api";

const CityCard = ({ data, isDark, unit, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`
      relative p-4 rounded-2xl flex flex-col gap-2
      ${isDark ? "bg-white/8" : "bg-black/5"}
    `}
  >
    {/* Remove button */}
    <button
      onClick={() => onRemove(data.city)}
      className="absolute top-2 right-2
        w-5 h-5 rounded-full bg-red-500/20
        text-red-400 text-xs flex items-center
        justify-center hover:bg-red-500/40
        transition-all"
    >
      ✕
    </button>

    {/* City */}
    <p className={`text-xs font-semibold truncate pr-6
      ${isDark ? "text-white/60" : "text-slate-500"}`}>
      {data.city}, {data.country}
    </p>

    {/* Emoji + Temp */}
    <div className="flex items-center gap-2">
      <span className="text-3xl">
        {getWeatherEmoji(data.condition)}
      </span>
      <div>
        <p className={`text-2xl font-black
          ${isDark ? "text-white" : "text-slate-800"}`}>
          {formatTemp(data.temp, unit)}
        </p>
        <p className={`text-xs
          ${isDark ? "text-white/40" : "text-slate-400"}`}>
          {data.description}
        </p>
      </div>
    </div>

    {/* Details */}
    <div className="grid grid-cols-2 gap-1 mt-1">
      {[
        { emoji: "💧", val: `${data.humidity}%`         },
        { emoji: "🌬️", val: `${data.wind_speed}m/s`    },
        { emoji: "↑",  val: formatTemp(data.temp_max, unit),
          color: "#f97316" },
        { emoji: "↓",  val: formatTemp(data.temp_min, unit),
          color: "#60a5fa" },
      ].map((d, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-xs">{d.emoji}</span>
          <span className="text-xs font-medium"
            style={d.color
              ? { color: d.color } : {}}>
            {d.val}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

const MultiCityDashboard = () => {
  const { isDark, unit } = useWeatherContext();
  const [cities,  setCities]  = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const addCity = async () => {
    const city = input.trim();
    if (!city) return;
    if (cities.length >= 4) {
      setError("Maximum 4 cities allowed");
      return;
    }
    if (cities.find((c) => c.city.toLowerCase() ===
        city.toLowerCase())) {
      setError("City already added");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${API}/weather/current?city=${city}`);
      setCities((prev) => [...prev, data]);
      setInput("");
    } catch {
      setError("City not found");
    } finally {
      setLoading(false);
    }
  };

  const removeCity = (cityName) => {
    setCities((prev) =>
      prev.filter((c) => c.city !== cityName));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🗺️ Multi-City Comparison
        <span className={`ml-2 text-xs font-normal
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Compare up to 4 cities
        </span>
      </h3>

      {/* Add city input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCity()}
          placeholder="Add a city..."
          className={`
            flex-1 px-4 py-2.5 rounded-xl text-sm
            outline-none transition-all
            ${isDark
              ? "glass text-white placeholder-white/30"
              : "glass-light text-slate-800 placeholder-slate-400"
            }
          `}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={addCity}
          disabled={loading || cities.length >= 4}
          className="px-4 py-2.5 rounded-xl
            bg-blue-500 hover:bg-blue-600
            text-white text-sm font-bold
            transition-all disabled:opacity-40"
        >
          {loading ? "⏳" : "+ Add"}
        </motion.button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3">
          ⚠️ {error}
        </p>
      )}

      {/* Cities grid */}
      <AnimatePresence>
        {cities.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm text-center py-6
              ${isDark ? "text-white/20" : "text-slate-300"}`}
          >
            Add cities to compare their weather
          </motion.p>
        ) : (
          <div className={`grid gap-3
            ${cities.length === 1 ? "grid-cols-1" :
              cities.length === 2 ? "grid-cols-2" :
              "grid-cols-2"}`}>
            <AnimatePresence>
              {cities.map((city) => (
                <CityCard
                  key={city.city}
                  data={city}
                  isDark={isDark}
                  unit={unit}
                  onRemove={removeCity}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MultiCityDashboard;