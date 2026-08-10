// ─────────────────────────────────────────────
//  weatherIcons — Colorful SVG-based icons
// ─────────────────────────────────────────────

// OpenWeatherMap colored icons (2x resolution)
export const getIconUrl = (icon) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

// Animated emoji with color context
export const getWeatherEmoji = (condition) => {
  if (!condition) return "🌤️";
  const c = condition.toLowerCase();
  if (c.includes("thunder"))            return "⛈️";
  if (c.includes("drizzle"))            return "🌦️";
  if (c.includes("heavy rain"))         return "🌧️";
  if (c.includes("rain"))               return "🌧️";
  if (c.includes("snow"))               return "❄️";
  if (c.includes("sleet"))              return "🌨️";
  if (c.includes("mist"))               return "🌫️";
  if (c.includes("smoke"))              return "🌫️";
  if (c.includes("haze"))               return "🌫️";
  if (c.includes("dust"))               return "🌪️";
  if (c.includes("fog"))                return "🌁";
  if (c.includes("sand"))               return "🌪️";
  if (c.includes("ash"))                return "🌋";
  if (c.includes("squall"))             return "💨";
  if (c.includes("tornado"))            return "🌪️";
  if (c.includes("clear"))              return "☀️";
  if (c.includes("few clouds"))         return "🌤️";
  if (c.includes("scattered clouds"))   return "⛅";
  if (c.includes("broken clouds"))      return "🌥️";
  if (c.includes("overcast"))           return "☁️";
  if (c.includes("cloud"))              return "⛅";
  return "🌡️";
};

// Background gradient per condition
export const getWeatherGradient = (condition, isDark) => {
  const c = condition?.toLowerCase() || "";
  if (!isDark) {
    if (c.includes("clear"))   return "from-amber-100 to-sky-200";
    if (c.includes("cloud"))   return "from-slate-200 to-gray-100";
    if (c.includes("rain"))    return "from-blue-200 to-indigo-100";
    if (c.includes("thunder")) return "from-gray-400 to-purple-200";
    if (c.includes("snow"))    return "from-blue-50 to-white";
    return "from-sky-100 to-blue-50";
  }
  if (c.includes("clear"))    return "from-[#0f2027] via-[#203a43] to-[#2c5364]";
  if (c.includes("cloud"))    return "from-[#2c3e50] via-[#3d5068] to-[#2c3e50]";
  if (c.includes("rain"))     return "from-[#0f0c29] via-[#1a1a6e] to-[#24243e]";
  if (c.includes("thunder"))  return "from-[#0a0a1a] via-[#1a0a3a] to-[#0a0a1a]";
  if (c.includes("snow"))     return "from-[#1a2a4a] via-[#2a3a5a] to-[#1a2a4a]";
  return "from-[#0f0c29] via-[#302b63] to-[#24243e]";
};

// Color per condition for UI accents
export const getConditionColor = (condition) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("clear"))   return "#fbbf24";
  if (c.includes("cloud"))   return "#94a3b8";
  if (c.includes("rain"))    return "#60a5fa";
  if (c.includes("thunder")) return "#a78bfa";
  if (c.includes("snow"))    return "#bae6fd";
  if (c.includes("mist") ||
      c.includes("fog"))     return "#cbd5e1";
  return "#60a5fa";
};