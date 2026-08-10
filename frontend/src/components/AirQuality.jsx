// ─────────────────────────────────────────────
//  AirQuality — AQI display card
// ─────────────────────────────────────────────

import { useWeatherContext } from "../context/WeatherContext";
import { getAQILabel } from "../utils/formatters";

const AirQuality = () => {
  const { airQuality, isDark } = useWeatherContext();
  if (!airQuality) return null;

  const { label, color } = getAQILabel(airQuality.aqi);

  const pollutants = [
    { label: "PM2.5", value: airQuality.pm2_5.toFixed(1) },
    { label: "PM10",  value: airQuality.pm10.toFixed(1)  },
    { label: "CO",    value: airQuality.co.toFixed(1)    },
    { label: "NO₂",   value: airQuality.no2.toFixed(1)   },
    { label: "O₃",    value: airQuality.o3.toFixed(1)    },
    { label: "SO₂",   value: airQuality.so2.toFixed(1)   },
  ];

  return (
    <div className={`
      ${isDark ? "glass" : "glass-light"}
      p-5 animate-fade-in
    `}>
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        🌿 Air Quality Index
      </h3>

      {/* AQI Score */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center
            justify-center text-2xl font-black text-white"
          style={{ backgroundColor: color }}
        >
          {airQuality.aqi}
        </div>
        <div>
          <p className="text-xl font-bold"
            style={{ color }}>
            {label}
          </p>
          <p className={`text-xs mt-1
            ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Air Quality Index
          </p>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div className="grid grid-cols-3 gap-2">
        {pollutants.map((p, i) => (
          <div
            key={i}
            className={`
              p-2 rounded-xl text-center
              ${isDark ? "bg-white/5" : "bg-black/5"}
            `}
          >
            <p className={`text-xs
              ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {p.label}
            </p>
            <p className={`text-sm font-bold mt-1
              ${isDark ? "text-white" : "text-slate-800"}`}>
              {p.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirQuality;