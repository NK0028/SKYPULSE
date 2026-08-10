// ─────────────────────────────────────────────
//  colorPalette — Colorblind-safe color remapping
//  for components using inline hex colors (which
//  CSS class overrides can't reach)
// ─────────────────────────────────────────────

const CB_MAP = {
  "#ef4444": "#f97316", // red    → orange
  "#22c55e": "#3b82f6", // green  → blue
  "#34d399": "#3b82f6", // green  → blue
  "#dc2626": "#ea580c", // dark red → dark orange
};

export const cbColor = (hex) => {
  try {
    const active = document.documentElement
      .classList.contains("colorblind-mode");
    if (active && CB_MAP[hex]) return CB_MAP[hex];
  } catch { /* ignore */ }
  return hex;
};