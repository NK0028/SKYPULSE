// ─────────────────────────────────────────────
//  AstroPanel — Moon phase + Dew point + Heat index
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";

// ── Moon phase calculation ────────────────────
const getMoonPhase = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const day   = now.getDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= year < 2000 ? 4 : 8.3;
  r = Math.floor(r + 0.5) % 30;

  const phases = [
    { phase: "New Moon",        emoji: "🌑", value: 0  },
    { phase: "Waxing Crescent", emoji: "🌒", value: 4  },
    { phase: "First Quarter",   emoji: "🌓", value: 8  },
    { phase: "Waxing Gibbous",  emoji: "🌔", value: 12 },
    { phase: "Full Moon",       emoji: "🌕", value: 15 },
    { phase: "Waning Gibbous",  emoji: "🌖", value: 19 },
    { phase: "Last Quarter",    emoji: "🌗", value: 23 },
    { phase: "Waning Crescent", emoji: "🌘", value: 27 },
  ];

  // ✅ Fixed — < operator was corrupted in original
  return phases.reduce((prev, curr) =>
    Math.abs(curr.value - r) < Math.abs(prev.value - r)
      ? curr
      : prev
  );
};

// ── Dew point calculation ─────────────────────
const getDewPoint = (temp, humidity) => {
  const a     = 17.27;
  const b     = 237.7;
  const alpha = ((a * temp) / (b + temp)) +
    Math.log(humidity / 100);
  return Math.round((b * alpha) / (a - alpha));
};

// ── Heat index calculation ────────────────────
const getHeatIndex = (temp, humidity) => {
  if (temp < 27) return null;
  const hi =
    -8.78469475556 +
    1.61139411       * temp +
    2.33854883889    * humidity +
    -0.14611605      * temp * humidity +
    -0.012308094     * temp * temp +
    -0.0164248277778 * humidity * humidity +
    0.002211732      * temp * temp * humidity +
    0.00072546       * temp * humidity * humidity +
    -0.000003582     * temp * temp * humidity * humidity;
  return Math.round(hi);
};

// ── Main Component ────────────────────────────
const AstroPanel = () => {
  const { current, isDark, unit } = useWeatherContext();
  if (!current) return null;

  const moon      = getMoonPhase();
  const dewPoint  = getDewPoint(
    current.temp, current.humidity);
  const heatIndex = getHeatIndex(
    current.temp, current.humidity);

  const items = [
    {
      emoji: moon.emoji,
      label: "Moon Phase",
      value: moon.phase,
      color: "#a78bfa",
    },
    {
      emoji: "💧",
      label: "Dew Point",
      value: formatTemp(dewPoint, unit),
      color: "#60a5fa",
    },
    ...(heatIndex
      ? [{
          emoji: "🌡️",
          label: "Heat Index",
          value: formatTemp(heatIndex, unit),
          color: "#ef4444",
        }]
      : []
    ),
    {
      emoji: "🌊",
      label: "Sea Level",
      value: `${current.pressure} hPa`,
      color: "#34d399",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🔭 Astronomical Data
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              p-3 rounded-2xl flex items-center gap-3
              ${isDark ? "bg-white/5" : "bg-black/5"}
            `}
          >
            <span className="text-2xl">{item.emoji}</span>
            <div>
              <p className={`text-xs
                ${isDark
                  ? "text-white/40"
                  : "text-slate-400"}`}>
                {item.label}
              </p>
              <p
                className="text-sm font-bold mt-0.5"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AstroPanel;