// ─────────────────────────────────────────────
//  WindHumidityChart — Wind speed + humidity
// ─────────────────────────────────────────────

import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatHour } from "../utils/formatters";

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`
      px-3 py-2 rounded-xl text-xs font-medium
      ${isDark
        ? "glass text-white"
        : "glass-light text-slate-800"}
    `}>
      <p className="mb-1 opacity-60">
        {payload[0]?.payload?.time}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
          {p.name === "Humidity" ? "%" : " m/s"}
        </p>
      ))}
    </div>
  );
};

const WindHumidityChart = () => {
  const { forecast, isDark } = useWeatherContext();
  const [active, setActive]  = useState("both");

  if (!forecast?.hourly?.length) return null;

  const data = forecast.hourly.map((h, i) => ({
    time    : i === 0 ? "Now" : formatHour(h.dt),
    wind    : h.wind_speed || 0,
    humidity: h.humidity,
  }));

  const tabs = ["both", "wind", "humidity"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <div className="flex items-center
        justify-between mb-4">
        <h3 className={`text-sm font-semibold
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          🌬️ Wind & Humidity
        </h3>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`
                text-xs px-2.5 py-1 rounded-lg
                capitalize transition-all
                ${active === t
                  ? "bg-blue-500 text-white"
                  : isDark
                    ? "text-white/40 hover:text-white/70"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time"
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)", fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            width={25}
          />
          <Tooltip content={
            <CustomTooltip isDark={isDark} />
          }/>
          {(active === "both" ||
            active === "humidity") && (
            <Bar dataKey="humidity" name="Humidity"
              fill="#60a5fa" opacity={0.6}
              radius={[4, 4, 0, 0]} />
          )}
          {(active === "both" ||
            active === "wind") && (
            <Line dataKey="wind" name="Wind"
              stroke="#f97316" strokeWidth={2}
              dot={false} type="monotone" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default WindHumidityChart;