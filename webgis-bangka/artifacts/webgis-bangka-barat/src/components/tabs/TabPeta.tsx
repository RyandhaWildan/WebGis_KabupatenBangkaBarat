import React, { useState } from 'react';
import { MapContainer, type MapContainerHandle } from '../MapContainer';
import { useMapLayers, type LayerId } from '../../hooks/useMapLayers';

interface TabPetaProps {
  layersState: ReturnType<typeof useMapLayers>;
  mapRef: React.RefObject<MapContainerHandle | null>;
}

const layerGroups = [
  {
    id: 'batas', title: 'Batas Wilayah', emoji: '📍', collapsible: false,
    items: [{ id: 'boundary' as LayerId, label: 'Batas Kabupaten', dot: '#34d399' }],
  },
  {
    id: 'composite', title: 'Citra Komposit', emoji: '🛰', hasSplit: true, collapsible: true,
    items: [
      { id: 'rgb2024' as LayerId, label: 'RGB Median 2024', dot: '#60a5fa' },
      { id: 'rgb2025' as LayerId, label: 'RGB Median 2025', dot: '#818cf8' },
    ],
  },
  {
    id: 'spectral', title: 'Indeks Spektral', emoji: '📈', collapsible: true,
    items: [
      { id: 'ndvi2024' as LayerId, label: 'NDVI 2024', dot: '#4ade80' },
      { id: 'ndvi2025' as LayerId, label: 'NDVI 2025', dot: '#22c55e' },
      { id: 'ndmi2024' as LayerId, label: 'NDMI 2024', dot: '#38bdf8' },
      { id: 'ndmi2025' as LayerId, label: 'NDMI 2025', dot: '#0284c7' },
    ],
  },
  {
    id: 'klasifikasi', title: 'Klasifikasi Lahan', emoji: '🌿', collapsible: true,
    items: [
      { id: 'class2024' as LayerId, label: 'Threshold NDVI 2024', dot: '#86efac' },
      { id: 'class2025' as LayerId, label: 'Threshold NDVI 2025', dot: '#34d399' },
      { id: 'rf2024' as LayerId,    label: 'Random Forest 2024',  dot: '#fbbf24' },
      { id: 'rf2025' as LayerId,    label: 'Random Forest 2025',  dot: '#f59e0b' },
    ],
  },
  {
    id: 'samples', title: 'Training Sample', emoji: '📌', collapsible: true,
    items: [
      { id: 'samples2024' as LayerId, label: '75 Titik 2024', dot: '#f87171' },
      { id: 'samples2025' as LayerId, label: '75 Titik 2025', dot: '#fb923c' },
    ],
  },
  {
    id: 'change', title: 'Change Detection', emoji: '🔄', collapsible: false,
    items: [{ id: 'changeDetection' as LayerId, label: 'Peta Perubahan Veg.', dot: '#a78bfa' }],
  },
];

const metricCards = [
  { label: 'Luas Veg. 2024', value: '201.670 Ha', pct: '70.5%', color: '#34d399' },
  { label: 'Luas Veg. 2025', value: '195.400 Ha', pct: '68.3%', color: '#60a5fa' },
  { label: 'Net Perubahan',  value: '−6.270 Ha',  pct: '−2.2%', color: '#f87171' },
  { label: 'Gain Vegetasi',  value: '+12.150 Ha', pct: '4.2%',  color: '#34d399' },
  { label: 'Loss Vegetasi',  value: '−18.420 Ha', pct: '6.4%',  color: '#fbbf24' },
];

export function TabPeta({ layersState, mapRef }: TabPetaProps) {
  const { getLayer, toggleLayer, splitMode, setSplitMode } = layersState;
  const [basemap, setBasemap] = useState<'dark' | 'satellite'>('dark');
  const [showRightPanel, setShowRightPanel] = useState(true);
  // Track which collapsible sections are open; default all open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    composite: true, spectral: true, klasifikasi: true, samples: true,
  });

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  // Active layer legend logic
  const activeLayerId = (() => {
    if (getLayer('changeDetection').visible) return 'changeDetection';
    if (getLayer('rf2025').visible) return 'rf2025';
    if (getLayer('rf2024').visible) return 'rf2024';
    if (getLayer('class2025').visible) return 'class2025';
    if (getLayer('class2024').visible) return 'class2024';
    if (getLayer('ndmi2025').visible) return 'ndmi2025';
    if (getLayer('ndmi2024').visible) return 'ndmi2024';
    if (getLayer('ndvi2025').visible) return 'ndvi2025';
    if (getLayer('ndvi2024').visible) return 'ndvi2024';
    if (getLayer('rgb2025').visible) return 'rgb2025';
    if (getLayer('rgb2024').visible) return 'rgb2024';
    return null;
  })();

  const activeLegend = (() => {
    if (!activeLayerId) return null;
    if (activeLayerId.includes('ndvi')) return {
      title: 'NDVI Spasial',
      items: [
        { color: '#14532d', label: '> 0.7  Sangat Lebat' },
        { color: '#22c55e', label: '0.5–0.7  Cukup Lebat' },
        { color: '#86efac', label: '0.3–0.5  Semak/Jarang' },
        { color: '#fef08a', label: '0.1–0.3  Lahan Terbuka' },
        { color: '#ef4444', label: '< 0.1  Non-Vegetasi' },
      ],
    };
    if (activeLayerId.includes('ndmi')) return {
      title: 'NDMI Moisture',
      items: [
        { color: '#0369a1', label: '> 0.5  Sangat Basah' },
        { color: '#0284c7', label: '0.3–0.5  Lembab Tinggi' },
        { color: '#38bdf8', label: '0.1–0.3  Lembab Sedang' },
        { color: '#bae6fd', label: '−0.1–0.1  Kering Sedang' },
        { color: '#f59e0b', label: '< −0.1  Sangat Kering' },
      ],
    };
    if (activeLayerId.includes('class')) return {
      title: 'Threshold NDVI',
      items: [
        { color: '#22c55e', label: 'Lolos (≥ 0.4)' },
        { color: '#ef4444', label: 'Bukan (< 0.4)' },
      ],
    };
    if (activeLayerId.includes('rf')) return {
      title: 'Random Forest',
      items: [
        { color: '#16a34a', label: 'Kelas 1: Vegetasi' },
        { color: '#dc2626', label: 'Kelas 0: Non-Vegetasi' },
      ],
    };
    if (activeLayerId === 'changeDetection') return {
      title: 'Deteksi Perubahan',
      items: [
        { color: '#16a34a', label: 'Tetap Vegetasi' },
        { color: '#dc2626', label: 'Tetap Non-Veg' },
        { color: '#eab308', label: 'Loss Vegetasi' },
        { color: '#2563eb', label: 'Gain Vegetasi' },
      ],
    };
    if (activeLayerId.includes('rgb')) return {
      title: 'Komposit RGB',
      items: [
        { color: 'rgb(20,83,45)',    label: 'Vegetasi Lebat' },
        { color: 'rgb(34,139,34)',   label: 'Vegetasi Sedang' },
        { color: 'rgb(180,130,90)', label: 'Lahan Terbuka' },
        { color: 'rgb(100,110,120)',label: 'Pemukiman' },
        { color: 'rgb(10,50,90)',   label: 'Air / Rawa' },
      ],
    };
    return null;
  })();

  return (
    <>
      {/* ── Injected global styles for sidebar & map container ── */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(71,85,105,0.45);
          border-radius: 99px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100,116,139,0.7);
        }
        /* Responsive breakpoints */
        .peta-right-sidebar { width: 240px; min-width: 200px; }
        @media (max-width: 768px) {
          .peta-right-sidebar { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>

        {/* ══ Center Map (Full Width) ════════════════════════════════════════════════ */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
          {/* Right panel toggle button when right panel is hidden */}
          {!showRightPanel && (
            <button
              onClick={() => setShowRightPanel(true)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 999,
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                color: '#34d399',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Tampilkan Statistik Area"
            >
              📊 Statistik
            </button>
          )}

          <MapContainer
            ref={mapRef}
            layersState={layersState}
            basemap={basemap}
            setBasemap={setBasemap}
          />
        </div>

        {/* ══ Right Panel (Statistik & Legend) ═════════════════════════ */}
        {showRightPanel && (
          <div className="sidebar-scroll peta-right-sidebar" style={{
            flexShrink: 0,
            overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 12px',
            background: 'linear-gradient(180deg, #0c1a30 0%, #0f1e38 100%)',
            borderLeft: '1px solid rgba(51,65,85,0.5)',
            position: 'relative',
          }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={labelStyle}>📊 Statistik Area</div>
              <button
                onClick={() => setShowRightPanel(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginLeft: 'auto',
                }}
                title="Sembunyikan Panel"
              >
                ✕
              </button>
            </div>

            {metricCards.map(m => (
              <div key={m.label} style={{
                borderRadius: 10, padding: '11px 13px',
                background: '#111f3a', border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 15, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{m.pct} dari total wilayah</div>
              </div>
            ))}

            {/* Dynamic Legend */}
            {activeLegend && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 1, background: 'rgba(51,65,85,0.4)', marginBottom: 12 }} />
                <div style={labelStyle}>🎨 {activeLegend.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                  {activeLegend.items.map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, background: l.color }} />
                      <span style={{ fontSize: 12, color: '#b0bfd0', lineHeight: 1.4 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick insight */}
            <div style={{
              marginTop: 4, borderRadius: 10, padding: '11px 12px',
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 7 }}>💡 Insight Cepat</div>
              <p style={{ fontSize: 11, color: '#7a8fa8', lineHeight: 1.7, margin: 0 }}>
                Vegetasi berkurang −6.270 Ha dalam satu tahun. Kec. Muntok &amp; Jebus paling terdampak oleh aktivitas penambangan timah terbuka.
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ── Shared typography style ──────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94a3b8',
};
