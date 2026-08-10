// ─────────────────────────────────────────────
//  WeatherMap — Live layered weather map
//  Fullscreen + Rain/Wind/Snow/Temp/Clouds layers
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  MapContainer, TileLayer,
  Marker, Popup, useMap, useMapEvents
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { useWeather } from "../hooks/useWeather";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const WEATHER_API_KEY = "9c1b04372a2848475277ace899bb2e7a";

// ── Fix default marker icon ───────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Available weather layers ──────────────────
const LAYERS = [
  {
    id: "precipitation", label: "🌧️ Rain & Snow",
    tile: "precipitation_new",
    legend: [
      { color: "#7de29a", label: "Light"    },
      { color: "#3ca0f0", label: "Moderate" },
      { color: "#1c4fd6", label: "Heavy"    },
    ],
  },
  {
    id: "wind", label: "💨 Wind Speed",
    tile: "wind_new",
    legend: [
      { color: "#c8e6c9", label: "Calm"     },
      { color: "#66bb6a", label: "Breezy"   },
      { color: "#ef6c00", label: "Strong"   },
      { color: "#b71c1c", label: "Storm"    },
    ],
  },
  {
    id: "temp", label: "🌡️ Temperature",
    tile: "temp_new",
    legend: [
      { color: "#2166ac", label: "Cold"     },
      { color: "#67c2a3", label: "Mild"     },
      { color: "#fdae61", label: "Warm"     },
      { color: "#d73027", label: "Hot"      },
    ],
  },
  {
    id: "clouds", label: "☁️ Cloud Cover",
    tile: "clouds_new",
    legend: [
      { color: "#e0e0e0", label: "Clear"    },
      { color: "#9e9e9e", label: "Partly"   },
      { color: "#616161", label: "Overcast" },
    ],
  },
  {
    id: "pressure", label: "🔵 Pressure",
    tile: "pressure_new",
    legend: [
      { color: "#4fc3f7", label: "Low"      },
      { color: "#ba68c8", label: "High"     },
    ],
  },
];

// ── Recenter map when city changes ────────────
const MapUpdater = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.setView([lat, lon], map.getZoom() < 5 ? 6 : map.getZoom());
  }, [lat, lon]);
  return null;
};

// ── Handle map click ──────────────────────────
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

// ── Fix Leaflet sizing when entering/exiting fullscreen ──
const MapResizeHandler = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [trigger]);
  return null;
};

// ── The actual map (reused in both modes) ─────
const MapCore = ({
  isDark, current, pos, activeLayer, onMapClick, isFullscreen
}) => (
  <MapContainer
    center={pos}
    zoom={6}
    style={{ height: "100%", width: "100%" }}
    zoomControl={true}
  >
    <TileLayer
      attribution="© OpenStreetMap"
      url={isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      }
    />

    {/* Active weather layer overlay */}
    {activeLayer && (
      <TileLayer
        key={activeLayer.id}
        url={`https://tile.openweathermap.org/map/${activeLayer.tile}/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`}
        opacity={0.6}
      />
    )}

    <MapClickHandler onMapClick={onMapClick} />
    <MapUpdater lat={pos[0]} lon={pos[1]} />
    <MapResizeHandler trigger={isFullscreen} />

    {current && (
      <Marker position={[current.lat, current.lon]}>
        <Popup>
          <div className="text-sm">
            <p className="font-bold text-base">
              {current.city}, {current.country}
            </p>
            <p className="text-gray-600 mt-1">
              {current.description}
            </p>
            <p className="font-semibold mt-1 text-blue-600">
              {Math.round(current.temp)}°C
            </p>
            <p className="text-gray-500 text-xs mt-1">
              💧 {current.humidity}% • 🌬️ {current.wind_speed} m/s
            </p>
          </div>
        </Popup>
      </Marker>
    )}
  </MapContainer>
);

// ── Layer selector bar ────────────────────────
const LayerBar = ({ isDark, activeLayer, setActiveLayer }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
    <button
      onClick={() => setActiveLayer(null)}
      className={`
        flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
        transition-all
        ${!activeLayer
          ? "bg-blue-500 text-white"
          : isDark
            ? "bg-white/8 text-white/50 hover:bg-white/15"
            : "bg-black/5 text-slate-500 hover:bg-black/10"
        }
      `}
    >
      🗺️ Base Map
    </button>
    {LAYERS.map((l) => (
      <button
        key={l.id}
        onClick={() => setActiveLayer(l)}
        className={`
          flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
          transition-all whitespace-nowrap
          ${activeLayer?.id === l.id
            ? "bg-blue-500 text-white"
            : isDark
              ? "bg-white/8 text-white/50 hover:bg-white/15"
              : "bg-black/5 text-slate-500 hover:bg-black/10"
          }
        `}
      >
        {l.label}
      </button>
    ))}
  </div>
);

// ── Legend for active layer ───────────────────
const LayerLegend = ({ isDark, activeLayer }) => {
  if (!activeLayer) return null;
  return (
    <div className="flex items-center gap-3 mt-2 flex-wrap">
      <span className={`text-xs font-medium
        ${isDark ? "text-white/40" : "text-slate-400"}`}>
        {activeLayer.label}:
      </span>
      {activeLayer.legend.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full"
            style={{ background: item.color }} />
          <span className={`text-xs
            ${isDark ? "text-white/40" : "text-slate-400"}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────
const WeatherMap = () => {
  const { current, isDark } = useWeatherContext();
  const { fetchByCoords }   = useWeather();
  const [activeLayer, setActiveLayer]   = useState(LAYERS[0]); // default: rain
  const [isFullscreen, setIsFullscreen] = useState(false);

  const defaultPos = [33.6, 73.0];
  const pos = current ? [current.lat, current.lon] : defaultPos;

  const handleMapClick = useCallback((lat, lng) => {
    fetchByCoords(lat, lng);
  }, [fetchByCoords]);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => e.key === "Escape" && setIsFullscreen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <>
      {/* ── Normal inline card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDark ? "glass" : "glass-light"} p-4`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold
            ${isDark ? "text-white/70" : "text-slate-600"}`}>
            🗺️ Live Weather Map
            <span className={`ml-2 text-xs font-normal
              ${isDark ? "text-white/40" : "text-slate-400"}`}>
              Click anywhere to get weather
            </span>
          </h3>
          <button
            onClick={() => setIsFullscreen(true)}
            title="Maximize"
            className={`
              p-2 rounded-xl text-sm transition-all
              ${isDark
                ? "bg-white/8 hover:bg-white/15 text-white/70"
                : "bg-black/5 hover:bg-black/10 text-slate-600"
              }
            `}
          >
            ⛶
          </button>
        </div>

        <LayerBar
          isDark={isDark}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
        />

        <div className="rounded-2xl overflow-hidden h-64">
          <MapCore
            isDark={isDark}
            current={current}
            pos={pos}
            activeLayer={activeLayer}
            onMapClick={handleMapClick}
            isFullscreen={isFullscreen}
          />
        </div>

        <LayerLegend isDark={isDark} activeLayer={activeLayer} />
      </motion.div>

      {/* ── Fullscreen overlay ── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col"
            style={{
              background: isDark ? "#0f0c29" : "#e3f2fd",
            }}
          >
            {/* Header */}
            <div className={`
              flex items-center justify-between px-5 py-4
              ${isDark ? "bg-[#1a1f35]" : "bg-white"}
              border-b
              ${isDark ? "border-white/10" : "border-slate-200"}
            `}>
              <h3 className={`text-base font-bold
                ${isDark ? "text-white" : "text-slate-800"}`}>
                🗺️ Live Weather Map
                {current && (
                  <span className={`ml-2 text-sm font-normal
                    ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    — {current.city}, {current.country}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsFullscreen(false)}
                title="Minimize (Esc)"
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold
                  transition-all
                  ${isDark
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }
                `}
              >
                ✕ Close
              </button>
            </div>

            {/* Layer bar */}
            <div className={`
              px-5 py-3
              ${isDark ? "bg-[#1a1f35]" : "bg-white"}
              border-b
              ${isDark ? "border-white/10" : "border-slate-200"}
            `}>
              <LayerBar
                isDark={isDark}
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
              />
              <LayerLegend isDark={isDark} activeLayer={activeLayer} />
            </div>

            {/* Fullscreen map */}
            <div className="flex-1">
              <MapCore
                isDark={isDark}
                current={current}
                pos={pos}
                activeLayer={activeLayer}
                onMapClick={handleMapClick}
                isFullscreen={isFullscreen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WeatherMap;