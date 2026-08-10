// ─────────────────────────────────────────────
//  DailyForecast — 5-day forecast
// ─────────────────────────────────────────────

import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp, formatDay, formatDate }
  from "../utils/formatters";
import { getIconUrl } from "../utils/weatherIcons";

const DailyForecast = () => {
  const { forecast, isDark, unit } = useWeatherContext();
  if (!forecast?.daily?.length) return null;

  return (
    <div className={`
      ${isDark ? "glass" : "glass-light"}
      p-5 animate-fade-in
    `}>
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📅 5-Day Forecast
      </h3>

      <div className="flex flex-col gap-2">
        {forecast.daily.map((d, i) => (
          <div
            key={i}
            className={`
              flex items-center justify-between
              px-3 py-2 rounded-xl
              ${isDark
                ? "hover:bg-white/5"
                : "hover:bg-black/5"
              }
              transition-all duration-200
            `}
          >
            {/* Day */}
            <p className={`text-sm font-medium w-24
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {i === 0 ? "Today" : formatDay(d.dt)}
              <span className={`block text-xs
                ${isDark ? "text-white/40" : "text-slate-400"}`}>
                {formatDate(d.dt)}
              </span>
            </p>

            {/* Icon */}
            <img
              src={getIconUrl(d.icon)}
              alt={d.condition}
              className="w-9 h-9"
            />

            {/* Rain chance */}
            <p className={`text-xs w-10 text-center
              ${isDark ? "text-blue-300" : "text-blue-600"}`}>
              {Math.round(d.pop * 100)}%
            </p>

            {/* Temp range */}
            <div className="flex gap-3 text-sm font-semibold">
              <span className={
                isDark ? "text-blue-300" : "text-blue-600"}>
                {formatTemp(d.temp_min, unit)}
              </span>
              <span className={
                isDark ? "text-orange-300" : "text-orange-600"}>
                {formatTemp(d.temp_max, unit)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;