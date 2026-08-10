// ─────────────────────────────────────────────
//  PullToRefresh — Visual indicator
// ─────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";

const PullToRefresh = ({ pullDist, refreshing, threshold }) => {
  const progress = Math.min(pullDist / threshold, 1);
  const ready    = pullDist >= threshold;

  return (
    <AnimatePresence>
      {(pullDist > 10 || refreshing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-16 left-1/2
            -translate-x-1/2 z-50
            flex flex-col items-center gap-1"
          style={{ y: pullDist * 0.3 }}
        >
          <motion.div
            className="w-10 h-10 rounded-full
              bg-blue-500/20 backdrop-blur-sm
              flex items-center justify-center
              border border-blue-400/30"
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: refreshing
              ? Infinity : 0, ease: "linear" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-blue-400"
              style={{
                strokeDasharray   : `${progress * 50} 100`,
                strokeDashoffset  : 0,
              }}
            >
              <circle
                cx="12" cy="12" r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {ready && (
                <path
                  d="M12 8l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
            </svg>
          </motion.div>
          <p className="text-xs text-white/60
            bg-black/30 px-2 py-0.5 rounded-full">
            {refreshing ? "Refreshing..." :
             ready ? "Release to refresh" :
             "Pull to refresh"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PullToRefresh;