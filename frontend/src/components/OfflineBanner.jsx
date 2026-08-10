// ─────────────────────────────────────────────
//  OfflineBanner — Network status indicator
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const OfflineBanner = () => {
  const { isDark } = useWeatherContext();
  const [isOffline, setIsOffline] = useState(
    !navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2
            z-50 px-4 py-2 rounded-2xl text-sm font-medium
            bg-orange-500/90 text-white shadow-xl
            flex items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5,
              repeat: Infinity }}
          >
            📡
          </motion.span>
          Offline — showing cached weather
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;   