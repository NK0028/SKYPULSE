// ─────────────────────────────────────────────
//  useLocation — Auto detect location
//  Prefers accurate browser GPS, falls back to IP
// ─────────────────────────────────────────────

import axios from "axios";
import { useWeather } from "./useWeather";

const API = "http://localhost:8000/api";

export const useLocation = () => {
  const { fetchByCoords } = useWeather();

  const detectViaIP = async () => {
    const { data } = await axios.get(`${API}/location/detect`);
    await fetchByCoords(data.lat, data.lon);
    return data;
  };

  const detectLocation = async () => {
    // Try accurate browser geolocation first
    if ("geolocation" in navigator) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await fetchByCoords(
                pos.coords.latitude,
                pos.coords.longitude
              );
              resolve({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
              });
            } catch (e) {
              reject(e);
            }
          },
          async () => {
            // Permission denied or failed — fall back to IP
            try {
              const result = await detectViaIP();
              resolve(result);
            } catch (e) {
              reject("Could not detect location.");
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      });
    }

    // No geolocation support at all — use IP fallback
    return detectViaIP();
  };

  return { detectLocation };
};