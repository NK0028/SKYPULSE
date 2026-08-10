// ─────────────────────────────────────────────
//  ShareCard — Generate shareable weather card
//  + Native share sheet (mobile/desktop share UI)
// ─────────────────────────────────────────────

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";
import { getWeatherEmoji } from "../utils/weatherIcons";

const ShareCard = () => {
  const { current, isDark, unit } = useWeatherContext();
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [shared,     setShared]     = useState(false);
  const [sharing,    setSharing]    = useState(false);
  const [copied,     setCopied]     = useState(false);

  if (!current) return null;

  const generateImage = async () => {
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link    = document.createElement("a");
      link.download = `skypulse-${current.city}.png`;
      link.href     = canvas.toDataURL();
      link.click();
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const shareNatively = async () => {
    setSharing(true);
    try {
      const shareText =
        `🌤️ ${current.city}, ${current.country}\n` +
        `${formatTemp(current.temp, unit)} — ${current.description}\n` +
        `Feels like ${formatTemp(current.feels_like, unit)}\n\n` +
        `Checked on SkyPulse 🚀`;

      if (navigator.share) {
        await navigator.share({
          title: `SkyPulse — ${current.city} Weather`,
          text: shareText,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        // Fallback for browsers without the Web Share API
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // User cancelled the share sheet or it failed silently — no action needed
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📤 Share Weather
      </h3>

      {/* Preview Card */}
      <div
        ref={cardRef}
        className="rounded-2xl p-5 mb-4 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29, #302b63)",
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs opacity-60 mb-1">
              🌤️ SkyPulse
            </p>
            <p className="text-2xl font-black">
              {current.city}, {current.country}
            </p>
            <p className="text-5xl font-black mt-2">
              {formatTemp(current.temp, unit)}
            </p>
            <p className="opacity-70 mt-1">
              {current.description}
            </p>
          </div>
          <span className="text-5xl">
            {getWeatherEmoji(current.condition)}
          </span>
        </div>
        <div className="flex gap-4 mt-4 text-xs opacity-60">
          <span>💧 {current.humidity}%</span>
          <span>🌬️ {current.wind_speed} m/s</span>
          <span>👁️ {current.visibility} km</span>
        </div>
        <p className="text-xs opacity-30 mt-3">
          {new Date().toLocaleDateString([], {
            weekday: "long", month: "long", day: "numeric"
          })}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={generateImage}
          disabled={generating}
          className={`
            flex-1 py-3 rounded-2xl text-sm font-bold
            transition-all duration-200
            ${shared
              ? "bg-green-500/20 text-green-400"
              : "bg-blue-500 hover:bg-blue-600 text-white"
            }
          `}
        >
          {generating ? "Generating..." :
           shared     ? "✅ Downloaded!" :
           "📥 Download"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={shareNatively}
          disabled={sharing}
          className={`
            flex-1 py-3 rounded-2xl text-sm font-bold
            transition-all duration-200
            ${copied
              ? "bg-green-500/20 text-green-400"
              : isDark
                ? "bg-white/8 text-white hover:bg-white/15"
                : "bg-black/5 text-slate-700 hover:bg-black/10"
            }
          `}
        >
          {sharing ? "Opening..." :
           copied   ? "✅ Copied!" :
           "📤 Share"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ShareCard;