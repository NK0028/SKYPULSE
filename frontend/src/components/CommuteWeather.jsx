// ─────────────────────────────────────────────
//  CommuteWeather — Home vs Work weather snapshot
// ─────────────────────────────────────────────

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "skyPulseCommute";

const CommuteWeather = () => {
  const { isDark, unit } = useWeatherContext();
  const [home, setHome] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.home || ""; }
    catch { return ""; }
  });
  const [work, setWork] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.work || ""; }
    catch { return ""; }
  });
  const [data, setData] = useState({ home: null, work: null });
  const [loading, setLoading] = useState(false);

  const checkCommute = async () => {
    if (!home.trim() || !work.trim()) return;
    setLoading(true);
    try {
      const [h, w] = await Promise.all([
        axios.get(`${API}/weather/current?city=${home}`),
        axios.get(`${API}/weather/current?city=${work}`),
      ]);
      setData({ home: h.data, work: w.data });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ home, work }));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const CityCard = ({ label, weather }) => (
    <div className={`p-4 rounded-2xl flex-1
      ${isDark ? "bg-white/5" : "bg-black/5"}`}>
      <p className={`text-xs mb-2
        ${isDark ? "text-white/40" : "text-slate-400"}`}>
        {label}
      </p>
      {weather ? (
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getWeatherEmoji(weather.condition)}</span>
          <div>
            <p className={`text-xl font-black
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {formatTemp(weather.temp, unit)}
            </p>
            <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
              {weather.city}
            </p>
          </div>
        </div>
      ) : (
        <p className={`text-sm ${isDark ? "text-white/20" : "text-slate-300"}`}>
          Not checked yet
        </p>
      )}
    </div>
  );

  // Explicit inline colors — wins over any global input style
  // AND overrides native browser color-scheme defaults that can
  // silently force a white background under dark mode
  const inputStyle = {
    color: isDark ? "#ffffff" : "#1e293b",
    caretColor: isDark ? "#ffffff" : "#1e293b",
    WebkitTextFillColor: isDark ? "#ffffff" : "#1e293b",
    backgroundColor: isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.05)",
    colorScheme: isDark ? "dark" : "light",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🚗 Commute Weather
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          value={home}
          onChange={(e) => setHome(e.target.value)}
          placeholder="🏠 Home city"
          style={inputStyle}
          className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none
            ${isDark ? "placeholder-white/30" : "placeholder-slate-400"}`}
        />
        <input
          value={work}
          onChange={(e) => setWork(e.target.value)}
          placeholder="🏢 Work city"
          style={inputStyle}
          className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none
            ${isDark ? "placeholder-white/30" : "placeholder-slate-400"}`}
        />
        <button
          onClick={checkCommute}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600
            text-white text-sm font-bold disabled:opacity-40"
        >
          {loading ? "⏳" : "Check"}
        </button>
      </div>

      <div className="flex gap-3">
        <CityCard label="Morning · Home" weather={data.home} />
        <CityCard label="Evening · Work" weather={data.work} />
      </div>
    </motion.div>
  );
};

export default CommuteWeather;