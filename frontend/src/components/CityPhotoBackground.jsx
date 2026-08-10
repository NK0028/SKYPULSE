// ─────────────────────────────────────────────
//  CityPhotoBackground — Unsplash city photos
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

// Using Unsplash Source API (free, no key needed)
const getCityPhotoUrl = (city, condition) => {
  const c = condition?.toLowerCase() || "";
  const query = c.includes("rain")    ? `${city} rain`
    : c.includes("snow")              ? `${city} snow`
    : c.includes("thunder")           ? `${city} storm`
    : c.includes("cloud")             ? `${city} cloudy`
    : `${city} skyline`;

  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
};

const CityPhotoBackground = () => {
  const { current, isDark } = useWeatherContext();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    if (!current) return;
    setLoaded(false);
    const url = getCityPhotoUrl(
      current.city, current.condition);
    const img = new Image();
    img.onload = () => {
      setPhotoUrl(url);
      setLoaded(true);
    };
    img.onerror = () => setLoaded(false);
    img.src = url;
  }, [current?.city]);

  if (!photoUrl || !loaded) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={photoUrl}
        className="fixed inset-0 z-[-2]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDark ? 0.08 : 0.12 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        style={{
          backgroundImage   : `url(${photoUrl})`,
          backgroundSize    : "cover",
          backgroundPosition: "center",
        }}
      />
    </AnimatePresence>
  );
};

export default CityPhotoBackground;