from fastapi import APIRouter, HTTPException
from services.location_service import LocationService
from models.schemas import LocationInfo

router  = APIRouter(prefix="/location", tags=["Location"])
service = LocationService()

@router.get("/detect", response_model=LocationInfo)
async def detect_location():
    try:
        return await service.detect()
    except Exception as e:
        raise HTTPException(500, str(e))