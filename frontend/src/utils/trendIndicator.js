export const getFeelsLikeTrend = (hourly) => {
  if (!hourly || hourly.length < 2) return null;
  const diff = hourly[1].feels_like - hourly[0].feels_like;
  if (Math.abs(diff) < 0.5) return { arrow: "→", label: "Steady", color: "#94a3b8" };
  if (diff > 0) return { arrow: "↗", label: "Rising", color: "#f97316" };
  return { arrow: "↘", label: "Falling", color: "#60a5fa" };
};