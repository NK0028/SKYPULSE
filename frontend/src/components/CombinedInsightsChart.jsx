// ─────────────────────────────────────────────
//  CombinedInsightsChart — Temp+Humidity+AQI together
// ─────────────────────────────────────────────

import {
  ComposedChart, Line, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatHour } from "../utils/formatters";

const CombinedInsightsChart = () => {
  const { forecast, airQuality, isDark } = useWeatherContext();
  if (!forecast?.hourly?.length) return null;

  const data = forecast.hourly.slice(0, 12).map((h, i) => ({
    time    : i === 0 ? "Now" : formatHour(h.dt),
    temp    : Math.round(h.temp),
    humidity: h.humidity,
    aqi     : airQuality?.aqi ? airQuality.aqi * 20 : null, // scaled for visibility
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-1
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📊 Combined Insights
      </h3>
      <p className={`text-xs mb-4
        ${isDark ? "text-white/30" : "text-slate-400"}`}>
        Temperature, humidity & air quality together
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time"
            tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
              fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{
              background: isDark ? "#1a1f35" : "#fff",
              border: "none", borderRadius: 12, fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="temp" name="Temp °"
            stroke="#f97316" fill="url(#tempFill)" strokeWidth={2} />
          <Line type="monotone" dataKey="humidity" name="Humidity %"
            stroke="#60a5fa" strokeWidth={2} dot={false} />
          {data[0].aqi !== null && (
            <Line type="monotone" dataKey="aqi" name="AQI (×20)"
              stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CombinedInsightsChart;