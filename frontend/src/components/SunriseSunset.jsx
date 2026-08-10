// ─────────────────────────────────────────────
//  SunriseSunset — Sun arc animation
// ─────────────────────────────────────────────

import { useWeatherContext } from "../context/WeatherContext";
import { formatTime } from "../utils/formatters";

const SunriseSunset = () => {
  const { current, isDark } = useWeatherContext();
  if (!current) return null;

  const now     = Date.now() / 1000;
  const sunrise = current.sunrise;
  const sunset  = current.sunset;
  const total   = sunset - sunrise;
  const elapsed = Math.min(Math.max(now - sunrise, 0), total);
  const progress = (elapsed / total) * 100;

  return (
    <div className={`
      ${isDark ? "glass" : "glass-light"}
      p-5 animate-fade-in
    `}>
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌅 Sunrise & Sunset
      </h3>

      {/* Arc */}
      <div className="relative h-20 mb-4">
        <svg viewBox="0 0 200 80"
          className="w-full h-full">
          {/* Track */}
          <path
            d="M 10 70 Q 100 10 190 70"
            fill="none"
            stroke={isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d="M 10 70 Q 100 10 190 70"
            fill="none"
            stroke="url(#sunGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * progress) / 100}
          />
          <defs>
            <linearGradient id="sunGrad"
              x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#f97316" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Sun */}
          {progress > 0 && progress < 100 && (
            <text
              x={10 + (progress / 100) * 180}
              y={70 - Math.sin((progress / 100) * Math.PI) * 55}
              textAnchor="middle"
              fontSize="16"
            >
              ☀️
            </text>
          )}
        </svg>
      </div>

      {/* Times */}
      <div className="flex justify-between">
        <div className="text-center">
          <p className="text-xl">🌅</p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Sunrise
          </p>
          <p className={`text-sm font-bold
            ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatTime(sunrise)}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs font-medium
            ${isDark ? "text-white/40" : "text-slate-400"}`}>
            {Math.round(total / 3600)}h daylight
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl">🌇</p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Sunset
          </p>
          <p className={`text-sm font-bold
            ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatTime(sunset)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunset;