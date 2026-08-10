// ─────────────────────────────────────────────
//  useAchievements — Unlockable weather badges
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BADGES_KEY = "skyPulseBadges";

const BADGE_DEFS = [
  { id: "first_snow",   emoji: "❄️", label: "First Snow",       test: (c) => c.condition.toLowerCase().includes("snow") },
  { id: "heat_survivor", emoji: "🥵", label: "Heat Survivor",     test: (c) => c.temp >= 40 },
  { id: "storm_chaser",  emoji: "⛈️", label: "Storm Chaser",      test: (c) => c.condition.toLowerCase().includes("thunder") },
  { id: "explorer_5",    emoji: "🗺️", label: "Explorer (5 cities)", test: null }, // handled separately
  { id: "frost_watcher", emoji: "🧊", label: "Frost Watcher",     test: (c) => c.temp <= 0 },
];

export const useAchievements = (current) => {
  const [unlocked, setUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    if (!current) return;
    const owned = new Set(unlocked);
    let changed = false;

    BADGE_DEFS.forEach((b) => {
      if (b.test && !owned.has(b.id) && b.test(current)) {
        owned.add(b.id);
        changed = true;
        toast(`🏆 Achievement unlocked: ${b.emoji} ${b.label}`, {
          duration: 4000,
        });
      }
    });

    // Explorer badge — 5 unique cities searched
    try {
      const historyRaw = localStorage.getItem("skyPulseSearchHistory");
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      if (history.length >= 5 && !owned.has("explorer_5")) {
        owned.add("explorer_5");
        changed = true;
        toast(`🏆 Achievement unlocked: 🗺️ Explorer (5 cities)`, {
          duration: 4000,
        });
      }
    } catch { /* ignore */ }

    if (changed) {
      const arr = Array.from(owned);
      setUnlocked(arr);
      localStorage.setItem(BADGES_KEY, JSON.stringify(arr));
    }
  }, [current?.city]);

  return { unlocked, allBadges: BADGE_DEFS };
};