// ─────────────────────────────────────────────
//  Navbar — Premium glassmorphism with blur
//  Cleaned up: only Logo, Live Clock, Settings gear
//  Language toggle removed
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { getSeasonalAccent } from "../utils/seasonalTheme";
import SettingsPanel from "./SettingsPanel";

const getLogoEmoji = (condition) => {
  if (!condition) return "🌤️";
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain"))    return "🌧️";
  if (c.includes("drizzle")) return "🌦️";
  if (c.includes("snow"))    return "❄️";
  if (c.includes("mist") ||
      c.includes("fog"))     return "🌫️";
  if (c.includes("cloud"))   return "☁️";
  if (c.includes("clear"))   return "☀️";
  return "🌤️";
};

const Navbar = () => {
  const { isDark, current } = useWeatherContext();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const logoEmoji = getLogoEmoji(current?.condition);
  const seasonal  = getSeasonalAccent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const timeColor = () => {
    const c = current?.condition?.toLowerCase() || "";
    if (c.includes("thunder")) return "text-purple-400";
    if (c.includes("rain"))    return "text-blue-400";
    if (c.includes("snow"))    return "text-cyan-300";
    if (c.includes("clear"))   return "text-yellow-400";
    return isDark ? "text-white/60" : "text-slate-500";
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50
          transition-all duration-500"
        style={{
          background: scrolled
            ? isDark
              ? "rgba(10,10,30,0.85)"
              : "rgba(255,255,255,0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled
            ? isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.06)"
            : "none",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-3
          flex items-center justify-between">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={logoEmoji}
                initial={{ rotate: -30, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 30, scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-2xl"
              >
                {logoEmoji}
              </motion.span>
            </AnimatePresence>

            <div>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-xl font-black tracking-tight
                  ${isDark ? "text-white" : "text-slate-800"}`}>
                  Sky
                </span>
                <motion.span
                  key={seasonal.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-xl font-black tracking-tight"
                  style={{ color: seasonal.color }}
                  title={`${seasonal.emoji} ${seasonal.name} theme`}
                >
                  Pulse
                </motion.span>
              </div>
              <AnimatePresence>
                {current && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-[10px] font-medium leading-none
                      ${isDark ? "text-white/30" : "text-slate-400"}`}
                  >
                    {current.city}, {current.country}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Center — Live Clock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:flex flex-col items-center"
          >
            <p className={`text-lg font-black tabular-nums
              tracking-widest ${timeColor()}`}>
              {time.toLocaleTimeString([], {
                hour  : "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
            <p className={`text-[10px]
              ${isDark ? "text-white/20" : "text-slate-300"}`}>
              {time.toLocaleDateString([], {
                weekday: "short",
                month  : "short",
                day    : "numeric",
              })}
            </p>
          </motion.div>

          {/* Settings — only remaining control */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            className={`
              p-2.5 rounded-xl text-base
              transition-all duration-200
              ${isDark
                ? "hover:bg-white/10 text-white/70"
                : "hover:bg-black/5 text-slate-600"
              }
            `}
          >
            ⚙️
          </motion.button>
        </div>
      </motion.nav>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default Navbar;