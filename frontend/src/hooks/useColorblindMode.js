// ─────────────────────────────────────────────
//  useColorblindMode — Accessible palette toggle
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";

const CB_KEY = "skyPulseColorblindMode";

export const useColorblindMode = () => {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(CB_KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(CB_KEY, enabled); } catch { /* ignore */ }
    document.documentElement.classList.toggle("colorblind-mode", enabled);
  }, [enabled]);

  return [enabled, () => setEnabled((v) => !v)];
};