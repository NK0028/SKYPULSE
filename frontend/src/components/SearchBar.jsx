// ─────────────────────────────────────────────
//  SearchBar — Fixed suggestions + auto-close
//  + Translated placeholder text
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback }
  from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherContext }       from "../context/WeatherContext";
import { useWeather }              from "../hooks/useWeather";
import { useLocation }             from "../hooks/useLocation";

const HISTORY_KEY = "skyPulseSearchHistory";
const MAX_HISTORY = 5;

const SearchBar = () => {
  const { isDark, loading, error } = useWeatherContext();
  const { fetchByCity, searchCities } = useWeather();
  const { detectLocation }            = useLocation();

  const [query,       setQuery]       = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history,     setHistory]     = useState(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      return h ? JSON.parse(h) : [];
    } catch { return []; }
  });
  const [showDrop,    setShowDrop]    = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [locLoading,  setLocLoading]  = useState(false);
  const [searchError, setSearchError] = useState("");

  const timerRef    = useRef(null);
  const inputRef    = useRef(null);
  const blurRef     = useRef(null);
  const requestIdRef = useRef(0); // prevents stale suggestion races

  const saveHistory = useCallback((city) => {
    try {
      const clean   = city.trim();
      const updated = [clean,
        ...history.filter((h) =>
          h.toLowerCase() !== clean.toLowerCase())
      ].slice(0, MAX_HISTORY);
      setHistory(updated);
      localStorage.setItem(
        HISTORY_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [history]);

  // Fully close the dropdown + cancel any pending suggestion fetch
  const closeDropdown = useCallback(() => {
    requestIdRef.current += 1; // invalidate in-flight requests
    clearTimeout(timerRef.current);
    clearTimeout(blurRef.current);
    setShowDrop(false);
    setFocused(false);
    setSuggestions([]);
  }, []);

  // Debounced autocomplete with race-condition protection
  useEffect(() => {
    clearTimeout(timerRef.current);
    setSearchError("");

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    const myId = ++requestIdRef.current;

    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(query.trim());
        // Ignore stale/out-of-order responses
        if (myId !== requestIdRef.current) return;

        if (Array.isArray(results) && results.length) {
          // De-duplicate identical name+country pairs
          const seen = new Set();
          const clean = results.filter((r) => {
            const key = `${r.name}-${r.country}-${r.state || ""}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setSuggestions(clean);
          setShowDrop(true);
        } else {
          setSuggestions([]);
          setShowDrop(false);
        }
      } catch {
        if (myId === requestIdRef.current) setSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || loading) return;

    setSearchError("");
    closeDropdown();          //  close immediately on submit
    inputRef.current?.blur(); //  remove focus so it can't reopen

    try {
      await fetchByCity(q);
      saveHistory(q);
    } catch {
      setSearchError(`"${q}" not found. Try another city.`);
    }
  };

  const handleSuggestion = (s) => {
    const cityName = s.state
      ? `${s.name}, ${s.state}`
      : s.name;
    setQuery(s.name);
    closeDropdown();
    fetchByCity(s.name);
    saveHistory(s.name);
    inputRef.current?.blur();
  };

  const handleHistory = (city) => {
    setQuery(city);
    closeDropdown();
    fetchByCity(city);
    inputRef.current?.blur();
  };

  const handleLocate = async () => {
    if (locLoading) return;
    setLocLoading(true);
    setSearchError("");
    closeDropdown();
    try {
      await detectLocation();
    } catch {
      setSearchError("Could not detect location.");
    } finally {
      setLocLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    closeDropdown();
    inputRef.current?.focus();
  };

  const showHistory = focused &&
    query.length === 0 &&
    history.length > 0;

  const showDropdown = (showDrop || showHistory) && focused;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="flex gap-2">

          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2
              -translate-y-1/2 text-lg pointer-events-none
              z-10">
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1,
                    repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : "🔍"}
            </span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                // Delay so click on a suggestion registers first
                blurRef.current = setTimeout(() => {
                  setFocused(false);
                  setShowDrop(false);
                }, 150);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  closeDropdown();
                  inputRef.current?.blur();
                }
                if (e.key === "Enter") {
                  // Prevent double-submit; form's onSubmit handles it
                  clearTimeout(blurRef.current);
                }
              }}
              placeholder="Search city, region or country..."
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
              className={`
                w-full pl-11 pr-10 py-3.5 rounded-2xl
                text-sm font-medium outline-none
                transition-all duration-200
                disabled:opacity-60
                ${isDark
                  ? "glass text-white placeholder-white/30 focus:border-blue-400/50"
                  : "glass-light text-slate-800 placeholder-slate-400"
                }
              `}
            />

            {query.length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep focus for click
                onClick={clearSearch}
                className={`
                  absolute right-3 top-1/2
                  -translate-y-1/2 w-5 h-5
                  rounded-full flex items-center
                  justify-center text-xs
                  transition-all
                  ${isDark
                    ? "text-white/30 hover:text-white/70 hover:bg-white/10"
                    : "text-slate-400 hover:text-slate-600 hover:bg-black/5"
                  }
                `}
              >
                ✕
              </button>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading || !query.trim()}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3.5 rounded-2xl
              bg-blue-500 hover:bg-blue-600
              active:bg-blue-700 text-white font-bold
              text-sm transition-all duration-200
              disabled:opacity-40
              disabled:cursor-not-allowed"
          >
            Search
          </motion.button>

          <motion.button
            type="button"
            onClick={handleLocate}
            disabled={loading || locLoading}
            whileTap={{ scale: 0.95 }}
            title="Detect my location"
            className={`
              px-4 py-3.5 rounded-2xl font-semibold
              text-base transition-all duration-200
              disabled:opacity-40
              ${isDark
                ? "glass text-white hover:bg-white/15"
                : "glass-light text-slate-700 hover:bg-white/80"
              }
            `}
          >
            {locLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1,
                  repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⌛
              </motion.span>
            ) : "📍"}
          </motion.button>
        </div>

        <AnimatePresence>
          {(searchError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 px-3 py-2 rounded-xl
                bg-red-500/15 border border-red-500/20
                text-red-400 text-xs flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>{searchError || error}</span>
              <button
                type="button"
                onClick={() => setSearchError("")}
                className="ml-auto opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-[calc(100%+8px)]
              left-0 right-12 z-[100]
              rounded-2xl overflow-hidden
              shadow-2xl border max-h-80 overflow-y-auto
              ${isDark
                ? "bg-[#1a1f35]/95 backdrop-blur-xl border-white/10"
                : "bg-white/95 backdrop-blur-xl border-slate-200"
              }
            `}
          >
            {showHistory && (
              <>
                <div className="px-4 pt-3 pb-1
                  flex items-center justify-between">
                  <p className={`text-xs font-semibold
                    ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    RECENT SEARCHES
                  </p>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setHistory([]);
                      localStorage.removeItem(HISTORY_KEY);
                    }}
                    className={`text-xs
                      ${isDark ? "text-white/20 hover:text-white/50" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Clear
                  </button>
                </div>
                {history.map((city, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleHistory(city);
                    }}
                    className={`
                      w-full text-left px-4 py-3
                      text-sm flex items-center gap-3
                      transition-all
                      ${isDark
                        ? "text-white/70 hover:bg-white/8"
                        : "text-slate-700 hover:bg-slate-50"
                      }
                      ${i < history.length - 1
                        ? isDark
                          ? "border-b border-white/5"
                          : "border-b border-slate-100"
                        : ""
                      }
                    `}
                  >
                    <span className={`text-xs
                      ${isDark ? "text-white/20" : "text-slate-300"}`}>
                      🕐
                    </span>
                    <span>{city}</span>
                  </button>
                ))}
              </>
            )}

            {suggestions.map((s, i) => (
              <button
                key={`${s.name}-${s.country}-${s.state || ""}-${i}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestion(s);
                }}
                className={`
                  w-full text-left px-4 py-3 text-sm
                  flex items-center justify-between gap-3
                  transition-all
                  ${isDark
                    ? "text-white hover:bg-white/8"
                    : "text-slate-800 hover:bg-slate-50"
                  }
                  ${i < suggestions.length - 1
                    ? isDark
                      ? "border-b border-white/5"
                      : "border-b border-slate-100"
                    : ""
                  }
                `}
              >
                <div className="flex items-center gap-3
                  min-w-0">
                  <span className="text-blue-400
                    flex-shrink-0">📍</span>
                  <div className="min-w-0">
                    <span className="font-semibold
                      truncate block">
                      {s.name}
                    </span>
                    {s.state && (
                      <span className={`text-xs block
                        ${isDark ? "text-white/40" : "text-slate-400"}`}>
                        {s.state}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`
                  text-xs flex-shrink-0 px-2 py-0.5
                  rounded-lg font-medium
                  ${isDark
                    ? "bg-white/8 text-white/40"
                    : "bg-slate-100 text-slate-400"
                  }
                `}>
                  {s.country}
                </span>
              </button>
            ))}

            {showDrop &&
             suggestions.length === 0 &&
             query.length >= 2 && (
              <div className={`px-4 py-4 text-sm text-center
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                No cities found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;