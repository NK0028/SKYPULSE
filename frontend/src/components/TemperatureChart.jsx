// ─────────────────────────────────────────────
//  TemperatureChart — 24hr temperature curve
// ─────────────────────────────────────────────

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatHour, formatTemp } from "../utils/formatters";

const CustomTooltip = ({ active, payload, isDark, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`
      px-3 py-2 rounded-xl text-xs font-medium
      ${isDark ? "glass text-white" : "glass-light text-slate-800"}
    `}>
      <p>{payload[0]?.payload?.time}</p>
      <p className="text-blue-400 font-bold">
        {formatTemp(payload[0]?.value, unit)}
      </p>
    </div>
  );
};

const TemperatureChart = () => {
  const { forecast, isDark, unit } = useWeatherContext();
  if (!forecast?.hourly?.length) return null;

  const data = forecast.hourly.map((h, i) => ({
    time : i === 0 ? "Now" : formatHour(h.dt),
    temp : Math.round(h.temp),
    feels: Math.round(h.feels_like),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        ${isDark ? "glass" : "glass-light"} p-5
      `}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📈 Temperature Trend
      </h3>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"
                stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%"
                stopColor="#60a5fa" stopOpacity={0}   />
            </linearGradient>
            <linearGradient
              id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"
                stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%"
                stopColor="#f97316" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="time"
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
              fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
              fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}°`}
            width={30}
          />
          <Tooltip
            content={
              <CustomTooltip isDark={isDark} unit={unit} />
            }
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#60a5fa" }}
          />
          <Area
            type="monotone"
            dataKey="feels"
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="url(#feelsGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "#f97316" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-400 rounded"/>
          <span className={`text-xs
            ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Temperature
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-orange-400
            rounded border-dashed"/>
          <span className={`text-xs
            ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Feels like
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TemperatureChart;