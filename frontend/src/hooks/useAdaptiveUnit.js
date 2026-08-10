// ─────────────────────────────────────────────
//  useAdaptiveUnit — Auto-set °F/°C by country
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";

// Countries that primarily use Fahrenheit
const FAHRENHEIT_COUNTRIES = new Set([
  "US", "BS", "BZ", "KY", "PW", "FM", "MH", "LR",
]);

export const useAdaptiveUnit = () => {
  const { current, unit, toggleUnit } = useWeatherContext();
  const hasAutoSet = useRef(new Set());

  useEffect(() => {
    if (!current?.country) return;
    // Only auto-adjust once per unique country search
    // (never overrides a manual toggle after that)
    if (hasAutoSet.current.has(current.country)) return;
    hasAutoSet.current.add(current.country);

    const shouldBeF = FAHRENHEIT_COUNTRIES.has(current.country);
    if (shouldBeF && unit === "C") toggleUnit();
    if (!shouldBeF && unit === "F") toggleUnit();
  }, [current?.country]);
};