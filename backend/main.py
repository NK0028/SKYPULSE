# ════════════════════════════════════════════════════════════════
#   SkyPulse — FastAPI Backend
#   Author  : Naeem Khan
#   Version : 1.0
#   Stack   : FastAPI | OpenWeatherMap | Python 3.11
# ════════════════════════════════════════════════════════════════

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import weather, forecast, air_quality, location

app = FastAPI(
    title       = "SkyPulse API",
    description = "Weather data API for SkyPulse app",
    version     = "1.0.0"
)

# ── CORS — allow local dev + production frontend(s) ──
# FRONTEND_URL is set as an environment variable on Railway
# once the real Vercel domain is known, so no redeploy-and-guess
# cycle is needed if the domain changes later.
extra_origin = os.getenv("FRONTEND_URL")

allow_origins = [
    "http://localhost:5173",
    "https://skypulse.vercel.app",
]
if extra_origin and extra_origin not in allow_origins:
    allow_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = allow_origins,
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