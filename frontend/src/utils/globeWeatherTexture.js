// ─────────────────────────────────────────────
//  globeWeatherTexture — Builds a true equirectangular
//  weather texture by stitching + reprojecting real
//  Web Mercator OpenWeatherMap tiles for sphere mapping
//  Tiles are fetched via our backend proxy to avoid CORS
// ─────────────────────────────────────────────

import * as THREE from "three";

const TILE_PROXY_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/weather/tile-proxy`;
const TILE_SIZE = 256;

// Cache built textures per layer so switching back is instant
const textureCache = new Map();

const loadTileImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null); // blank tile is fine (e.g. poles)
    img.src = url;
  });

// Web Mercator lat -> vertical fraction [0,1] within the
// standard XYZ tile pyramid range (±85.0511 degrees)
const latToMercatorFraction = (latDeg) => {
  const clampedLat = Math.max(-85.05, Math.min(85.05, latDeg));
  const latRad = (clampedLat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / Math.PI) / 2;
};

/**
 * Builds an equirectangular weather texture for a given
 * OpenWeatherMap tile layer (precipitation_new, wind_new, etc.)
 *
 * zoom: tile zoom level to stitch. 2 = 4x4 tiles (fast, good default),
 *       3 = 8x8 tiles (sharper, slower to load)
 */
export const buildOverlayTexture = async (tileType, zoom = 2) => {
  const cacheKey = `${tileType}-${zoom}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const n = Math.pow(2, zoom);
  const stitchedSize = TILE_SIZE * n;

  // ── Step 1: Fetch and stitch all Mercator tiles via proxy ──
  const stitched = document.createElement("canvas");
  stitched.width  = stitchedSize;
  stitched.height = stitchedSize;
  const sctx = stitched.getContext("2d");

  const tilePromises = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const url = `${TILE_PROXY_BASE}/${tileType}/${zoom}/${x}/${y}.png`;
      tilePromises.push(
        loadTileImage(url).then((img) => {
          if (img) sctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        })
      );
    }
  }
  await Promise.all(tilePromises);

  // ── Step 2: Reproject Mercator -> Equirectangular ──
  // Output width matches stitched width (no horizontal resample
  // needed — longitude is already linear in both projections)
  const equiWidth  = stitchedSize;
  const equiHeight = Math.round(stitchedSize / 2); // 2:1 world map aspect

  const equi = document.createElement("canvas");
  equi.width  = equiWidth;
  equi.height = equiHeight;
  const ectx = equi.getContext("2d");

  for (let row = 0; row < equiHeight; row++) {
    // Latitude for this equirectangular row, +90 at top to -90 at bottom
    const lat = 90 - (row / (equiHeight - 1)) * 180;
    const mercFraction = latToMercatorFraction(lat);
    const srcRow = Math.min(
      stitchedSize - 1,
      Math.max(0, Math.round(mercFraction * (stitchedSize - 1)))
    );

    // Copy the corresponding 1px-tall strip from the Mercator
    // stitched canvas — browser-accelerated, very fast
    ectx.drawImage(
      stitched,
      0, srcRow, stitchedSize, 1,   // source strip
      0, row, equiWidth, 1          // destination strip
    );
  }

  const texture = new THREE.CanvasTexture(equi);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, texture);
  return texture;
};

export const clearTextureCache = () => textureCache.clear();