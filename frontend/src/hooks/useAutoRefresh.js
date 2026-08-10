// ─────────────────────────────────────────────
//  useAutoRefresh — Refresh every 10 minutes
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "./useWeather";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const useAutoRefresh = () => {
  const { city, current } = useWeatherContext();
  const { fetchByCity, fetchByCoords } = useWeather();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!current) return;

    intervalRef.current = setInterval(() => {
      if (city) {
        fetchByCity(city);
      } else if (current?.lat && current?.lon) {
        fetchByCoords(current.lat, current.lon);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [current?.city]);

  return null;
};