from fastapi import APIRouter, Query, HTTPException, Response
from services.weather_service import WeatherService
from models.schemas import CurrentWeather, SearchResult
from typing import List, Optional
from dotenv import load_dotenv
import httpx
import os
import math 

load_dotenv()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

router  = APIRouter(prefix="/weather", tags=["Weather"])
service = WeatherService()

@router.get("/current", response_model=CurrentWeather)
async def get_current_weather(
    city: Optional[str]   = Query(None),
    lat : Optional[float] = Query(None),
    lon : Optional[float] = Query(None),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(
            400, "Provide city or lat/lon")
    try:
        return await service.get_current(
            city=city, lat=lat, lon=lon)
    except Exception as e:
        raise HTTPException(404, str(e))

@router.get("/search", response_model=List[SearchResult])
async def search_cities(q: str = Query(..., min_length=2)):
    try:
        return await service.search_cities(q)
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/history")
async def get_weather_history(
    lat: float = Query(...),
    lon: float = Query(...),
    dt: int = Query(...),
):
    try:
        return await service.get_history(lat, lon, dt)
    except Exception as e:
        raise HTTPException(404, str(e))

# ── Weather tile proxy ────────────────────────
@router.get("/tile-proxy/{layer}/{z}/{x}/{y}.png")
async def proxy_weather_tile(layer: str, z: int, x: int, y: int):
    url = f"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params={"appid": WEATHER_API_KEY})
        return Response(content=resp.content, media_type="image/png")


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon/2)**2)
    return R * 2 * math.asin(math.sqrt(a))

@router.get("/severe-alerts")
async def get_severe_alerts(
    lat: float = Query(...),
    lon: float = Query(...),
):
    alerts = []

    # ── GDACS (global — floods, cyclones, earthquakes, etc.) ──
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH",
                params={"eventlist": "EQ;TC;FL;VO;DR"}
            )
            data = resp.json()
            for feature in data.get("features", [])[:30]:
                props = feature.get("properties", {})
                geom  = feature.get("geometry", {})
                coords = geom.get("coordinates", [])
                if len(coords) < 2:
                    continue
                ev_lon, ev_lat = coords[0], coords[1]
                distance = _haversine_km(lat, lon, ev_lat, ev_lon)
                if distance <= 1000:  # within ~1000km radius
                    alerts.append({
                        "source"  : "GDACS",
                        "type"    : props.get("eventtype", "Unknown"),
                        "title"   : props.get("eventname") or props.get("name", "Alert"),
                        "severity": props.get("alertlevel", "Green"),
                        "distance_km": round(distance),
                        "date"    : props.get("fromdate", ""),
                        "url"     : props.get("url", {}).get("report", ""),
                    })
    except Exception:
        pass

    # ── NWS (US-only bonus layer) ──
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                "https://api.weather.gov/alerts/active",
                params={"point": f"{lat},{lon}"},
                headers={"User-Agent": "SkyPulseWeatherApp"}
            )
            if resp.status_code == 200:
                data = resp.json()
                for feature in data.get("features", [])[:10]:
                    props = feature.get("properties", {})
                    alerts.append({
                        "source"  : "NWS",
                        "type"    : props.get("event", "Alert"),
                        "title"   : props.get("headline", props.get("event", "Alert")),
                        "severity": props.get("severity", "Unknown"),
                        "distance_km": 0,
                        "date"    : props.get("effective", ""),
                        "url"     : props.get("id", ""),
                    })
    except Exception:
        pass

    return {"alerts": alerts}