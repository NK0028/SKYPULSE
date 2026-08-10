// ─────────────────────────────────────────────
//  OnboardingTour — First-visit guided walkthrough
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const TOUR_KEY = "skyPulseTourSeen";

const STEPS = [
  {
    emoji: "🔍",
    title: "Search Any City",
    text: "Type a city name, use voice search, or tap the pin icon to auto-detect your location.",
  },
  {
    emoji: "🌍",
    title: "Explore the Live Globe",
    text: "Drag to rotate, double-click anywhere to check that spot's weather, and switch between rain, wind, and temperature layers.",
  },
  {
    emoji: "🚨",
    title: "Stay Safe",
    text: "SkyPulse automatically warns you about severe weather, floods, and storms near you.",
  },
  {
    emoji: "📱",
    title: "Explore Everything",
    text: "Use the bottom tabs (on mobile) or scroll down (on desktop) to discover travel advice, commute weather, PDF reports, and more.",
  },
];

const OnboardingTour = () => {
  const { isDark, current } = useWeatherContext();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(TOUR_KEY);
      if (!seen) {
        // Delay slightly so it doesn't clash with initial load animations
        const t = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, []);

  const finish = () => {
    try { localStorage.setItem(TOUR_KEY, "true"); } catch { /* ignore */ }
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => step > 0 && setStep(step - 1);

  if (!visible) return null;

  const current_step = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center
          justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`
            max-w-sm w-full rounded-3xl p-6 relative
            ${isDark ? "bg-[#1a1f35]" : "bg-white"}
          `}
        >
          <button
            onClick={finish}
            className={`absolute top-4 right-4 text-xs
              ${isDark ? "text-white/40 hover:text-white/70"
                       : "text-slate-400 hover:text-slate-600"}`}
          >
            Skip ✕
          </button>

          <div className="text-center mb-5">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              {current_step.emoji}
            </motion.div>
            <h3 className={`text-lg font-black mb-2
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {current_step.title}
            </h3>
            <p className={`text-sm leading-relaxed
              ${isDark ? "text-white/60" : "text-slate-500"}`}>
              {current_step.text}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? "20px" : "6px",
                  background: i === step
                    ? "#60a5fa"
                    : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold
                  ${isDark ? "bg-white/8 text-white/70 hover:bg-white/15"
                           : "bg-black/5 text-slate-600 hover:bg-black/10"}`}
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold
                bg-blue-500 hover:bg-blue-600 text-white transition-all"
            >
              {step === STEPS.length - 1 ? "Get Started 🚀" : "Next"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;