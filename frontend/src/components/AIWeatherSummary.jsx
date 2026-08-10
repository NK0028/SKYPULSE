// ─────────────────────────────────────────────
//  AIWeatherSummary — Claude AI weather insight
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext }       from "../context/WeatherContext";

const AIWeatherSummary = () => {
  const { current, forecast, isDark } = useWeatherContext();
  const [summary,  setSummary]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [cityKey,  setCityKey]  = useState("");

  useEffect(() => {
    if (!current || current.city === cityKey) return;
    generateSummary();
  }, [current?.city]);

  const generateSummary = async () => {
    if (!current) return;
    setLoading(true);
    setError("");
    setSummary("");
    setCityKey(current.city);

    const prompt = `You are a friendly weather assistant. 
Give a 2-sentence conversational weather summary for:
City: ${current.city}, ${current.country}
Temperature: ${Math.round(current.temp)}°C (feels like ${Math.round(current.feels_like)}°C)
Condition: ${current.description}
Humidity: ${current.humidity}%
Wind: ${current.wind_speed} m/s
AQI context: moderate

Make it friendly, include an activity suggestion, and end with an emoji.
Keep it under 60 words.`;

    try {
      const response = await fetch(
        "https://api.anthropic.com/v1/messages", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          model     : "claude-sonnet-4-6",
          max_tokens: 150,
          messages  : [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      setSummary(text);
    } catch {
      // Fallback — generate locally
      const condition = current.condition.toLowerCase();
      const temp      = Math.round(current.temp);
      const fallbacks = [
        `${current.city} is ${current.description} at ${temp}°C today. ${temp > 30 ? "Stay hydrated and seek shade! ☀️" : temp < 10 ? "Bundle up and stay warm! 🧥" : "Perfect weather for a walk outside! 🚶"}`,
        `It's a ${current.description} day in ${current.city} with ${temp}°C. ${condition.includes("rain") ? "Don't forget your umbrella! ☂️" : condition.includes("clear") ? "Great day for outdoor activities! 🌟" : "Dress comfortably for the day! 😊"}`,
      ];
      setSummary(fallbacks[Math.floor(
        Math.random() * fallbacks.length)]);
    } finally {
      setLoading(false);
    }
  };

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <div className="flex items-center
        justify-between mb-3">
        <h3 className={`text-sm font-semibold
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          🤖 AI Weather Insight
        </h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={generateSummary}
          disabled={loading}
          className={`text-xs px-2.5 py-1 rounded-lg
            transition-all
            ${isDark
              ? "bg-white/8 text-white/40 hover:bg-white/15"
              : "bg-black/5 text-slate-400 hover:bg-black/10"
            }`}
        >
          {loading ? "⏳" : "↺ Refresh"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full
                    bg-blue-400"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat  : Infinity,
                    delay   : i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className={`text-sm
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              Generating insight...
            </span>
          </motion.div>
        ) : summary ? (
          <motion.p
            key="summary"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm leading-relaxed
              ${isDark ? "text-white/80" : "text-slate-700"}`}
          >
            {summary}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIWeatherSummary;