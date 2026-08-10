// ─────────────────────────────────────────────
//  Formatters — Temperature, time, date helpers
// ─────────────────────────────────────────────

export const celsiusToFahrenheit = (c) =>
  Math.round((c * 9) / 5 + 32);

export const formatTemp = (temp, unit) => {
  if (unit === "F")
    return `${celsiusToFahrenheit(temp)}°F`;
  return `${Math.round(temp)}°C`;
};

export const formatTime = (unix) => {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour  : "2-digit",
    minute: "2-digit",
  });
};

export const formatHour = (unix) => {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour  : "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDay = (unix) => {
  return new Date(unix * 1000).toLocaleDateString([], {
    weekday: "short",
  });
};

export const formatFullDay = (unix) => {
  return new Date(unix * 1000).toLocaleDateString([], {
    weekday: "long",
    month  : "short",
    day    : "numeric",
  });
};

export const formatDate = (unix) => {
  return new Date(unix * 1000).toLocaleDateString([], {
    month: "short",
    day  : "numeric",
  });
};

export const windDirection = (deg) => {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
};

export const getAQILabel = (aqi) => {
  const labels = {
    1: { label: "Good",      color: "#00e400" },
    2: { label: "Fair",      color: "#ffff00" },
    3: { label: "Moderate",  color: "#ff7e00" },
    4: { label: "Poor",      color: "#ff0000" },
    5: { label: "Very Poor", color: "#8f3f97" },
  };
  return labels[aqi] || { label: "Unknown", color: "#999" };
};

export const getUVLabel = (uv) => {
  if (uv <= 2)  return { label: "Low",       color: "#3ea72d" };
  if (uv <= 5)  return { label: "Moderate",  color: "#f9a825" };
  if (uv <= 7)  return { label: "High",      color: "#e65100" };
  if (uv <= 10) return { label: "Very High", color: "#b71c1c" };
  return        { label: "Extreme",          color: "#6a1b9a" };
};