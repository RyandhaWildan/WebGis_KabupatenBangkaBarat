import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { center, bangkaBaratBoundary, layerAssets, samples2024, samples2025 } from '../data/geodata';
import { useMapLayers } from '../hooks/useMapLayers';
import { LayerControl } from './LayerControl';
type GeoJsonObject = any;

// Fix Leaflet marker icons issue in React/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom markers for points
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const vegIcon = createCustomIcon('#22c55e'); // Green
const nonVegIcon = createCustomIcon('#ef4444'); // Red
const boundaryCoords = bangkaBaratBoundary.features[0].geometry.coordinates[0];
// Mutable reference — updated with precise GeoJSON coords after async fetch
let activeBoundaryCoords: number[][] = boundaryCoords;

// ─── Offline canvas-based dark basemap ────────────────────────────────────
// Generates a single 256×256 dark canvas tile as a data URL, then
// serves it for every tile via a getTileUrl override.
// Zero network requests, zero CORS / CSP concerns, works fully offline.
function makeOfflineTileUrl(bg: string = '#0d1628'): string {
  const SIZE = 256;
  const c = document.createElement('canvas');
  c.width = SIZE; c.height = SIZE;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Subtle dot-grid for visual depth
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  const gap = 32;
  for (let x = gap; x < SIZE; x += gap)
    for (let y = gap; y < SIZE; y += gap) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  return c.toDataURL('image/png');
}

// Subclass L.TileLayer to override getTileUrl so coords are never appended.
const StaticTileLayer = L.TileLayer.extend({
  getTileUrl(): string {
    return (this as any)._url as string;
  },
});

// Cache the generated tile data URLs to avoid recreating them
let darkTileUrlCache = '';
let satelliteTileUrlCache = '';

function createOfflineBasemap(type: 'dark' | 'satellite'): L.TileLayer {
  let url = '';
  if (type === 'dark') {
    if (!darkTileUrlCache) darkTileUrlCache = makeOfflineTileUrl('#0d1628');
    url = darkTileUrlCache;
  } else {
    if (!satelliteTileUrlCache) satelliteTileUrlCache = makeOfflineTileUrl('#0a1c28');
    url = satelliteTileUrlCache;
  }

  return new (StaticTileLayer as any)(url, {
    tileSize: 256,
    attribution: '',
    opacity: 1,
  });
}
const sampleNodes: { lat: number; lng: number; v1: number; v2: number }[] = [];
function initSampleNodes() {
  let seed = 42;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  for (let i = 0; i < 45; i++) {
    sampleNodes.push({
      lat: -2.05 + (random() * 0.45),
      lng: 105.12 + (random() * 0.72),
      v1: random(), // data 2024
      v2: random()  // data 2025
    });
  }
}

// Initialize sampleNodes on module load if inside browser environment
if (typeof window !== 'undefined' && sampleNodes.length === 0) {
  initSampleNodes();
}

function getGeoNoise(lat: number, lng: number): number {
  const x = lng * 180.0;
  const y = lat * 220.0;

  const n1 = Math.sin(x * 0.123 + y * 0.456) * 43758.5453;
  const n2 = Math.cos(x * 0.789 - y * 0.211) * 23412.1241;

  const f1 = n1 - Math.floor(n1);
  const f2 = n2 - Math.floor(n2);

  return (f1 + f2) / 2;
}

// Custom Leaflet Layer for Micro-Pixel Raster Engine (Clipped to Boundary)
const PixelRasterLayer = (L.Layer as any).extend({
  initialize: function (options: any) {
    L.setOptions(this, options);
  },
  onAdd: function (map: L.Map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-layer') as HTMLCanvasElement;
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.opacity = String(this.options.opacity || 0.8);

    map.getPanes().overlayPane.appendChild(this._canvas);
    map.on('moveend', this._render, this);
    this._render();
  },
  onRemove: function (map: L.Map) {
    if (this._canvas && this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
    map.off('moveend', this._render, this);
  },
  setOpacity: function (opacity: number) {
    this.options.opacity = opacity;
    if (this._canvas) {
      this._canvas.style.opacity = String(opacity);
    }
  },
  _render: function () {
    if (!this._map || !this._canvas) return;

    const size = this._map.getSize();
    if (size.x === 0 || size.y === 0) return;
    this._canvas.width = size.x;
    this._canvas.height = size.y;

    const ctx = this._canvas.getContext('2d');
    if (!ctx) return;

    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    // --- STEP 1: PARAMETERS & BOUNDS ---
    const layerType = this.options.layerType;
    const zoom = this._map.getZoom();
    const pixelStep = zoom >= 13 ? 4 : (zoom >= 11 ? 3 : 2);

    const bounds = this._map.getBounds();
    const swPt = this._map.latLngToContainerPoint(bounds.getSouthWest());
    const nePt = this._map.latLngToContainerPoint(bounds.getNorthEast());

    const startX = Math.max(0, Math.floor(swPt.x));
    const endX = Math.min(size.x, Math.ceil(nePt.x));
    const startY = Math.max(0, Math.floor(nePt.y));
    const endY = Math.min(size.y, Math.ceil(swPt.y));

    // Precalculate lat for Y rows and lng for X columns (reduces 1.9M Leaflet projection calls to ~3k)
    const lats = new Float64Array(size.y);
    for (let y = startY; y < endY; y += pixelStep) {
      lats[y] = this._map.containerPointToLatLng([0, y]).lat;
    }
    const lngs = new Float64Array(size.x);
    for (let x = startX; x < endX; x += pixelStep) {
      lngs[x] = this._map.containerPointToLatLng([x, 0]).lng;
    }

    // --- STEP 2: HIGH-SPEED IMAGEDATA BUFFER ---
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size.x;
    offCanvas.height = size.y;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const imgData = offCtx.createImageData(size.x, size.y);
    const data = imgData.data;

    for (let x = startX; x < endX; x += pixelStep) {
      const lng = lngs[x];
      for (let y = startY; y < endY; y += pixelStep) {
        const lat = lats[y];

        let noiseValue = getGeoNoise(lat, lng);

        const dMuntok = Math.sqrt((lat - (-2.06)) * (lat - (-2.06)) + (lng - 105.17) * (lng - 105.17));
        if (dMuntok < 0.15) {
          noiseValue -= (0.15 - dMuntok) * 2.2;
        }

        const dJebus = Math.sqrt((lat - (-1.74)) * (lat - (-1.74)) + (lng - 105.42) * (lng - 105.42));
        if (dJebus < 0.12) {
          noiseValue -= (0.12 - dJebus) * 2.8;
        }

        let draw = false;
        let r = 0, g = 0, b = 0, a = 230;

        if (layerType === 'rgb2024') {
          draw = true;
          if (noiseValue > 0.42)      { r = 4;   g = 120; b = 87;  a = 230; }
          else if (noiseValue > 0.28) { r = 180; g = 130; b = 90;  a = 230; }
          else                        { r = 10;  g = 50;  b = 90;  a = 230; }
        } else if (layerType === 'rgb2025') {
          draw = true;
          if (noiseValue > 0.47)      { r = 52;  g = 211; b = 153; a = 242; }
          else if (noiseValue > 0.25) { r = 180; g = 130; b = 90;  a = 230; }
          else                        { r = 10;  g = 50;  b = 90;  a = 230; }
        } else if (layerType === 'ndvi2024') {
          if (noiseValue > 0.15) {
            draw = true;
            if (noiseValue > 0.55)      { r = 20;  g = 83;  b = 45;  a = 230; }
            else if (noiseValue > 0.40) { r = 34;  g = 197; b = 94;  a = 230; }
            else if (noiseValue > 0.28) { r = 134; g = 239; b = 172; a = 230; }
            else                        { r = 254; g = 240; b = 138; a = 230; }
          }
        } else if (layerType === 'ndvi2025') {
          if (noiseValue > 0.15) {
            draw = true;
            if (noiseValue > 0.58)      { r = 20;  g = 83;  b = 45;  a = 230; }
            else if (noiseValue > 0.44) { r = 34;  g = 197; b = 94;  a = 230; }
            else if (noiseValue > 0.32) { r = 134; g = 239; b = 172; a = 230; }
            else                        { r = 254; g = 240; b = 138; a = 230; }
          }
        } else if (layerType === 'ndmi2024') {
          if (noiseValue > 0.10) {
            draw = true;
            if (noiseValue > 0.52)      { r = 3;   g = 105; b = 161; a = 200; }
            else if (noiseValue > 0.35) { r = 2;   g = 132; b = 199; a = 200; }
            else if (noiseValue > 0.22) { r = 56;  g = 189; b = 248; a = 200; }
            else                        { r = 186; g = 230; b = 253; a = 200; }
          }
        } else if (layerType === 'ndmi2025') {
          if (noiseValue > 0.10) {
            draw = true;
            if (noiseValue > 0.55)      { r = 3;   g = 105; b = 161; a = 200; }
            else if (noiseValue > 0.38) { r = 2;   g = 132; b = 199; a = 200; }
            else if (noiseValue > 0.25) { r = 56;  g = 189; b = 248; a = 200; }
            else                        { r = 186; g = 230; b = 253; a = 200; }
          }
        } else if (layerType === 'class2024') {
          draw = true;
          if (noiseValue >= 0.42) { r = 34;  g = 197; b = 94;  a = 230; }
          else                    { r = 239; g = 68;  b = 68;  a = 230; }
        } else if (layerType === 'class2025') {
          draw = true;
          if (noiseValue >= 0.47) { r = 34;  g = 197; b = 94;  a = 230; }
          else                    { r = 239; g = 68;  b = 68;  a = 230; }
        } else if (layerType === 'rf2024') {
          draw = true;
          if (noiseValue > 0.44) { r = 22;  g = 163; b = 74;  a = 230; }
          else                   { r = 220; g = 38;  b = 38;  a = 230; }
        } else if (layerType === 'rf2025') {
          draw = true;
          if (noiseValue > 0.49) { r = 22;  g = 163; b = 74;  a = 230; }
          else                   { r = 220; g = 38;  b = 38;  a = 230; }
        } else if (layerType === 'changeDetection') {
          draw = true;
          const isVeg24 = noiseValue > 0.42;
          const isVeg25 = noiseValue > 0.47;
          if (isVeg24 && isVeg25)       { r = 22;  g = 163; b = 74;  a = 230; } // Tetap Veg (Hijau)
          else if (!isVeg24 && !isVeg25){ r = 220; g = 38;  b = 38;  a = 230; } // Tetap Non-Veg (Merah)
          else if (isVeg24 && !isVeg25) { r = 234; g = 179; b = 8;   a = 230; } // Loss Veg (Kuning)
          else                          { r = 37;  g = 99;  b = 235; a = 230; } // Gain Veg (Biru)
        }

        if (draw) {
          for (let dy = 0; dy < pixelStep && y + dy < size.y; dy++) {
            for (let dx = 0; dx < pixelStep && x + dx < size.x; dx++) {
              const idx = ((y + dy) * size.x + (x + dx)) * 4;
              data[idx]     = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // --- STEP 3: BOUNDARY CLIPPING & DRAW ---
    ctx.save();
    ctx.beginPath();
    const coords = activeBoundaryCoords;
    for (let i = 0; i < coords.length; i++) {
      const pt = this._map.latLngToContainerPoint([coords[i][1], coords[i][0]]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(offCanvas, 0, 0);
    ctx.restore();
  }
});

// ─── Ray-casting point-in-polygon ────────────────────────────────────────────
function pointInPolygon(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Generate N sample points strictly inside a polygon ring using a seeded RNG
function generateSamplesInBoundary(
  count: number, year: number, seedOffset: number, ring: number[][]
): { type: string; features: any[] } {
  const lngs = ring.map(c => c[0]);
  const lats = ring.map(c => c[1]);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);

  let seed = 42 + seedOffset;
  const rng = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

  const features: any[] = [];
  let attempts = 0;
  while (features.length < count && attempts < count * 200) {
    attempts++;
    const lng = minLng + rng() * (maxLng - minLng);
    const lat = minLat + rng() * (maxLat - minLat);
    if (pointInPolygon(lng, lat, ring)) {
      features.push({
        type: 'Feature',
        properties: { class: rng() > 0.4 ? 'Vegetasi' : 'Non-Vegetasi', year },
        geometry: { type: 'Point', coordinates: [lng, lat] }
      });
    }
  }
  return { type: 'FeatureCollection', features };
}

// Build a Leaflet GeoJSON layer from a sample FeatureCollection
function buildSampleLayer(featureCollection: any, yearOverride?: number): L.GeoJSON {
  return L.geoJSON(featureCollection, {
    pointToLayer: (feature, latlng) => {
      const cls = feature.properties.class;
      const isVeg = cls === 'Vegetasi' || cls === 1 || cls === '1';
      return L.marker(latlng, {
        icon: isVeg ? vegIcon : nonVegIcon
      });
    },
    onEachFeature: (feature, layer) => {
      const marker = layer as L.Marker;
      const props = feature.properties || {};
      const cls = props.class;
      const classLabel = (cls === 'Vegetasi' || cls === 1 || cls === '1') ? 'Vegetasi (1)' : 'Non-Vegetasi (0)';
      const year = props.year || yearOverride || '2024/2025';
      const ndvi = props.NDVI !== undefined ? Number(props.NDVI).toFixed(4) : '-';
      const ndmi = props.NDMI !== undefined ? Number(props.NDMI).toFixed(4) : '-';
      const b2 = props.B2 !== undefined ? Number(props.B2).toFixed(4) : '-';
      const b3 = props.B3 !== undefined ? Number(props.B3).toFixed(4) : '-';
      const b4 = props.B4 !== undefined ? Number(props.B4).toFixed(4) : '-';
      const b8 = props.B8 !== undefined ? Number(props.B8).toFixed(4) : '-';
      const b11 = props.B11 !== undefined ? Number(props.B11).toFixed(4) : '-';
      const b12 = props.B12 !== undefined ? Number(props.B12).toFixed(4) : '-';

      layer.bindPopup(`
        <div style="font-family:sans-serif;min-width:210px;background:#0d1628;color:#e2e8f0;border-radius:10px;padding:12px;">
          <div style="font-size:13px;font-weight:800;color:#38bdf8;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            📍 Training Sample Bangka Barat (${year})
          </div>
          <table style="width:100%;font-size:11px;border-collapse:collapse;">
            <tr><td style="color:#64748b;padding:2px 0;">Kelas Target</td><td style="font-weight:700;color:#34d399;">${classLabel}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">NDVI</td><td style="font-family:monospace;font-weight:700;color:#86efac;">${ndvi}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">NDMI</td><td style="font-family:monospace;font-weight:700;color:#38bdf8;">${ndmi}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">B2 (Blue) / B3 (Green)</td><td style="font-family:monospace;">${b2} / ${b3}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">B4 (Red) / B8 (NIR)</td><td style="font-family:monospace;">${b4} / ${b8}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">B11 / B12 (SWIR)</td><td style="font-family:monospace;">${b11} / ${b12}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">Koordinat</td><td style="font-family:monospace;color:#94a3b8;">${marker.getLatLng().lat.toFixed(5)}, ${marker.getLatLng().lng.toFixed(5)}</td></tr>
          </table>
        </div>`, { maxWidth: 260, className: 'custom-popup' });
    }
  });
}

export interface MapContainerHandle {
  invalidateSize: () => void;
}

interface MapContainerProps {
  layersState: ReturnType<typeof useMapLayers>;
  basemap?: 'dark' | 'satellite';
  setBasemap?: (bm: 'dark' | 'satellite') => void;
}

export const MapContainer = forwardRef(function MapContainer(
  { layersState, basemap = 'dark', setBasemap }: MapContainerProps,
  ref: React.ForwardedRef<MapContainerHandle>
) {
  const { layers, splitMode, splitPosition, setSplitPosition } = layersState;

  // States for Layer Control & GeoServer Configuration
  const [activeYear, setActiveYear] = useState<'2024' | '2025' | 'both'>('both');
  const [rasterSource, setRasterSource] = useState<'preview' | 'geoserver'>('preview');
  const [geoserverUrl, setGeoserverUrl] = useState<string>('http://localhost:8080/geoserver/wms');

  // Real boundary GeoJSON fetched from public/
  const [batasGeoJson, setBatasGeoJson] = useState<GeoJsonObject | null>(null);
  const batasLayerRef = useRef<L.GeoJSON | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const splitMapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapInstanceRef = useRef<L.Map | null>(null);
  const splitMapInstanceRef = useRef<L.Map | null>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const darkMapRef = useRef<L.TileLayer | null>(null);
  const satelliteMapRef = useRef<L.TileLayer | null>(null);
  const splitDarkMapRef = useRef<L.TileLayer | null>(null);
  const splitSatelliteMapRef = useRef<L.TileLayer | null>(null);

  // Layer refs
  const layerRefs = useRef<{ [key: string]: L.Layer | L.LayerGroup }>({});
  const splitLayerRefs = useRef<{ [key: string]: L.Layer | L.LayerGroup }>({});

  // Expose invalidateSize to parent
  useImperativeHandle(ref, () => ({
    invalidateSize: () => {
      mapInstanceRef.current?.invalidateSize();
      splitMapInstanceRef.current?.invalidateSize();
    },
  }));

  // Auto-invalidate on ANY container resize (window zoom, sidebar toggle, panel resize)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const invalidate = () => {
      mapInstanceRef.current?.invalidateSize({ animate: false });
      splitMapInstanceRef.current?.invalidateSize({ animate: false });
    };

    // ResizeObserver fires on element size changes (most reliable)
    const ro = new ResizeObserver(() => { invalidate(); });
    ro.observe(el);

    // Fallback: window resize (covers browser zoom)
    window.addEventListener('resize', invalidate);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', invalidate);
    };
  }, []);

  const [coords, setCoords] = useState<{ lat: string, lng: string } | null>(null);

  // Fetch batas_bangkabarat.geojson and converted TrainingSample GeoJSON files from public/
  useEffect(() => {
    fetch('/batas_bangkabarat.geojson')
      .then(r => r.json())
      .then((data: GeoJsonObject) => setBatasGeoJson(data))
      .catch(err => console.warn('Gagal memuat batas_bangkabarat.geojson:', err));

    // Load converted 2024 training sample GeoJSON
    fetch('/data/TrainingSample_BangkaBarat_2024.geojson')
      .then(r => r.json())
      .then(data => {
        const map = mapInstanceRef.current;
        const newLayer = buildSampleLayer(data, 2024);
        if (layerRefs.current['samples2024'] && map && map.hasLayer(layerRefs.current['samples2024'])) {
          map.removeLayer(layerRefs.current['samples2024']);
          newLayer.addTo(map);
        }
        layerRefs.current['samples2024'] = newLayer;
      })
      .catch(err => console.warn('Loading 2024 GeoJSON sample fallback:', err));

    // Load converted 2025 training sample GeoJSON
    fetch('/data/TrainingSample_BangkaBarat_2025.geojson')
      .then(r => r.json())
      .then(data => {
        const map = mapInstanceRef.current;
        const newLayer = buildSampleLayer(data, 2025);
        if (layerRefs.current['samples2025'] && map && map.hasLayer(layerRefs.current['samples2025'])) {
          map.removeLayer(layerRefs.current['samples2025']);
          newLayer.addTo(map);
        }
        layerRefs.current['samples2025'] = newLayer;
      })
      .catch(err => console.warn('Loading 2025 GeoJSON sample fallback:', err));
  }, []);

  // Initial map setup
  useEffect(() => {
    console.log("MAP INITIALIZATION EFFECT RUNNING!", mapRef.current);
    if (!mapRef.current) {
      console.log("MAP REF IS NULL, ABORTING INITIALIZATION!");
      return;
    }

    // Main Map
    const map = L.map(mapRef.current, {
      center,
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;
    console.log("LEAFLET MAP INSTANCE CREATED SUCCESS!", map);

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    // Debug helper: expose map to window
    (window as any).leafletMap = map;

    // Basemaps — CartoDB Dark Matter tiles for premium dark-mode theme
    const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    });
    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    darkMapRef.current = darkMap;
    satelliteMapRef.current = satelliteMap;
    darkMap.addTo(map);

    // Initialize map layers
    // NOTE: 'boundary' layerRef is set later by the batasGeoJson effect (precise green outline)
    // The old rough orange dashed polygon has been removed.

    layerRefs.current['rgb2024'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'rgb2024', opacity: 0.6
    });
    layerRefs.current['rgb2025'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'rgb2025', opacity: 0.6
    });
    layerRefs.current['ndvi2024'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'ndvi2024', opacity: 0.7
    });
    layerRefs.current['ndvi2025'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'ndvi2025', opacity: 0.7
    });
    layerRefs.current['ndmi2024'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'ndmi2024', opacity: 0.6
    });
    layerRefs.current['ndmi2025'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'ndmi2025', opacity: 0.6
    });
    layerRefs.current['class2024'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'class2024', opacity: 0.7
    });
    layerRefs.current['class2025'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'class2025', opacity: 0.7
    });
    layerRefs.current['rf2024'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'rf2024', opacity: 0.7
    });
    layerRefs.current['rf2025'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'rf2025', opacity: 0.7
    });
    layerRefs.current['changeDetection'] = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'changeDetection', opacity: 0.75
    });

    // Sample points — initial rough placement (will be replaced by precise ones once
    // batas_bangkabarat.geojson loads; see batasGeoJson effect below)
    layerRefs.current['samples2024'] = buildSampleLayer(samples2024);
    layerRefs.current['samples2025'] = buildSampleLayer(samples2025);

    // Coordinate tracker
    map.on('mousemove', (e) => {
      setCoords({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) });
    });

    // NOTE: batasGeoJson layer is added via separate effect below

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add/update batas_bangkabarat.geojson layer whenever data arrives
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !batasGeoJson) return;

    // Remove old layer if exists
    if (batasLayerRef.current) {
      map.removeLayer(batasLayerRef.current);
    }

    const batasLayer = L.geoJSON(batasGeoJson, {
      style: {
        color: '#34d399',          // Emerald green border
        weight: 2.5,
        opacity: 0.95,
        fillColor: '#34d399',
        fillOpacity: 0.06,
        dashArray: undefined,
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties as Record<string, string>;
        const name2 = p?.NAME_2 || 'Bangka Barat';
        const type2 = p?.TYPE_2 || 'Kabupaten';
        const name1 = p?.NAME_1 || 'Bangka Belitung';
        const hasc = p?.HASC_2 || '-';
        const cc = p?.CC_2 || '-';

        // Hover tooltip
        layer.bindTooltip(
          `<div style="font-family:monospace;font-size:12px;font-weight:700;color:#34d399;background:#0d1628;border:1px solid rgba(52,211,153,0.4);padding:4px 10px;border-radius:8px;">
            📍 ${type2} ${name2}
          </div>`,
          { permanent: false, direction: 'top', opacity: 0.95, sticky: true }
        );

        // Click popup with rich info
        layer.bindPopup(
          `<div style="font-family:sans-serif;min-width:200px;background:#0d1628;color:#e2e8f0;border-radius:10px;padding:14px;">
            <div style="font-size:14px;font-weight:800;color:#34d399;margin-bottom:8px;">🗺️ Batas Administratif</div>
            <table style="width:100%;font-size:12px;border-collapse:collapse;">
              <tr><td style="color:#64748b;padding:3px 0;">Kabupaten</td><td style="font-weight:700;">${name2}</td></tr>
              <tr><td style="color:#64748b;padding:3px 0;">Provinsi</td><td>${name1}</td></tr>
              <tr><td style="color:#64748b;padding:3px 0;">Tipe</td><td>${type2}</td></tr>
              <tr><td style="color:#64748b;padding:3px 0;">Kode HASC</td><td style="font-family:monospace;">${hasc}</td></tr>
              <tr><td style="color:#64748b;padding:3px 0;">Kode BPS</td><td style="font-family:monospace;">${cc}</td></tr>
              <tr><td style="color:#64748b;padding:3px 0;">Sumber</td><td>GADM v4.1 – batas_bangkabarat.shp</td></tr>
            </table>
          </div>`,
          { maxWidth: 280, className: 'custom-popup' }
        );

        // Highlight on hover
        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({
            weight: 3.5,
            fillOpacity: 0.14,
            color: '#6ee7b7',
          });
        });
        layer.on('mouseout', () => {
          batasLayer.resetStyle(layer as L.Path);
        });
      }
    });

    batasLayer.addTo(map);
    batasLayerRef.current = batasLayer;

    // ── Assign precise layer as the sidebar-controlled 'boundary' entry ──────
    // This replaces the old rough orange polygon in layerRefs so the
    // "Batas Kabupaten" checkbox in the sidebar now controls this green layer.
    layerRefs.current['boundary'] = batasLayer;

    // ── Extract precise MultiPolygon ring coords for pixel raster clipping ───
    // GeoJSON from shapefile is a MultiPolygon; Ring[0][0] = main land body
    try {
      const gj = batasGeoJson as any;
      const geomType: string = gj?.features?.[0]?.geometry?.type;
      let preciseCoords: number[][] | null = null;

      if (geomType === 'MultiPolygon') {
        // MultiPolygon: coordinates[polygonIdx][ringIdx][pointIdx]
        // Pick the ring with the most points = main land mass
        const polys: number[][][][] = gj.features[0].geometry.coordinates;
        let maxLen = 0;
        polys.forEach((poly: number[][][]) => {
          if (poly[0].length > maxLen) {
            maxLen = poly[0].length;
            preciseCoords = poly[0]; // exterior ring of the largest polygon
          }
        });
      } else if (geomType === 'Polygon') {
        preciseCoords = gj.features[0].geometry.coordinates[0];
      }

      if (preciseCoords && preciseCoords.length > 3) {
        activeBoundaryCoords = preciseCoords;

        // Re-render every visible PixelRasterLayer with the new precise clipping
        Object.values(layerRefs.current).forEach(layer => {
          if (layer && typeof (layer as any)._render === 'function') {
            try { (layer as any)._render(); } catch (_) { }
          }
        });

        // ── Regenerate training sample points inside precise boundary ──────────
        // Uses ray-casting so every point is guaranteed within the actual
        // Bangka Barat polygon, not just the rectangular bounding box.
        const fc2024 = generateSamplesInBoundary(75, 2024, 0, preciseCoords);
        const fc2025 = generateSamplesInBoundary(75, 2025, 1000, preciseCoords);

        (['samples2024', 'samples2025'] as const).forEach((id, i) => {
          const fc = i === 0 ? fc2024 : fc2025;
          const old = layerRefs.current[id];
          const wasVisible = old && map.hasLayer(old);
          if (old && wasVisible) map.removeLayer(old);
          const newLayer = buildSampleLayer(fc);
          layerRefs.current[id] = newLayer;
          if (wasVisible) newLayer.addTo(map);
        });
      }
    } catch (e) {
      console.warn('Failed to extract precise boundary coords:', e);
    }

    // ── Fit map view to precise boundary extent ──────────────────────────────
    try {
      const layerBounds = batasLayer.getBounds();
      if (layerBounds.isValid()) {
        map.fitBounds(layerBounds, { padding: [40, 40], maxZoom: 11 });
      }
    } catch (_) { }

  }, [batasGeoJson]);

  // Sync split map setup
  useEffect(() => {
    if (!splitMode) {
      if (splitMapInstanceRef.current) {
        splitMapInstanceRef.current.remove();
        splitMapInstanceRef.current = null;
      }
      return;
    }

    if (!splitMapRef.current || !mapInstanceRef.current) return;

    // Create split map (right side map)
    const splitMap = L.map(splitMapRef.current, {
      center: mapInstanceRef.current.getCenter(),
      zoom: mapInstanceRef.current.getZoom(),
      zoomControl: false,
      attributionControl: false
    });
    splitMapInstanceRef.current = splitMap;

    // Basemaps for split map (Dark & Satellite)
    const splitDarkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    });
    const splitSatelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    splitDarkMapRef.current = splitDarkMap;
    splitSatelliteMapRef.current = splitSatelliteMap;

    if (basemap === 'satellite') {
      splitSatelliteMap.addTo(splitMap);
    } else {
      splitDarkMap.addTo(splitMap);
    }

    // Add RGB 2025 by default to the split map — styled with PixelRasterLayer
    const splitRgb2025 = new (PixelRasterLayer as any)({
      boundaryCoords, layerType: 'rgb2025', opacity: 0.6
    });
    splitRgb2025.addTo(splitMap);
    splitLayerRefs.current['rgb2025'] = splitRgb2025;

    // Map Sync logic
    const mainMap = mapInstanceRef.current;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    mainMap.on('move', () => {
      if (!isSyncingRight) {
        isSyncingLeft = true;
        try { splitMap.setView(mainMap.getCenter(), mainMap.getZoom(), { animate: false }); } catch (_) { }
        isSyncingLeft = false;
      }
    });

    splitMap.on('move', () => {
      if (!isSyncingLeft) {
        isSyncingRight = true;
        try { mainMap.setView(splitMap.getCenter(), splitMap.getZoom(), { animate: false }); } catch (_) { }
        isSyncingRight = false;
      }
    });

  }, [splitMode]);

  // Switch basemap when prop changes (for both main map and split map)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const splitMap = splitMapInstanceRef.current;

    // Update main map basemap
    if (map && darkMapRef.current && satelliteMapRef.current) {
      if (basemap === 'satellite') {
        if (map.hasLayer(darkMapRef.current)) map.removeLayer(darkMapRef.current);
        if (!map.hasLayer(satelliteMapRef.current)) satelliteMapRef.current.addTo(map);
      } else {
        if (map.hasLayer(satelliteMapRef.current)) map.removeLayer(satelliteMapRef.current);
        if (!map.hasLayer(darkMapRef.current)) darkMapRef.current.addTo(map);
      }
    }

    // Update split map basemap
    if (splitMap && splitDarkMapRef.current && splitSatelliteMapRef.current) {
      if (basemap === 'satellite') {
        if (splitMap.hasLayer(splitDarkMapRef.current)) splitMap.removeLayer(splitDarkMapRef.current);
        if (!splitMap.hasLayer(splitSatelliteMapRef.current)) splitSatelliteMapRef.current.addTo(splitMap);
      } else {
        if (splitMap.hasLayer(splitSatelliteMapRef.current)) splitMap.removeLayer(splitSatelliteMapRef.current);
        if (!splitMap.hasLayer(splitDarkMapRef.current)) splitDarkMapRef.current.addTo(splitMap);
      }
    }
  }, [basemap, splitMode]);

  // Update layers visibility and opacity
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (splitMode) {
      // In split mode, enforce specific layers regardless of state
      // Main map (left) -> RGB 2024
      // Split map (right) -> RGB 2025

      // Clear all layers from main map first except boundary
      Object.entries(layerRefs.current).forEach(([id, layer]) => {
        if (id !== 'boundary' && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });

      // Add RGB 2024 to main map
      if (!map.hasLayer(layerRefs.current['rgb2024'])) {
        layerRefs.current['rgb2024'].addTo(map);
      }

      // The split map is handled in its initialization, but we should make sure it has RGB 2025
      if (splitMapInstanceRef.current && !splitMapInstanceRef.current.hasLayer(splitLayerRefs.current['rgb2025'])) {
        splitLayerRefs.current['rgb2025'].addTo(splitMapInstanceRef.current);
      }

    } else {
      // Normal mode - respect layer state
      layers.forEach(layerState => {
        const layer = layerRefs.current[layerState.id];
        if (!layer) return;

        if (layerState.visible) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
          }

          // Set opacity / style for layers
          if ('setOpacity' in layer) {
            (layer as any).setOpacity(layerState.opacity / 100);
          } else if ('setStyle' in layer) {
            const isBoundary = layerState.id === 'boundary';
            (layer as L.GeoJSON).setStyle({
              opacity: layerState.opacity / 100,
              fillOpacity: isBoundary ? 0 : (layerState.opacity / 100) * 0.7
            });
          }
        } else {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        }
      });
    }
  }, [layers, splitMode]);

  // Split Dragging Logic
  useEffect(() => {
    if (!splitMode || !dividerRef.current || !containerRef.current) return;

    let isDragging = false;

    const onMouseDown = () => { isDragging = true; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSplitPosition(percentage);
    };

    dividerRef.current.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      if (dividerRef.current) {
        dividerRef.current.removeEventListener('mousedown', onMouseDown);
      }
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [splitMode, setSplitPosition]);

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      ref={containerRef}
    >
      {/* Main Map (Left in split mode) */}
      <div
        ref={mapRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          ...(splitMode ? { clipPath: `inset(0 ${100 - splitPosition}% 0 0)` } : {})
        }}
      />

      {/* Split Map (Right) */}
      {splitMode && (
        <div
          ref={splitMapRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            pointerEvents: 'none',
            clipPath: `inset(0 0 0 ${splitPosition}%)`
          }}
        />
      )}

      {/* Divider */}
      {splitMode && (
        <div
          ref={dividerRef}
          className="split-divider"
          style={{ left: `${splitPosition}%` }}
        >
          {/* Labels for split mode */}
          <div className="absolute top-4 left-[-120px] bg-card text-foreground px-3 py-1 rounded shadow-lg font-mono text-sm border border-border">
            RGB 2024
          </div>
          <div className="absolute top-4 right-[-120px] bg-card text-foreground px-3 py-1 rounded shadow-lg font-mono text-sm border border-border">
            RGB 2025
          </div>
        </div>
      )}

      {/* Floating Layer Control & Data Filter */}
      <LayerControl
        layers={layers}
        toggleLayer={layersState.toggleLayer}
        setLayerOpacity={layersState.setLayerOpacity}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
        rasterSource={rasterSource}
        setRasterSource={setRasterSource}
        geoserverUrl={geoserverUrl}
        setGeoserverUrl={setGeoserverUrl}
        basemap={basemap}
        setBasemap={setBasemap}
        splitMode={splitMode}
        setSplitMode={layersState.setSplitMode}
      />

      {/* Coordinate display */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(4px)',
        fontSize: '11px',
        fontFamily: 'monospace',
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        color: '#94a3b8',
        pointerEvents: 'none'
      }}>
        {coords ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : 'Hover to see coordinates'}
      </div>
    </div>
  );
});

