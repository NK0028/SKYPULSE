// ─────────────────────────────────────────────
//  useRainNotifications — Browser rain alerts
//  Respects the user's notification preference
//  set in the Settings panel
//
//  Platform notes:
//  - iOS Safari has no Notification API at all —
//    every access to the bare `Notification`
//    identifier must be guarded, or it throws a
//    ReferenceError.
//  - Android Chrome (and other browsers) FORBID
//    `new Notification()` once the page is
//    controlled by a service worker — as it is
//    here via vite-plugin-pwa — and require
//    ServiceWorkerRegistration.showNotification()
//    instead, or it throws an "Illegal constructor"
//    TypeError.
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

const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

// Shows a notification via the correct API for the current
// context — service worker route when one is controlling the
// page (required by Chrome/Android), constructor otherwise
// (Safari desktop, Firefox, etc.)
const showNotification = async (title, options) => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // fall through to constructor attempt below
    }
  }

  try {
    new Notification(title, options);
  } catch {
    // Some browsers/contexts forbid both paths — silently
    // no-op rather than crashing the app over a non-critical
    // convenience feature.
  }
};

export const useRainNotifications = () => {
  const { current, forecast } = useWeatherContext();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!notificationsSupported()) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!forecast?.hourly?.length || !current) return;
    if (!notificationsSupported()) return;
    if (Notification.permission !== "granted") return;
    if (!getRainPref()) return; // user disabled rain alerts in Settings

    const key = current.city;
    if (notifiedRef.current.has(key)) return;

    const rainSoon = forecast.hourly.slice(0, 4)
      .findIndex((h) => h.pop > 0.6);

    if (rainSoon !== -1) {
      notifiedRef.current.add(key);
      showNotification("🌧️ SkyPulse Rain Alert", {
        body: `Rain likely in ${current.city} within the next ${rainSoon + 1} hour(s). Grab an umbrella!`,
        icon: "/pwa-192x192.png",
      });
    }
  }, [current?.city, forecast]);
};