// ─────────────────────────────────────────────
//  useWeatherStreak — Daily visit streak tracker
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";

const STREAK_KEY = "skyPulseStreak";

export const useWeatherStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const raw = localStorage.getItem(STREAK_KEY);
      const data = raw ? JSON.parse(raw) : { lastVisit: null, count: 0 };

      if (data.lastVisit === today) {
        setStreak(data.count);
        return;
      }

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount = data.lastVisit === yesterday ? data.count + 1 : 1;

      localStorage.setItem(STREAK_KEY, JSON.stringify({
        lastVisit: today, count: newCount,
      }));
      setStreak(newCount);
    } catch { setStreak(1); }
  }, []);

  return streak;
};