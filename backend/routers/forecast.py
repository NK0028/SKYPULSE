from fastapi import APIRouter, Query, HTTPException
from services.weather_service import WeatherService
from models.schemas import ForecastResponse

router  = APIRouter(prefix="/forecast", tags=["Forecast"])
service = WeatherService()

@router.get("/", response_model=ForecastResponse)
async def get_forecast(
    lat: float = Query(...),
    lon: float = Query(...),
):
    try:
        return await service.get_forecast(lat, lon)
    except Exception as e:
        raise HTTPException(500, str(e))