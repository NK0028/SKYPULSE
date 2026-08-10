// ─────────────────────────────────────────────
//  Weather Context — Global state management
// ─────────────────────────────────────────────

import { createContext, useContext, useState } from "react";

const WeatherContext = createContext(null);

export const WeatherProvider = ({ children }) => {
  const [current,  setCurrent]  = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [unit,     setUnit]     = useState("C");
  const [isDark,   setIsDark]   = useState(true);
  const [city,     setCity]     = useState("");

  const toggleUnit = () =>
    setUnit((u) => (u === "C" ? "F" : "C"));

  const toggleTheme = () =>
    setIsDark((d) => !d);

  return (
    <WeatherContext.Provider value={{
      current,  setCurrent,
      forecast, setForecast,
      airQuality, setAirQuality,
      loading,  setLoading,
      error,    setError,
      unit,     toggleUnit,
      isDark,   toggleTheme,
      city,     setCity,
    }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeatherContext = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error(
    "useWeatherContext must be inside WeatherProvider");
  return ctx;
};