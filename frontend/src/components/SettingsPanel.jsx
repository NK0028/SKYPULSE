// ─────────────────────────────────────────────
//  SettingsPanel — Centralized user preferences
//  Language toggle removed
// ─────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "../hooks/useWeather";
import { useColorblindMode } from "../hooks/useColorblindMode";

const DEFAULT_CITY_KEY = "skyPulseDefaultCity";
const NOTIF_PREF_KEY   = "skyPulseNotifPrefs";

const SettingsPanel = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme, unit, toggleUnit } =
    useWeatherContext();
  const { fetchByCity } = useWeather();
  const [cbMode, toggleCbMode] = useColorblindMode();

  const [listening, setListening] = useState(false);

  const [defaultCity, setDefaultCity] = useState(() => {
    try { return localStorage.getItem(DEFAULT_CITY_KEY) || ""; }
    catch { return ""; }
  });

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_PREF_KEY)) || {
        rain: true, severe: true,
      };
    } catch { return { rain: true, severe: true }; }
  });

  const saveDefaultCity = () => {
    try {
      localStorage.setItem(DEFAULT_CITY_KEY, defaultCity);
    } catch { /* ignore */ }
  };

  const toggleNotifPref = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      localStorage.setItem(NOTIF_PREF_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition ||
               window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice search not supported in this browser.");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
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
      toast(`🎙️ Heard: "${city}" — searching...`, { duration: 3000 });
      fetchByCity(city);
      onClose();
    };

    r.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };
    r.onend = () => setListening(false);
  };

  const Row = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={`text-sm font-semibold
          ${isDark ? "text-white/90" : "text-slate-700"}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs mt-0.5
            ${isDark ? "text-white/40" : "text-slate-400"}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ active, onToggle }) => (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
      style={{ background: active ? "#3b82f6" : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
        animate={{ left: active ? "22px" : "2px" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              fixed top-0 right-0 bottom-0 z-[999] w-full max-w-sm
              overflow-y-auto p-6
              ${isDark ? "bg-[#0f0c29]" : "bg-white"}
            `}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black
                ${isDark ? "text-white" : "text-slate-800"}`}>
                ⚙️ Settings
              </h2>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${isDark ? "bg-white/10 text-white" : "bg-black/5 text-slate-600"}`}
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl p-4 mb-4
              ${isDark ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Quick Actions
              </p>
              <Row label="Voice Search" description="Search a city by speaking">
                <button
                  onClick={startVoiceSearch}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold
                    ${listening
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500 text-white"}`}
                >
                  {listening ? "🔴 Listening..." : "🎙️ Start"}
                </button>
              </Row>
            </div>

            {/* Appearance */}
            <div className={`rounded-2xl p-4 mb-4
              ${isDark ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Appearance
              </p>
              <Row label="Dark Mode" description="Toggle light/dark theme">
                <Toggle active={isDark} onToggle={toggleTheme} />
              </Row>
              <div className={`border-t ${isDark ? "border-white/5" : "border-black/5"}`} />
              <Row label="Colorblind-Friendly Mode" description="Adjusts red/green indicators">
                <Toggle active={cbMode} onToggle={toggleCbMode} />
              </Row>
            </div>

            {/* Units & Defaults */}
            <div className={`rounded-2xl p-4 mb-4
              ${isDark ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Units & Defaults
              </p>
              <Row label="Temperature Unit" description={`Currently °${unit}`}>
                <button
                  onClick={toggleUnit}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold bg-blue-500
                    text-white"
                >
                  °{unit === "C" ? "F" : "C"}
                </button>
              </Row>
              <div className={`border-t my-2 ${isDark ? "border-white/5" : "border-black/5"}`} />
              <div className="py-2">
                <p className={`text-sm font-semibold mb-2
                  ${isDark ? "text-white/90" : "text-slate-700"}`}>
                  Default City
                </p>
                <div className="flex gap-2">
                  <input
                    value={defaultCity}
                    onChange={(e) => setDefaultCity(e.target.value)}
                    placeholder="e.g. Mingora"
                    style={{
                      color: isDark ? "#fff" : "#1e293b",
                      caretColor: isDark ? "#fff" : "#1e293b",
                      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      colorScheme: isDark ? "dark" : "light",
                    }}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  />
                  <button
                    onClick={saveDefaultCity}
                    className="px-3 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={`rounded-2xl p-4 mb-4
              ${isDark ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Notifications
              </p>
              <Row label="Rain Alerts" description="Notify before rain starts">
                <Toggle active={notifPrefs.rain} onToggle={() => toggleNotifPref("rain")} />
              </Row>
              <div className={`border-t ${isDark ? "border-white/5" : "border-black/5"}`} />
              <Row label="Severe Weather Alerts" description="Floods, storms, disasters nearby">
                <Toggle active={notifPrefs.severe} onToggle={() => toggleNotifPref("severe")} />
              </Row>
            </div>

            <p className={`text-xs text-center mt-6
              ${isDark ? "text-white/20" : "text-slate-300"}`}>
              SkyPulse v1.0 • Built by Naeem Khan
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;