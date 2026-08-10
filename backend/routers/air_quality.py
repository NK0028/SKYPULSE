from fastapi import APIRouter, Query, HTTPException
from services.weather_service import WeatherService
from models.schemas import AirQuality

router  = APIRouter(
    prefix="/air-quality", tags=["Air Quality"])
service = WeatherService()

@router.get("/", response_model=AirQuality)
async def get_air_quality(
    lat: float = Query(...),
    lon: float = Query(...),
):
    try:
        return await service.get_air_quality(lat, lon)
    except Exception as e:
        raise HTTPException(500, str(e))