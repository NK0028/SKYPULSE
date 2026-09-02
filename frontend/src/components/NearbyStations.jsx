// ─────────────────────────────────────────────
//  NearbyStations — Live readouts from nearby cities
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Small fixed offsets to sample a few nearby points (~40-60km)
const OFFSETS = [
  { dLat:  0.4, dLon:  0.4 },
  { dLat: -0.4, dLon:  0.4 },
  { dLat:  0.4, dLon: -0.4 },
];

const NearbyStations = () => {
  const { current, isDark, unit } = useWeatherContext();
  const [stations, setStations] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setLoading(true);

    Promise.all(
      OFFSETS.map(({ dLat, dLon }) =>
        axios.get(`${API}/weather/current`, {
          params: {
            lat: current.lat + dLat,
            lon: current.lon + dLon,
          },
        }).then((r) => r.data).catch(() => null)
      )
    ).then((results) => {
      if (!cancelled) {
        setStations(results.filter(Boolean));
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [current?.city]);

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📡 Nearby Readings
      </h3>

      {loading && (
        <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Loading nearby stations...
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {stations.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-xl text-center
              ${isDark ? "bg-white/5" : "bg-black/5"}`}
          >
            <p className="text-xl">{getWeatherEmoji(s.condition)}</p>
            <p className={`text-xs mt-1 truncate
              ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {s.city}
            </p>
            <p className={`text-sm font-bold
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {formatTemp(s.temp, unit)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NearbyStations;