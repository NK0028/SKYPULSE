// ─────────────────────────────────────────────
//  TimeOfDaySkin — Dynamic time-based gradient
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";

const getTimeGradient = (isDark) => {
  const h = new Date().getHours();
  if (!isDark) return null; // light mode uses its own

  if (h >= 5  && h < 7)  // Dawn
    return "from-[#1a1a2e] via-[#4a2c6e] to-[#e07b39]";
  if (h >= 7  && h < 10) // Morning
    return "from-[#0f0c29] via-[#302b63] to-[#24243e]";
  if (h >= 10 && h < 16) // Day
    return "from-[#0f2027] via-[#203a43] to-[#2c5364]";
  if (h >= 16 && h < 19) // Golden hour
    return "from-[#1a1a2e] via-[#7b3f00] to-[#e07b39]";
  if (h >= 19 && h < 21) // Dusk
    return "from-[#0f0c29] via-[#4a1c8e] to-[#e07b39]";
  return // Night
    "from-[#020111] via-[#0f0c29] to-[#191621]";
};

export const useTimeGradient = (isDark) => {
  const [gradient, setGradient] = useState(
    getTimeGradient(isDark));

  useEffect(() => {
    const interval = setInterval(() => {
      setGradient(getTimeGradient(isDark));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [isDark]);

  return gradient;
};