<div align="center">

# 🌤️ SkyPulse

### Real-time weather intelligence at your fingertips

**A next-generation weather experience — live global weather layers on an interactive 3D globe, severe disaster alerts, AI-powered insights, and a genuinely useful toolkit for everyday life.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Globe-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#-pwa--installable)

</div>

---

## 📌 Overview

**SkyPulse** isn't just another weather app — it's a full-stack weather intelligence platform built from the ground up with a **FastAPI** backend and a richly animated **React + Vite** frontend. It combines real-time meteorological data with a genuinely interactive 3D globe, AI-generated insights, severe disaster monitoring, and a suite of everyday tools that go far beyond "temperature and forecast."

Every screen is designed to feel alive — weather-reactive backgrounds that shift with the sky, glassmorphism cards, smooth Framer Motion animations, and a live-rotating Earth you can actually explore.

---

## ✨ Signature Features

### 🌍 Interactive 3D Weather Globe
A fully rotatable, zoomable Earth rendered in Three.js — complete with a real blue-marble texture, animated starfield, and **live weather layers** (precipitation, wind speed, temperature, cloud cover) stitched and reprojected from real Mercator map tiles onto the sphere. Double-click anywhere on the globe to instantly check that location's weather. Includes a full-screen immersive mode and auto-rotate toggle.

### 🗺️ Live Weather Map
A 2D companion map with the same live weather layers, click-to-search functionality, and a maximize/minimize fullscreen mode — powered by Leaflet and a custom backend tile proxy for reliable, CORS-safe rendering.

### 🚨 Severe Weather & Disaster Alerts
Real-time monitoring of floods, cyclones, earthquakes, and volcanic activity via **GDACS** (global) and precise tornado/flood/storm warnings via **NWS** (United States) — completely free, no paid API tier required.

### 🤖 AI Weather Summaries
Natural-language daily weather insights generated on the fly, giving users a friendly, conversational read on their day instead of just raw numbers.

### 🎨 Weather-Reactive Everything
The entire background — animated rain, snow, lightning, drifting clouds, starfields — dynamically reflects the current weather condition and time of day. Dark and light themes are fully supported with smooth transitions.

---

## 🧰 Complete Feature Set

<table>
<tr>
<td valign="top" width="33%">

**Core Weather**
- Live current conditions
- Hourly & 5-day forecasts
- Air Quality Index (AQI)
- Sunrise / Sunset & Sun Path
- Wind compass & live speed
- Temperature / humidity / history charts
- Precipitation probability charts
- UV index tracker
- Pollen & allergy risk
- Tide information
- Moon phase & astronomical data
- Local timezone display
- Feels-like trend indicator

</td>
<td valign="top" width="33%">

**Smart & Personal**
- Voice search
- Smart search shortcuts
- Search history & autocomplete
- Favorite cities
- Multi-city comparison
- Streaks & achievement badges
- Daily weather digest
- Weekly activity planner
- Settings panel (units, defaults, notifications)
- Colorblind-friendly mode
- Onboarding tour

</td>
<td valign="top" width="33%">

**Utility & Sharing**
- Travel weather advisor
- Commute weather (home ↔ work)
- Nearby weather stations
- Best photo-timing recommendations
- PDF weather report export
- Native share sheet
- Shareable weather cards
- Rain countdown timer
- Rain/severe push notifications
- Pull-to-refresh
- Offline caching
- Auto-refresh

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + Vite** | Core UI framework & build tooling |
| **Tailwind CSS** | Utility-first styling with custom glassmorphism |
| **Framer Motion** | Animation throughout the entire interface |
| **Three.js + React Three Fiber** | The interactive 3D weather globe |
| **Leaflet** | 2D interactive weather map |
| **Recharts** | Temperature, humidity, and precipitation charts |
| **Axios** | API communication |
| **jsPDF / html2canvas** | Weather report & card export |
| **vite-plugin-pwa** | Progressive Web App support |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async REST API |
| **httpx** | Async HTTP client for external data sources |
| **Pydantic** | Request/response schema validation |
| **python-dotenv** | Environment configuration |

### Data Sources
| Source | Used For |
|---|---|
| **OpenWeatherMap** | Current weather, forecasts, AQI, geocoding, map tiles |
| **GDACS** | Global disaster alerts (floods, cyclones, earthquakes, volcanoes) |
| **NWS (api.weather.gov)** | US-specific severe weather warnings |
| **ip-api.com / ipinfo.io** | IP-based location fallback |
| Browser Geolocation API | Primary accurate location detection |

---

## 📂 Project Structure

```
SkyPulse/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── routers/
│   │   └── weather.py             # Weather, search, history, tile proxy, severe alerts
│   ├── services/
│   │   └── weather_service.py     # OpenWeatherMap integration logic
│   ├── models/
│   │   └── schemas.py             # Pydantic response models
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/            # 40+ feature components
    │   ├── hooks/                 # Custom hooks (location, streaks, notifications...)
    │   ├── context/                # Global weather state
    │   ├── utils/                  # Formatters, color palettes, seasonal themes
    │   ├── pages/
    │   │   └── Home.jsx            # Main application layout
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- A free [OpenWeatherMap API key](https://openweathermap.org/api)

### 1. Clone the Repository
```bash
git clone https://github.com/NK0028/SkyPulse.git
cd SkyPulse
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
WEATHER_API_KEY=your_openweathermap_api_key
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 🔌 API Reference (Selected Endpoints)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/weather/current` | Current weather by city or coordinates |
| `GET` | `/api/weather/search` | City search / autocomplete |
| `GET` | `/api/weather/history` | Historical weather trend |
| `GET` | `/api/weather/severe-alerts` | Active disaster & severe weather alerts |
| `GET` | `/api/weather/tile-proxy/{layer}/{z}/{x}/{y}.png` | CORS-safe weather map tile proxy |
| `GET` | `/api/forecast` | Hourly & daily forecast |
| `GET` | `/api/air-quality` | Air Quality Index & pollutant breakdown |
| `GET` | `/api/location/detect` | IP-based location fallback |

---

## 📱 PWA & Installable

SkyPulse is built as a **Progressive Web App** — users can install it directly to their desktop or home screen for a native app-like experience, complete with offline caching of recently viewed cities and an app icon in their dock or app drawer.

---

## 🎯 What Makes SkyPulse Different

Most weather apps stop at "temperature and a five-day forecast." SkyPulse treats weather as something worth *exploring* — a live, textured 3D Earth you can spin and click on; disaster monitoring most consumer apps skip entirely; AI-written summaries instead of raw numbers; and a full suite of real-life tools (commute weather, travel advisories, photo timing, PDF reports) that make it genuinely useful, not just informative.

---

## 🗺️ Roadmap

- [ ] Web Push notifications (background alerts when app is closed)
- [ ] Historical climate trend comparisons *(requires paid weather-API tier)*
- [ ] Companion browser extension for one-click weather checks
- [ ] Full multi-language localization

---

## 👨‍💻 Author

**Naeem Khan**
AI Engineering Student — FAST NUCES Peshawar

- GitHub: [@NK0028](https://github.com/NK0028)
- Built with ❤️ and an unreasonable number of Framer Motion animations

---

<div align="center">

**Powered by OpenWeatherMap • GDACS • NWS**

⭐ *If you like SkyPulse, consider giving the repo a star!*

</div>
