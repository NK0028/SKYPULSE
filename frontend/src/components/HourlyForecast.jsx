// ─────────────────────────────────────────────
//  HourlyForecast — Next 24 hours
// ─────────────────────────────────────────────

import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp, formatHour } from "../utils/formatters";
import { getWeatherEmoji, getIconUrl } from "../utils/weatherIcons";

const HourlyForecast = () => {
  const { forecast, isDark, unit } = useWeatherContext();
  if (!forecast?.hourly?.length) return null;

  return (
    <div className={`
      ${isDark ? "glass" : "glass-light"}
      p-5 animate-fade-in
    `}>
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        ⏱ Hourly Forecast
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {forecast.hourly.map((h, i) => (
          <div
            key={i}
            className={`
              flex-shrink-0 flex flex-col items-center
              gap-2 p-3 rounded-2xl min-w-[72px]
              ${isDark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-black/5 hover:bg-black/10"
              }
              transition-all duration-200
            `}
          >
            <p className={`text-xs font-medium
              ${isDark ? "text-white/60" : "text-slate-500"}`}>
              {i === 0 ? "Now" : formatHour(h.dt)}
            </p>
            <img
              src={getIconUrl(h.icon)}
              alt={h.condition}
              className="w-8 h-8"
            />
            <p className={`text-sm font-bold
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {formatTemp(h.temp, unit)}
            </p>
            <p className={`text-xs
              ${isDark ? "text-blue-300" : "text-blue-600"}`}>
              {Math.round(h.pop * 100)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;