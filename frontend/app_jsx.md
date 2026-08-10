// ─────────────────────────────────────────────
// App — Root with all providers and wrappers
// ─────────────────────────────────────────────

import { Toaster } from "react-hot-toast";
import { WeatherProvider } from "./context/WeatherContext";

import ErrorBoundary from "./components/ErrorBoundary";
import ProgressBar from "./components/ProgressBar";
import WeatherCursor from "./components/WeatherCursor";
import ThemeTransition from "./components/ThemeTransition";
import WeatherConfetti from "./components/WeatherConfetti";
import CityPhotoBackground from "./components/CityPhotoBackground";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function App() {
  return (
    <ErrorBoundary>
      <WeatherProvider>
        {/* Global UI */}
        <ProgressBar />
        <WeatherCursor />
        <ThemeTransition />
        <WeatherConfetti />
        <CityPhotoBackground />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15,12,41,0.92)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              fontSize: "13px",
            },
          }}
        />

        {/* Navigation */}
        <Navbar />

        {/* Main Page */}
        <Home />
      </WeatherProvider>
    </ErrorBoundary>
  );
}

export default App;