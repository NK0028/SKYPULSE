# ─────────────────────────────────────────────
#  Pydantic Schemas — Data validation models
# ─────────────────────────────────────────────

from pydantic import BaseModel
from typing import List, Optional

class CurrentWeather(BaseModel):
    city        : str
    country     : str
    lat         : float
    lon         : float
    temp        : float
    feels_like  : float
    temp_min    : float
    temp_max    : float
    humidity    : int
    pressure    : int
    visibility  : float
    wind_speed  : float
    wind_deg    : int
    condition   : str
    description : str
    icon        : str
    sunrise     : int
    sunset      : int
    timezone    : Optional[int] = None
    uv_index    : Optional[float] = None

class HourlyItem(BaseModel):
    dt          : int
    temp        : float
    feels_like  : float
    humidity    : int
    condition   : str
    icon        : str
    pop         : float       # probability of precipitation

class DailyItem(BaseModel):
    dt          : int
    temp_min    : float
    temp_max    : float
    humidity    : int
    condition   : str
    icon        : str
    pop         : float
    sunrise     : int
    sunset      : int

class ForecastResponse(BaseModel):
    hourly      : List[HourlyItem]
    daily       : List[DailyItem]

class AirQuality(BaseModel):
    aqi         : int
    category    : str
    color       : str
    pm2_5       : float
    pm10        : float
    co          : float
    no2         : float
    o3          : float
    so2         : float

class LocationInfo(BaseModel):
    city        : str
    country     : str
    lat         : float
    lon         : float
    region      : Optional[str] = ""

class SearchResult(BaseModel):
    name        : str
    country     : str
    state       : Optional[str] = ""
    lat         : float
    lon         : float