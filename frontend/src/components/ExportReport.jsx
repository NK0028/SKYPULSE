// ─────────────────────────────────────────────
//  ExportReport — Download weather report as PDF
// ─────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { useWeatherContext } from "../context/WeatherContext";
import { formatTemp } from "../utils/formatters";

const ExportReport = () => {
  const { current, forecast, airQuality, isDark, unit } = useWeatherContext();
  const [generating, setGenerating] = useState(false);

  if (!current) return null;

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(22);
      doc.text("SkyPulse Weather Report", 20, y); y += 12;

      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text(new Date().toLocaleDateString(), 20, y); y += 14;

      doc.setTextColor(20);
      doc.setFontSize(16);
      doc.text(`${current.city}, ${current.country}`, 20, y); y += 10;

      doc.setFontSize(12);
      doc.text(`Current: ${formatTemp(current.temp, unit)} — ${current.description}`, 20, y); y += 8;
      doc.text(`Feels like: ${formatTemp(current.feels_like, unit)}`, 20, y); y += 8;
      doc.text(`Humidity: ${current.humidity}%  Wind: ${current.wind_speed} m/s`, 20, y); y += 12;

      if (airQuality) {
        doc.text(`Air Quality Index: ${airQuality.aqi} (${airQuality.category})`, 20, y);
        y += 12;
      }

      if (forecast?.daily?.length) {
        doc.setFontSize(14);
        doc.text("5-Day Forecast", 20, y); y += 8;
        doc.setFontSize(11);
        forecast.daily.slice(0, 5).forEach((d) => {
          const day = new Date(d.dt * 1000).toLocaleDateString([], { weekday: "short" });
          doc.text(
            `${day}: ${Math.round(d.temp_min)}° - ${Math.round(d.temp_max)}°  (${Math.round(d.pop * 100)}% rain)`,
            20, y
          );
          y += 7;
        });
      }

      doc.save(`SkyPulse-${current.city}-Report.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={generatePDF}
      disabled={generating}
      className={`
        w-full py-3 rounded-2xl text-sm font-bold transition-all
        ${isDark
          ? "glass text-white hover:bg-white/15"
          : "glass-light text-slate-700 hover:bg-black/5"
        }
      `}
    >
      {generating ? "Generating..." : "📄 Export Weather Report as PDF"}
    </motion.button>
  );
};

export default ExportReport;