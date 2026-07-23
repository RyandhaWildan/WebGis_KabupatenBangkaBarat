import React, { useState } from 'react';
import { Layers, Calendar, Filter, Eye, EyeOff, MapPin, Grid, Shield, Server, X, Columns, Map as MapIcon } from 'lucide-react';
import type { LayerId, LayerState } from '../hooks/useMapLayers';

interface LayerControlProps {
  layers: LayerState[];
  toggleLayer: (id: LayerId, visible?: boolean) => void;
  setLayerOpacity: (id: LayerId, opacity: number) => void;
  activeYear: '2024' | '2025' | 'both';
  setActiveYear: (year: '2024' | '2025' | 'both') => void;
  rasterSource: 'geoserver' | 'preview';
  setRasterSource: (source: 'geoserver' | 'preview') => void;
  geoserverUrl: string;
  setGeoserverUrl: (url: string) => void;
  basemap?: 'dark' | 'satellite';
  setBasemap?: (bm: 'dark' | 'satellite') => void;
  splitMode?: boolean;
  setSplitMode?: (split: boolean) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  toggleLayer,
  setLayerOpacity,
  activeYear,
  setActiveYear,
  rasterSource,
  setRasterSource,
  geoserverUrl,
  setGeoserverUrl,
  basemap = 'dark',
  setBasemap,
  splitMode = false,
  setSplitMode,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'raster' | 'vector'>('all');

  const getVisibility = (id: LayerId) => {
    return layers.find((l) => l.id === id)?.visible ?? false;
  };

  const getOpacity = (id: LayerId) => {
    return layers.find((l) => l.id === id)?.opacity ?? 100;
  };

  const activeCount = layers.filter((l) => l.visible).length;

  if (!isOpen) {
    return (
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-emerald-400 text-xs font-semibold transition cursor-pointer select-none"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Layer & Filter Data</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
            {activeCount}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] max-w-sm w-full sm:w-80 shadow-2xl rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-md text-slate-100 transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 select-none">
        <div className="flex items-center gap-2 font-semibold text-sm text-emerald-400">
          <Layers className="w-4 h-4" />
          <span>Layer Control & Filter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="p-1.5 hover:bg-slate-700/80 rounded-lg text-slate-400 hover:text-slate-200 transition"
            title="Pengaturan GeoServer / Data Source"
          >
            <Server className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-700/80 rounded-lg text-slate-400 hover:text-slate-200 transition"
            title="Tutup Widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 text-xs max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        {/* Opsi Basemap & Split Map */}
        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-700/50">
          {/* Basemap Switcher */}
          {setBasemap && (
            <div>
              <span className="block text-[10px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                <MapIcon className="w-3 h-3 text-blue-400" /> BASEMAP
              </span>
              <div className="grid grid-cols-2 gap-1 bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/50">
                <button
                  onClick={() => setBasemap('dark')}
                  className={`py-1 rounded text-[11px] font-medium transition ${
                    basemap === 'dark'
                      ? 'bg-slate-700 text-emerald-400 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setBasemap('satellite')}
                  className={`py-1 rounded text-[11px] font-medium transition ${
                    basemap === 'satellite'
                      ? 'bg-slate-700 text-emerald-400 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Satelit
                </button>
              </div>
            </div>
          )}

          {/* Split Map Switcher */}
          {setSplitMode && (
            <div>
              <span className="block text-[10px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Columns className="w-3 h-3 text-indigo-400" /> TAMPILAN
              </span>
              <button
                onClick={() => setSplitMode(!splitMode)}
                className={`w-full py-1 px-2 rounded-lg text-[11px] font-medium border transition ${
                  splitMode
                    ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {splitMode ? '✓ Split Mode ON' : '⊞ Split Map'}
              </button>
            </div>
          )}
        </div>

        {/* Opsi 1: Pilihan Tahun */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>PILIH TAHUN DATA</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveYear('2024')}
              className={`py-1.5 rounded text-center font-medium transition ${
                activeYear === '2024'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              2024
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`py-1.5 rounded text-center font-medium transition ${
                activeYear === '2025'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setActiveYear('both')}
              className={`py-1.5 rounded text-center font-medium transition ${
                activeYear === 'both'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              2024 & 2025
            </button>
          </div>
        </div>

        {/* Opsi 2: Filter Jenis Data (Raster vs Vektor) */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>FILTER JENIS DATA</span>
          </div>
          <div className="flex gap-1 border-b border-slate-700/60 pb-1 mb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-t font-medium transition ${
                activeTab === 'all'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('raster')}
              className={`px-2.5 py-1 rounded-t font-medium transition flex items-center gap-1 ${
                activeTab === 'raster'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3 h-3 text-amber-400" /> Raster
            </button>
            <button
              onClick={() => setActiveTab('vector')}
              className={`px-2.5 py-1 rounded-t font-medium transition flex items-center gap-1 ${
                activeTab === 'vector'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3 h-3 text-cyan-400" /> Vektor
            </button>
          </div>
        </div>

        {/* List Layer Items */}
        <div className="space-y-2">
          {/* Batas Wilayah */}
          {(activeTab === 'all' || activeTab === 'vector') && (
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/80 transition">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-slate-200">Batas Kab. Bangka Barat</span>
              </div>
              <button
                onClick={() => toggleLayer('boundary')}
                className={`p-1 rounded transition ${
                  getVisibility('boundary') ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {getVisibility('boundary') ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Raster FeatureStack 2024 */}
          {(activeYear === '2024' || activeYear === 'both') && (activeTab === 'all' || activeTab === 'raster') && (
            <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <span className="font-semibold text-amber-300">FeatureStack2024.tif</span>
                    <span className="block text-[10px] text-slate-400">Raster GeoTIFF Multi-band</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer('rgb2024')}
                  className={`p-1 rounded transition ${
                    getVisibility('rgb2024') ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getVisibility('rgb2024') ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              {getVisibility('rgb2024') && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
                  <span className="text-[10px] text-slate-400">Transparansi:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={getOpacity('rgb2024')}
                    onChange={(e) => setLayerOpacity('rgb2024', Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[10px] w-6 text-slate-300">{getOpacity('rgb2024')}%</span>
                </div>
              )}
            </div>
          )}

          {/* Raster FeatureStack 2025 */}
          {(activeYear === '2025' || activeYear === 'both') && (activeTab === 'all' || activeTab === 'raster') && (
            <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-emerald-300">FeatureStack2025.tif</span>
                    <span className="block text-[10px] text-slate-400">Raster GeoTIFF Multi-band</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer('rgb2025')}
                  className={`p-1 rounded transition ${
                    getVisibility('rgb2025') ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getVisibility('rgb2025') ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              {getVisibility('rgb2025') && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
                  <span className="text-[10px] text-slate-400">Transparansi:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={getOpacity('rgb2025')}
                    onChange={(e) => setLayerOpacity('rgb2025', Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[10px] w-6 text-slate-300">{getOpacity('rgb2025')}%</span>
                </div>
              )}
            </div>
          )}

          {/* Vector Training Sample 2024 */}
          {(activeYear === '2024' || activeYear === 'both') && (activeTab === 'all' || activeTab === 'vector') && (
            <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-cyan-300">TrainingSample 2024</span>
                    <span className="block text-[10px] text-slate-400">Shapefile Vektor Titik (150 sampel)</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer('samples2024')}
                  className={`p-1 rounded transition ${
                    getVisibility('samples2024') ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getVisibility('samples2024') ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Vector Training Sample 2025 */}
          {(activeYear === '2025' || activeYear === 'both') && (activeTab === 'all' || activeTab === 'vector') && (
            <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="font-semibold text-purple-300">TrainingSample 2025</span>
                    <span className="block text-[10px] text-slate-400">Shapefile Vektor Titik (150 sampel)</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer('samples2025')}
                  className={`p-1 rounded transition ${
                    getVisibility('samples2025') ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getVisibility('samples2025') ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Konfigurasi GeoServer */}
        {showConfigModal && (
          <div className="pt-2 border-t border-slate-700/60 space-y-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <div className="font-medium text-slate-300 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-emerald-400" /> Mode Sumber Data Raster:
              </span>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setRasterSource('preview')}
                className={`py-1 px-2 rounded text-[11px] font-medium border ${
                  rasterSource === 'preview'
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Web Standalone
              </button>
              <button
                onClick={() => setRasterSource('geoserver')}
                className={`py-1 px-2 rounded text-[11px] font-medium border ${
                  rasterSource === 'geoserver'
                    ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                GeoServer WMS
              </button>
            </div>

            {rasterSource === 'geoserver' && (
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-slate-400">GeoServer WMS Base URL:</label>
                <input
                  type="text"
                  value={geoserverUrl}
                  onChange={(e) => setGeoserverUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="http://localhost:8080/geoserver/wms"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
