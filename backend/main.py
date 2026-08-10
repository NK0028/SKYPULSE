# ════════════════════════════════════════════════════════════════
#   SkyPulse — FastAPI Backend
#   Author  : Naeem Khan
#   Version : 1.0
#   Stack   : FastAPI | OpenWeatherMap | Python 3.11
# ════════════════════════════════════════════════════════════════

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import weather, forecast, air_quality, location

app = FastAPI(
    title       = "SkyPulse API",
    description = "Weather data API for SkyPulse app",
    version     = "1.0.0"
)

# ── CORS — allow React frontend ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173",
                         "https://skypulse.vercel.app"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Register routers ──────────────────────────
app.include_router(weather.router,     prefix="/api")
app.include_router(forecast.router,    prefix="/api")
app.include_router(air_quality.router, prefix="/api")
app.include_router(location.router,    prefix="/api")

@app.get("/")
async def root():
    return {
        "app"    : "SkyPulse API",
        "version": "1.0.0",
        "status" : "running"
    }