// ─────────────────────────────────────────────
//  TideInfo — Coastal tide simulation
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

// Simple tide simulation based on lunar cycle
const getTideData = () => {
  const now   = new Date();
  const hour  = now.getHours() + now.getMinutes() / 60;
  const tides = [];

  // Lunar-based tide period ~12.4 hours
  const period = 12.4;
  const phase  = (Date.now() / 1000 / 3600 / period) % 1;

  for (let i = 0; i < 24; i += 3) {
    const t = ((hour + i) / period) * 2 * Math.PI;
    const height = 2.5 + 2 * Math.sin(t + phase * 2 * Math.PI);
    const h = Math.floor(hour + i) % 24;
    tides.push({
      time  : `${String(h).padStart(2, "0")}:00`,
      height: Math.round(height * 10) / 10,
      type  : height > 2.5 ? "High" : "Low",
    });
  }
  return tides;
};

const TideWave = ({ isDark }) => {
  return (
    <div className="relative h-16 overflow-hidden rounded-xl">
      <div className={`absolute inset-0
        ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`} />
      <svg viewBox="0 0 400 64"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none">
        <motion.path
          d="M0,32 C50,10 100,54 150,32 C200,10 250,54 300,32 C350,10 400,54 400,32 L400,64 L0,64 Z"
          fill={isDark
            ? "rgba(96,165,250,0.4)"
            : "rgba(96,165,250,0.5)"}
          animate={{
            d: [
              "M0,32 C50,10 100,54 150,32 C200,10 250,54 300,32 C350,10 400,54 400,32 L400,64 L0,64 Z",
              "M0,40 C50,18 100,46 150,40 C200,18 250,46 300,40 C350,18 400,46 400,40 L400,64 L0,64 Z",
              "M0,32 C50,10 100,54 150,32 C200,10 250,54 300,32 C350,10 400,54 400,32 L400,64 L0,64 Z",
            ]
          }}
          transition={{ duration: 4, repeat: Infinity,
            ease: "easeInOut" }}
        />
        <motion.path
          d="M0,38 C60,20 120,56 180,38 C240,20 300,56 360,38 C380,30 400,42 400,38 L400,64 L0,64 Z"
          fill={isDark
            ? "rgba(96,165,250,0.25)"
            : "rgba(96,165,250,0.3)"}
          animate={{
            d: [
              "M0,38 C60,20 120,56 180,38 C240,20 300,56 360,38 C380,30 400,42 400,38 L400,64 L0,64 Z",
              "M0,30 C60,48 120,24 180,30 C240,48 300,24 360,30 C380,38 400,26 400,30 L400,64 L0,64 Z",
              "M0,38 C60,20 120,56 180,38 C240,20 300,56 360,38 C380,30 400,42 400,38 L400,64 L0,64 Z",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity,
            ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
    </div>
  );
};

const TideInfo = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const tides = getTideData();
  const currentTide = tides[0];
  const nextTide    = tides.find(
    (t) => t.type !== currentTide.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌊 Tide Information
        <span className={`ml-2 text-xs font-normal
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          Estimated
        </span>
      </h3>

      {/* Animated wave */}
      <TideWave isDark={isDark} />

      {/* Current + Next */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className={`p-3 rounded-2xl
          ${isDark ? "bg-blue-500/15" : "bg-blue-50"}`}>
          <p className={`text-xs
            ${isDark ? "text-blue-300/60" : "text-blue-400"}`}>
            Current Tide
          </p>
          <p className="text-2xl font-black text-blue-400
            mt-1">
            {currentTide.height}m
          </p>
          <p className={`text-xs font-medium mt-1
            ${isDark ? "text-blue-300" : "text-blue-600"}`}>
            {currentTide.type === "High"
              ? "🌊 High Tide" : "🏖️ Low Tide"}
          </p>
        </div>

        {nextTide && (
          <div className={`p-3 rounded-2xl
            ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <p className={`text-xs
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              Next {nextTide.type} Tide
            </p>
            <p className={`text-2xl font-black mt-1
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {nextTide.height}m
            </p>
            <p className={`text-xs font-medium mt-1
              ${isDark ? "text-white/50" : "text-slate-500"}`}>
              🕐 {nextTide.time}
            </p>
          </div>
        )}
      </div>

      {/* Tide schedule */}
      <div className="mt-4">
        <p className={`text-xs font-semibold mb-2
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          TODAY'S SCHEDULE
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tides.slice(0, 6).map((t, i) => (
            <div
              key={i}
              className={`
                flex-shrink-0 p-2 rounded-xl text-center
                min-w-[60px]
                ${i === 0
                  ? isDark
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-blue-100 border border-blue-200"
                  : isDark ? "bg-white/5" : "bg-black/5"
                }
              `}
            >
              <p className={`text-[10px]
                ${isDark ? "text-white/40" : "text-slate-400"}`}>
                {t.time}
              </p>
              <p className={`text-sm font-bold mt-1
                ${t.type === "High"
                  ? "text-blue-400"
                  : isDark ? "text-white/60" : "text-slate-500"
                }`}>
                {t.height}m
              </p>
              <p className="text-[9px] mt-0.5"
                style={{
                  color: t.type === "High"
                    ? "#60a5fa" : "#94a3b8"
                }}>
                {t.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TideInfo;