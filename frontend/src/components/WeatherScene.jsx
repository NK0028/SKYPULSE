// ─────────────────────────────────────────────
//  WeatherScene — Animated cartoon weather art
// ─────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

// ── Sunny Park Scene ─────────────────────────
const SunnyScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Sky gradient */}
    <div className="absolute inset-0 bg-gradient-to-b
      from-sky-400 to-sky-200" />

    {/* Sun */}
    <motion.div
      className="absolute top-4 right-8 w-14 h-14
        bg-yellow-300 rounded-full"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ boxShadow: "0 0 30px #fde047" }}
    >
      {/* Sun rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-5 bg-yellow-200
            rounded-full"
          style={{
            top: "50%", left: "calc(50% - 2px)",
            transformOrigin: "bottom center",
            transform: `rotate(${i * 45}deg) translateY(-150%)`,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity,
            delay: i * 0.1 }}
        />
      ))}
    </motion.div>

    {/* Clouds */}
    {[{ top: "15%", duration: 18, delay: 0, size: 1   },
      { top: "8%",  duration: 25, delay: -8, size: 0.7 }
    ].map((c, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ top: c.top, scale: c.size }}
        animate={{ x: ["-120px", "calc(100vw + 120px)"] }}
        transition={{ duration: c.duration,
          delay: c.delay, repeat: Infinity,
          ease: "linear" }}
      >
        <div className="relative w-20 h-10">
          <div className="absolute bottom-0 left-2
            w-16 h-8 bg-white rounded-full opacity-90" />
          <div className="absolute bottom-4 left-4
            w-12 h-10 bg-white rounded-full opacity-90" />
          <div className="absolute bottom-3 left-8
            w-10 h-8 bg-white rounded-full opacity-80" />
        </div>
      </motion.div>
    ))}

    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0
      h-16 bg-gradient-to-t from-green-500 to-green-400" />

    {/* Trees */}
    {[10, 30, 60, 80].map((left, i) => (
      <div key={i} className="absolute bottom-12"
        style={{ left: `${left}%` }}>
        <div className="w-0 h-0 border-l-[12px]
          border-r-[12px] border-b-[20px]
          border-l-transparent border-r-transparent
          border-b-green-700 mx-auto" />
        <div className="w-3 h-4 bg-amber-800
          mx-auto" />
      </div>
    ))}

    {/* Flowers */}
    {[20, 45, 70].map((left, i) => (
      <motion.div
        key={i}
        className="absolute bottom-14 text-lg"
        style={{ left: `${left}%` }}
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 2 + i * 0.5,
          repeat: Infinity }}
      >
        🌸
      </motion.div>
    ))}

    {/* Bird */}
    <motion.div
      className="absolute text-sm"
      initial={{ x: -30, y: 30 }}
      animate={{ x: "calc(100% + 30px)",
        y: [30, 20, 35, 15, 30] }}
      transition={{ duration: 8, repeat: Infinity,
        ease: "linear" }}
    >
      🐦
    </motion.div>
  </div>
);

// ── Rainy Scene ───────────────────────────────
const RainyScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Dark sky */}
    <div className="absolute inset-0 bg-gradient-to-b
      from-slate-600 to-slate-500" />

    {/* Rain drops */}
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 bg-blue-300
          rounded-full opacity-60"
        style={{
          left   : `${Math.random() * 100}%`,
          height : `${Math.random() * 15 + 8}px`,
        }}
        animate={{ y: ["-20px", "100%"] }}
        transition={{
          duration : Math.random() * 0.4 + 0.3,
          delay    : Math.random() * 2,
          repeat   : Infinity,
          ease     : "linear"
        }}
      />
    ))}

    {/* Ground with puddles */}
    <div className="absolute bottom-0 left-0 right-0
      h-16 bg-gradient-to-t from-slate-700 to-slate-600" />

    {/* Puddle ripples */}
    {[20, 50, 75].map((left, i) => (
      <motion.div
        key={i}
        className="absolute bottom-8 border border-blue-400
          rounded-full opacity-40"
        style={{ left: `${left}%` }}
        animate={{ width: [4, 20], height: [2, 8],
          opacity: [0.6, 0], x: "-50%" }}
        transition={{ duration: 1, repeat: Infinity,
          delay: i * 0.4 }}
      />
    ))}

    {/* Frog with umbrella */}
    <motion.div
      className="absolute bottom-14 left-8 text-3xl"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      🐸
    </motion.div>
    <div className="absolute bottom-20 left-7 text-2xl">
      ☂️
    </div>

    {/* Puddles */}
    <div className="absolute bottom-13 left-12 w-8 h-2
      bg-blue-400/30 rounded-full blur-sm" />

    {/* Street lamp */}
    <div className="absolute bottom-14 right-12">
      <div className="w-1 h-16 bg-gray-400 mx-auto" />
      <div className="w-6 h-1 bg-gray-400 mx-auto
        -mt-1 -ml-4" />
      <motion.div
        className="absolute -top-2 -left-4
          w-3 h-3 bg-yellow-200 rounded-full"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ boxShadow: "0 0 8px #fef08a" }}
      />
    </div>
  </div>
);

// ── Snowy Scene ───────────────────────────────
const SnowyScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Cold sky */}
    <div className="absolute inset-0 bg-gradient-to-b
      from-slate-800 to-blue-900" />

    {/* Snowflakes */}
    {Array.from({ length: 25 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-white opacity-70"
        style={{
          left    : `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 10 + 8}px`,
        }}
        animate={{
          y      : ["-20px", "100%"],
          rotate : [0, 360],
          x      : [0, Math.random() * 20 - 10],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          delay   : Math.random() * 3,
          repeat  : Infinity,
          ease    : "linear"
        }}
      >
        ❄
      </motion.div>
    ))}

    {/* Snow ground */}
    <div className="absolute bottom-0 left-0 right-0
      h-20 bg-gradient-to-t from-white to-blue-50" />

    {/* Snowy mountain */}
    <div className="absolute bottom-16 left-1/4
      w-0 h-0 border-l-[40px] border-r-[40px]
      border-b-[60px] border-l-transparent
      border-r-transparent border-b-gray-500" />
    <div className="absolute bottom-28 left-1/4
      ml-4 w-0 h-0 border-l-[15px] border-r-[15px]
      border-b-[20px] border-l-transparent
      border-r-transparent border-b-white" />

    {/* Snowman */}
    <div className="absolute bottom-16 right-12
      flex flex-col items-center">
      <div className="w-5 h-5 bg-white rounded-full
        border border-gray-300 text-center
        text-xs leading-5">
        😊
      </div>
      <div className="w-7 h-7 bg-white rounded-full
        border border-gray-300 -mt-1" />
      <div className="w-5 h-5 bg-orange-200 rounded-full
        border border-gray-300 -mt-1" />
    </div>

    {/* Pine trees */}
    {[10, 75].map((left, i) => (
      <div key={i} className="absolute bottom-18"
        style={{ left: `${left}%` }}>
        {[20, 16, 12].map((size, j) => (
          <div key={j}
            className="w-0 h-0 mx-auto -mb-1"
            style={{
              borderLeft  : `${size}px solid transparent`,
              borderRight : `${size}px solid transparent`,
              borderBottom: `${size * 1.2}px solid #166534`,
            }}
          />
        ))}
        <div className="w-3 h-5 bg-amber-800 mx-auto" />
      </div>
    ))}
  </div>
);

// ── Thunderstorm Scene ────────────────────────
const ThunderScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Very dark sky */}
    <div className="absolute inset-0 bg-gradient-to-b
      from-gray-900 to-gray-800" />

    {/* Lightning flash */}
    <motion.div
      className="absolute inset-0 bg-yellow-50/10"
      animate={{ opacity: [0, 0, 0, 0.8, 0, 0.3, 0] }}
      transition={{ duration: 0.8, repeat: Infinity,
        repeatDelay: 3 }}
    />

    {/* Lightning bolt */}
    <motion.div
      className="absolute text-4xl"
      style={{ top: "10%", left: "45%" }}
      animate={{ opacity: [0, 0, 1, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 0.4, repeat: Infinity,
        repeatDelay: 3 }}
    >
      ⚡
    </motion.div>

    {/* Heavy rain */}
    {Array.from({ length: 40 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 bg-blue-400 opacity-50"
        style={{
          left  : `${Math.random() * 100}%`,
          height: `${Math.random() * 20 + 12}px`,
        }}
        animate={{ y: ["-20px", "100%"] }}
        transition={{
          duration: Math.random() * 0.3 + 0.2,
          delay   : Math.random() * 1.5,
          repeat  : Infinity, ease: "linear"
        }}
      />
    ))}

    {/* Dark ground */}
    <div className="absolute bottom-0 left-0 right-0
      h-14 bg-gradient-to-t from-gray-900 to-gray-800" />

    {/* House */}
    <div className="absolute bottom-14 left-1/2
      -translate-x-1/2">
      <div className="w-0 h-0 border-l-[30px]
        border-r-[30px] border-b-[25px]
        border-l-transparent border-r-transparent
        border-b-red-800 mx-auto" />
      <div className="w-14 h-10 bg-amber-900" />
      <div className="w-4 h-6 bg-yellow-200/60
        mx-auto" />
    </div>
  </div>
);

// ── Cloudy Scene ──────────────────────────────
const CloudyScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b
      from-slate-400 to-slate-300" />

    {/* Multiple clouds */}
    {[
      { top: "5%",  size: 1.2, duration: 20, delay: 0   },
      { top: "20%", size: 0.8, duration: 28, delay: -10 },
      { top: "35%", size: 1.0, duration: 22, delay: -5  },
    ].map((c, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ top: c.top, scale: c.size }}
        animate={{ x: ["-150px", "calc(100% + 150px)"] }}
        transition={{ duration: c.duration,
          delay: c.delay, repeat: Infinity,
          ease: "linear" }}
      >
        <div className="relative w-24 h-12">
          <div className="absolute bottom-0 left-2
            w-20 h-10 bg-white/80 rounded-full" />
          <div className="absolute bottom-5 left-4
            w-16 h-12 bg-white/80 rounded-full" />
          <div className="absolute bottom-4 left-10
            w-14 h-10 bg-white/70 rounded-full" />
        </div>
      </motion.div>
    ))}

    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0
      h-14 bg-gradient-to-t from-green-600 to-green-500" />

    {/* Sad tree */}
    <div className="absolute bottom-12 left-1/3">
      <div className="w-0 h-0 border-l-[20px]
        border-r-[20px] border-b-[30px]
        border-l-transparent border-r-transparent
        border-b-green-700 mx-auto" />
      <div className="w-4 h-6 bg-amber-800 mx-auto" />
    </div>

    <div className="absolute bottom-16 left-1/2
      text-2xl">
      😐
    </div>
  </div>
);

// ── Foggy Scene ───────────────────────────────
const FoggyScene = () => (
  <div className="relative w-full h-full overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b
      from-gray-400 to-gray-300" />

    {/* Fog layers */}
    {[20, 40, 60, 80].map((top, i) => (
      <motion.div
        key={i}
        className="absolute left-0 right-0 h-8
          bg-white/40 blur-md"
        style={{ top: `${top}%` }}
        animate={{ x: ["-5%", "5%", "-5%"],
          opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4 + i,
          repeat: Infinity, ease: "easeInOut" }}
      />
    ))}

    <div className="absolute bottom-0 left-0 right-0
      h-14 bg-gray-600" />
    <div className="absolute bottom-12 left-1/2
      -translate-x-1/2 text-2xl opacity-50">
      🌆
    </div>
  </div>
);

// ── Main Component ────────────────────────────
const WeatherScene = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const condition = current.condition.toLowerCase();

  const getScene = () => {
    if (condition.includes("thunder")) return <ThunderScene />;
    if (condition.includes("snow"))    return <SnowyScene />;
    if (condition.includes("rain") ||
        condition.includes("drizzle")) return <RainyScene />;
    if (condition.includes("mist") ||
        condition.includes("fog"))     return <FoggyScene />;
    if (condition.includes("cloud"))   return <CloudyScene />;
    return <SunnyScene />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-4`}
    >
      <h3 className={`text-sm font-semibold mb-3
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🎨 Weather Scene
        <span className={`ml-2 text-xs font-normal
          ${isDark ? "text-white/30" : "text-slate-400"}`}>
          {current.description}
        </span>
      </h3>

      <div className="rounded-2xl overflow-hidden h-44
        relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={condition}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {getScene()}
          </motion.div>
        </AnimatePresence>

        {/* Overlay label */}
        <div className="absolute bottom-2 right-2
          bg-black/30 backdrop-blur-sm text-white
          text-xs px-2 py-1 rounded-lg">
          {current.condition}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherScene;