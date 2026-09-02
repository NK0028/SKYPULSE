// ─────────────────────────────────────────────
//  useWeather Hook — API call logic
// ─────────────────────────────────────────────

import axios from "axios";
import { useWeatherContext } from "../context/WeatherContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const useWeather = () => {
  const {
    setCurrent, setForecast, setAirQuality,
    setLoading, setError, setCity,
  } = useWeatherContext();

  const fetchByCity = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      // Current weather
      const { data: current } = await axios.get(
        `${API}/weather/current?city=${cityName}`);
      setCurrent(current);
      setCity(cityName);

      // Forecast
      const { data: forecast } = await axios.get(
        `${API}/forecast/?lat=${current.lat}&lon=${current.lon}`);
      setForecast(forecast);

      // Air quality
      const { data: aqi } = await axios.get(
        `${API}/air-quality/?lat=${current.lat}&lon=${current.lon}`);
      setAirQuality(aqi);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "City not found. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const { data: current } = await axios.get(
        `${API}/weather/current?lat=${lat}&lon=${lon}`);
      setCurrent(current);
      setCity(current.city);

      const { data: forecast } = await axios.get(
        `${API}/forecast/?lat=${lat}&lon=${lon}`);
      setForecast(forecast);

      const { data: aqi } = await axios.get(
        `${API}/air-quality/?lat=${lat}&lon=${lon}`);
      setAirQuality(aqi);

    } catch (err) {
      setError("Could not fetch weather for this location.");
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (query) => {
    if (query.length < 2) return [];
    try {
      const { data } = await axios.get(
        `${API}/weather/search?q=${query}`);
      return data;
    } catch {
      return [];
    }
  };

  return { fetchByCity, fetchByCoords, searchCities };
};