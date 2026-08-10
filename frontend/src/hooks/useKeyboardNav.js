// ─────────────────────────────────────────────
//  useKeyboardNav — Global keyboard shortcuts
// ─────────────────────────────────────────────

import { useEffect } from "react";

export const useKeyboardNav = ({ onSearchFocus, onThemeToggle }) => {
  useEffect(() => {
    const handler = (e) => {
      // "/" focuses search (like GitHub, Slack)
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        onSearchFocus?.();
      }
      // "D" toggles dark mode
      if (e.key.toLowerCase() === "d" && e.altKey) {
        e.preventDefault();
        onThemeToggle?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchFocus, onThemeToggle]);
};