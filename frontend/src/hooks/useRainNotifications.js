// ─────────────────────────────────────────────
//  useRainNotifications — Browser rain alerts
//  Respects the user's notification preference
//  set in the Settings panel
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useWeatherContext } from "../context/WeatherContext";

const NOTIF_PREF_KEY = "skyPulseNotifPrefs";

const getRainPref = () => {
  try {
    const prefs = JSON.parse(localStorage.getItem(NOTIF_PREF_KEY));
    return prefs?.rain !== false; // default true if unset
  } catch {
    return true;
  }
};

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
    if (!getRainPref()) return; // user disabled rain alerts in Settings

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