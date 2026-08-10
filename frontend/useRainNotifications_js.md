// ─────────────────────────────────────────────
//  useRainNotifications — Browser rain alerts
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";

export const useRainNotifications = () => {
  const { current, forecast } = useWeatherContext();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!forecast?.hourly?.length || !current) return;
    if (Notification.permission !== "granted") return;

    const key = current.city;
    if (notifiedRef.current.has(key)) return;

    const rainSoon = forecast.hourly.slice(0, 4)
      .findIndex((h) => h.pop > 0.6);

    if (rainSoon !== -1) {
      notifiedRef.current.add(key);
      new Notification("🌧️ SkyPulse Rain Alert", {
        body: `Rain likely in ${current.city} within the next ${rainSoon + 1} hour(s). Grab an umbrella!`,
        icon: "/pwa-192x192.png",
      });
    }
  }, [current?.city, forecast]);
};