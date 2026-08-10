// ─────────────────────────────────────────────
//  useOfflineCache — Cache last weather locally
// ─────────────────────────────────────────────

import { useEffect } from "react";
import { useWeatherContext } from "../context/WeatherContext";

const CACHE_KEY = "skyPulseLastWeather";

export const useOfflineCache = () => {
  const { current, forecast, airQuality,
          setCurrent, setForecast, setAirQuality } =
    useWeatherContext();

  // Save to cache whenever data updates
  useEffect(() => {
    if (current) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        current, forecast, airQuality,
        timestamp: Date.now(),
      }));
    }
  }, [current, forecast, airQuality]);

  // Load from cache on mount if offline
  useEffect(() => {
    if (!navigator.onLine) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setCurrent(data.current);
        setForecast(data.forecast);
        setAirQuality(data.airQuality);
      }
    }
  }, []);

  return null;
};