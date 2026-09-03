// ─────────────────────────────────────────────
//  Home — Complete layout with all features
// ─────────────────────────────────────────────

import { useState }                 from "react";
import { motion, AnimatePresence }  from "framer-motion";
import { useWeatherContext }        from "../context/WeatherContext";
import { useTimeGradient }          from "../components/TimeOfDaySkin";
import { useOfflineCache }          from "../hooks/useOfflineCache";
import { useAutoRefresh }           from "../hooks/useAutoRefresh";
import { useAdaptiveUnit }          from "../hooks/useAdaptiveUnit";
import { useRainNotifications }     from "../hooks/useRainNotifications";
import WeatherBackground            from "../components/WeatherBackground";
import ParallaxLayer                from "../components/ParallaxLayer";
import OfflineBanner                from "../components/OfflineBanner";
import SearchBar                    from "../components/SearchBar";
import CurrentWeather               from "../components/CurrentWeather";
import WeatherDetails               from "../components/WeatherDetails";
import HourlyForecast               from "../components/HourlyForecast";
import DailyForecast                from "../components/DailyForecast";
import AQIGauge                     from "../components/AQIGauge";
import SunriseSunset                from "../components/SunriseSunset";
import WeatherMap                   from "../components/WeatherMap";
import WindCompass                  from "../components/WindCompass";
import TemperatureChart             from "../components/TemperatureChart";
import FavoriteCities               from "../components/FavoriteCities";
import FeelScore                    from "../components/FeelScore";
import GoldenHour                   from "../components/GoldenHour";
import WeatherAlert                 from "../components/WeatherAlert";
import ShareCard                    from "../components/ShareCard";
import WeatherHistory               from "../components/WeatherHistory";
import Globe3D                      from "../components/Globe3D";
import WindHumidityChart            from "../components/WindHumidityChart";
import AstroPanel                   from "../components/AstroPanel";
import BottomNav                    from "../components/BottomNav";
import PrecipitationBar             from "../components/PrecipitationBar";
import PrecipitationChart           from "../components/PrecipitationChart";
import WeatherScene                 from "../components/WeatherScene";
import RainCountdown                from "../components/RainCountdown";
import MultiCityDashboard           from "../components/MultiCityDashboard";
import UVTracker                    from "../components/UVTracker";
import PollenCount                  from "../components/PollenCount";
import TideInfo                     from "../components/TideInfo";
import TravelAdvisor                from "../components/TravelAdvisor";
import WeatherSounds                from "../components/WeatherSounds";
import WeeklyPlanner                from "../components/WeeklyPlanner";
import AIWeatherSummary             from "../components/AIWeatherSummary";
import PullToRefresh                from "../components/PullToRefresh";
import { usePullToRefresh }         from "../hooks/usePullToRefresh";
import SmartShortcuts               from "../components/SmartShortcuts";
import DailyDigest                  from "../components/DailyDigest";
import SunPath                      from "../components/SunPath";
import CombinedInsightsChart        from "../components/CombinedInsightsChart";
import NearbyStations               from "../components/NearbyStations";
import PhotoSpotTiming              from "../components/PhotoSpotTiming";
import CommuteWeather               from "../components/CommuteWeather";
import StreakBadgesPanel            from "../components/StreakBadgesPanel";
import ExportReport                 from "../components/ExportReport";
import SevereAlertPanel             from "../components/SevereAlertPanel";

// ── Shimmer skeleton card ─────────────────────
const ShimmerCard = ({ isDark, height = "h-40" }) => (
  <div className={`
    ${isDark ? "glass" : "glass-light"}
    ${height} shimmer rounded-2xl
  `}/>
);

// ── Stagger animation variants ────────────────
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.5 }
  }
};

// ── Feature badges ────────────────────────────
const FEATURES = [
  "☀️ Live Weather",
  "📈 Temp Charts",
  "🗺️ Click Map",
  "🌍 3D Globe",
  "🌿 Air Quality",
  "🧭 Wind Compass",
  "📸 Golden Hour",
  "📊 7-Day History",
  "📤 Share Card",
  "⭐ Favorites",
  "🎙️ Voice Search",
  "📱 PWA Ready",
  "📡 Offline Mode",
  "🌬️ Wind Chart",
  "🌑 Moon Phase",
  "🌡️ Heat Index",
  "🔄 Auto Refresh",
  "🌧️ Rain Countdown",
  "🎨 Weather Scene",
  "☂️ Precipitation",
  "🌈 UV Tracker",
  "💨 Pollen Count",
  "🌊 Tide Info",
  "✈️ Travel Advisor",
  "🏙️ Multi-City",
  "📋 Daily Digest",
  "🌅 Sun Path",
  "📡 Nearby Stations",
  "🚗 Commute Weather",
  "🔥 Streaks & Badges",
  "📄 PDF Export",
];

// ── Main Component ────────────────────────────
const Home = () => {
  const {
    isDark,
    loading,
    error,
    current,
    fetchByCity,
  } = useWeatherContext();
  const timeGradient = useTimeGradient(isDark);
  const [activeTab, setActiveTab] = useState("home");

  const {
    pulling,
    pullDist,
    refreshing,
    THRESHOLD,
  } = usePullToRefresh(() => {
    if (current?.city) {
      fetchByCity(current.city);
    }
  });

  useOfflineCache();
  useAutoRefresh();
  useAdaptiveUnit();
  useRainNotifications();

  const bgClass = isDark
    ? timeGradient ||
      "from-[#0f0c29] via-[#302b63] to-[#24243e]"
    : "from-[#dde1f9] via-[#fce4ec] to-[#e3f2fd]";

  return (
    <div className={`
      relative min-h-screen pt-24 pb-24 px-4
      bg-gradient-to-br transition-all duration-700
      ${bgClass}
    `}>

      {/* ── Fixed background layers ── */}
      <WeatherBackground />
      <ParallaxLayer />
      <OfflineBanner />

      <PullToRefresh
        pullDist={pullDist}
        refreshing={refreshing}
        threshold={THRESHOLD}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto
        main-content">

        {/* Search + Favorites */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 flex flex-col gap-3"
        >
          <SearchBar />
          <SmartShortcuts />
          <FavoriteCities />
        </motion.div>

        {/* Smart Weather Alerts */}
        <AnimatePresence>
          {current && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <WeatherAlert />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading shimmer skeleton */}
        {loading && (
          <div className="grid grid-cols-1
            lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-4">
              <ShimmerCard isDark={isDark} height="h-64"/>
              <ShimmerCard isDark={isDark} height="h-40"/>
              <ShimmerCard isDark={isDark} height="h-32"/>
            </div>
            <div className="lg:col-span-2
              flex flex-col gap-4">
              <ShimmerCard isDark={isDark} height="h-32"/>
              <ShimmerCard isDark={isDark} height="h-48"/>
              <ShimmerCard isDark={isDark} height="h-40"/>
              <ShimmerCard isDark={isDark} height="h-40"/>
            </div>
          </div>
        )}

        {/* Welcome screen */}
        {!current && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.p
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3,
                repeat: Infinity,
                ease: "easeInOut" }}
              className="text-8xl mb-6"
            >
              🌍
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-black
                ${isDark
                  ? "text-white/90"
                  : "text-slate-700"}`}
            >
              {"Welcome to SkyPulse"}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-sm mt-3
                ${isDark
                  ? "text-white/40"
                  : "text-slate-400"}`}
            >
              {"Real-time weather intelligence at your fingertips"}
            </motion.p>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center
                gap-2 mt-8"
            >
              {FEATURES.map((f, i) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className={`
                    text-xs px-3 py-1.5 rounded-xl
                    ${isDark
                      ? "glass text-white/50"
                      : "glass-light text-slate-500"
                    }
                  `}
                >
                  {f}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Main Weather Grid ── */}
        <AnimatePresence mode="wait">
          {current && !loading && (
            <motion.div
              key="weather-grid"
              variants={container}
              initial="hidden"
              animate="show"
            >

              {/* ── DESKTOP Layout ── */}
              <div className="hidden lg:grid
                grid-cols-3 gap-4">

                {/* ── Left Column ── */}
                <motion.div
                  variants={item}
                  className="flex flex-col gap-4"
                >
                  <CurrentWeather />
                  <WeatherDetails />
                  <FeelScore />
                  <DailyDigest />
                  <SunriseSunset />
                  <SunPath />
                  <GoldenHour />
                  <WindCompass />
                  <AstroPanel />
                  <StreakBadgesPanel />
                </motion.div>

                {/* ── Right Column ── */}
                <motion.div
                  variants={item}
                  className="col-span-2 flex flex-col gap-4"
                >
                  <RainCountdown />
                  <SevereAlertPanel />
                  <PrecipitationBar />
                  <HourlyForecast />
                  <AIWeatherSummary />
                  <WeatherSounds />
                  <WeeklyPlanner />
                  <WeatherScene />
                  <TemperatureChart />
                  <PrecipitationChart />
                  <WindHumidityChart />
                  <CombinedInsightsChart />
                  <WeatherHistory />
                  <DailyForecast />
                  <UVTracker />
                  <PollenCount />
                  <AQIGauge />
                  <TideInfo />
                  <NearbyStations />
                  <MultiCityDashboard />
                  <CommuteWeather />
                  <TravelAdvisor />
                  <PhotoSpotTiming />
                  <WeatherMap />
                  <Globe3D />
                  <ShareCard />
                  <ExportReport />
                </motion.div>

              </div>

              {/* ── MOBILE Layout — Tab Based ── */}
              <div className="lg:hidden">
                <AnimatePresence mode="wait">

                  {/* Home Tab */}
                  {activeTab === "home" && (
                    <motion.div
                      key="tab-home"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <CurrentWeather />
                      <WeatherDetails />
                      <FeelScore />
                      <SevereAlertPanel />
                      <DailyDigest />
                      <SunriseSunset />
                      <GoldenHour />
                      <AIWeatherSummary />
                      <WeatherSounds />
                      <StreakBadgesPanel />
                    </motion.div>
                  )}

                  {/* Forecast Tab */}
                  {activeTab === "forecast" && (
                    <motion.div
                      key="tab-forecast"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <RainCountdown />
                      <PrecipitationBar />
                      <HourlyForecast />
                      <PrecipitationChart />
                      <DailyForecast />
                      <WeatherScene />
                      <SunPath />
                      <PhotoSpotTiming />
                      <WeeklyPlanner />
                    </motion.div>
                  )}

                  {/* Charts Tab */}
                  {activeTab === "charts" && (
                    <motion.div
                      key="tab-charts"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <TemperatureChart />
                      <WindHumidityChart />
                      <CombinedInsightsChart />
                      <WeatherHistory />
                      <UVTracker />
                      <PollenCount />
                      <WindCompass />
                      <TideInfo />
                      <AstroPanel />
                    </motion.div>
                  )}

                  {/* Map Tab */}
                  {activeTab === "map" && (
                    <motion.div
                      key="tab-map"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <WeatherMap />
                      <Globe3D />
                      <NearbyStations />
                    </motion.div>
                  )}

                  {/* Travel Tab */}
                  {activeTab === "travel" && (
                    <motion.div
                      key="tab-travel"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <TravelAdvisor />
                      <CommuteWeather />
                      <MultiCityDashboard />
                      <FavoriteCities />
                    </motion.div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === "stats" && (
                    <motion.div
                      key="tab-stats"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <AQIGauge />
                      <AstroPanel />
                      <ShareCard />
                      <ExportReport />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {current && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className={`text-center text-xs mt-10
              ${isDark
                ? "text-white/20"
                : "text-slate-300"}`}
          >
            Built with ❤️ by Naeem Khan •
            Powered by OpenWeatherMap
          </motion.p>
        )}

      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

    </div>
  );
};

export default Home;