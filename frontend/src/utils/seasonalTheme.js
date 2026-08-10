// ─────────────────────────────────────────────
//  seasonalTheme — Auto seasonal accent shifts
// ─────────────────────────────────────────────

export const getSeasonalAccent = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 9 && month <= 11)  return { name: "autumn", color: "#f97316", emoji: "🍂" };
  if (month === 12 || month <= 2) return { name: "winter", color: "#60a5fa", emoji: "❄️" };
  if (month >= 3 && month <= 5)   return { name: "spring", color: "#34d399", emoji: "🌸" };
  return                              { name: "summer", color: "#fbbf24", emoji: "☀️" };
};