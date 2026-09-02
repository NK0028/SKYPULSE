// ─────────────────────────────────────────────
//  TravelAdvisor — Weather-based travel advice
// ─────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp, formatDay } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getTravelAdvice = (forecast, travelDate) => {
  if (!forecast?.daily?.length) return null;

  const target = new Date(travelDate);
  const today  = new Date();
  const diffDays = Math.round(
    (target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays > 6) {
    return {
      available: false,
      message: "Travel advice available for trips within 7 days."
    };
  }

  const dayData = forecast.daily[Math.min(
    diffDays, forecast.daily.length - 1)];

  const temp     = dayData.temp_max;
  const humidity = dayData.humidity;
  const pop      = dayData.pop * 100;
  const cond     = dayData.condition.toLowerCase();

  let score    = 100;
  let advice   = [];
  let packing  = [];
  let warnings = [];

  // Score calculation
  if (temp > 38)       { score -= 30; warnings.push("🌡️ Extreme heat expected"); }
  else if (temp > 33)  { score -= 15; advice.push("Stay hydrated"); }
  else if (temp < 5)   { score -= 25; warnings.push("🥶 Very cold conditions"); }
  else if (temp < 15)  { score -= 10; advice.push("Dress in layers"); }

  if (pop > 80)        { score -= 25; warnings.push("🌧️ High chance of rain"); }
  else if (pop > 50)   { score -= 10; advice.push("Carry an umbrella"); }

  if (humidity > 85)   { score -= 15; advice.push("Expect humid conditions"); }

  if (cond.includes("thunder")) { score -= 30; warnings.push("⛈️ Thunderstorms likely"); }
  if (cond.includes("snow"))    { score -= 20; warnings.push("❄️ Snow expected"); }

  // Packing suggestions
  if (temp > 30)       packing.push("👕 Light clothes", "🧴 Sunscreen", "😎 Sunglasses");
  else if (temp > 20)  packing.push("👔 Smart casual", "👟 Comfortable shoes");
  else if (temp > 10)  packing.push("🧥 Light jacket", "👖 Jeans");
  else                 packing.push("🧥 Heavy coat", "🧣 Scarf", "🧤 Gloves");

  if (pop > 40)        packing.push("☂️ Umbrella", "🥾 Waterproof shoes");
  if (temp > 30)       packing.push("💧 Water bottle");

  // Rating
  const getRating = (s) => {
    if (s >= 80) return { label: "Excellent",  emoji: "🌟", color: "#34d399" };
    if (s >= 60) return { label: "Good",        emoji: "✅", color: "#60a5fa" };
    if (s >= 40) return { label: "Fair",        emoji: "⚠️", color: "#fbbf24" };
    if (s >= 20) return { label: "Poor",        emoji: "❌", color: "#f97316" };
    return             { label: "Avoid",        emoji: "🚫", color: "#ef4444" };
  };

  return {
    available : true,
    score     : Math.max(0, score),
    rating    : getRating(Math.max(0, score)),
    temp_max  : temp,
    temp_min  : dayData.temp_min,
    condition : dayData.condition,
    pop,
    humidity,
    advice,
    packing,
    warnings,
    dayData,
  };
};

const TravelAdvisor = () => {
  const { isDark, unit } = useWeatherContext();
  const [destination, setDestination] = useState("");
  const [travelDate,  setTravelDate]  = useState("");
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(
    Date.now() + 6 * 86400000
  ).toISOString().split("T")[0];

  const handleSearch = async () => {
    if (!destination.trim() || !travelDate) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: weather } = await axios.get(
        `${API}/weather/current?city=${destination}`);
      const { data: forecast } = await axios.get(
        `${API}/forecast/?lat=${weather.lat}&lon=${weather.lon}`);

      const advice = getTravelAdvice(forecast, travelDate);
      setResult({ weather, forecast, advice });
    } catch {
      setError("City not found. Please try another.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      {/* Header */}
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        ✈️ Travel Weather Advisor
        <span className={`ml-2 text-xs font-normal
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Get weather advice for your trip
        </span>
      </h3>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="🏙️ Destination city..."
          className={`
            flex-1 px-4 py-3 rounded-2xl text-sm
            outline-none transition-all
            ${isDark
              ? "glass text-white placeholder-white/30"
              : "glass-light text-slate-800 placeholder-slate-400"
            }
          `}
        />
        <input
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          min={today}
          max={maxDate}
          className={`
            px-4 py-3 rounded-2xl text-sm outline-none
            transition-all
            ${isDark
              ? "glass text-white"
              : "glass-light text-slate-800"
            }
          `}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={loading || !destination || !travelDate}
          className="px-5 py-3 rounded-2xl bg-blue-500
            hover:bg-blue-600 text-white font-bold
            text-sm transition-all disabled:opacity-40"
        >
          {loading ? "⏳" : "Check"}
        </motion.button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm
          text-center py-2">
          ⚠️ {error}
        </p>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && result.advice?.available && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* City + Score */}
            <div className={`
              p-4 rounded-2xl flex items-center
              justify-between
              ${isDark ? "bg-white/5" : "bg-black/5"}
            `}>
              <div>
                <p className={`text-lg font-black
                  ${isDark ? "text-white" : "text-slate-800"}`}>
                  {result.weather.city},
                  {result.weather.country}
                </p>
                <p className={`text-xs mt-1
                  ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  {new Date(travelDate).toLocaleDateString([], {
                    weekday: "long",
                    month  : "long",
                    day    : "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black"
                  style={{
                    color: result.advice.rating.color
                  }}>
                  {result.advice.rating.emoji}
                </p>
                <p className="text-sm font-bold mt-1"
                  style={{
                    color: result.advice.rating.color
                  }}>
                  {result.advice.rating.label}
                </p>
              </div>
            </div>

            {/* Weather snapshot */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "High",
                  value: `${Math.round(result.advice.temp_max)}°C`,
                  emoji: "🌡️",
                  color: "#f97316",
                },
                {
                  label: "Rain",
                  value: `${Math.round(result.advice.pop)}%`,
                  emoji: "🌧️",
                  color: "#60a5fa",
                },
                {
                  label: "Humidity",
                  value: `${result.advice.humidity}%`,
                  emoji: "💧",
                  color: "#34d399",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`
                    p-3 rounded-xl text-center
                    ${isDark ? "bg-white/5" : "bg-black/5"}
                  `}
                >
                  <p className="text-lg">{s.emoji}</p>
                  <p className="text-xs mt-1"
                    style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className={`text-xs
                    ${isDark
                      ? "text-white/30"
                      : "text-slate-400"}`}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Score bar */}
            <div>
              <div className="flex justify-between
                text-xs mb-1.5">
                <span className={
                  isDark ? "text-white/50" : "text-slate-400"}>
                  Travel Score
                </span>
                <span style={{
                  color: result.advice.rating.color
                }}>
                  {result.advice.score}/100
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden
                ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: result.advice.rating.color
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${result.advice.score}%`
                  }}
                  transition={{ duration: 1,
                    ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Warnings */}
            {result.advice.warnings.length > 0 && (
              <div className="space-y-2">
                {result.advice.warnings.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2
                      p-2.5 rounded-xl bg-red-500/10
                      border border-red-500/20 text-sm
                      text-red-400"
                  >
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Advice tips */}
            {result.advice.advice.length > 0 && (
              <div className="space-y-1.5">
                <p className={`text-xs font-semibold
                  ${isDark
                    ? "text-white/40"
                    : "text-slate-400"}`}>
                  💡 TIPS
                </p>
                {result.advice.advice.map((a, i) => (
                  <div
                    key={i}
                    className={`text-xs px-3 py-2
                      rounded-xl
                      ${isDark
                        ? "bg-white/5 text-white/70"
                        : "bg-black/5 text-slate-600"
                      }`}
                  >
                    • {a}
                  </div>
                ))}
              </div>
            )}

            {/* Packing list */}
            {result.advice.packing.length > 0 && (
              <div>
                <p className={`text-xs font-semibold mb-2
                  ${isDark
                    ? "text-white/40"
                    : "text-slate-400"}`}>
                  🎒 PACKING LIST
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.advice.packing.map((p, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`
                        text-xs px-3 py-1.5 rounded-xl
                        ${isDark
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                        }
                      `}
                    >
                      {p}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Out of range message */}
        {result && !result.advice?.available && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm text-center py-4
              ${isDark ? "text-white/40" : "text-slate-400"}`}
          >
            {result.advice?.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TravelAdvisor;