// ─────────────────────────────────────────────
//  Globe3D — Immersive live weather globe
//  Layers + Fullscreen + Auto-rotate + Double-click search
//  Real stitched + reprojected tiles via backend proxy
//  City label rendered as WebGL sprite (no DOM overflow bugs)
// ─────────────────────────────────────────────

import {
  Suspense, useRef, useState,
  useEffect, useCallback, useMemo
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls }              from "@react-three/drei";
import { motion, AnimatePresence }    from "framer-motion";
import * as THREE                     from "three";
import { useWeatherContext }          from "../context/WeatherContext";
import { useWeather }                 from "../hooks/useWeather";
import { buildOverlayTexture }        from "../utils/globeWeatherTexture";

// ── Weather layers (same family as the 2D map) ──
const LAYERS = [
  {
    id: "precipitation", label: "🌧️ Rain & Snow", tile: "precipitation_new",
    legend: [
      { color: "#7de29a", label: "Light"    },
      { color: "#3ca0f0", label: "Moderate" },
      { color: "#1c4fd6", label: "Heavy"    },
    ],
  },
  {
    id: "wind", label: "💨 Wind Speed", tile: "wind_new",
    legend: [
      { color: "#c8e6c9", label: "Calm"   },
      { color: "#66bb6a", label: "Breezy" },
      { color: "#ef6c00", label: "Strong" },
      { color: "#b71c1c", label: "Storm"  },
    ],
  },
  {
    id: "temp", label: "🌡️ Temperature", tile: "temp_new",
    legend: [
      { color: "#2166ac", label: "Cold" },
      { color: "#67c2a3", label: "Mild" },
      { color: "#fdae61", label: "Warm" },
      { color: "#d73027", label: "Hot"  },
    ],
  },
  {
    id: "clouds", label: "☁️ Cloud Cover", tile: "clouds_new",
    legend: [
      { color: "#e0e0e0", label: "Clear"    },
      { color: "#9e9e9e", label: "Partly"   },
      { color: "#616161", label: "Overcast" },
    ],
  },
];

// ── Convert lat/lon to 3D vector ──────────────
const latLonToVec3 = (lat, lon, r = 2.05) => {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
};

// ── Draw a small rounded-rect city label onto a canvas texture ──
// Rendered as an in-scene WebGL sprite instead of a DOM <Html>
// element, so it can never overflow/clip/blur like a portal-based
// DOM overlay can.
const createLabelTexture = (text) => {
  const canvas   = document.createElement("canvas");
  const ctx      = canvas.getContext("2d");
  const fontSize = 40;
  const paddingX = 28;
  const paddingY = 18;

  ctx.font = `700 ${fontSize}px -apple-system, sans-serif`;
  const label     = `📍 ${text}`;
  const textWidth = ctx.measureText(label).width;

  canvas.width  = Math.ceil(textWidth + paddingX * 2);
  canvas.height = Math.ceil(fontSize + paddingY * 2);

  // Re-apply font after resize (canvas reset clears context state)
  ctx.font = `700 ${fontSize}px -apple-system, sans-serif`;

  const w = canvas.width, h = canvas.height, r = 18;
  ctx.fillStyle = "rgba(239,68,68,0.92)";
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, aspect: w / h };
};

// ── Guaranteed-working procedural Earth texture (fallback) ──
const generateEarthCanvasTexture = () => {
  const canvas  = document.createElement("canvas");
  canvas.width  = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0,   "#0a3d6b");
  grad.addColorStop(0.5, "#0d4d8c");
  grad.addColorStop(1,   "#0a3d6b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = "#2d6a3e";
  const blobs = [
    [150,120,70],[190,140,55],[160,170,60],[210,110,40],
    [230,260,45],[245,300,35],[225,330,30],
    [480,120,50],[500,160,45],[490,220,55],[510,280,45],[495,330,35],
    [650,100,80],[720,130,70],[780,110,50],[700,170,60],[650,200,45],
    [820,320,45],
    [400,480,900],
  ];
  blobs.forEach(([x, y, r]) => {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      const jitter = r * (0.7 + Math.random() * 0.5);
      const px = x + Math.cos(a) * jitter;
      const py = y + Math.sin(a) * jitter * 0.6;
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#e8f4f8";
  ctx.fillRect(0, 0, 1024, 25);
  ctx.fillRect(0, 487, 1024, 25);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// ── Starfield ──────────────────────────────────
const Stars = () => {
  const ref = useRef();
  const geo = useMemo(() => {
    const g   = new THREE.BufferGeometry();
    const pos = new Float32Array(
      Array.from({ length: 1200 * 3 },
        () => (Math.random() - 0.5) * 100)
    );
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0001; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.1} transparent
        opacity={0.6} sizeAttenuation />
    </points>
  );
};

// ── Earth mesh with live weather overlay ──────
const Earth = ({
  onDoubleClickGlobe, marker, cityName, activeLayer,
  autoRotate, onLoadingChange
}) => {
  const meshRef    = useRef();
  const cloudRef   = useRef();
  const overlayRef = useRef();

  const fallbackTexture = useMemo(() => generateEarthCanvasTexture(), []);
  const [map,     setMap]     = useState(fallbackTexture);
  const [clouds,  setClouds]  = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [overlayLoading, setOverlayLoading] = useState(false);

  // Load base Earth texture (best-effort upgrade, reliable CDN)
  useEffect(() => {
    let cancelled = false;
    const loader  = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    loader.load(
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
      (tex) => {
        if (!cancelled) {
          tex.colorSpace = THREE.SRGBColorSpace;
          setMap(tex);
        }
      },
      undefined,
      () => {}
    );

    loader.load(
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-clouds.png",
      (tex) => { if (!cancelled) setClouds(tex); },
      undefined,
      () => {}
    );

    return () => { cancelled = true; };
  }, []);

  // Build the live weather overlay by stitching + reprojecting
  // real Mercator tiles (fetched via our CORS-safe backend proxy)
  // into a correct equirectangular texture
  useEffect(() => {
    if (!activeLayer) {
      setOverlay(null);
      return;
    }
    let cancelled = false;
    setOverlayLoading(true);

    buildOverlayTexture(activeLayer.tile, 2) // zoom 2 = 4x4 tiles
      .then((tex) => {
        if (!cancelled) {
          setOverlay(tex);
          setOverlayLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOverlay(null);
          setOverlayLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeLayer]);

  // Report loading state up to parent for the spinner indicator
  useEffect(() => {
    onLoadingChange?.(overlayLoading);
  }, [overlayLoading, onLoadingChange]);

  useFrame((_, delta) => {
    if (autoRotate) {
      if (meshRef.current)    meshRef.current.rotation.y    += delta * 0.05;
      if (cloudRef.current)   cloudRef.current.rotation.y   += delta * 0.07;
      if (overlayRef.current) overlayRef.current.rotation.y += delta * 0.05;
    }
  });

  // Double-click (not single click) triggers a location search,
  // so single-click-drag remains purely for rotating the globe
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    const n   = e.point.clone().normalize();
    const lat = 90 - (Math.acos(
      THREE.MathUtils.clamp(n.y, -1, 1)) * 180) / Math.PI;
    const lon = ((270 + (Math.atan2(n.x, n.z) * 180)
      / Math.PI) % 360) - 180;
    onDoubleClickGlobe(lat, lon);
  }, [onDoubleClickGlobe]);

  const markerPos = marker
    ? latLonToVec3(marker.lat, marker.lon)
    : null;

  // WebGL sprite label — replaces the buggy DOM-based <Html> tooltip
  const labelData = useMemo(() => {
    if (!cityName) return null;
    return createLabelTexture(cityName);
  }, [cityName]);

  return (
    <group>
      {/* Earth surface */}
      <mesh ref={meshRef} onDoubleClick={handleDoubleClick}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={map}
          specular={new THREE.Color(0x222222)}
          shininess={8}
        />
      </mesh>

      {/* Static cloud texture (decorative, only when no live layer active) */}
      {clouds && !activeLayer && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[2.04, 48, 48]} />
          <meshPhongMaterial
            map={clouds} transparent opacity={0.3} depthWrite={false}
          />
        </mesh>
      )}

      {/* Live weather overlay layer — stitched + reprojected */}
      {overlay && (
        <mesh ref={overlayRef}>
          <sphereGeometry args={[2.045, 48, 48]} />
          <meshBasicMaterial
            map={overlay}
            transparent
            opacity={0.75}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#4db8ff" transparent
          opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.12, 32, 32]} />
        <meshBasicMaterial color="#1a6bcc" transparent
          opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Location pin + WebGL sprite label (no DOM overflow risk) */}
      {markerPos && labelData && (
        <group position={markerPos}>
          <mesh>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <sprite
            position={[0, 0.22, 0]}
            scale={[0.55 * labelData.aspect, 0.55, 1]}
          >
            <spriteMaterial
              map={labelData.texture}
              transparent
              depthTest={false}
            />
          </sprite>
        </group>
      )}
    </group>
  );
};

// ── Layer selector bar (shared normal/fullscreen) ──
const LayerBar = ({ isDark, activeLayer, setActiveLayer, autoRotate, setAutoRotate }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2">
    <button
      onClick={() => setActiveLayer(null)}
      className={`
        flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
        ${!activeLayer
          ? "bg-blue-500 text-white"
          : isDark ? "bg-white/8 text-white/50 hover:bg-white/15"
                   : "bg-black/5 text-slate-500 hover:bg-black/10"
        }
      `}
    >
      🌍 Clear View
    </button>
    {LAYERS.map((l) => (
      <button
        key={l.id}
        onClick={() => setActiveLayer(l)}
        className={`
          flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
          transition-all whitespace-nowrap
          ${activeLayer?.id === l.id
            ? "bg-blue-500 text-white"
            : isDark ? "bg-white/8 text-white/50 hover:bg-white/15"
                     : "bg-black/5 text-slate-500 hover:bg-black/10"
          }
        `}
      >
        {l.label}
      </button>
    ))}
    <button
      onClick={() => setAutoRotate((r) => !r)}
      title="Toggle auto-rotate"
      className={`
        flex-shrink-0 ml-auto px-3 py-1.5 rounded-xl text-xs font-medium
        transition-all
        ${autoRotate
          ? "bg-green-500/20 text-green-400"
          : isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-slate-400"
        }
      `}
    >
      {autoRotate ? "⏸ Pause Spin" : "▶ Auto Spin"}
    </button>
  </div>
);

const LayerLegend = ({ isDark, activeLayer }) => {
  if (!activeLayer) return null;
  return (
    <div className="flex items-center gap-3 mb-2 flex-wrap">
      <span className={`text-xs font-medium
        ${isDark ? "text-white/40" : "text-slate-400"}`}>
        {activeLayer.label}:
      </span>
      {activeLayer.legend.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
          <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── The 3D scene (shared normal/fullscreen) ───
const GlobeScene = ({
  current, marker, activeLayer, autoRotate,
  onDoubleClickGlobe, hint, setHint, clicking, layerLoading
}) => (
  <>
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 42 }}
      gl={{
        antialias: true, alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => gl.setClearColor("#020811", 1)}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.4} color="#fff8e8" />
        <pointLight position={[-4, -2, -4]} intensity={0.2} color="#4db8ff" />
        <Stars />
        <Earth
          onDoubleClickGlobe={onDoubleClickGlobe}
          marker={marker}
          cityName={current?.city}
          activeLayer={activeLayer}
          autoRotate={autoRotate}
          onLoadingChange={layerLoading.setLayerLoading}
        />
        <OrbitControls
          enableZoom minDistance={2.8} maxDistance={9}
          autoRotate={false} enablePan={false}
          rotateSpeed={0.5} zoomSpeed={0.7}
          dampingFactor={0.08} enableDamping
        />
      </Suspense>
    </Canvas>

    {current && (
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm
        text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2
        pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"/>
        <span className="truncate max-w-[140px]">
          {current.city}, {current.country}
        </span>
      </div>
    )}

    <AnimatePresence>
      {layerLoading.isLoading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm
            text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2
            pointer-events-none"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🌐
          </motion.span>
          Stitching live tiles...
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {clicking && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            rounded-full border-2 border-blue-400 pointer-events-none"
          initial={{ width: 20, height: 20, opacity: 1 }}
          animate={{ width: 60, height: 60, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {hint && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setHint(false)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/50
            bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none
            whitespace-nowrap"
        >
          🖱️ Drag to rotate • Double-click to search a location
        </motion.div>
      )}
    </AnimatePresence>
  </>
);

// ── Main Component ────────────────────────────
const Globe3D = () => {
  const { current, isDark } = useWeatherContext();
  const { fetchByCoords }   = useWeather();
  const [hint,         setHint]         = useState(true);
  const [webglOk,      setWebglOk]      = useState(true);
  const [clicking,     setClicking]     = useState(false);
  const [activeLayer,  setActiveLayer]  = useState(null);
  const [autoRotate,   setAutoRotate]   = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglOk(false);
    } catch { setWebglOk(false); }
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => e.key === "Escape" && setIsFullscreen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const handleDoubleClick = useCallback((lat, lon) => {
    setHint(false);
    setClicking(true);
    fetchByCoords(lat, lon);
    setTimeout(() => setClicking(false), 800);
  }, [fetchByCoords]);

  const marker = current ? { lat: current.lat, lon: current.lon } : null;

  // Bundled loading state passed down to both scene instances
  const layerLoading = { isLoading, setLayerLoading: setIsLoading };

  if (!webglOk) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className={`${isDark ? "glass" : "glass-light"} p-5`}>
        <h3 className={`text-sm font-semibold mb-3
          ${isDark ? "text-white/70" : "text-slate-600"}`}>
          🌍 Weather Globe
        </h3>
        <div className={`rounded-2xl h-64 flex items-center justify-center
          ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <div className="text-center">
            <p className="text-4xl mb-3">🌍</p>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
              3D Globe requires WebGL
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* ── Normal inline card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`${isDark ? "glass" : "glass-light"} p-4`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-slate-600"}`}>
            🌍 Live Weather Globe
          </h3>
          <button
            onClick={() => setIsFullscreen(true)}
            title="Maximize"
            className={`
              p-2 rounded-xl text-sm transition-all
              ${isDark ? "bg-white/8 hover:bg-white/15 text-white/70"
                       : "bg-black/5 hover:bg-black/10 text-slate-600"}
            `}
          >
            ⛶
          </button>
        </div>

        <LayerBar
          isDark={isDark} activeLayer={activeLayer} setActiveLayer={setActiveLayer}
          autoRotate={autoRotate} setAutoRotate={setAutoRotate}
        />
        <LayerLegend isDark={isDark} activeLayer={activeLayer} />

        <div className="rounded-2xl overflow-hidden relative"
          style={{ height: "300px", background: "radial-gradient(ellipse at center, #0d1b2a 0%, #020811 100%)" }}>
          <GlobeScene
            current={current} marker={marker}
            activeLayer={activeLayer} autoRotate={autoRotate}
            onDoubleClickGlobe={handleDoubleClick}
            hint={hint} setHint={setHint} clicking={clicking}
            layerLoading={layerLoading}
          />
        </div>

        <div className="flex gap-4 mt-3">
          {[
            { icon: "🖱️", text: "Drag to rotate"  },
            { icon: "🔍", text: "Scroll to zoom"  },
            { icon: "👆👆", text: "Double-click for weather" },
          ].map((h) => (
            <div key={h.text} className="flex items-center gap-1">
              <span className="text-sm">{h.icon}</span>
              <span className={`text-xs ${isDark ? "text-white/25" : "text-slate-300"}`}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Fullscreen immersive mode ── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col"
            style={{ background: "#020811" }}
          >
            {/* Header */}
            <div className={`
              flex items-center justify-between px-5 py-4
              ${isDark ? "bg-[#1a1f35]" : "bg-white"}
              border-b ${isDark ? "border-white/10" : "border-slate-200"}
            `}>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                🌍 Live Weather Globe
                {current && (
                  <span className={`ml-2 text-sm font-normal
                    ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    — {current.city}, {current.country}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsFullscreen(false)}
                title="Minimize (Esc)"
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${isDark ? "bg-white/10 hover:bg-white/20 text-white"
                           : "bg-slate-100 hover:bg-slate-200 text-slate-700"}
                `}
              >
                ✕ Close
              </button>
            </div>

            {/* Layer bar */}
            <div className={`
              px-5 py-3
              ${isDark ? "bg-[#1a1f35]" : "bg-white"}
              border-b ${isDark ? "border-white/10" : "border-slate-200"}
            `}>
              <LayerBar
                isDark={isDark} activeLayer={activeLayer} setActiveLayer={setActiveLayer}
                autoRotate={autoRotate} setAutoRotate={setAutoRotate}
              />
              <LayerLegend isDark={isDark} activeLayer={activeLayer} />
            </div>

            {/* Fullscreen globe */}
            <div className="flex-1 relative">
              <GlobeScene
                current={current} marker={marker}
                activeLayer={activeLayer} autoRotate={autoRotate}
                onDoubleClickGlobe={handleDoubleClick}
                hint={hint} setHint={setHint} clicking={clicking}
                layerLoading={layerLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Globe3D;