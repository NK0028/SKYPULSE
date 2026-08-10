// ─────────────────────────────────────────────
//  SevereAlertPanel — Flood/Tornado/Disaster warnings
//  Free sources: GDACS (global) + NWS (US)
//  + Colorblind-safe severity colors
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { cbColor } from "../utils/colorPalette";

const API = "http://localhost:8000/api";

const SEVERITY_COLOR = {
  Red:      "#ef4444",
  Orange:   "#f97316",
  Yellow:   "#eab308",
  Green:    "#22c55e",
  Extreme:  "#ef4444",
  Severe:   "#f97316",
  Moderate: "#eab308",
  Minor:    "#60a5fa",
  Unknown:  "#94a3b8",
};

const TYPE_EMOJI = {
  FL: "🌊", TC: "🌀", EQ: "🌐", VO: "🌋", DR: "🏜️",
  "Flood Warning": "🌊", "Tornado Warning": "🌪️",
  "Severe Thunderstorm Warning": "⛈️",
};

const getEmoji = (type) => TYPE_EMOJI[type] ||
  (type?.toLowerCase().includes("flood")   ? "🌊" :
   type?.toLowerCase().includes("tornado") ? "🌪️" :
   type?.toLowerCase().includes("storm")   ? "⛈️" : "⚠️");

const SevereAlertPanel = () => {
  const { current, isDark } = useWeatherContext();
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setLoading(true);

    axios.get(`${API}/weather/severe-alerts`, {
      params: { lat: current.lat, lon: current.lon }
    })
      .then((r) => {
        if (!cancelled) setAlerts(r.data.alerts || []);
      })
      .catch(() => { if (!cancelled) setAlerts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [current?.city]);

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          🚨 Severe Weather Alerts
        </h3>
        <span className={`text-xs
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          GDACS + NWS
        </span>
      </div>

      {loading && (
        <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Checking for active alerts...
        </p>
      )}

      {!loading && alerts.length === 0 && (
        <div className="flex items-center gap-3 py-2">
          <span className="text-2xl">✅</span>
          <p className={`text-sm
            ${isDark ? "text-white/60" : "text-slate-500"}`}>
            No active severe alerts near {current.city}
          </p>
        </div>
      )}

      <AnimatePresence>
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => {
            const color = cbColor(
              SEVERITY_COLOR[alert.severity] || SEVERITY_COLOR.Unknown);
            return (
              <motion.a
                key={i}
                href={alert.url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`
                  flex items-start gap-3 p-3 rounded-2xl
                  transition-all cursor-pointer
                  ${isDark ? "bg-white/5 hover:bg-white/10"
                           : "bg-black/5 hover:bg-black/10"}
                `}
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <span className="text-xl flex-shrink-0">
                  {getEmoji(alert.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate
                    ${isDark ? "text-white/90" : "text-slate-700"}`}>
                    {alert.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold"
                      style={{ color }}>
                      {alert.severity}
                    </span>
                    <span className={`text-xs
                      ${isDark ? "text-white/30" : "text-slate-400"}`}>
                      • {alert.source}
                    </span>
                    {alert.distance_km > 0 && (
                      <span className={`text-xs
                        ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        • {alert.distance_km} km away
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SevereAlertPanel;