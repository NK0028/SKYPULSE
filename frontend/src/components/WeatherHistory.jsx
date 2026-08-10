// ─────────────────────────────────────────────
//  WeatherHistory — Past 7-day temperature trend
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";

const API = "http://localhost:8000/api";

const CustomTooltip = ({ active, payload, isDark, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`
      px-3 py-2 rounded-xl text-xs font-medium
      ${isDark ? "glass text-white" : "glass-light text-slate-800"}
    `}>
      <p>{payload[0]?.payload?.day}</p>
      <p className="text-purple-400 font-bold">
        {formatTemp(payload[0]?.value, unit)}
      </p>
    </div>
  );
};

const WeatherHistory = () => {
  const { current, isDark, unit } = useWeatherContext();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!current) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const days = [];
        const now  = Math.floor(Date.now() / 1000);

        // OpenWeather One Call timemachine — last 7 days
        const requests = Array.from({ length: 7 }, (_, i) => {
          const dt = now - (i + 1) * 86400;
          return axios.get(
            `${API}/weather/history`,
            { params: { lat: current.lat,
                        lon: current.lon, dt } }
          ).catch(() => null);
        });

        const results = await Promise.all(requests);
        const parsed = results
          .map((r, i) => {
            if (!r?.data) return null;
            const date = new Date(
              (now - (i + 1) * 86400) * 1000);
            return {
              day : date.toLocaleDateString([],
                { weekday: "short" }),
              temp: r.data.temp,
            };
          })
          .filter(Boolean)
          .reverse();

        setHistory(parsed.length ? parsed : null);
      } catch {
        setHistory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [current?.city]);

  if (!current) return null;

  // Fallback — synthetic data if API plan doesn't support history
  const displayData = history || Array.from(
    { length: 7 }, (_, i) => {
      const date = new Date(
        Date.now() - (7 - i) * 86400000);
      return {
        day : date.toLocaleDateString([],
          { weekday: "short" }),
        temp: current.temp +
          (Math.random() * 6 - 3),
      };
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-1
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📊 7-Day History
      </h3>
      <p className={`text-xs mb-4
        ${isDark ? "text-white/30" : "text-slate-400"}`}>
        {history
          ? "Actual recorded temperatures"
          : "Estimated trend (history API unavailable)"}
      </p>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="histGrad"
              x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"
                stopColor="#a78bfa" stopOpacity={0.3}/>
              <stop offset="95%"
                stopColor="#a78bfa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day"
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
            tickFormatter={(v) => `${Math.round(v)}°`}
            width={30}
          />
          <Tooltip content={
            <CustomTooltip isDark={isDark} unit={unit}/>
          }/>
          <Area
            type="monotone" dataKey="temp"
            stroke="#a78bfa" strokeWidth={2}
            fill="url(#histGrad)"
            dot={{ r: 3, fill: "#a78bfa" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default WeatherHistory;