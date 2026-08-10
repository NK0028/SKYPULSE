# ─────────────────────────────────────────────
#  Weather Service — All OpenWeatherMap calls
# ─────────────────────────────────────────────

import os
import httpx
from dotenv import load_dotenv
from models.schemas import (
    CurrentWeather, ForecastResponse,
    HourlyItem, DailyItem,
    AirQuality, SearchResult
)

load_dotenv()
API_KEY  = os.getenv("WEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org"

AQI_CATEGORIES = {
    1: ("Good",        "#00e400"),
    2: ("Fair",        "#ffff00"),
    3: ("Moderate",    "#ff7e00"),
    4: ("Poor",        "#ff0000"),
    5: ("Very Poor",   "#8f3f97"),
}

class WeatherService:

    async def _get(self, url: str, params: dict) -> dict:
        params["appid"] = API_KEY
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    # ── Current Weather ───────────────────────
    async def get_current(
        self,
        city: str = None,
        lat: float = None,
        lon: float = None
    ) -> CurrentWeather:

        params = {"units": "metric"}
        if city:
            params["q"] = city
        else:
            params["lat"] = lat
            params["lon"] = lon

        data = await self._get(
            f"{BASE_URL}/data/2.5/weather", params)

        return CurrentWeather(
            city        = data["name"],
            country     = data["sys"]["country"],
            lat         = data["coord"]["lat"],
            lon         = data["coord"]["lon"],
            temp        = data["main"]["temp"],
            feels_like  = data["main"]["feels_like"],
            temp_min    = data["main"]["temp_min"],
            temp_max    = data["main"]["temp_max"],
            humidity    = data["main"]["humidity"],
            pressure    = data["main"]["pressure"],
            visibility  = data.get("visibility", 0) / 1000,
            wind_speed  = data["wind"]["speed"],
            wind_deg    = data["wind"].get("deg", 0),
            condition   = data["weather"][0]["main"],
            description = data["weather"][0]["description"].title(),
            icon        = data["weather"][0]["icon"],
            sunrise     = data["sys"]["sunrise"],
            sunset      = data["sys"]["sunset"],
            timezone    = data.get("timezone"),
        )

    # ── Forecast ──────────────────────────────
    async def get_forecast(
        self,
        lat: float,
        lon: float
    ) -> ForecastResponse:

        # Hourly — One Call API
        params = {
            "lat"     : lat,
            "lon"     : lon,
            "units"   : "metric",
            "exclude" : "minutely,alerts",
            "appid"   : API_KEY
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{BASE_URL}/data/3.0/onecall",
                params=params
            )
            # Fallback to 2.5 if 3.0 fails
            if resp.status_code != 200:
                resp = await client.get(
                    f"{BASE_URL}/data/2.5/forecast",
                    params={
                        "lat"  : lat,
                        "lon"  : lon,
                        "units": "metric",
                        "cnt"  : 40,
                        "appid": API_KEY
                    }
                )
                data = resp.json()
                return self._parse_forecast_25(data)

        data = resp.json()
        return self._parse_forecast_30(data)

    def _parse_forecast_30(self, data: dict) -> ForecastResponse:
        hourly = [
            HourlyItem(
                dt         = h["dt"],
                temp       = h["temp"],
                feels_like = h["feels_like"],
                humidity   = h["humidity"],
                condition  = h["weather"][0]["main"],
                icon       = h["weather"][0]["icon"],
                pop        = h.get("pop", 0),
            )
            for h in data.get("hourly", [])[:24]
        ]
        daily = [
            DailyItem(
                dt         = d["dt"],
                temp_min   = d["temp"]["min"],
                temp_max   = d["temp"]["max"],
                humidity   = d["humidity"],
                condition  = d["weather"][0]["main"],
                icon       = d["weather"][0]["icon"],
                pop        = d.get("pop", 0),
                sunrise    = d["sunrise"],
                sunset     = d["sunset"],
            )
            for d in data.get("daily", [])[:7]
        ]
        return ForecastResponse(hourly=hourly, daily=daily)

    def _parse_forecast_25(self, data: dict) -> ForecastResponse:
        import datetime

        # Hourly — next 8 entries (24 hours)
        hourly = [
            HourlyItem(
                dt         = h["dt"],
                temp       = h["main"]["temp"],
                feels_like = h["main"]["feels_like"],
                humidity   = h["main"]["humidity"],
                condition  = h["weather"][0]["main"],
                icon       = h["weather"][0]["icon"],
                pop        = h.get("pop", 0),
            )
            for h in data["list"][:8]
        ]

        # Daily — group by date
        daily_map = {}
        for item in data["list"]:
            day = datetime.datetime.fromtimestamp(
                item["dt"]).strftime("%Y-%m-%d")
            if day not in daily_map:
                daily_map[day] = {
                    "dt"      : item["dt"],
                    "temps"   : [],
                    "condition": item["weather"][0]["main"],
                    "icon"    : item["weather"][0]["icon"],
                    "humidity": item["main"]["humidity"],
                    "pop"     : item.get("pop", 0),
                }
            daily_map[day]["temps"].append(item["main"]["temp"])

        daily = [
            DailyItem(
                dt       = v["dt"],
                temp_min = min(v["temps"]),
                temp_max = max(v["temps"]),
                humidity = v["humidity"],
                condition= v["condition"],
                icon     = v["icon"],
                pop      = v["pop"],
                sunrise  = 0,
                sunset   = 0,
            )
            for v in list(daily_map.values())[:7]
        ]
        return ForecastResponse(hourly=hourly, daily=daily)

    # ── Air Quality ───────────────────────────
    async def get_air_quality(
        self, lat: float, lon: float
    ) -> AirQuality:

        data = await self._get(
            f"{BASE_URL}/data/2.5/air_pollution",
            {"lat": lat, "lon": lon}
        )
        aqi        = data["list"][0]["main"]["aqi"]
        components = data["list"][0]["components"]
        category, color = AQI_CATEGORIES.get(
            aqi, ("Unknown", "#999999"))

        return AirQuality(
            aqi      = aqi,
            category = category,
            color    = color,
            pm2_5    = components.get("pm2_5", 0),
            pm10     = components.get("pm10",  0),
            co       = components.get("co",    0),
            no2      = components.get("no2",   0),
            o3       = components.get("o3",    0),
            so2      = components.get("so2",   0),
        )

    # ── City Search Autocomplete ──────────────
    async def search_cities(
        self, query: str
    ) -> list[SearchResult]:

        data = await self._get(
            f"{BASE_URL}/geo/1.0/direct",
            {"q": query, "limit": 10}   # ↑ was 5, now 10 for better options
        )

        # De-duplicate identical name+country+state combos
        # (OpenWeather's geocoding API often returns near-duplicates)
        seen    = set()
        results = []
        for item in data:
            key = (
                item["name"].lower(),
                item["country"],
                item.get("state", "")
            )
            if key in seen:
                continue
            seen.add(key)
            results.append(
                SearchResult(
                    name    = item["name"],
                    country = item["country"],
                    state   = item.get("state", ""),
                    lat     = item["lat"],
                    lon     = item["lon"],
                )
            )

        return results

    async def get_history(self, lat: float, lon: float, dt: int) -> dict:
        params = {
            "lat": lat, "lon": lon, "dt": dt,
        }
        data = await self._get(
            f"{BASE_URL}/data/3.0/onecall/timemachine",
            params
        )
        temps = [h["temp"] for h in data.get("data", [])]
        avg_temp = sum(temps) / len(temps) if temps else 0
        return {"temp": round(avg_temp, 1)}