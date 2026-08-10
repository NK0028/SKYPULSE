// ─────────────────────────────────────────────
//  WeatherConfetti — Celebrate perfect weather
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";

const isPerfectWeather = (current) => {
  if (!current) return false;
  const temp      = current.temp;
  const humidity  = current.humidity;
  const condition = current.condition?.toLowerCase() || "";
  return (
    temp >= 20 && temp <= 26 &&
    humidity < 60 &&
    condition.includes("clear")
  );
};

const WeatherConfetti = () => {
  const { current } = useWeatherContext();
  const firedRef    = useRef("");

  useEffect(() => {
    const key = `${current?.city}-${current?.condition}`;
    if (firedRef.current === key) return;
    if (!isPerfectWeather(current)) return;

    firedRef.current = key;

    const launchConfetti = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;

        const colors = ["#fbbf24", "#60a5fa",
                        "#34d399", "#f97316", "#a78bfa"];

        confetti({
          particleCount: 80,
          spread       : 70,
          origin       : { y: 0.6 },
          colors,
          shapes: ["circle", "square"],
        });

        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle        : 60,
            spread       : 55,
            origin       : { x: 0 },
            colors,
          });
          confetti({
            particleCount: 40,
            angle        : 120,
            spread       : 55,
            origin       : { x: 1 },
            colors,
          });
        }, 300);
      } catch { /* ignore */ }
    };

    launchConfetti();
  }, [current?.city, current?.condition]);

  return null;
};

export default WeatherConfetti;