// ─────────────────────────────────────────────
//  Navbar — Premium glassmorphism with blur
//  + Seasonal accent color on "Pulse"
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "../hooks/useWeather";
import { getSeasonalAccent } from "../utils/seasonalTheme";
import toast from "react-hot-toast";

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
  const { isDark, toggleTheme, unit,
          toggleUnit, current } = useWeatherContext();
  const { fetchByCity } = useWeather();
  const [listening,  setListening]  = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [time,       setTime]       = useState(new Date());

  const logoEmoji = getLogoEmoji(current?.condition);
  const seasonal  = getSeasonalAccent();

  // Scroll detection for navbar appearance
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live clock
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

  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition ||
               window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice search not supported in this browser.");
      return;
    }
    const r = new SR();
    r.lang           = "en-US";
    r.interimResults = false;
    setListening(true);
    r.start();

    r.onresult = (e) => {
      const rawTranscript = e.results[0][0].transcript;
      const city = rawTranscript
        .replace(/weather in|weather for|what.*weather.*in|for|in/gi, "")
        .trim();

      setListening(false);

      if (!city) {
        toast.error("Couldn't understand that. Please try again.");
        return;
      }

      // Show exactly what was heard so mis-transcriptions are visible
      toast(`🎙️ Heard: "${city}" — searching...`, {
        duration: 3000,
      });

      fetchByCity(city);
    };

    r.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };
    r.onend = () => setListening(false);
  };

  return (
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
              initial={{ rotate: -30, scale: 0.5,
                opacity: 0 }}
              animate={{ rotate: 0, scale: 1,
                opacity: 1 }}
              exit={{ rotate: 30, scale: 0.5,
                opacity: 0 }}
              transition={{ type: "spring",
                stiffness: 300 }}
              className="text-2xl"
            >
              {logoEmoji}
            </motion.span>
          </AnimatePresence>

          <div>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl font-black
                tracking-tight
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
                  className={`text-[10px] font-medium
                    leading-none
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
          className="hidden md:flex flex-col
            items-center"
        >
          <p className={`text-lg font-black
            tabular-nums tracking-widest
            ${timeColor()}`}>
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

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Voice */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={startVoiceSearch}
            title="Voice Search"
            className={`
              relative p-2.5 rounded-xl text-base
              transition-all duration-200
              ${listening
                ? "bg-red-500/20 text-red-400"
                : isDark
                  ? "hover:bg-white/10 text-white/60"
                  : "hover:bg-black/5 text-slate-500"
              }
            `}
          >
            {listening
              ? <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8,
                    repeat: Infinity }}>
                  🔴
                </motion.span>
              : "🎙️"
            }
          </motion.button>

          {/* Unit toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleUnit}
            className={`
              px-3.5 py-2 rounded-xl text-sm
              font-black transition-all duration-200
              ${isDark
                ? "hover:bg-white/10 text-white/70"
                : "hover:bg-black/5 text-slate-600"
              }
            `}
          >
            °{unit}
          </motion.button>

          {/* Theme */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`
              p-2.5 rounded-xl text-base
              transition-all duration-200
              ${isDark
                ? "hover:bg-white/10"
                : "hover:bg-black/5"
              }
            `}
          >
            {isDark ? "☀️" : "🌙"}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;