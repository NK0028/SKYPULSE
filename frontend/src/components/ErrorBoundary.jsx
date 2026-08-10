// ─────────────────────────────────────────────
//  ErrorBoundary — Graceful crash handler
// ─────────────────────────────────────────────

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("SkyPulse Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center
          justify-center bg-gradient-to-br
          from-[#0f0c29] via-[#302b63] to-[#24243e]">
          <div className="glass p-8 max-w-md mx-4
            text-center rounded-3xl">
            <p className="text-5xl mb-4">⛈️</p>
            <h2 className="text-xl font-black
              text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-white/50 text-sm mb-6">
              {this.state.error?.message ||
                "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500
                hover:bg-blue-600 text-white font-bold
                rounded-2xl transition-all"
            >
              🔄 Reload SkyPulse
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;