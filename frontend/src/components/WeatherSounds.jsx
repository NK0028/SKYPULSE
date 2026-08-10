// ─────────────────────────────────────────────
//  WeatherSounds — Ambient weather soundscape
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useWeatherContext }           from "../context/WeatherContext";

// Free royalty-free weather sounds from Freesound CDN
const SOUNDS = {
  rain    : "https://www.soundjay.com/nature/rain-01.mp3",
  thunder : "https://www.soundjay.com/nature/thunder-01.mp3",
  wind    : "https://www.soundjay.com/nature/wind-howling-01.mp3",
  birds   : "https://www.soundjay.com/nature/birds-singing-01.mp3",
};

const getSoundForCondition = (condition) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("thunder")) return { key: "thunder", label: "⛈️ Thunder" };
  if (c.includes("rain") ||
      c.includes("drizzle")) return { key: "rain",    label: "🌧️ Rain"    };
  if (c.includes("wind") ||
      c.includes("squall"))  return { key: "wind",    label: "💨 Wind"    };
  if (c.includes("clear"))   return { key: "birds",   label: "🐦 Birds"   };
  return null;
};

const WeatherSounds = () => {
  const { current, isDark } = useWeatherContext();
  const [playing,  setPlaying]  = useState(false);
  const [volume,   setVolume]   = useState(0.3);
  const [loading,  setLoading]  = useState(false);
  const audioRef  = useRef(null);

  const soundInfo = getSoundForCondition(current?.condition);

  const togglePlay = async () => {
    if (!soundInfo) return;

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      if (!audioRef.current ||
          audioRef.current._soundKey !== soundInfo.key) {
        if (audioRef.current) audioRef.current.pause();
        const audio      = new Audio();
        audio.loop       = true;
        audio.volume     = volume;
        audio._soundKey  = soundInfo.key;
        audioRef.current = audio;

        // Use Web Audio API oscillator as fallback
        // (since external URLs may be blocked)
        const ctx = new (window.AudioContext ||
                         window.webkitAudioContext)();

        const createRainSound = () => {
          const bufferSize = ctx.sampleRate * 2;
          const buffer     = ctx.createBuffer(
            1, bufferSize, ctx.sampleRate);
          const data       = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
          }
          const source  = ctx.createBufferSource();
          source.buffer = buffer;
          source.loop   = true;

          const filter = ctx.createBiquadFilter();
          filter.type  = "bandpass";

          const gain      = ctx.createGain();
          gain.gain.value = volume;

          if (soundInfo.key === "rain") {
            filter.frequency.value = 1200;
            filter.Q.value         = 0.5;
          } else if (soundInfo.key === "wind") {
            filter.frequency.value = 400;
            filter.Q.value         = 0.3;
          } else if (soundInfo.key === "thunder") {
            filter.frequency.value = 80;
            filter.Q.value         = 1;
          } else {
            // Birds — use oscillators
            filter.frequency.value = 3000;
            filter.Q.value         = 2;
          }

          source.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          source.start();

          audioRef.current = { pause: () => {
            source.stop();
            gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
          }, _soundKey: soundInfo.key, _gain: gain, _ctx: ctx };
        };

        createRainSound();
      }

      setPlaying(true);
    } catch (e) {
      console.warn("Audio failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Update volume
  useEffect(() => {
    if (audioRef.current?._gain) {
      audioRef.current._gain.gain.value = volume;
    }
  }, [volume]);

  // Stop on unmount
  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  if (!soundInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${isDark ? "glass" : "glass-light"}
        p-4 flex items-center gap-4
      `}
    >
      {/* Sound icon */}
      <motion.div
        animate={playing
          ? { scale: [1, 1.1, 1] }
          : { scale: 1 }}
        transition={{ duration: 1.5,
          repeat: playing ? Infinity : 0 }}
        className="text-2xl flex-shrink-0"
      >
        {soundInfo.label.split(" ")[0]}
      </motion.div>

      <div className="flex-1">
        <p className={`text-xs font-semibold
          ${isDark ? "text-white/60" : "text-slate-500"}`}>
          {soundInfo.label} Soundscape
        </p>

        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) =>
            setVolume(parseFloat(e.target.value))}
          className="w-full mt-1.5 h-1 rounded-full
            appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              #60a5fa ${volume * 100}%,
              rgba(255,255,255,0.1) ${volume * 100}%)`
          }}
        />
      </div>

      {/* Play/Stop button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        disabled={loading}
        className={`
          w-10 h-10 rounded-xl flex items-center
          justify-center text-lg transition-all
          flex-shrink-0
          ${playing
            ? "bg-red-500/20 text-red-400"
            : "bg-blue-500/20 text-blue-400"
          }
        `}
      >
        {loading ? "⏳" : playing ? "⏹" : "▶"}
      </motion.button>

      {/* Equalizer animation */}
      {playing && (
        <div className="flex gap-0.5 items-end
          h-5 flex-shrink-0">
          {[1,2,3,4].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-blue-400"
              animate={{ height: ["40%","100%","60%","80%","40%"] }}
              transition={{
                duration: 0.8 + i * 0.1,
                repeat  : Infinity,
                delay   : i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WeatherSounds;