// ─────────────────────────────────────────────
//  WeatherBackground — Immersive weather effects
// ─────────────────────────────────────────────

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence }    from "framer-motion";
import { useWeatherContext }          from "../context/WeatherContext";

// ── Rain drops ────────────────────────────────
const RainEffect = ({ heavy = false }) => {
  const count = heavy ? 120 : 70;
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id      : i,
      left    : `${Math.random() * 110 - 5}%`,
      height  : `${Math.random() * (heavy ? 25 : 15) + 8}px`,
      duration: `${Math.random() * 0.3 + (heavy ? 0.2 : 0.4)}s`,
      delay   : `${Math.random() * 2}s`,
      opacity : Math.random() * 0.5 + 0.2,
      skew    : heavy ? "-10deg" : "-5deg",
    })), [heavy]);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[1] overflow-hidden">
      {drops.map((d) => (
        <div
          key={d.id}
          style={{
            position        : "absolute",
            left            : d.left,
            top             : "-20px",
            width           : heavy ? "2px" : "1.5px",
            height          : d.height,
            background      : heavy
              ? "linear-gradient(transparent, #93c5fd)"
              : "linear-gradient(transparent, #bfdbfe)",
            borderRadius    : "2px",
            opacity         : d.opacity,
            transform       : `skewX(${d.skew})`,
            animation       : `rainFall ${d.duration} linear ${d.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
};

// ── Lightning ─────────────────────────────────
const LightningEffect = () => {
  const bolts = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id      : i,
      left    : `${20 + i * 25 + Math.random() * 15}%`,
      delay   : i * 1.5 + Math.random() * 2,
      duration: 3 + Math.random() * 4,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[2] overflow-hidden">
      {/* Screen flash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(200,200,255,0.15), transparent 70%)"
        }}
        animate={{ opacity: [0,0,0,0,0.8,0,0.3,0,0] }}
        transition={{
          duration   : 0.8,
          repeat     : Infinity,
          repeatDelay: 3 + Math.random() * 4,
        }}
      />

      {/* Lightning bolts */}
      {bolts.map((b) => (
        <motion.div
          key={b.id}
          className="absolute top-0 flex flex-col
            items-center"
          style={{ left: b.left }}
          animate={{ opacity: [0,0,0,1,0.8,0,0,0] }}
          transition={{
            duration   : 0.6,
            repeat     : Infinity,
            repeatDelay: b.duration,
            delay      : b.delay,
          }}
        >
          {/* SVG lightning bolt */}
          <svg width="40" height="120" viewBox="0 0 40 120">
            <polyline
              points="25,0 10,55 22,55 8,120"
              fill="none"
              stroke="#fef08a"
              strokeWidth="3"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur
                  stdDeviation="3"
                  result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// ── Snow ──────────────────────────────────────
const SnowEffect = () => {
  const flakes = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id      : i,
      left    : `${Math.random() * 100}%`,
      size    : `${Math.random() * 12 + 5}px`,
      duration: `${Math.random() * 5 + 4}s`,
      delay   : `${Math.random() * 5}s`,
      drift   : Math.random() * 30 - 15,
      opacity : Math.random() * 0.7 + 0.3,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[1] overflow-hidden">
      {flakes.map((f) => (
        <motion.div
          key={f.id}
          className="absolute text-white select-none"
          style={{
            left    : f.left,
            top     : "-20px",
            fontSize: f.size,
            opacity : f.opacity,
          }}
          animate={{
            y      : ["0vh", "110vh"],
            x      : [0, f.drift, -f.drift, 0],
            rotate : [0, 180, 360],
          }}
          transition={{
            duration : parseFloat(f.duration),
            delay    : parseFloat(f.delay),
            repeat   : Infinity,
            ease     : "linear",
          }}
        >
          {["❄", "❅", "❆"][i % 3]}
        </motion.div>
      ))}
    </div>
  );
};

// ── Wind streaks ──────────────────────────────
const WindEffect = () => {
  const streaks = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id      : i,
      top     : `${Math.random() * 80}%`,
      width   : `${Math.random() * 120 + 60}px`,
      duration: `${Math.random() * 0.8 + 0.5}s`,
      delay   : `${Math.random() * 3}s`,
      opacity : Math.random() * 0.3 + 0.1,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[1] overflow-hidden">
      {streaks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute h-px"
          style={{
            top    : s.top,
            width  : s.width,
            opacity: s.opacity,
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)",
          }}
          animate={{ x: ["-200px", "110vw"] }}
          transition={{
            duration : parseFloat(s.duration),
            delay    : parseFloat(s.delay),
            repeat   : Infinity,
            ease     : "linear",
          }}
        />
      ))}
    </div>
  );
};

// ── Fog ───────────────────────────────────────
const FogEffect = () => (
  <div className="fixed inset-0 pointer-events-none
    z-[1] overflow-hidden">
    {[15, 35, 55, 75].map((top, i) => (
      <motion.div
        key={i}
        className="absolute left-0 right-0 blur-2xl"
        style={{
          top     : `${top}%`,
          height  : "80px",
          background: "rgba(255,255,255,0.06)",
        }}
        animate={{
          x      : ["-10%", "10%", "-10%"],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 6 + i * 2,
          repeat  : Infinity,
          ease    : "easeInOut",
        }}
      />
    ))}
  </div>
);

// ── Clouds drifting ───────────────────────────
const CloudEffect = () => {
  const clouds = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id      : i,
      top     : `${5 + i * 14}%`,
      scale   : 0.6 + Math.random() * 0.6,
      duration: 20 + Math.random() * 20,
      delay   : -(i * 6),
      opacity : 0.06 + Math.random() * 0.06,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[1] overflow-hidden">
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute text-white text-8xl"
          style={{
            top    : c.top,
            opacity: c.opacity,
            scale  : c.scale,
          }}
          animate={{ x: ["-200px", "110vw"] }}
          transition={{
            duration: c.duration,
            delay   : c.delay,
            repeat  : Infinity,
            ease    : "linear",
          }}
        >
          ☁
        </motion.div>
      ))}
    </div>
  );
};

// ── Clear sky — stars + sun rays ──────────────
const ClearEffect = ({ isDark }) => {
  const isNight = new Date().getHours() >= 19 ||
                  new Date().getHours() < 6;
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id      : i,
      left    : `${Math.random() * 100}%`,
      top     : `${Math.random() * 55}%`,
      size    : Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay   : Math.random() * 4,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none
      z-[1] overflow-hidden">
      {/* Sun glow */}
      {!isNight && (
        <motion.div
          className="absolute top-16 right-16
            rounded-full"
          style={{
            width     : "80px",
            height    : "80px",
            background: "radial-gradient(circle, rgba(253,224,71,0.25), transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      {/* Stars */}
      {(isNight || isDark) && stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left  : s.left,
            top   : s.top,
            width : `${s.size}px`,
            height: `${s.size}px`,
          }}
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{
            duration: s.duration,
            delay   : s.delay,
            repeat  : Infinity,
          }}
        />
      ))}
    </div>
  );
};

// ── Gradient backgrounds per condition ────────
const getBgStyle = (condition, isDark) => {
  const c = condition?.toLowerCase() || "";
  if (!isDark) {
    if (c.includes("thunder")) return "from-gray-700 via-purple-800 to-gray-900";
    if (c.includes("rain"))    return "from-slate-600 via-blue-700 to-slate-700";
    if (c.includes("drizzle")) return "from-slate-500 via-blue-600 to-slate-600";
    if (c.includes("snow"))    return "from-blue-100 via-slate-200 to-blue-50";
    if (c.includes("cloud"))   return "from-slate-400 via-gray-300 to-slate-300";
    if (c.includes("clear"))   return "from-sky-300 via-blue-200 to-amber-100";
    if (c.includes("mist") ||
        c.includes("fog"))     return "from-gray-400 via-slate-300 to-gray-300";
    return "from-sky-200 via-blue-100 to-indigo-100";
  }
  if (c.includes("thunder")) return "from-[#0a0515] via-[#1a0a3a] to-[#0d0a1a]";
  if (c.includes("rain"))    return "from-[#0a0f1e] via-[#0d1b3e] to-[#0a1628]";
  if (c.includes("drizzle")) return "from-[#0f1424] via-[#162040] to-[#0f1830]";
  if (c.includes("snow"))    return "from-[#0d1628] via-[#1a2a4a] to-[#0d2040]";
  if (c.includes("cloud"))   return "from-[#1a1f2e] via-[#252b3d] to-[#1a1f2e]";
  if (c.includes("clear"))   return "from-[#0a1628] via-[#0d2040] to-[#162a50]";
  if (c.includes("mist") ||
      c.includes("fog"))     return "from-[#1e2535] via-[#2c3547] to-[#1e2535]";
  return "from-[#0f0c29] via-[#302b63] to-[#24243e]";
};

// ── Main Component ────────────────────────────
const WeatherBackground = () => {
  const { current, isDark } = useWeatherContext();
  const condition = current?.condition?.toLowerCase() || "";
  const bgGradient = getBgStyle(current?.condition, isDark);

  const renderEffect = () => {
    if (condition.includes("thunder"))
      return (
        <>
          <RainEffect heavy />
          <LightningEffect />
        </>
      );
    if (condition.includes("snow")) return <SnowEffect />;
    if (condition.includes("rain"))
      return <RainEffect heavy={condition.includes("heavy")} />;
    if (condition.includes("drizzle")) return <RainEffect />;
    if (condition.includes("mist") ||
        condition.includes("fog"))  return <FogEffect />;
    if (condition.includes("cloud")) return <CloudEffect />;
    if (condition.includes("squall") ||
        condition.includes("wind"))  return <WindEffect />;
    if (condition.includes("clear"))
      return <ClearEffect isDark={isDark} />;
    return <ClearEffect isDark={isDark} />;
  };

  return (
    <>
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${condition}`}
          className={`fixed inset-0 bg-gradient-to-br
            ${bgGradient}`}
          style={{ zIndex: -1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      </AnimatePresence>

      {/* Weather effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`effect-${condition}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {renderEffect()}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default WeatherBackground;