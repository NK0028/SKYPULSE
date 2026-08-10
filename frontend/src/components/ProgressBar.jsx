// ─────────────────────────────────────────────
//  ProgressBar — YouTube-style top loader
// ─────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";

const ProgressBar = () => {
  const { loading } = useWeatherContext();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999]
            h-0.5"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r
              from-blue-400 via-purple-400 to-blue-400"
            initial={{ width: "0%",  x: "0%" }}
            animate={{ width: "90%", x: "0%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressBar;