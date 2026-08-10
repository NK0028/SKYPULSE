# ─────────────────────────────────────────────
#  Location Service — IP-based auto detection
# ─────────────────────────────────────────────

import httpx
from models.schemas import LocationInfo

class LocationService:

    async def detect(self) -> LocationInfo:

        # Method 1 — ip-api.com
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    "http://ip-api.com/json/")
                data = resp.json()
                if data.get("status") == "success":
                    return LocationInfo(
                        city    = data["city"],
                        country = data["countryCode"],
                        lat     = data["lat"],
                        lon     = data["lon"],
                        region  = data.get("regionName", ""),
                    )
        except Exception:
            pass

        # Method 2 — ipinfo.io
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    "https://ipinfo.io/json")
                data = resp.json()
                lat, lon = data.get(
                    "loc", "33.6,73.0").split(",")
                return LocationInfo(
                    city    = data.get("city", "Unknown"),
                    country = data.get("country", ""),
                    lat     = float(lat),
                    lon     = float(lon),
                    region  = data.get("region", ""),
                )
        except Exception:
            pass

        # Fallback — Islamabad
        return LocationInfo(
            city    = "Islamabad",
            country = "PK",
            lat     = 33.6,
            lon     = 73.0,
        )